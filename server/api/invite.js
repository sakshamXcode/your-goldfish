// server/api/invite.js
import { supabaseServer } from "../lib/supabase.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Invite create endpoint (mock-SMS).
 * - Inserts an invite row
 * - Inserts a notification row for the invite
 * - Logs a mock SMS (no paid provider)
 *
 * Expects JSON body: { to_phone, from_user_id, message }
 * Returns: { ok: true, invite: {...}, token, link }
 */

function safeNowIso() {
  return new Date().toISOString();
}

async function sendMockSMS(to, body, meta = {}) {
  // This function is intentionally non-blocking for core flow.
  // It logs to server console and returns a resolved object for success.
  try {
    const log = {
      to,
      body,
      meta,
      timestamp: new Date().toISOString(),
    };
    // Console log the mock SMS so you can see it in dev logs.
    console.log("📩 [MOCK SMS]", log);
    // Optionally we could insert into a debug table `sent_messages` for dev inspection.
    try {
      await supabaseServer.from("sent_messages").insert([{
        to_phone: to,
        body,
        meta,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      // ignore if table doesn't exist - non-critical
    }
    return { ok: true };
  } catch (err) {
    console.warn("Mock SMS failed:", err);
    return { ok: false, error: String(err) };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { to_phone, from_user_id, message } = req.body || {};
    if (!to_phone || !from_user_id) {
      return res.status(400).json({ ok: false, error: "missing_params" });
    }

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const created_at = safeNowIso();

    const row = {
      token,
      from_user: from_user_id,
      to_phone,
      message: message || null,
      expires_at,
      created_at,
      accepted: false
    };

    // Insert invite
    let insertResp;
    try {
      insertResp = await supabaseServer.from("invites").insert([row]);
    } catch (err) {
      // some supabase client shapes may throw - catch and return diagnostic
      console.error("invite insert thrown error:", err);
      return res.status(500).json({ ok: false, error: "insert_failed", detail: String(err) });
    }

    if (insertResp?.error) {
      console.error("invite insert error:", insertResp.error);
      return res.status(500).json({ ok: false, error: "insert_failed", detail: String(insertResp.error) });
    }

    // attempt to read back the row to verify persistence
    let lookup;
    try {
      lookup = await supabaseServer.from("invites").select("*").eq("token", token).limit(1).maybeSingle();
    } catch (e) {
      console.warn("invite lookup failed after insert:", e);
      lookup = null;
    }

    const inviteRow = (lookup && lookup.data) ? lookup.data : row;

    // Build the invite link using APP_BASE or fallback to localhost frontend
    const APP_BASE = process.env.APP_BASE || "http://localhost:5173";
    const link = `${APP_BASE.replace(/\/$/, "")}/invite/${token}`;

    // Insert a notification for the invite (payload JSON contains token + link)
    const notification = {
      user_id: null, // if you have a mapping from phone -> user_id, set it here
      to_phone,
      type: "invite",
      payload: { token, from: from_user_id, message: message || null, link },
      created_at: safeNowIso(),
      read: false
    };

    try {
      const notifResp = await supabaseServer.from("notifications").insert([notification]);
      if (notifResp?.error) {
        console.warn("notifications insert returned error:", notifResp.error);
        // non-fatal for invite creation — continue, but report the detail
      }
    } catch (e) {
      console.warn("notifications insert thrown error:", e);
      // continue - non-fatal
    }

    // Mock SMS send (free): include dev logo path in meta for debugging/preview
    const mockBody = `You've been invited to UsBook by ${from_user_id}! Open: ${link}`;
    const mockMeta = {
      reason: "invite",
      // developer-provided upload path (dev asset). The team said to include this path as the file url.
      logo: "/mnt/data/A_logo_design_features_a_cheerful_goldfish_charact.png"
    };

    // Do not fail the request if mock SMS fails.
    await sendMockSMS(to_phone, mockBody, mockMeta);

    // Return success with diagnostic data
    return res.status(200).json({
      ok: true,
      invite: inviteRow,
      token,
      link
    });
  } catch (err) {
    console.error("invite endpoint unexpected error:", err);
    return res.status(500).json({ ok: false, error: "invite_failed", detail: String(err) });
  }
}
