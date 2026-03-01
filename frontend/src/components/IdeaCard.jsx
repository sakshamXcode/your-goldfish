// frontend/src/components/IdeaCard.jsx
import React, { useState } from "react";

const categoryColors = {
  Food: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  Romantic: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
  Travel: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  Reel: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  Creative: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' },
  Surprise: { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.3)' },
};

const categoryIcons = {
  Food: '🍽️',
  Romantic: '💕',
  Travel: '✈️',
  Reel: '🎬',
  Creative: '🎨',
  Surprise: '🎁',
};

const statusBadges = {
  done: { label: 'Completed', bg: 'rgba(34,197,94,0.15)', text: '#22c55e', icon: '✅' },
  archived: { label: 'Archived', bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', icon: '📁' },
};

export default function IdeaCard({ idea, onPrimaryAction, onSecondaryAction }) {
  const [hovered, setHovered] = useState(false);

  if (!idea) return null;
  const { title, category, image_url, preview_image, url, status } = idea;
  const displayImage = image_url || preview_image || null;
  const colors = categoryColors[category] || categoryColors.Food;
  const icon = categoryIcons[category] || '💡';
  const badge = status && status !== 'active' ? statusBadges[status] : null;

  return (
    <article
      className="glass-card overflow-hidden cursor-pointer transition-all duration-300 group"
      style={{
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 0 30px rgba(139,92,246,0.12)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image section */}
      <div className="h-36 relative overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))' }}>
        {displayImage ? (
          <img src={displayImage} alt={title || "idea"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="text-4xl animate-float">{icon}</div>
        )}
        {/* Status badge overlay */}
        {badge && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: badge.bg, color: badge.text, backdropFilter: 'blur(8px)' }}>
            <span>{badge.icon}</span> {badge.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          {category && (
            <span className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              {icon} {category}
            </span>
          )}

          {url && (
            <a href={url} target="_blank" rel="noreferrer"
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--color-aurora-purple)' }}
              onClick={(e) => e.stopPropagation()}>
              Open link ↗
            </a>
          )}
        </div>

        {/* Action buttons */}
        {(onPrimaryAction || onSecondaryAction) && status === 'active' && (
          <div className="mt-3 pt-3 flex gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {onPrimaryAction && (
              <button onClick={(e) => { e.stopPropagation(); onPrimaryAction(); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}>
                ✓ Done
              </button>
            )}
            {onSecondaryAction && (
              <button onClick={(e) => { e.stopPropagation(); onSecondaryAction(); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                Archive
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
