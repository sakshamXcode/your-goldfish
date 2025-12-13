// server/api/ideas_status.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * POST /api/ideas_status
 * Body: { idea_id, status } // "approved" | "rejected"
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { idea_id, status } = req.body || {};
    if (!idea_id || !status) return res.status(400).json({ ok: false, error: "missing_params" });

    if (!["approved", "rejected", "pending"].includes(status)) return res.status(400).json({ ok: false, error: "invalid_status" });

    const { error } = await supabaseServer.from("ideas").update({ status }).eq("id", idea_id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ideas_status error", err);
    return res.status(500).json({ ok: false, error: "update_failed", detail: String(err) });
  }
}
