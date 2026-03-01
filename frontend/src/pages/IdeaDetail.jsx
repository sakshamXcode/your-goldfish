// frontend/src/pages/IdeaDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import demoData from '../demo/demoData';

export default function IdeaDetail() {
  const { id } = useParams();
  const idea = demoData.ideas.find((i) => String(i.id) === String(id)) || demoData.ideas[0];

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="glass-card-static overflow-hidden animate-fade-in-up">
        <div className="h-56 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))' }}>
          {idea.image ? (
            <img src={idea.image} alt={idea.title} className="object-cover w-full h-full" />
          ) : (
            <div className="text-4xl animate-float">🌸</div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{idea.title}</h3>
          <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {idea.description || 'No description yet.'}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {idea.tags.map((t) => (
              <span key={t} className="pill pill-active text-xs">{t}</span>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button className="btn-aurora text-sm px-5 py-2.5">✓ Mark Done</button>
            <button className="btn-ghost text-sm px-5 py-2.5">Add To Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
