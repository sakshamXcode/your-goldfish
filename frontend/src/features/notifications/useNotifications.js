import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  fetchNotifications,
  handleNotificationByToken,
} from "../../lib/api";
import demoData from "../../demo/demoData";

export default function useNotifications({ user_id = null, to_email = null } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user_id && !to_email) {
      setNotifications(demoData.notifications || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchNotifications({ user_id, to_email });
      setNotifications(res?.notifications || []);
    } catch {
      setNotifications(demoData.notifications || []);
    } finally {
      setLoading(false);
    }
  }, [user_id, to_email]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user_id && !to_email) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();

    return () => {
      // In React 18 Strict Mode, components mount/unmount rapidly. 
      // Supabase .removeChannel() can throw a websocket closed error if invoked 
      // before the connection establishes. We swallow it silently to keep console clean.
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [user_id, to_email, load]);



  async function markReadByToken(token) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.payload?.token === token ? { ...n, read: true } : n
      )
    );

    const res = await handleNotificationByToken({
      token,
      action: "mark_read_by_token",
    });

    if (!res.ok) {
      await load();
      throw new Error(res.error);
    }
  }

  return {
    notifications,
    loading,
    markReadByToken,
    refresh: load,
    setNotifications,
  };
}
