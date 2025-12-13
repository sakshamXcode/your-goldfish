// server/api/invite_reject.js
import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

    // Option: delete or mark as rejected. We'll mark accepted = false and set a rejected_at.
    const now = new Date().toISOString();
    const update = await supabaseServer.from("invites").update({ rejected: true, rejected_at: now }).filter("token", "eq", token);
    if (update?.error) return res.status(500).json({ ok: false, error: "update_failed", detail: String(update.error) });

    // Optionally mark notifications read
    await supabaseServer.from("notifications").update({ read: true }).filter("payload->>token", "eq", token);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("invite_reject error:", err);
    return res.status(500).json({ ok: false, error: "server_error", detail: String(err) });
  }
}
