// server/api/timeline_add.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * POST /api/timeline_add
 * Body: { title, date, note, created_by }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { title, date, note, created_by } = req.body || {};
    if (!title || !created_by) return res.status(400).json({ ok: false, error: "missing_params" });

    const row = { title, date: date || new Date().toISOString().split("T")[0], note: note || null, created_by, created_at: new Date().toISOString() };

    const { data, error } = await supabaseServer.from("timeline").insert([row]).select().single();
    if (error) throw error;

    return res.status(200).json({ ok: true, timeline: data });
  } catch (err) {
    console.error("timeline_add error", err);
    return res.status(500).json({ ok: false, error: "add_failed", detail: String(err) });
  }
}
