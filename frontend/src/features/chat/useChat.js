import { useEffect, useState, useCallback, useRef } from "react";
import { jsonFetch } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

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
 * Normalize a message row from the DB (which uses from_user/to_user)
 * so the UI can always rely on from_user_id.
 */
function normalizeMsg(m) {
  return {
    ...m,
    from_user_id: m.from_user_id || m.from_user || null,
    text: m.text || m.message || "",
  };
}

/**
 * Chat hook
 * - Loads messages from /api/chat_list
 * - Sends messages via /api/chat_send
 * - Uses Supabase realtime for instant updates (partner messages only)
 */
export default function useChat({ user_id = null, partner_id = null } = {}) {
  const [messages, setMessages] = useState(demoMessages);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    if (!user_id) {
      setMessages(demoMessages);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("user_id", user_id);

      const json = await jsonFetch(`/chat_list?${params.toString()}`);
      if (json.ok === false) {
        throw new Error(json.error || "Failed to load chat");
      }

      const rows = Array.isArray(json.messages) ? json.messages : [];
      // Normalize all messages so from_user_id is always set
      setMessages(rows.map(normalizeMsg));
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

  // Listen for realtime updates — only add PARTNER messages
  useEffect(() => {
    if (!user_id || !partner_id) return;

    const channel = supabase.channel('chat_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        (payload) => {
          const newMsg = normalizeMsg(payload.new);

          // ONLY process messages FROM the partner TO us.
          // Our own sent messages are handled optimistically — no need to add them again.
          const isFromPartner =
            newMsg.from_user_id === partner_id &&
            (newMsg.to_user === user_id || payload.new.to_user === user_id);

          if (isFromPartner) {
            setMessages(prev => {
              // Prevent duplicates
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user_id, partner_id]);

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();

    if (!user_id) {
      // demo mode
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

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      from_user_id: user_id,
      text: clean,
      message: clean,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const json = await jsonFetch("/chat_send", {
        method: "POST",
        body: JSON.stringify({
          to_user: partner_id,
          message: clean,
        }),
      });

      if (json.ok === false) {
        throw new Error(json.error || "Failed to send");
      }

      // Replace the optimistic message with the real one from the server
      if (json.message) {
        const real = normalizeMsg(json.message);
        setMessages(prev =>
          prev.map(m => m.id === tempId ? real : m)
        );
      }

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
    bottomRef,
  };
}
