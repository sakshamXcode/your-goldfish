// frontend/src/features/notifications/useNotifications.js
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { fetchNotifications } from "../../lib/api";
import demoData from "../../demo/demoData";

/**
 * Notifications hook
 * - Backend API is the source of truth
 * - Supabase realtime only triggers reload()
 */
export default function useNotifications({ user_id = null, to_phone = null } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load notifications from backend API
   */
  const load = useCallback(async () => {
    // Demo mode
    if (!user_id && !to_phone) {
      setNotifications(demoData.notifications || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchNotifications({ user_id, to_phone });
      if (res?.ok) {
        setNotifications(res.notifications || []);
      } else {
        console.warn("fetchNotifications not ok:", res);
        setNotifications([]);
      }
    } catch (err) {
      console.warn("notifications fetch failed", err);
      setNotifications(demoData.notifications || []);
    } finally {
      setLoading(false);
    }
  }, [user_id, to_phone]);

  /**
   * Initial load
   */
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Realtime subscription
   * Only used to trigger reload()
   */
  useEffect(() => {
    if (!user_id && !to_phone) return;

    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;

          // Filter for this user
          if (user_id && row.user_id && row.user_id !== user_id) return;
          if (!user_id && to_phone && row.to_phone && row.to_phone !== to_phone) return;

          // Reload from backend
          load();
        }
      )
      .subscribe((status) => {
        console.log("notifications realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user_id, to_phone, load]);

  /**
   * Accept invite
   */
  async function acceptInvite({ token, accepting_user_id }) {
    if (!token) throw new Error("Missing token for acceptInvite");

    const res = await fetch("/api/invite_accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, accepting_user_id }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      throw new Error(json.error || "Failed to accept invite");
    }

    await load();
    return json;
  }

  /**
   * Reject / dismiss invite
   */
  async function rejectInvite({ token }) {
    if (!token) throw new Error("Missing token for rejectInvite");

    const res = await fetch("/api/notifications_handle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "dismiss",
        token,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      throw new Error(json.error || "Failed to reject invite");
    }

    await load();
    return json;
  }

  /**
   * Mark notification read by token
   * Optimistic UI + backend sync
   */
  async function markReadByToken(token) {
    if (!token) return;

    // Optimistic UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.payload?.token === token ? { ...n, read: true } : n
      )
    );

    const res = await fetch("/api/notifications_handle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "mark_read_by_token",
        token,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      // rollback if needed
      await load();
      throw new Error(json.error || "Failed to mark notification read");
    }

    return json;
  }

  return {
    notifications,
    loading,
    acceptInvite,
    rejectInvite,
    markReadByToken,
    refresh: load,
    setNotifications, // exposed intentionally
  };
}
