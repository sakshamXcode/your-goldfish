// server/utils/authMiddleware.js
import { supabaseServer } from "../lib/supabase.js";

/**
 * Express middleware to verify the Supabase JWT access token.
 * Extracts the token from the "Authorization: Bearer <token>" header,
 * asks Supabase to verify it securely, and attaches the verified
 * user object to `req.user`.
 */
export async function authMiddleware(req, res, next) {
  // Allow OPTIONS preflight requests to pass through
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Some public endpoints might not need auth (like preview), 
  // but we'll apply this to the ones that do. For now, we enforce it.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "missing_token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // getUser explicitly verifies the JWT signature and checks expiration
    // against the Supabase Auth server. It is secure against spoofing.
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      console.warn("[authMiddleware] Invalid token:", error?.message);
      return res.status(401).json({ ok: false, error: "invalid_token" });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("[authMiddleware] Error:", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
