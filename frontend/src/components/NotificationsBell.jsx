// frontend/src/components/NotificationsBell.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../features/notifications/useNotifications";

export default function NotificationsBell({ to_email, user_id }) {
  const { notifications, loading } = useNotifications({
    user_id: user_id || null,
    to_email: to_email || null,
  });

  const navigate = useNavigate();
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
      aria-label="Notifications"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
        <path d="M18 16V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5L4 18v1h16v-1l-2-2Z" />
      </svg>

      {!loading && unreadCount > 0 && (
        <span className="badge-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
