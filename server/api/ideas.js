// server/api/ideas.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * IDEAS API
 *
 * GET    /api/ideas?user_id=...
 * POST   /api/ideas
 * PATCH  /api/ideas
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    /* =====================================================
       GET — LIST IDEAS (pair scoped)
    ===================================================== */
    if (req.method === "GET") {
      const user_id = req.user.id;

      if (!user_id) {
        return res.status(400).json({ ok: false, error: "missing_user_id" });
      }

      // Find partner pair
      const { data: pair } = await supabaseServer
        .from("partners")
        .select("*")
        .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
        .maybeSingle();

      let data, error;

      if (pair) {
        // Paired: show ideas for the pair AND any ideas added by either user before pairing
        ({ data, error } = await supabaseServer
          .from("ideas")
          .select("*")
          .or(`pair_id.eq.${pair.id},added_by.in.(${pair.user_a},${pair.user_b})`)
          .order("created_at", { ascending: false }));
      } else {
        // Solo: show only this user's own ideas
        ({ data, error } = await supabaseServer
          .from("ideas")
          .select("*")
          .eq("added_by", user_id)
          .order("created_at", { ascending: false }));
      }

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      return res.status(200).json({
        ok: true,
        ideas: data || [],
      });
    }

    /* =====================================================
       POST — CREATE IDEA
    ===================================================== */
    if (req.method === "POST") {
      const { title, url, category, image_url, tags } = req.body || {};
      const added_by = req.user.id;

      if (!title || !added_by) {
        return res.status(400).json({ ok: false, error: "missing_params" });
      }

      // Find partner pair (optional — solo users can still add ideas)
      const { data: pair } = await supabaseServer
        .from("partners")
        .select("*")
        .or(`user_a.eq.${added_by},user_b.eq.${added_by}`)
        .maybeSingle();

      const { data, error } = await supabaseServer
        .from("ideas")
        .insert({
          title,
          url,
          category,
          image_url,
          tags: Array.isArray(tags) ? tags : [],
          added_by,
          pair_id: pair?.id || null,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      // Timeline event
      if (pair?.id) {
        await supabaseServer.from("timeline_events").insert({
          pair_id: pair.id,
          type: "idea_added",
          actor_id: added_by,
          payload: {
            idea_id: data.id,
            title: data.title,
            category: data.category,
            image_url: data.image_url || null,
          },
        });
      }

      return res.status(200).json({ ok: true, idea: data });
    }

    /* =====================================================
       PATCH — UPDATE IDEA STATUS
    ===================================================== */
    if (req.method === "PATCH") {
      const { idea_id, action } = req.body || {};
      const user_id = req.user.id;

      if (!idea_id || !action) {
        return res.status(400).json({ ok: false, error: "missing_params" });
      }

      let update = {};

      if (action === "mark_done") {
        update = { status: "done", done_at: new Date().toISOString() };
      } else if (action === "archive") {
        update = { status: "archived" };
      } else {
        return res.status(400).json({ ok: false, error: "unknown_action" });
      }

      const { data, error } = await supabaseServer
        .from("ideas")
        .update(update)
        .eq("id", idea_id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      // Optional timeline event
      if (action === "mark_done" && user_id) {
        await supabaseServer.from("timeline_events").insert({
          pair_id: data.pair_id,
          type: "idea_done",
          actor_id: user_id,
          payload: {
            idea_id: data.id,
            title: data.title,
          },
        });
      }

      return res.status(200).json({ ok: true, idea: data });
    }

    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (err) {
    console.error("ideas api error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
