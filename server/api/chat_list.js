// server/api/chat_list.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * GET /api/chat_list?user_id=...&peer_id=...
 * If peer_id provided, returns direct chat history between two users.
 * Otherwise returns recent conversations for user_id.
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const q = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const user_id = req.user.id;
    const peer_id = q.get("peer_id");

    if (peer_id) {
      // return direct chat between user_id and peer_id
      const { data, error } = await supabaseServer
        .from("chat")
        .select("*")
        .or(`from_user.eq.${user_id},to_user.eq.${user_id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      // filter messages that involve both peers
      const filtered = (data || []).filter(m =>
        (m.from_user === user_id && m.to_user === peer_id) || (m.from_user === peer_id && m.to_user === user_id)
      );
      return res.status(200).json({ ok: true, messages: filtered });
    } else {
      // recent conversations: group by peer (basic)
      const { data, error } = await supabaseServer
        .from("chat")
        .select("*")
        .or(`from_user.eq.${user_id},to_user.eq.${user_id}`)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return res.status(200).json({ ok: true, messages: data });
    }
  } catch (err) {
    console.error("chat_list error", err);
    return res.status(500).json({ ok: false, error: "fetch_failed", detail: String(err) });
  }
}
