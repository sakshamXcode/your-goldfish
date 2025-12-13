// frontend/src/features/timeline/useTimeline.js
import { useEffect, useState, useCallback } from "react";

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

export default function useTimeline({ user_id = null } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user_id) params.set("user_id", user_id);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetchJson(`/api/timeline_list${query}`);
      if (res && res.ok) {
        setItems(res.timeline || []);
      } else {
        console.warn("timeline_list not ok:", res);
        setItems([]);
      }
    } catch (err) {
      console.error("load timeline failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load, setItems };
}
