// frontend/src/pages/NotificationsPage.jsx
import React from "react";
import useNotifications from "../features/notifications/useNotifications";
import { useAuthContext } from "../contexts/AuthContext";
import { acceptPartnerAPI, handleNotificationByToken } from "../lib/api";
import { useNavigate } from "react-router-dom";

const typeConfig = {
  partner_request: { icon: '💘', label: 'Connection Request', color: '#ec4899' },
  chat: { icon: '💬', label: 'New Message', color: '#8b5cf6' },
  idea_added: { icon: '💡', label: 'New Idea', color: '#f59e0b' },
  default: { icon: '🔔', label: 'Notification', color: '#60a5fa' },
};

export default function NotificationsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const user_id = user?.id || null;
  const to_email = user?.email || null;
  const { notifications, loading } = useNotifications({ user_id, to_email });

  async function onAcceptPartner(n) {
    const token = n.payload?.token;
    try {
      const res = await acceptPartnerAPI(token);
      if (res?.ok) {
        alert("You are now connected!");
        window.location.href = "/";
      } else {
        alert("Accept failed: " + res?.error);
      }
    } catch (e) {
      console.error("accept failed", e);
      alert("Accept failed: " + e.message);
    }
  }

  async function onDecline(n) {
    const token = n.payload?.token;
    try {
      await handleNotificationByToken({ token, action: "mark_read_by_token" });
      window.location.reload();
    } catch (e) {
      console.error("decline failed", e);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        Notifications
      </h2>

      {loading && <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>}

      {!loading && notifications.length === 0 && (
        <div className="glass-card-static p-8 text-center mt-6 animate-fade-in-up">
          <div className="text-3xl mb-2">📭</div>
          <div className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>All caught up!</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>You have no new notifications.</div>
        </div>
      )}

      <div className="space-y-3 mt-4 stagger-children">
        {notifications.map((n) => {
          const isPartnerReq = n.type === "partner_request";
          const token = n.payload?.token;
          const config = typeConfig[n.type] || typeConfig.default;
          const fromName = n.payload?.requester_name || "Someone";
          const titleText = n.text || (isPartnerReq ? `${fromName} wants to connect!` : n.type);

          return (
            <div key={n.id}
              className={`glass-card-static p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${n.handled ? "opacity-40" : ""}`}
              style={{
                borderLeft: n.handled ? undefined : `3px solid ${config.color}`,
              }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${config.color}15` }}>
                  {config.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {titleText}
                  </div>

                  {isPartnerReq && (
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      They used your code ({token}) to send a connection request.
                    </div>
                  )}

                  {!isPartnerReq && (
                    <div className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {n.payload?.message || n.payload?.token || "No details"}
                    </div>
                  )}

                  <div className="mt-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </div>
                </div>
              </div>

              {!n.handled && isPartnerReq && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => onAcceptPartner(n)}
                    className="btn-aurora flex-1 md:flex-none text-sm px-6 py-2">
                    Approve
                  </button>
                  <button onClick={() => onDecline(n)}
                    className="btn-ghost flex-1 md:flex-none text-sm px-6 py-2">
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
