// frontend/src/pages/Timeline.jsx
import React from "react";
import useTimeline from "../features/timeline/useTimeline";
import { useAuthContext } from "../contexts/AuthContext";

export default function TimelinePage() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const { items, loading } = useTimeline({ user_id });

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        Memory Timeline
      </h2>

      {loading && <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading timeline…</div>}

      {!loading && items.length === 0 && (
        <div className="glass-card-static p-8 text-center animate-fade-in-up">
          <div className="text-3xl mb-2 animate-float">📖</div>
          <div className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No memories yet</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Mark ideas as "Done" to start your story
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4 stagger-children">
        {items.map((d) => (
          <div key={d.id} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {d.title || "Unnamed memory"}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {d.occurred_at
                    ? new Date(d.occurred_at).toLocaleString()
                    : d.created_at
                    ? new Date(d.created_at).toLocaleString()
                    : ""}
                </div>
              </div>
              <div className="text-sm">⭐</div>
            </div>
            {d.note && (
              <div className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{d.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
