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
  // loading | ready | accepted | invalid | error

  // 1️⃣ Fetch invite details
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

  // 2️⃣ Auto-accept if logged in
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

  // 3️⃣ Handle auth redirect
  function handleLogin() {
    navigate(`/auth/login?redirect=/invite/${token}`);
  }

  // ⏳ Loading
  if (status === "loading" || authLoading) {
    return <div className="p-8 text-center text-gray-500">Loading invite…</div>;
  }

  // ❌ Invalid
  if (status === "invalid") {
    return <div className="p-8 text-center text-red-500">Invite not found or expired</div>;
  }

  // ✅ Already accepted
  if (status === "accepted") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">You’re already connected 💕</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white"
        >
          Go Home
        </button>
      </div>
    );
  }

  // ✨ Ready to accept
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="mb-4 text-2xl">🐟</div>

      <h2 className="text-xl font-semibold mb-2">
        {invite.from_user} invited you
      </h2>

      {invite.message && (
        <p className="text-gray-600 mb-6">{invite.message}</p>
      )}

      {!user ? (
        <button
          onClick={handleLogin}
          className="px-6 py-3 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white"
        >
          Login to accept
        </button>
      ) : (
        <button
          onClick={handleAccept}
          className="px-6 py-3 rounded-full bg-green-500 text-white"
        >
          Accept invite
        </button>
      )}
    </div>
  );
}
