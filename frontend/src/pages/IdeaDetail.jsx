// frontend/src/pages/IdeaDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import demoData from '../demo/demoData';

export default function IdeaDetail() {
  const { id } = useParams();
  const idea = demoData.ideas.find((i) => String(i.id) === String(id)) || demoData.ideas[0];

  return (
    <section>
      <div className="rounded-2xl overflow-hidden shadow-md bg-white">
        <div className="h-56 bg-gradient-to-br from-[#FFE7F2] to-[#FFF0F6] flex items-center justify-center">
          {idea.image ? <img src={idea.image} alt={idea.title} className="object-cover w-full h-full" /> : <div className="text-3xl">🌸</div>}
        </div>

        <div className="p-4">
          <h3 className="text-2xl font-bold">{idea.title}</h3>
          <div className="mt-2 text-sm text-[#6E6E6E]">{idea.description || 'No description yet.'}</div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {idea.tags.map((t) => <span key={t} className="text-xs px-3 py-1 rounded-full bg-[#FFF0F6]">{t}</span>)}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white">Mark Done</button>
            <button className="px-4 py-2 rounded-full bg-white border">Add To Plan</button>
          </div>
        </div>
      </div>
    </section>
  );
}
