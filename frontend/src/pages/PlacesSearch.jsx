// frontend/src/pages/PlacesSearch.jsx
import React, { useState } from "react";
import usePlacesSearch from "../features/places/usePlacesSearch";
import useIdeas from "../features/ideas/useIdeas";
import { useAuthContext } from "../contexts/AuthContext";

function mapPlaceToIdea(place) {
  // Be defensive about shape: support various field names
  const name =
    place.name ||
    place.title ||
    place.display_name ||
    "Unnamed place";

  const address =
    place.address ||
    place.formatted_address ||
    place.vicinity ||
    "";

  const url =
    place.url ||
    place.website ||
    place.maps_url ||
    place.google_maps_url ||
    null;

  return {
    title: name,
    url,
    category: "Food", // could later vary by type
    address,
  };
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
        // not sending address to backend to avoid schema mismatch
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
    <div className="max-w-3xl mx-auto p-6 pb-24">
      <h2 className="text-xl font-semibold mb-3">Find cafés & places</h2>
      <p className="text-sm text-gray-600 mb-4">
        Search for cozy cafés, rooftops, or fun spots and save them directly as ideas.
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl p-4 shadow-sm space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What are you looking for?
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. cafe, rooftop, pizza, date spot"
            className="w-full p-3 rounded-lg border border-[#EFEFEF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optional area / city
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bhubaneswar, KIIT, Patia"
            className="w-full p-3 rounded-lg border border-[#EFEFEF]"
          />
        </div>

        <div className="flex justify-end gap-2 items-center">
          {error && (
            <div className="text-xs text-red-500 mr-auto">{error}</div>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white text-sm"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search places"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="mt-3 text-xs text-green-600">{feedback}</div>
      )}

      {/* Results */}
      <div className="mt-6 space-y-3">
        {loading && (
          <div className="text-sm text-gray-500">Searching…</div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-sm text-gray-500">
            No places yet. Try a search like{" "}
            <span className="font-semibold">"cafe bhubaneswar"</span>.
          </div>
        )}

        {results.map((place) => {
          const mapped = mapPlaceToIdea(place);
          const rating = place.rating || place.score || null;

          return (
            <div
              key={place.id || mapped.title}
              className="bg-white rounded-2xl p-4 shadow-sm flex justify-between gap-3 items-start"
            >
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base">
                  {mapped.title}
                </div>
                {mapped.address && (
                  <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {mapped.address}
                  </div>
                )}
                {rating && (
                  <div className="mt-1 text-xs text-yellow-600">
                    ⭐ {rating}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {mapped.url && (
                  <a
                    href={mapped.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#A86EFF] underline"
                  >
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleSave(place)}
                  className="px-3 py-1 rounded-full bg-[#FFF0F6] text-[#FF6FAF] text-xs"
                  disabled={savingId === (place.id || mapped.title)}
                >
                  {savingId === (place.id || mapped.title)
                    ? "Saving…"
                    : "Save as idea"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
