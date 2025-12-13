// server/api/notifications.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * GET /api/notifications?user_id=...
 */
export default async function handler(req, res) {
  try {
    const user_id = (req.method === "GET")
      ? (req.query?.user_id || new URL(req.url, `http://${req.headers.host}`).searchParams.get("user_id"))
      : (req.body && req.body.user_id);

    if (!user_id) return res.status(400).json({ ok: false, error: "missing_user_id" });

    const { data, error } = await supabaseServer
      .from("notifications")
      .select("*")
      .eq("to_user", user_id)
      .eq("handled", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ ok: true, notifications: data });
  } catch (err) {
    console.error("notifications error", err);
    return res.status(500).json({ ok: false, error: "fetch_failed", detail: String(err) });
  }
}
