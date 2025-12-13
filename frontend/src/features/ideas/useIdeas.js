// frontend/src/features/ideas/useIdeas.js
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

/**
 * useIdeas
 * - loads ideas from /api/ideas_status
 * - lets you create new ideas via /api/ideas_create
 * - lets you update status (accepted/rejected/archived) via /api/ideas_handle
 *
 * usage:
 * const { ideas, loading, createIdea, updateIdeaStatus, reload } = useIdeas({ user_id, partner_id });
 */
export default function useIdeas({ user_id = null, partner_id = null } = {}) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user_id) params.set("user_id", user_id);
      if (partner_id) params.set("partner_id", partner_id);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetchJson(`/api/ideas_status${query}`);
      if (res && res.ok) {
        setIdeas(res.ideas || []);
      } else {
        console.warn("ideas_status not ok:", res);
        setIdeas([]);
      }
    } catch (err) {
      console.error("load ideas failed:", err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [user_id, partner_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function createIdea({ title, url = null, category = "general", added_by = null }) {
    const body = {
      title,
      url,
      category,
      added_by: added_by || user_id || "local_user",
    };
    const res = await fetchJson("/api/ideas_create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res || !res.ok || !res.idea) {
      throw new Error(res?.error || "Failed to create idea");
    }

    // optimistic prepend
    setIdeas((prev) => [res.idea, ...prev]);
    return res.idea;
  }

  async function updateIdeaStatus({ idea_id, action }) {
    const res = await fetchJson("/api/ideas_handle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_id, action }),
    });

    if (!res || !res.ok) {
      throw new Error(res?.error || "Failed to update idea");
    }

    // very simple client update: if server returns idea, use it; else reload
    if (res.idea) {
      setIdeas((prev) =>
        prev.map((it) => (it.id === res.idea.id ? res.idea : it))
      );
    } else {
      load();
    }

    return res;
  }

  return {
    ideas,
    loading,
    reload: load,
    createIdea,
    updateIdeaStatus,
    setIdeas, // in case UI wants to reorder locally
  };
}
