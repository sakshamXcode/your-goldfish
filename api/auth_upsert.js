import { supabaseServer } from "./_lib/supabase.js";
import { withAuth } from "./_utils/withAuth.js";

/**
 * Generate a unique username from an email prefix or random string.
 */
async function generateUniqueUsername(email) {
  const base = email ? email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 12) : "user";
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const candidate = `${base}${suffix}`;
    
    const { data: existing } = await supabaseServer
      .from("users")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    
    if (!existing) return candidate;
  }
  
  // Absolute fallback
  return `${base}${Date.now().toString(36)}`;
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { email = null, phone = null, display_name = null, avatar_url = null } = req.body || {};
    const id = req.user.id;

    // Check if user already exists (to decide if we need to generate a username)
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id, username")
      .eq("id", id)
      .maybeSingle();

    let username = existingUser?.username || null;
    
    // Only generate username for brand-new users
    if (!username) {
      username = await generateUniqueUsername(email || req.user.email);
    }

    const row = {
      id,
      email: email || req.user.email || null,
      phone,
      display_name,
      avatar_url,
      username,
      created_at: new Date().toISOString()
    };

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

export default withAuth(handler);
