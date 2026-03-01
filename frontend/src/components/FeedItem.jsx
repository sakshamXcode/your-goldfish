import React from "react";

export default function FeedItem({ event }) {
  const time = event.created_at
    ? new Date(event.created_at).toLocaleString()
    : "";

  switch (event.type) {
    case "idea_added":
      return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-700">
            <strong>{event.actor_id}</strong> added an idea
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {event.payload?.title}
          </div>

          {event.payload?.image_url && (
            <img
              src={event.payload.image_url}
              alt={event.payload?.title}
              className="mt-3 w-full max-h-56 object-cover rounded-lg"
            />
          )}

          <div className="mt-2 text-xs text-gray-400">{time}</div>
        </div>
      );

    case "invite_accepted":
      return (
        <div className="bg-green-50 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-green-700">
            <strong>{event.actor_id}</strong> accepted the invite 🎉
          </div>
          <div className="mt-2 text-xs text-gray-400">{time}</div>
        </div>
      );

    case "invite_rejected":
      return (
        <div className="bg-red-50 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-red-700">
            <strong>{event.actor_id}</strong> rejected the invite
          </div>
          <div className="mt-2 text-xs text-gray-400">{time}</div>
        </div>
      );

    default:
      return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-700">{event.type}</div>
          <div className="mt-2 text-xs text-gray-400">{time}</div>
        </div>
      );
  }
}
