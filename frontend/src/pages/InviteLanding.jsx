// frontend/src/pages/InviteLanding.jsx
import React, { useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";


function fetchJson(url, opts = {}) {
  return fetch(url, opts).then(async (r) => {
    const txt = await r.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

export default function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
const { user } = useAuthContext();

  const [state, setState] = useState({
    loading: true,
    error: null,
    invite: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchJson(`/api/invite_lookup?token=${encodeURIComponent(token)}`);
        if (!cancelled) {
          if (!res || !res.ok || !res.invite) {
            setState({ loading: false, error: "Invalid or expired invite", invite: null });
          } else {
            setState({ loading: false, error: null, invite: res.invite });
          }
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: String(err), invite: null });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  async function handleAccept() {
    if (!state.invite) return;
    try {
      const accepting_user_id = user?.id || "user_saksham"; // dev default
      const res = await fetchJson("/api/invite_accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, accepting_user_id }),
      });

      if (!res || !res.ok) {
        alert("Failed to accept invite.");
        return;
      }

      // best-effort mark notifications read
      try {
        await fetchJson("/api/notifications_handle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read_by_token", token }),
        });
      } catch (e) {
        console.log(e)
      }

      alert("Invite accepted!");
      navigate("/"); // go home (or your main board)
    } catch (err) {
      console.error(err);
      alert("Error accepting invite: " + err.message);
    }
  }

  async function handleReject() {
    try {
      const res = await fetchJson("/api/invite_reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res || !res.ok) {
        alert("Failed to reject invite.");
        return;
      }

      try {
        await fetchJson("/api/notifications_handle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read_by_token", token }),
        });
      } catch (e) {
        console.log(e)
      }

      alert("Invite rejected.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error rejecting invite: " + err.message);
    }
  }

  const { loading, error, invite } = state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F6] via-[#FFE7F2] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        {loading && <div className="text-sm text-gray-500">Loading invite…</div>}
        {error && (
          <div className="text-center">
            <div className="text-lg font-semibold text-red-500 mb-2">Invite problem</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm"
            >
              Go home
            </button>
          </div>
        )}

        {!loading && !error && invite && (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Join Your Goldfish</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{invite.from_user || "Your partner"}</strong> invited you to share date ideas, reels and places
              in your private UsBook.
            </p>

            <div className="mb-4 rounded-xl bg-[#FFF0F6] p-3 text-sm text-gray-700">
              <div className="font-medium mb-1">Message</div>
              <div>{invite.message || "No custom message, just vibes 💌"}</div>
            </div>

            <div className="mb-4 text-xs text-gray-500 space-y-1">
              <div><strong>Invite to:</strong> {invite.to_phone}</div>
              <div><strong>Expires:</strong> {invite.expires_at ? new Date(invite.expires_at).toLocaleString() : "Not set"}</div>
              {invite.accepted && (
                <div className="text-green-600">
                  Already accepted by {invite.accepted_by || "someone"} at{" "}
                  {invite.accepted_at ? new Date(invite.accepted_at).toLocaleString() : ""}
                </div>
              )}
              {invite.rejected && (
                <div className="text-red-500">
                  Already rejected at {invite.rejected_at ? new Date(invite.rejected_at).toLocaleString() : ""}
                </div>
              )}
            </div>

            {!invite.accepted && !invite.rejected && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAccept}
                  className="flex-1 px-4 py-2 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white text-sm font-medium"
                >
                  Accept invite
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm"
                >
                  Decline
                </button>
              </div>
            )}

            {(invite.accepted || invite.rejected) && (
              <div className="mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm"
                >
                  Back home
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
