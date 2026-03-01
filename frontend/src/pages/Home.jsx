// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import useIdeas from "../features/ideas/useIdeas";
import useTimeline from "../features/timeline/useTimeline";
import { useAuthContext } from "../contexts/AuthContext";
import IdeaCard from "../components/IdeaCard";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import { getCodeAPI, requestPartnerAPI } from "../lib/api";

export default function Home() {
  const { user, partner } = useAuthContext();
  const user_id = user?.id || null;
  const pair_id = user?.pair_id || null;
  const hasPartner = Boolean(partner);
  const navigate = useNavigate();

  const { ideas, loading, updateIdeaStatus } = useIdeas({ user_id });
  const { items: timeline, loading: timelineLoading } = useTimeline({ pair_id });

  async function handleMarkDone(idea) {
    try {
      await updateIdeaStatus({ idea_id: idea.id, action: "mark_done", user_id });
    } catch (err) {
      console.error("mark done failed", err);
    }
  }

  async function handleArchive(idea) {
    try {
      await updateIdeaStatus({ idea_id: idea.id, action: "archive", user_id });
    } catch (err) {
      console.error("archive failed", err);
    }
  }

  const timelinePreview = timeline.slice(0, 3);
  const activeIdeas = ideas.filter(i => i.status === 'active' || !i.status);
  const doneIdeas = ideas.filter(i => i.status === 'done');

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Onboarding Card OR Paired Header */}
      {!hasPartner ? (
        <OnboardingCard user={user} />
      ) : (
        <div className="mb-6 glass-card-static p-5 animate-fade-in-up" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06), rgba(59,130,246,0.04))',
        }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#c084fc' }}>
                Connected
              </div>
              <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                You <span className="mx-1">💞</span> Your Partner
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Shared ideas, shared moments
              </div>
            </div>
            <div className="text-3xl animate-float">💑</div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-lg font-bold text-aurora">{activeIdeas.length}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Active</div>
            </div>
            <div className="text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-lg font-bold" style={{ color: '#22c55e' }}>{doneIdeas.length}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Done</div>
            </div>
            <div className="text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-lg font-bold" style={{ color: '#60a5fa' }}>{timeline.length}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(hasPartner || ideas.length > 0) && (
        <div className="flex items-center justify-between mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Your Board
          </h2>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs px-4 py-2" onClick={() => navigate("/generator")}>
              🎲 Random
            </button>
            <button className="btn-ghost text-xs px-4 py-2" onClick={() => navigate("/places")}>
              📍 Places
            </button>
          </div>
        </div>
      )}

      {/* Timeline Preview */}
      {hasPartner && (
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Recent Activity
            </h3>
            <button onClick={() => navigate("/timeline")}
              className="text-xs font-medium transition-colors"
              style={{ color: '#c084fc' }}>
              View all →
            </button>
          </div>

          {timelineLoading && (
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading activity…</div>
          )}

          {!timelineLoading && timelinePreview.length === 0 && (
            <div className="glass-card-static p-5 text-center">
              <span className="text-2xl mb-2 block">🕰️</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No activity yet</span>
              <span className="text-xs block mt-1" style={{ color: 'var(--color-text-muted)' }}>Add ideas together to build your timeline.</span>
            </div>
          )}

          <div className="space-y-2 stagger-children">
            {timelinePreview.map((e) => (
              <TimelinePreviewItem key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && ideas.length === 0 && (
        <div className="mt-4 glass-card-static p-8 text-center animate-fade-in-up" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.04))',
        }}>
          <div className="text-4xl mb-3 animate-float">🪄</div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {hasPartner ? "Your board is pristine" : "Start saving date ideas"}
          </h3>
          <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {hasPartner
              ? "Start filling your shared board with dates, gifts, and memory links ✨"
              : "Add ideas now — they'll be shared with your partner once you connect!"}
          </p>
          <button onClick={() => navigate("/add")} className="btn-aurora mt-5 text-sm">
            Add your first idea
          </button>
        </div>
      )}

      {/* Ideas grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {loading && <SkeletonLoader count={3} className="h-64" />}
        {!loading && ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onPrimaryAction={() => handleMarkDone(idea)}
            onSecondaryAction={() => handleArchive(idea)}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingCard({ user }) {
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
    if (partnerCode.trim().length !== 8) {
      setStatus({ ok: false, text: 'Code must be 8 characters.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await requestPartnerAPI(partnerCode);
    if (res?.ok) {
      setStatus({ ok: true, text: 'Request sent! They will approve in notifications.' });
      setPartnerCode('');
    } else {
      setStatus({ ok: false, text: res?.error || 'Failed.' });
    }
    setLoading(false);
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}/invite/${myCode}`;
    const text = `Connect with me on Your Goldfish! My code: ${myCode}\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: 'Your Goldfish', text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    <div className="mb-6 glass-card-static p-6 animate-fade-in-up" style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))',
    }}>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2 animate-float">🐠</div>
        <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Welcome to Your Goldfish!
        </h3>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Share your code with your partner to start building your love board together.
        </p>
      </div>

      {/* My Code */}
      <div className="glass-card-static p-5 mb-4">
        <div className="text-xs font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#c084fc' }}>
          Your Connection Code
        </div>
        <div className="text-2xl tracking-[0.3em] font-mono font-bold text-center mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {myCode || '• • • • • • • •'}
        </div>
        <button onClick={handleShare} className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}>
          💬 Share with Partner
        </button>
      </div>

      {/* Enter Partner Code */}
      <div className="glass-card-static p-4">
        <p className="text-xs mb-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
          Have your partner's code?
        </p>
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
  );
}

function TimelinePreviewItem({ event }) {
  const icons = {
    idea_added: '💡', idea_done: '✅', invite_accepted: '🎉'
  };
  const icon = icons[event.type] || '📌';
  const text = event.type === 'idea_added' ? `added "${event.payload?.title}"`
    : event.type === 'idea_done' ? `completed "${event.payload?.title}"`
    : event.type === 'invite_accepted' ? 'Invite accepted'
    : event.type;

  return (
    <div className="glass-card-static p-3 flex items-center gap-3">
      <span className="text-base">{icon}</span>
      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {text}
      </span>
    </div>
  );
}
