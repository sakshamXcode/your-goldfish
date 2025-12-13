// frontend/src/components/NotificationsBell.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../features/notifications/useNotifications";

export default function NotificationsBell({ to_phone, user_id }) {
  // For now, prefer explicit props, fall back to your own dev phone
  const effectivePhone = to_phone || "+918081308505"; // your number for dev
  const { notifications, loading } = useNotifications({
    user_id: user_id || null,
    to_phone: effectivePhone,
    // no supabase client yet, just polling
  });

  const navigate = useNavigate();

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  function handleClick() {
    navigate("/notifications");
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-pink-50 transition"
      aria-label="Notifications"
    >
      {/* Bell icon using pure JSX (no icon library required) */}
      <span className="inline-block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
          <path d="M18 16V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5L4 18v1h16v-1l-2-2Z" />
        </svg>
      </span>

      {/* Badge */}
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6FAF] text-white text-[10px] flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
