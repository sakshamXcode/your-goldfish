// server/api/chat_send.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * POST /api/chat_send
 * Body: { from_user, to_user, message }
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { to_user, message } = req.body || {};
    const from_user = req.user.id;
    if (!to_user || !message) return res.status(400).json({ ok: false, error: "missing_params" });

    const row = { from_user, to_user, message, created_at: new Date().toISOString() };
    const { data, error } = await supabaseServer.from("chat").insert([row]).select().single();
    if (error) throw error;

    // Optionally create a notification for recipient (unread badge)
    await supabaseServer.from("notifications").insert([{
      to_user,
      from_user,
      type: "chat",
      text: message.slice(0, 500),
      created_at: new Date().toISOString(),
      handled: false
    }]);

    return res.status(200).json({ ok: true, message: data });
  } catch (err) {
    console.error("chat_send error", err);
    return res.status(500).json({ ok: false, error: "send_failed", detail: String(err) });
  }
}
