import { supabaseServer } from "./_lib/supabase.js";
import { withAuth } from "./_utils/withAuth.js";

/**
 * 8-Letter Connection Code System
 * Repurposes the "invites" table to store the 8-letter codes for users.
 */

// Format: 8 uppercase alphanumeric chars
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed confusing chars O,0,1,I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function handler(req, res) {

  try {
    const action = req.query.action || null;
    const user_id = req.user?.id; // Guaranteed by authMiddleware

    /* =====================================================
       GET /api/invites?action=get_code
       Returns the user's active 8-letter code. Generates one if it doesn't exist.
    ===================================================== */
    if (req.method === "GET" && action === "get_code") {
      // 1. Look for existing code
      const { data: existing } = await supabaseServer
        .from("invites")
        .select("token")
        .eq("from_user", user_id)
        .eq("accepted", false)
        .eq("rejected", false)
        .maybeSingle();

      if (existing) {
        return res.status(200).json({ ok: true, code: existing.token });
      }

      // 2. Generate new code and insert
      const newCode = generateCode();
      const { error } = await supabaseServer.from("invites").insert({
        token: newCode,
        from_user: user_id,
        to_email: "code@pending", // placeholder to satisfy NOT NULL constraint
        created_at: new Date().toISOString(),
        accepted: false,
        rejected: false
      });

      if (error) throw error;
      return res.status(200).json({ ok: true, code: newCode });
    }

    /* =====================================================
       POST /api/invites?action=request_partner
       Body: { code: 'A7X9MP2W' }
       User B enters User A's code. We send a notification to A.
    ===================================================== */
    if (req.method === "POST" && action === "request_partner") {
      const { code } = req.body || {};
      if (!code || code.length !== 8) {
        return res.status(400).json({ ok: false, error: "invalid_code_format" });
      }

      // Find the invite row
      const { data: invite } = await supabaseServer
        .from("invites")
        .select("*")
        .eq("token", code.toUpperCase())
        .eq("accepted", false)
        .eq("rejected", false)
        .maybeSingle();

      if (!invite) {
        return res.status(404).json({ ok: false, error: "code_not_found" });
      }
      
      if (invite.from_user === user_id) {
          return res.status(400).json({ ok: false, error: "cant_invite_self" });
      }

      // Check if they are already partners
      const { data: alreadyPartnered } = await supabaseServer
        .from("partners")
        .select("id")
        .or(`user_a.eq.${invite.from_user},user_b.eq.${invite.from_user}`)
        .maybeSingle();

      if (alreadyPartnered) {
          return res.status(400).json({ ok: false, error: "user_already_partnered" });
      }


      // Get requester's username
      const { data: requester } = await supabaseServer
        .from("users")
        .select("username, display_name")
        .eq("id", user_id)
        .maybeSingle();
      
      const requesterName = requester?.username ? `@${requester.username}` : (requester?.display_name || "Someone");

      // Create a notification for the CODE OWNER (User A)
      const { error: notifError } = await supabaseServer.from("notifications").insert({
        user_id: invite.from_user, // send to the person who generated the code
        from_user: user_id, // the person requesting
        type: "partner_request",
        text: `${requesterName} wants to be your partner!`,
        payload: { token: invite.token, requester_name: requesterName }, // tie the request to this specific invite token
        created_at: new Date().toISOString(),
        read: false,
        handled: false
      });

      if (notifError) throw notifError;

      return res.status(200).json({ ok: true });
    }

    /* =====================================================
       POST /api/invites?action=accept_partner
       Body: { token: 'A7X9MP2W' }
       User A clicks [Approve] on their notification.
    ===================================================== */
    if (req.method === "POST" && action === "accept_partner") {
      const { token } = req.body || {};
      if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

      // 1. Get the invite row
      const { data: invite } = await supabaseServer
        .from("invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (!invite || invite.from_user !== user_id) {
        return res.status(403).json({ ok: false, error: "unauthorized" });
      }

      // 2. Find the person who requested it (from_user in the notification)
      const { data: notif } = await supabaseServer
        .from("notifications")
        .select("from_user, id")
        .eq("user_id", user_id)
        .eq("type", "partner_request")
        .filter("payload->>token", "eq", token)
        .eq("handled", false)
        .maybeSingle();

      if (!notif) {
        return res.status(404).json({ ok: false, error: "request_not_found" });
      }

      const accepting_user_id = notif.from_user;

      // 3. Create the partner connection!
      const [user_a, user_b] = user_id < accepting_user_id 
        ? [user_id, accepting_user_id] 
        : [accepting_user_id, user_id];

      const { error: partnerError } = await supabaseServer.from("partners").insert({ user_a, user_b });
      if (partnerError) throw partnerError;

      // 4. Mark invite as accepted
      await supabaseServer.from("invites").update({
        accepted: true,
        accepted_by: accepting_user_id,
        accepted_at: new Date().toISOString()
      }).eq("id", invite.id);

      // 5. Mark notification as handled
      await supabaseServer.from("notifications").update({
        handled: true,
        read: true
      }).eq("id", notif.id);

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "invalid_action" });

  } catch (err) {
    console.error("invites API error:", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}

export default withAuth(handler);
