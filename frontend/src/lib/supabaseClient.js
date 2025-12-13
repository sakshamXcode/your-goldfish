// frontend/src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.warn('[supabaseClient] VITE_SUPABASE_* is not set. Auth will not work until env vars are configured.');
}

export const supabase = createClient(URL || '', KEY || '');
export default supabase;
