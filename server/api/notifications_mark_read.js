// server/api/notifications_mark_read.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * POST body: { token: string, user_id?: string }
 * Marks notifications (or invites) related to token as read.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { token, user_id } = req.body || {};
    if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

    // Try to mark any notification whose payload->>'token' = token
    // and (optionally) user_id matches
    const matchClause = { "payload->>token": token };

    // Build a query: we use SQL filter via rpc or use supabase client eq on json
    // Simpler: run an update with filter on payload->>token using raw SQL
    const sql = `
      update public.notifications
      set read = true, updated_at = now()
      where (payload ->> 'token') = $1
      ${user_id ? `and (user_id = $2 or to_phone = $2)` : ''}
      returning *
    `;
    const params = user_id ? [token, user_id] : [token];

    const { data, error } = await supabaseServer.rpc("sql", {
      q: sql,
      params
    }).catch(() => ({ data: null, error: "rpc_not_available" }));

    // Not all Supabase projects expose a generic rpc; fallback to client builder
    if (error) {
      // fallback using client query: fetch rows then update by id
      const { data: rows, error: selErr } = await supabaseServer
        .from("notifications")
        .select("*")
        .filter("payload->>token", "eq", token);

      if (selErr) {
        console.error("notifications lookup failed:", selErr);
        return res.status(500).json({ ok: false, error: "lookup_failed", detail: selErr.message || selErr });
      }

      if (!rows || rows.length === 0) {
        return res.status(200).json({ ok: true, updated: 0 });
      }

      const ids = rows.map((r) => r.id);
      const { data: up, error: upErr } = await supabaseServer
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .in("id", ids)
        .select("*");

      if (upErr) {
        console.error("notifications update failed:", upErr);
        return res.status(500).json({ ok: false, error: "update_failed", detail: upErr.message || upErr });
      }

      return res.status(200).json({ ok: true, updated: up.length, rows: up });
    }

    // If rpc succeeded, return data
    return res.status(200).json({ ok: true, updated: (data && data.length) || 0, rows: data || [] });
  } catch (err) {
    console.error("mark_read_by_token exception:", err);
    return res.status(500).json({ ok: false, error: "exception", detail: String(err) });
  }
}
