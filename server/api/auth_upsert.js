// server/api/auth_upsert.js
import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { id, email = null, phone = null, display_name = null, avatar_url = null } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: "missing_id" });

    const row = {
      id,
      email,
      phone,
      display_name,
      avatar_url,
      created_at: new Date().toISOString()
    };

    // Upsert ensures we don't create duplicates
    const { data, error } = await supabaseServer
      .from("users")
      .upsert(row, { onConflict: ['id'] })
      .select()
      .single();

    if (error) {
      console.warn('auth_upsert warn', error);
      return res.status(500).json({ ok: false, error: 'upsert_failed', detail: String(error) });
    }

    return res.status(200).json({ ok: true, user: data });
  } catch (err) {
    console.error('auth_upsert error', err);
    return res.status(500).json({ ok: false, error: 'server_error', detail: String(err) });
  }
}
