import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { jsonFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";
import usePartner from "../hooks/usePartner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { partner, loading: partnerLoading } = usePartner(user?.id);

  useEffect(() => {
    let mounted = true;

    const isMagicLink = window.location.hash.includes('access_token=');

    // 1. Fetch initial session (handles both standard loads & magic link resolution natively in Supabase)
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("Error getting session:", error.message);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      window.__SUPABASE_TOKEN__ = data?.session?.access_token ?? null;
      
      // CRITICAL FIX: If we see a magic link in the URL, DO NOT release the loading lock. 
      // Supabase is currently exchanging that token for a session in the background. 
      // If we release the lock here, ProtectedRoute will instantly bounce the user back to /auth/login.
      if (!isMagicLink) {
        setLoading(false);
      }
    });

    // 2. Listen for future auth events
    // In Supabase v2, the callback receives (event, session) where session IS the session directly.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      window.__SUPABASE_TOKEN__ = session?.access_token ?? null;
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
         setLoading(false); // Failsafe unlock once the auth state securely finalizes
      }

      // If they just signed in, securely upsert their profile to our DB
      if (event === "SIGNED_IN" && session?.user) {
        jsonFetch("/auth_upsert", {
          method: "POST",
          body: JSON.stringify({
            email: session.user.email || null,
            phone: session.user.phone || null,
            display_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
          }),
        }).then((res) => {
          if (res?.ok && res?.user?.username) {
            // Merge username into user state
            setUser(prev => prev ? { ...prev, username: res.user.username } : prev);
          }
        }).catch((err) => console.warn("auth_upsert failed:", err));
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    window.__SUPABASE_TOKEN__ = null;
    navigate("/auth/login");
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        partner,
        loading: loading || partnerLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
