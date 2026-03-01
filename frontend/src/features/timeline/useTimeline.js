import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { fetchTimeline } from "../../lib/api";

export default function useTimeline({ pair_id = null } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const load = useCallback(async () => {
    if (!pair_id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await fetchTimeline(pair_id);
    setItems(res?.timeline || []);
    setLoading(false);
  }, [pair_id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!pair_id) return;

    const channel = supabase
      .channel(`timeline:${pair_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "timeline_events",
          filter: `pair_id=eq.${pair_id}`,
        },
        (payload) => {
          setItems((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [pair_id]);

  return { items, loading, reload: load };
}
