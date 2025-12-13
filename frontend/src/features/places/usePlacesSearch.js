// frontend/src/features/places/usePlacesSearch.js
import { useState, useCallback } from "react";

function fetchJson(url, options = {}) {
  return fetch(url, options).then(async (r) => {
    const txt = await r.text();
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  });
}

/**
 * Hook to search public places (cafés, etc.) via /api/places_search.
 * We keep it tolerant about response shape so backend changes don't crash UI.
 */
export default function usePlacesSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = useCallback(async ({ query, location }) => {
    if (!query || !query.trim()) {
      setError("Please enter something to search.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try{
      const params = new URLSearchParams();
      params.set("q", query.trim());
      params.set("query", query.trim()); // support both keys
      if (location && location.trim()) {
        params.set("location", location.trim());
      }

      const res = await fetchJson(`/api/places_search?${params.toString()}`);

      if (!res || res.ok === false) {
        setError(res?.error || "Search failed");
        setResults([]);
        return;
      }

      // Backend might return { places: [...] } or a raw array; normalize
      const list =
        Array.isArray(res)
          ? res
          : Array.isArray(res.places)
          ? res.places
          : [];

      setResults(list);
    } catch (e) {
      console.error("places_search failed", e);
      setError("Search failed. Try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
