// frontend/src/pages/TimelinePage.jsx
import React from "react";
import useTimeline from "../features/timeline/useTimeline";
import { useAuthContext } from "../contexts/AuthContext";
import RelationshipHeader from "../components/RelationshipHeader";

export default function TimelinePage() {
  const { user } = useAuthContext();
  const pair_id = user?.pair_id || null;
  const { items, loading } = useTimeline({ pair_id });

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <RelationshipHeader subtitle="Your relationship timeline" />

      <h2 className="text-xl font-bold mb-6 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        Timeline
      </h2>

      {loading && (
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading activity…</div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass-card-static p-8 text-center animate-fade-in-up">
          <div className="text-3xl mb-2 animate-float">🕰️</div>
          <div className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No activity yet</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Start adding ideas 💡</div>
        </div>
      )}

      {/* Timeline with connector line */}
      <div className="relative">
        {items.length > 1 && <div className="timeline-line" />}

        <div className="space-y-4 stagger-children">
          {items.map((event) => (
            <TimelineItem key={event.id} event={event} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ event, currentUserId }) {
  const actor = event.actor_id === currentUserId ? "You" : "Your partner";
  const time = event.created_at ? new Date(event.created_at).toLocaleString() : "";

  const typeConfig = {
    idea_added: { icon: '💡', color: '#f59e0b', title: `${actor} added an idea` },
    idea_done: { icon: '✅', color: '#22c55e', title: `${actor} completed an idea` },
    invite_accepted: { icon: '🎉', color: '#ec4899', title: `${actor} accepted the invite` },
    invite_rejected: { icon: '❌', color: '#ef4444', title: `${actor} rejected the invite` },
  };

  const config = typeConfig[event.type] || { icon: '📌', color: '#60a5fa', title: event.type };

  return (
    <div className="flex gap-4 items-start pl-2 relative">
      <div className="timeline-dot mt-1" style={{ boxShadow: `0 0 12px ${config.color}50` }} />

      <div className="glass-card-static p-4 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{config.icon}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {config.title}
          </span>
        </div>

        {event.payload?.title && (
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {event.payload.title}
          </div>
        )}

        {event.payload?.image_url && (
          <img src={event.payload.image_url} alt={event.payload.title}
            className="mt-3 w-full max-h-48 object-cover rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
        )}

        <div className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {time}
        </div>
      </div>
    </div>
  );
}
