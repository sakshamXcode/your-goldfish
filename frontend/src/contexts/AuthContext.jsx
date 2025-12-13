import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
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

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { subscription } = supabase.auth.onAuthStateChange((event, payload) => {
      const s = payload?.session ?? null;
      setSession(s);
      setUser(s?.user ?? null);

      if (event === "SIGNED_IN" && s?.user) {
        fetch("/api/auth_upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: s.user.id,
            email: s.user.email || null,
            phone: s.user.phone || null,
            display_name: s.user.user_metadata?.full_name || null,
            avatar_url: s.user.user_metadata?.avatar_url || null,
          }),
        }).catch(() => {});
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
