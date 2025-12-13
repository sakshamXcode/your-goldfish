import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const { title, url, category, added_by, image_url } = req.body;

    if (!title || !added_by) {
      return res.status(400).json({ ok: false, error: "missing_params" });
    }

    // 1️⃣ Find partner pair
    const { data: pair, error: pairErr } = await supabaseServer
      .from("partners")
      .select("*")
      .or(`user_a.eq.${added_by},user_b.eq.${added_by}`)
      .maybeSingle();

    if (pairErr || !pair) {
      return res.status(400).json({
        ok: false,
        error: "user_not_paired",
      });
    }

    // 2️⃣ Insert idea scoped to pair
    const { data: idea, error: ideaErr } = await supabaseServer
      .from("ideas")
      .insert({
        title,
        url,
        category,
        image_url,
        added_by,
        pair_id: pair.id,
      })
      .select()
      .single();

    if (ideaErr || !idea) {
      return res.status(500).json({
        ok: false,
        error: ideaErr?.message || "idea_insert_failed",
      });
    }

    // 3️⃣ Insert timeline event (AFTER idea success)
    await supabaseServer.from("timeline_events").insert({
      pair_id: pair.id,
      type: "idea_added",
      actor_id: added_by,
      payload: {
        idea_id: idea.id,
        title: idea.title,
        category: idea.category,
        image_url: idea.image_url || null,
      },
    });

    return res.status(200).json({ ok: true, idea });
  } catch (err) {
    console.error("ideas_create error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
