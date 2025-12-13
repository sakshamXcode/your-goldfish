// server/api/notifications_handle.js
import { supabaseServer } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const body = req.body || {};
    const action = body.action;

    if (!action) return res.status(400).json({ ok: false, error: "missing_action" });

    if (action === "mark_read") {
      // body.ids -> [1,2,3]
      const ids = Array.isArray(body.ids) ? body.ids : [];
      if (!ids.length) return res.status(400).json({ ok: false, error: "missing_ids" });

      const resp = await supabaseServer.from("notifications").update({ read: true }).in("id", ids);
      if (resp?.error) return res.status(500).json({ ok: false, error: "update_failed", detail: String(resp.error) });

      return res.status(200).json({ ok: true, updated: resp.data?.length ?? null });
    }

    if (action === "mark_read_by_token") {
      const token = body.token;
      if (!token) return res.status(400).json({ ok: false, error: "missing_token" });
      // approach using PostgREST-style operations
      // first: mark by payload->>'token'
      const byPayload = await supabaseServer
        .from("notifications")
        .update({ read: true })
        .filter("payload->>token", "eq", token);

      // second: in case any notifications used to_phone instead (not linked to payload)
      const byPhone = await supabaseServer
        .from("notifications")
        .update({ read: true })
        .eq("to_phone", token) // token might be a phone if caller passed phone - harmless
        .maybeSingle ? await supabaseServer.from("notifications").update({ read: true }).eq("to_phone", token) : null;

      // Build diagnostic result
      const errors = [];
      if (byPayload?.error) errors.push(String(byPayload.error));
      if (byPhone?.error) errors.push(String(byPhone.error));

      if (errors.length) return res.status(500).json({ ok: false, error: "update_failed", detail: errors.join(" | ") });

      return res.status(200).json({ ok: true, detail: "marked_by_token", byPayload: byPayload?.data, byPhone: byPhone?.data ?? null });
    }

    return res.status(400).json({ ok: false, error: "unknown_action" });
  } catch (err) {
    console.error("notifications_handle error:", err);
    return res.status(500).json({ ok: false, error: "server_error", detail: String(err) });
  }
}
