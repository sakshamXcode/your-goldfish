// frontend/src/pages/NotificationsPage.jsx
import React from "react";
import useNotifications from "../features/notifications/useNotifications";
import {useAuthContext } from "../contexts/AuthContext"; // if you have an auth context; otherwise pass user info manually

export default function NotificationsPage() {

  const { user } = useAuthContext();

  const user_id = user?.id || null;
  const to_phone = user?.phone || null;

  const { notifications, loading, acceptInvite, rejectInvite, markReadByToken } = useNotifications({ user_id, to_phone });

  async function onAccept(n) {
    const token = n.payload?.token || (n.payload && n.payload.token);
    // set the accepting_user_id to current user (or 'user_local' if none)
    const accepting_user_id = user_id || "user_local";
    try {
      await acceptInvite({ token, accepting_user_id });
      // optional: UI toast
    } catch (e) {
      console.error("accept failed", e);
      alert("Accept failed: " + e.message);
    }
  }

  async function onReject(n) {
    const token = n.payload?.token;
    try {
      await rejectInvite({ token });
    } catch (e) {
      console.error("reject failed", e);
      alert("Reject failed: " + e.message);
    }
  }

  async function onOpen(n) {
    const token = n.payload?.token;
    if (!token) return;
    // mark read immediately
    try { await markReadByToken(token); 
      
      
    } catch(e){console.log(e)}
    
    window.location.href = `/invite/${token}`;
    // deep-link to invite page
  }
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {!loading && notifications.length === 0 && (
        <div className="text-sm text-gray-500">No notifications</div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => {
          const isInvite = n.type === "invite";
          const token = n.payload?.token;
          const from = n.payload?.from || (n.payload?.from_user) || n.payload?.from_user_id;
          return (
            <div key={n.id} className={`bg-white p-4 rounded-lg shadow-sm flex justify-between items-start ${n.read ? "opacity-60" : "border-2 border-pink-50"}`}>
              <div>
                <div className="text-sm text-gray-700">
                  {isInvite ? <strong>{from}</strong> : <strong>{n.type}</strong>}
                  <span className="ml-2 text-xs text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">{n.payload?.message || n.payload?.token || "No details"}</div>
                {isInvite && token && (
                  <div className="mt-2 text-xs text-gray-400">token: {token}</div>
                )}
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => onOpen(n)} className="px-3 py-1 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white text-sm">
                  Open
                </button>

                {isInvite && (
                  <>
                    <button onClick={() => onAccept(n)} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">Accept</button>
                    <button onClick={() => onReject(n)} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm">Reject</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
