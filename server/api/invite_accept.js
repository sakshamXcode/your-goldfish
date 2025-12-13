import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { token, accepting_user_id } = req.body || {};
    if (!token || !accepting_user_id) {
      return res.status(400).json({ ok: false, error: "missing_params" });
    }

    // 1️⃣ Fetch invite
    const { data: invite, error: inviteErr } = await supabaseServer
      .from("invites")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (inviteErr || !invite) {
      return res.status(404).json({ ok: false, error: "invite_not_found" });
    }

    if (invite.accepted) {
      return res.status(400).json({ ok: false, error: "invite_already_accepted" });
    }

    // 2️⃣ Mark invite accepted
    const accepted_at = new Date().toISOString();

    const { error: updateErr } = await supabaseServer
      .from("invites")
      .update({
        accepted: true,
        accepted_by: accepting_user_id,
        accepted_at,
      })
      .eq("id", invite.id);

    if (updateErr) {
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    // 3️⃣ Create partner relationship
    const fromUser = invite.from_user;
    const toUser = accepting_user_id;

    // normalize order to avoid duplicates
    const [user_a, user_b] =
      fromUser < toUser ? [fromUser, toUser] : [toUser, fromUser];

    // check if already exists
    const { data: existing } = await supabaseServer
      .from("partners")
      .select("*")
      .eq("user_a", user_a)
      .eq("user_b", user_b)
      .maybeSingle();

    if (!existing) {
      const { error: partnerErr } = await supabaseServer
        .from("partners")
        .insert({ user_a, user_b });

      if (partnerErr) {
        return res.status(500).json({ ok: false, error: partnerErr.message });
      }
    }

    // 4️⃣ Done
    return res.status(200).json({
      ok: true,
      invite: {
        ...invite,
        accepted: true,
        accepted_by: accepting_user_id,
        accepted_at,
      },
    });
  } catch (err) {
    console.error("invite_accept error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
