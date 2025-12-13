// frontend/src/pages/Notifications.jsx
import React from 'react';
import demoData from '../demo/demoData';

export default function Notifications() {
  const notifications = demoData.notifications;

  return (
    <section>
      <h2 className="text-xl font-semibold">Notifications</h2>
      <div className="mt-4 flex flex-col gap-3">
        {notifications.length === 0 && <div className="text-sm text-[#6E6E6E]">No pending items</div>}
        {notifications.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold">{n.author} added a new {n.type}:</div>
              <div className="text-sm text-[#6E6E6E]">{n.text}</div>
              <div className="text-xs text-[#B0B0B0] mt-2">{n.time} ago</div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-[#FFE7F2] text-[#FF6FAF]">Accept</button>
              <button className="px-4 py-2 rounded-lg bg-white border">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
