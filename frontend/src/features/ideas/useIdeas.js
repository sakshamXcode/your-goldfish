import { useEffect, useState, useCallback } from "react";
import { jsonFetch } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

export default function useIdeas({ user_id = null } = {}) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jsonFetch(`/ideas`);
      setIdeas(res?.ideas || []);
    } catch {
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: listen for new ideas so the partner sees them instantly
  useEffect(() => {
    if (!user_id) return;

    const channel = supabase.channel('ideas_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ideas' },
        (payload) => {
          const newIdea = payload.new;
          // Add the new idea if it's not already present and wasn't added by us
          // (our own creates are already handled optimistically via createIdea)
          if (newIdea.added_by !== user_id) {
            setIdeas(prev => {
              if (prev.find(i => i.id === newIdea.id)) return prev;
              return [newIdea, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ideas' },
        (payload) => {
          const updated = payload.new;
          setIdeas(prev =>
            prev.map(i => i.id === updated.id ? { ...i, ...updated } : i)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ideas' },
        (payload) => {
          const deleted = payload.old;
          setIdeas(prev => prev.filter(i => i.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user_id]);

  async function createIdea(payload) {
    const res = await jsonFetch("/ideas", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res?.ok) throw new Error(res?.error || "create_failed");
    setIdeas((prev) => [res.idea, ...prev]);
    return res.idea;
  }

  async function updateIdeaStatus({ idea_id, action }) {
    const res = await jsonFetch("/ideas", {
      method: "PATCH",
      body: JSON.stringify({ idea_id, action }),
    });

    if (!res?.ok) throw new Error(res?.error || "update_failed");
    // Update locally instead of full reload
    if (res.idea) {
      setIdeas(prev =>
        prev.map(i => i.id === res.idea.id ? res.idea : i)
      );
    }
    return res;
  }

  return {
    ideas,
    loading,
    reload: load,
    createIdea,
    updateIdeaStatus,
  };
}
