// frontend/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import useChat from "../features/chat/useChat";
import { useAuthContext } from "../contexts/AuthContext";
import { getCodeAPI, requestPartnerAPI } from "../lib/api";

function MessageBubble({ meId, msg }) {
  const isMe = (msg.from_user_id || msg.from_user) === meId;
  return (
    <div className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div className={`max-w-[75%] px-4 py-3 text-sm ${isMe ? "bubble-sent" : "bubble-received"}`}>
        <div style={{ color: 'var(--color-text-primary)' }}>
          {msg.text || msg.message}
        </div>
        {msg.created_at && (
          <div className="mt-1 text-right" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}

function PairingOverlay({ user }) {
  const [myCode, setMyCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getCodeAPI().then(res => {
        if (res?.ok && res?.code) setMyCode(res.code);
      });
    }
  }, [user?.id]);

  async function handleConnect() {
    if (!partnerCode.trim() || partnerCode.trim().length !== 8) {
      setStatus({ ok: false, text: 'Code must be 8 characters.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await requestPartnerAPI(partnerCode);
    if (res?.ok) {
      setStatus({ ok: true, text: 'Request sent! They will approve it in their notifications.' });
      setPartnerCode('');
    } else {
      setStatus({ ok: false, text: res?.error || 'Failed.' });
    }
    setLoading(false);
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}/invite/${myCode}`;
    const text = `Chat with me on Your Goldfish! My code: ${myCode}\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: 'Your Goldfish', text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6"
      style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-sm w-full text-center animate-fade-in-up">
        <div className="text-5xl mb-4 animate-float">💬</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Connect to start chatting
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Share your code with your partner, or enter theirs to pair up and unlock couple chat!
        </p>

        <div className="glass-card-static p-5 mb-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#c084fc' }}>
            Your Code
          </div>
          <div className="text-2xl tracking-[0.3em] font-mono font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {myCode || '• • • • • • • •'}
          </div>
          <button onClick={handleShare}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
            💬 Share with Partner
          </button>
        </div>

        <div className="glass-card-static p-4">
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Have your partner's code?</p>
          <div className="flex gap-2">
            <input type="text" value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234" maxLength={8}
              className="input-glass flex-1 uppercase tracking-widest font-mono text-center text-sm"
            />
            <button onClick={handleConnect} disabled={loading || partnerCode.length !== 8}
              className="btn-aurora text-sm px-5">
              {loading ? '...' : 'Connect'}
            </button>
          </div>
          {status && (
            <div className="mt-3 text-xs p-3 rounded-xl" style={{
              background: status.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: status.ok ? '#22c55e' : '#ef4444',
            }}>
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, partner } = useAuthContext();
  const user_id = user?.id || null;
  const hasPartner = Boolean(partner);
  const scrollRef = useRef(null);

  const { messages, loading, sending, error, sendMessage } = useChat({
    user_id: hasPartner ? user_id : null,
    partner_id: partner?.partner_id,
  });

  const [draft, setDraft] = useState("");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      await sendMessage(draft);
      setDraft("");
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 relative" style={{ minHeight: '70vh' }}>
      <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Chat
        </h2>
        {hasPartner && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22c55e' }} />
            Connected
          </div>
        )}
      </div>

      {!hasPartner && <PairingOverlay user={user} />}

      {hasPartner && (
        <>
          {error && (
            <div className="mb-3 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <div ref={scrollRef}
            className="glass-card-static p-4 overflow-auto"
            style={{ height: 'calc(70vh - 120px)', minHeight: 320 }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading chat…</span>
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-3xl mb-3 animate-float">👋</div>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No messages yet. Say hi!</span>
              </div>
            )}
            {!loading && messages.map((m) => (
              <MessageBubble key={m.id || m.created_at} meId={user_id} msg={m} />
            ))}
          </div>

          <form onSubmit={handleSend} className="mt-3 flex gap-2 animate-fade-in-up">
            <input
              className="input-glass flex-1"
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{ borderRadius: 999 }}
            />
            <button type="submit" disabled={sending || !draft.trim()}
              className="btn-aurora px-6"
              style={{ borderRadius: 999 }}>
              {sending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
