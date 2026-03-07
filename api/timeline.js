import { supabaseServer } from "./_lib/supabase.js";
import { withAuth } from "./_utils/withAuth.js";

/**
 * GET /api/timeline
 * Fetches the timeline events for the authenticated user's pair.
 */
async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const user_id = req.user.id;

    // Securely find the pair_id for the authenticated user
    const { data: pair } = await supabaseServer
      .from("partners")
      .select("*")
      .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
      .maybeSingle();

    if (!pair) {
      return res.status(200).json({ ok: true, timeline: [] });
    }

    const { data, error } = await supabaseServer
      .from("timeline_events")
      .select("*")
      .eq("pair_id", pair.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return res.status(200).json({ ok: true, timeline: data || [] });
  } catch (err) {
    console.error("timeline api error", err);
    return res.status(500).json({ ok: false, error: "server_error", detail: String(err) });
  }
}

export default withAuth(handler);
