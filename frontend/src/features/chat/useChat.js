// frontend/src/features/chat/useChat.js
import { useEffect, useState, useCallback } from "react";

const demoMessages = [
  {
    id: "demo-1",
    from_user_id: "her",
    text: "Hey — saw this reel, looks perfect for our next date 😍",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "demo-2",
    from_user_id: "me",
    text: "Love it — let's save it to the board!",
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "demo-3",
    from_user_id: "her",
    text: "Also found a cozy cafe nearby.",
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

/**
 * Chat hook
 * - Loads messages from /api/chat_list?user_id=...
 * - Sends messages via /api/chat_send
 * - Polls periodically for new messages
 */
export default function useChat({ user_id = null } = {}) {
  const [messages, setMessages] = useState(demoMessages);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user_id) {
      // demo mode
      setMessages(demoMessages);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("user_id", user_id);
      const res = await fetch(`/api/chat_list?${params.toString()}`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.ok === false) {
        console.warn("chat_list not ok", json);
        setMessages([]);
        setError(json.error || "Failed to load chat");
        return;
      }

      const rows = Array.isArray(json.messages) ? json.messages : [];
      setMessages(rows);
    } catch (e) {
      console.error("chat_list failed", e);
      setError("Failed to load chat");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    load();
  }, [load]);

  // Small polling for now (every 5 seconds)
  useEffect(() => {
    if (!user_id) return;
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [user_id, load]);

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();

    if (!user_id) {
      // demo mode: just append locally
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          from_user_id: "me",
          text: clean,
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    setSending(true);
    setError("");

    // optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      from_user_id: user_id,
      text: clean,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat_send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user_id: user_id,
          text: clean,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "Failed to send");
      }

      // Reload from server to get the final version (with id, timestamps, etc.)
      await load();
      return json;
    } catch (e) {
      console.error("chat_send failed", e);
      setError(e.message || "Failed to send message");
      // remove the optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      throw e;
    } finally {
      setSending(false);
    }
  }

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
  };
}
