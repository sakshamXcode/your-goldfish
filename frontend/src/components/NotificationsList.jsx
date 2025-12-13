// frontend/src/components/NotificationsList.jsx
import React from "react";
import useNotifications from "../features/notifications/useNotifications";
import useAuth from "../hooks/useAuth";

export default function NotificationsList() {
  const { user } = useAuth();
  const { notifications, loading, markAsRead } = useNotifications(user?.id);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <div className="mt-4 flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id} className="p-4 rounded-lg bg-white shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{n.type}</div>
                <div className="text-xs text-gray-600">{n.payload?.message || JSON.stringify(n.payload)}</div>
              </div>
              <div className="text-sm">
                {!n.read ? <button className="px-3 py-1 border rounded" onClick={() => markAsRead([n.id])}>Mark read</button> : <span className="text-gray-400">Read</span>}
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div className="text-gray-500">No notifications</div>}
      </div>
    </div>
  );
}
