// frontend/src/pages/Timeline.jsx
import React from "react";
import useTimeline from "../features/timeline/useTimeline";
import { useAuthContext } from "../contexts/AuthContext";

export default function TimelinePage() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const { items, loading } = useTimeline({ user_id });

  return (
    <div className="p-6 max-w-3xl mx-auto pb-24">
      <h2 className="text-xl font-semibold mb-4">Memory Timeline</h2>

      {loading && <div className="text-sm text-gray-500">Loading timeline…</div>}

      {!loading && items.length === 0 && (
        <div className="text-sm text-gray-500">
          No memories logged yet. Mark ideas as “Done” to start your story 📖
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {items.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm sm:text-base">
                  {d.title || "Unnamed memory"}
                </div>
                <div className="text-xs text-[#B0B0B0]">
                  {d.occurred_at
                    ? new Date(d.occurred_at).toLocaleString()
                    : d.created_at
                    ? new Date(d.created_at).toLocaleString()
                    : ""}
                </div>
              </div>
              <div className="text-sm text-[#6E6E6E]">⭐</div>
            </div>
            {d.note && (
              <div className="mt-3 text-sm text-[#6E6E6E]">{d.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
