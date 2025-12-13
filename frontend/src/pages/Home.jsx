// frontend/src/pages/Home.jsx
import React from "react";
import useIdeas from "../features/ideas/useIdeas";
import { useAuthContext } from "../contexts/AuthContext";
import IdeaCard from "../components/IdeaCard";
import { useNavigate } from "react-router-dom";

function fetchJson(url, opts = {}) {
  return fetch(url, opts).then(async (r) => {
    const txt = await r.text();
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  });
}

export default function Home() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const navigate = useNavigate();

  const { ideas, loading, updateIdeaStatus } = useIdeas({ user_id });

  async function handleMarkDone(idea) {
    try {
      // 1) Update idea status in backend
      await updateIdeaStatus({ idea_id: idea.id, action: "mark_done" });

      // 2) Add timeline entry
      await fetchJson("/api/timeline_add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: idea.id,
          title: idea.title,
          occurred_at: new Date().toISOString(),
          note: "Marked as done from board",
          user_id: user_id || "local_user",
        }),
      });
    } catch (err) {
      console.error("mark done failed", err);
      alert("Failed to mark done: " + (err.message || err));
    }
  }

  async function handleArchive(idea) {
    try {
      await updateIdeaStatus({ idea_id: idea.id, action: "archive" });
    } catch (err) {
      console.error("archive failed", err);
      alert("Failed to archive: " + (err.message || err));
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Love Board</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
            onClick={() => navigate("/generator")}
          >
            Random
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
            onClick={() => navigate("/notifications")}
          >
            Review
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-white shadow-sm text-sm"
            onClick={() => navigate("/places")}
          >
            Find places
          </button>
        </div>
      </div>


      {loading && <div className="text-sm text-gray-500">Loading ideas…</div>}

      {!loading && ideas.length === 0 && (
        <div className="text-sm text-gray-500">
          No ideas yet. Tap “Add an idea” to start filling your board ✨
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((it) => (
          <IdeaCard
            key={it.id}
            item={mapIdeaToCard(it)}
            onPrimaryAction={() => handleMarkDone(it)}
            onSecondaryAction={() => handleArchive(it)}
          />
        ))}
      </div>
    </div>
  );
}

function mapIdeaToCard(idea) {
  return {
    id: idea.id,
    title: idea.title,
    tags: idea.tags || [idea.category || "Idea"],
    img: idea.preview_image || null,
    url: idea.url || null,
    status: idea.status || null,
  };
}
