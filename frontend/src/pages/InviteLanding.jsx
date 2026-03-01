// frontend/src/pages/InviteLanding.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { requestPartnerAPI } from "../lib/api";

export default function InviteLanding() {
  const { token } = useParams(); // 'token' here is actually the 8-letter code
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleConnect() {
    if (!token || token.length !== 8) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestPartnerAPI(token);
      if (res?.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res?.error || "Failed to connect.");
      }
    } catch (err) {
      setError(err.message || "Failed to send connection request.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    // Save the redirect url so they come back to this specifically formatted code page
    navigate(`/auth/login?redirect=/invite/${token}`);
  }

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F6] via-[#FFE7F2] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="text-4xl mb-4">💌</div>
        <h2 className="text-2xl font-semibold mb-2">You've been invited!</h2>
        <p className="text-sm text-gray-600 mb-6">
          Your partner wants to connect with you on UsBook to share date ideas, memories, and places together.
        </p>

        <div className="mb-6 rounded-xl bg-[#FFF0F6] p-4 text-center">
          <div className="text-xs text-[#FF6FAF] font-bold uppercase tracking-widest mb-1">Connection Code</div>
          <div className="text-2xl tracking-widest font-mono font-bold text-gray-800">
            {token}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-green-600 font-medium p-3 bg-green-50 rounded-lg">
            Connection requested successfully! Taking you home...
          </div>
        ) : !user ? (
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white font-medium shadow-md shadow-pink-200"
            >
              Log in to Connect
            </button>
            <p className="text-xs text-gray-500">
              You'll need a free account to pair with your partner.
            </p>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white font-medium shadow-md shadow-pink-200 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Tap to Connect"}
          </button>
        )}
      </div>
    </div>
  );
}
