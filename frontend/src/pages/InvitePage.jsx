// frontend/src/pages/InvitePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();

  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    async function loadInvite() {
      try {
        const res = await fetch(`/api/invite_lookup?token=${token}`);
        const json = await res.json();

        if (!res.ok || !json.ok || !json.invite) {
          setStatus("invalid");
          return;
        }

        if (json.invite.accepted) {
          setInvite(json.invite);
          setStatus("accepted");
          return;
        }

        setInvite(json.invite);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    }

    loadInvite();
  }, [token]);

  async function handleAccept() {
    if (!user || !token) return;

    try {
      const res = await fetch("/api/invite_accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          accepting_user_id: user.id,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "accept failed");
      }

      setStatus("accepted");
      setTimeout(() => navigate("/"), 1200);
    } catch (e) {
      console.error(e);
      alert("Failed to accept invite");
    }
  }

  function handleLogin() {
    navigate(`/auth/login?redirect=/invite/${token}`);
  }

  // Loading
  if (status === "loading" || authLoading) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in-up">
        <div className="text-3xl mb-3 animate-float">🐠</div>
        <div style={{ color: 'var(--color-text-muted)' }}>Loading invite…</div>
      </div>
    );
  }

  // Invalid
  if (status === "invalid") {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in-up">
        <div className="text-3xl mb-3">❌</div>
        <div style={{ color: '#ef4444' }}>Invite not found or expired</div>
      </div>
    );
  }

  // Accepted
  if (status === "accepted") {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in-up">
        <div className="text-4xl mb-4 animate-float">💕</div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          You're already connected!
        </h2>
        <button onClick={() => navigate("/")} className="btn-aurora text-sm px-6 py-3">
          Go Home
        </button>
      </div>
    );
  }

  // Ready
  return (
    <div className="max-w-md mx-auto mt-16 px-4 text-center animate-fade-in-up">
      <div className="text-4xl mb-4 animate-float">🐟</div>

      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {invite.from_user} invited you
      </h2>

      {invite.message && (
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>{invite.message}</p>
      )}

      {!user ? (
        <button onClick={handleLogin} className="btn-aurora text-sm px-6 py-3">
          Login to accept
        </button>
      ) : (
        <button onClick={handleAccept}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
          ✓ Accept invite
        </button>
      )}
    </div>
  );
}
