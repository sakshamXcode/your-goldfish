// frontend/src/components/NotificationCard.jsx
import React from "react";

export default function NotificationCard({ data, onAccept, onReject }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <div className="font-semibold">
          {data.author} added a new {data.type}:
        </div>

        <div className="text-sm text-[#6E6E6E]">{data.text}</div>
        <div className="text-xs text-[#B0B0B0] mt-2">{data.time}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(data.id)}
          className="px-4 py-2 rounded-lg bg-[#FFE7F2] text-[#FF6FAF]"
        >
          Accept
        </button>

        <button
          onClick={() => onReject(data.id)}
          className="px-4 py-2 rounded-lg bg-white border"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
