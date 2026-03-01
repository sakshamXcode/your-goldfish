// server/api/notifications.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * Notifications API
 *
 * GET  /api/notifications?user_id=...&to_email=...
 * POST /api/notifications  { action, token }
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (or specify your frontend URL)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    /* =====================================================
       GET: LIST NOTIFICATIONS
       /api/notifications?user_id=&to_email=
    ===================================================== */
    if (req.method === "GET") {
      const user_id = req.user.id;
      const to_email = req.user.email || "";

      let q = supabaseServer
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${user_id},to_email.eq.${to_email}`)
        .order("created_at", { ascending: false })
        .limit(100);

      const { data, error } = await q;

      if (error) {
        return res.status(500).json({
          ok: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        ok: true,
        notifications: data || [],
      });
    }

    /* =====================================================
       POST: HANDLE NOTIFICATION ACTIONS
       action = mark_read_by_token | dismiss
    ===================================================== */
    if (req.method === "POST") {
      const { action, token } = req.body || {};

      if (!action || !token) {
        return res.status(400).json({
          ok: false,
          error: "missing_params",
        });
      }

      // ---- MARK READ ----
      if (action === "mark_read_by_token") {
        const { error } = await supabaseServer
          .from("notifications")
          .update({ read: true })
          .filter("payload->>token", "eq", token);

        if (error) {
          return res.status(500).json({
            ok: false,
            error: error.message,
          });
        }

        return res.status(200).json({ ok: true });
      }

      // ---- DISMISS ----
      if (action === "dismiss") {
        const { error } = await supabaseServer
          .from("notifications")
          .update({ read: true, dismissed: true })
          .filter("payload->>token", "eq", token);

        if (error) {
          return res.status(500).json({
            ok: false,
            error: error.message,
          });
        }

        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({
        ok: false,
        error: "unknown_action",
      });
    }

    return res.status(405).json({
      ok: false,
      error: "method_not_allowed",
    });
  } catch (err) {
    console.error("notifications api error", err);
    return res.status(500).json({
      ok: false,
      error: "server_error",
    });
  }
}
