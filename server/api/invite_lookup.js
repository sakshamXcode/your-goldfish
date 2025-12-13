// server/api/invite_lookup.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * Robust invite lookup that tolerates differing supabase client return shapes.
 * GET /api/invite_lookup?token=...
 */
function isQueryBuilder(obj) {
  return obj && typeof obj.eq === "function" && typeof obj.then === "function";
}

export default async function handler(req, res) {
  try {
    const token = req.method === "GET"
      ? new URL(req.url, `http://${req.headers.host}`).searchParams.get("token")
      : (req.body && req.body.token);

    if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

    // Try to build a select query
    const base = supabaseServer.from("invites").select("*");

    let lookupResp = null;

    // If base looks chainable (has eq), use chain
    if (isQueryBuilder(base)) {
      try {
        // prefer maybeSingle if available
        if (typeof base.eq === "function" && typeof base.maybeSingle === "function") {
          lookupResp = await base.eq("token", token).maybeSingle();
        } else if (typeof base.eq === "function" && typeof base.single === "function") {
          lookupResp = await base.eq("token", token).single();
        } else if (typeof base.eq === "function") {
          lookupResp = await base.eq("token", token);
        } else {
          lookupResp = await base;
        }
      } catch (err) {
        // If chainable attempt fails, fall back below
        console.warn("invite_lookup: chainable query failed, falling back", String(err));
      }
    }

    // If we didn't get a valid shape yet, try awaiting base and filter locally
    if (!lookupResp) {
      try {
        const awaited = await base; // might be { data, error } or array
        // Normalize
        if (awaited && ('data' in awaited || 'error' in awaited)) {
          // search in awaited.data
          const rows = awaited.data || [];
          const found = Array.isArray(rows) ? rows.find(r => String(r.token) === String(token)) : null;
          lookupResp = { data: found || null, error: null };
        } else if (Array.isArray(awaited)) {
          const found = awaited.find(r => String(r.token) === String(token));
          lookupResp = { data: found || null, error: null };
        } else {
          lookupResp = { data: null, error: null };
        }
      } catch (err) {
        console.error("invite_lookup: fallback await failed", err);
        return res.status(500).json({ ok: false, error: "lookup_failed", detail: String(err) });
      }
    }

    // Normalize final response
    const invite = (lookupResp && (lookupResp.data || lookupResp[0])) || null;
    if (!invite) return res.status(404).json({ ok: false, error: "not_found" });

    return res.status(200).json({ ok: true, invite });
  } catch (err) {
    console.error("invite_lookup exception", err);
    return res.status(500).json({ ok: false, error: "server_error", detail: String(err) });
  }
}
