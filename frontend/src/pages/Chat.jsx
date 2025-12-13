// frontend/src/pages/Chat.jsx
import React, { useState } from "react";
import useChat from "../features/chat/useChat";
import { useAuthContext } from "../contexts/AuthContext";

function MessageBubble({ meId, msg }) {
  const isMe = msg.from_user_id === meId || msg.from_user_id === "me";
  return (
    <div className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] p-3 rounded-2xl text-sm ${
          isMe ? "bg-[#DDE7FF]" : "bg-[#FFF0F6]"
        }`}
      >
        <div>{msg.text}</div>
        {msg.created_at && (
          <div className="mt-1 text-[10px] text-gray-500 text-right">
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;

  const { messages, loading, sending, error, sendMessage } = useChat({
    user_id,
  });

  const [draft, setDraft] = useState("");

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    try {
      await sendMessage(draft);
      setDraft("");
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pb-24">
      <h2 className="text-xl font-semibold mb-3">Couple Chat</h2>
      {user_id ? (
        <p className="text-xs text-gray-500 mb-3">
          Logged in as{" "}
          <span className="font-semibold">
            {user.email || user.phone || user_id}
          </span>
        </p>
      ) : (
        <p className="text-xs text-gray-500 mb-3">
          Demo mode: messages are local only.
        </p>
      )}

      {error && (
        <div className="mb-2 text-xs text-red-500">
          {error}
        </div>
      )}

      <div className="mt-2 bg-white rounded-2xl p-4 shadow-sm h-80 overflow-auto">
        {loading && (
          <div className="text-sm text-gray-500">Loading chat…</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-sm text-gray-500">
            No messages yet. Say hi 👋
          </div>
        )}

        {!loading &&
          messages.map((m) => (
            <MessageBubble key={m.id || m.created_at} meId={user_id} msg={m} />
          ))}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          className="flex-1 p-3 rounded-full border border-[#EFEFEF]"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="px-4 py-2 bg-[#FFE7F2] rounded-full text-[#FF6FAF] text-sm disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
