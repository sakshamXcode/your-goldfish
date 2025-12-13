// frontend/src/hooks/useAuth.js - supabase v2-compatible small wrapper
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase?.auth) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        // supabase v2: getUser() returns { data: { user }, error }
        const result = await supabase.auth.getUser();
        const currentUser = result?.data?.user || null;
        if (mounted) setUser(currentUser);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      // v2 returns sub with unsubscribe method
      try { sub?.subscription?.unsubscribe?.(); } catch (e) { /* ignore */ }
    };
  }, []);

  async function signIn(email) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email });
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, signIn, signUp, signOut };
}
