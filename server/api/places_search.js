// server/api/places_search.js
import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;
const FOURSQUARE_KEY = process.env.FOURSQUARE_KEY;

/**
 * GET /api/places_search?query=...
 * Returns: { ok, results: [...] }
 */
export default async function handler(req, res) {
  try {
    const query = (req.method === "GET")
      ? (req.query?.query || new URL(req.url, `http://${req.headers.host}`).searchParams.get("query"))
      : (req.body && req.body.query);

    if (!query) return res.status(400).json({ ok: false, error: "missing_query" });

    // Google Places Text Search
    if (GOOGLE_KEY) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      const mapped = (data.results || []).map((r) => ({
        id: r.place_id,
        name: r.name,
        address: r.formatted_address,
        rating: r.rating,
        types: r.types,
        location: r.geometry?.location,
        photos: r.photos || null,
      }));
      return res.status(200).json({ ok: true, results: mapped });
    }

    // Foursquare fallback
    if (FOURSQUARE_KEY) {
      const url = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&limit=10`;
      const r = await fetch(url, { headers: { Authorization: FOURSQUARE_KEY }});
      const data = await r.json();
      const mapped = (data.results || []).map((r) => ({
        id: r.fsq_id || r.id,
        name: r.name,
        address: r.location?.formatted_address || null,
        categories: r.categories || [],
        location: r.geocodes?.main || r.geocodes?.center || null,
      }));
      return res.status(200).json({ ok: true, results: mapped });
    }

    // Default: no provider
    return res.status(200).json({ ok: true, results: [] });
  } catch (err) {
    console.error("places_search error", err);
    return res.status(500).json({ ok: false, error: "places_failed", detail: String(err) });
  }
}
