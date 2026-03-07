import { supabaseServer } from "./_lib/supabase.js";
import { withAuth } from "./_utils/withAuth.js";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const username = (req.query.username || "").trim().toLowerCase();
    
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({ ok: false, error: "invalid_username", available: false });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(400).json({ ok: false, error: "invalid_characters", available: false });
    }

    const { data: existing } = await supabaseServer
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    return res.status(200).json({
      ok: true,
      available: !existing,
    });
  } catch (err) {
    console.error("username_check error:", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}

export default withAuth(handler);
