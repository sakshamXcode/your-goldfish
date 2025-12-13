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
    const { data, error } = await supabaseServer
      .from("partners")
      .select("*")
      .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    if (!data) {
      return res.status(200).json({ ok: true, partner: null });
    }

    const partner_id =
      data.user_a === user_id ? data.user_b : data.user_a;

    return res.status(200).json({
      ok: true,
      partner: {
        pair_id: data.id,
        partner_id,
        created_at: data.created_at,
      },
    });
  } catch (err) {
    console.error("partner_get error", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
