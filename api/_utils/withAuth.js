// api/_utils/withAuth.js
import { supabaseServer } from "../_lib/supabase.js";

/**
 * Higher-order function to wrap serverless handlers with authentication.
 * Verification is done against Supabase Auth.
 */
export function withAuth(handler) {
  return async (req, res) => {
    // 1. Handle CORS & OPTIONS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 2. Extract Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, error: "missing_token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      // 3. Verify Token with Supabase
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);

      if (error || !user) {
        console.warn("[withAuth] Invalid token:", error?.message);
        return res.status(401).json({ ok: false, error: "invalid_token" });
      }

      // 4. Attach user to req and call original handler
      req.user = user;
      return await handler(req, res);
    } catch (err) {
      console.error("[withAuth] Error:", err);
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  };
}
