import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false });
  }

  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ ok: false, error: "missing_user_id" });
  }

  try {
    // find pair
    const { data: pair } = await supabaseServer
      .from("partners")
      .select("*")
      .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
      .maybeSingle();

    if (!pair) {
      return res.status(200).json({ ok: true, ideas: [] });
    }

    const { data, error } = await supabaseServer
      .from("ideas")
      .select("*")
      .eq("pair_id", pair.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, ideas: data });
  } catch (err) {
    console.error("ideas_list error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
