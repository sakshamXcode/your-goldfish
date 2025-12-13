// server/api/timeline_list.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * GET /api/timeline_list?user_id=...
 */
export default async function handler(req, res) {
  try {
    const user_id = (req.method === "GET")
      ? (req.query?.user_id || new URL(req.url, `http://${req.headers.host}`).searchParams.get("user_id"))
      : (req.body && req.body.user_id);

    if (!user_id) return res.status(400).json({ ok: false, error: "missing_user_id" });

    const { data, error } = await supabaseServer
      .from("timeline")
      .select("*")
      .eq("created_by", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ ok: true, timeline: data });
  } catch (err) {
    console.error("timeline_list error", err);
    return res.status(500).json({ ok: false, error: "fetch_failed", detail: String(err) });
  }
}
