// frontend/src/pages/PlacesSearch.jsx
import React, { useState } from "react";
import usePlacesSearch from "../features/places/usePlacesSearch";
import useIdeas from "../features/ideas/useIdeas";
import { useAuthContext } from "../contexts/AuthContext";

function mapPlaceToIdea(place) {
  const name = place.name || place.title || place.display_name || "Unnamed place";
  const address = place.address || place.formatted_address || place.vicinity || "";
  const url = place.url || place.website || place.maps_url || place.google_maps_url || null;
  return { title: name, url, category: "Food", address };
}

export default function PlacesSearch() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const { results, loading, error, search } = usePlacesSearch();
  const { createIdea } = useIdeas({ user_id });

  async function handleSearch(e) {
    e.preventDefault();
    setFeedback("");
    await search({ query, location });
  }

  async function handleSave(place) {
    const mapped = mapPlaceToIdea(place);
    setSavingId(place.id || mapped.title);
    setFeedback("");
    try {
      await createIdea({
        title: mapped.title,
        url: mapped.url,
        category: mapped.category,
        added_by: user_id || "local_user",
      });
      setFeedback(`Saved "${mapped.title}" to your board ✨`);
    } catch (e) {
      console.error("save place as idea failed", e);
      setFeedback("Failed to save place as idea.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-2 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        📍 Find Places
      </h2>
      <p className="text-sm mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-muted)', animationDelay: '0.05s' }}>
        Search for cozy cafés, rooftops, or fun spots and save them as ideas.
      </p>

      <form onSubmit={handleSearch} className="glass-card-static p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            What are you looking for?
          </label>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. cafe, rooftop, pizza, date spot"
            className="input-glass" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Area / City <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bhubaneswar, KIIT, Patia"
            className="input-glass" />
        </div>

        <div className="flex justify-end gap-3 items-center">
          {error && <div className="text-xs mr-auto" style={{ color: '#ef4444' }}>{error}</div>}
          <button type="submit" className="btn-aurora text-sm" disabled={loading}>
            {loading ? "Searching…" : "🔍 Search"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="mt-3 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
          {feedback}
        </div>
      )}

      {/* Results */}
      <div className="mt-6 space-y-3 stagger-children">
        {loading && <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Searching…</div>}

        {!loading && results.length === 0 && !error && (
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No places yet. Try a search like{" "}
            <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>"cafe bhubaneswar"</span>.
          </div>
        )}

        {results.map((place) => {
          const mapped = mapPlaceToIdea(place);
          const rating = place.rating || place.score || null;

          return (
            <div key={place.id || mapped.title}
              className="glass-card p-4 flex justify-between gap-3 items-start">
              <div className="min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {mapped.title}
                </div>
                {mapped.address && (
                  <div className="mt-1 text-xs line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                    {mapped.address}
                  </div>
                )}
                {rating && (
                  <div className="mt-1 text-xs" style={{ color: '#facc15' }}>
                    ⭐ {rating}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                {mapped.url && (
                  <a href={mapped.url} target="_blank" rel="noreferrer"
                    className="text-xs font-medium" style={{ color: '#c084fc' }}>
                    View ↗
                  </a>
                )}
                <button type="button" onClick={() => handleSave(place)}
                  className="pill pill-active text-xs"
                  disabled={savingId === (place.id || mapped.title)}>
                  {savingId === (place.id || mapped.title) ? "Saving…" : "💾 Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
