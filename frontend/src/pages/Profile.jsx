import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getCodeAPI, requestPartnerAPI } from '../lib/api';

export default function Profile() {
  const { user, partner, signOut } = useAuthContext();
  const [myCode, setMyCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getCodeAPI().then(res => {
        if (res?.ok && res?.code) setMyCode(res.code);
      });
    }
  }, [user?.id]);

  async function handleConnect() {
    if (!partnerCode.trim() || partnerCode.trim().length !== 8) {
      setStatus({ ok: false, text: 'Code must be exactly 8 characters.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await requestPartnerAPI(partnerCode);
    if (res?.ok) {
      setStatus({ ok: true, text: 'Request sent! They will see it in their notifications.' });
      setPartnerCode('');
    } else {
      setStatus({ ok: false, text: res?.error || 'Failed to send request.' });
    }
    setLoading(false);
  }

  function handleCopyCode() {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        Settings
      </h2>

      {/* User Profile Card */}
      <div className="glass-card-static p-6 mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              boxShadow: '0 0 25px rgba(139,92,246,0.3)',
            }}>
            {initial}
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{displayName}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email || 'No email set'}</div>
            {partner && (
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium"
                style={{ color: '#c084fc' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22c55e' }} />
                💞 Paired with your partner
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Code */}
      {!partner && (
        <div className="glass-card-static p-6 mb-4 animate-fade-in-up" style={{
          animationDelay: '0.1s',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.04))',
        }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Your Connection Code</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Share this with your partner to connect.</p>

          <div 
            onClick={handleCopyCode}
            className="group relative glass-card-static p-4 text-center tracking-[0.3em] font-mono font-bold text-xl mb-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]" 
            style={{ 
              color: '#c084fc',
              border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
              background: copied ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)'
            }}>
            {myCode || '• • • • • • • •'}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] px-2 py-1 rounded text-white tracking-normal font-sans">
              {copied ? 'Copied!' : 'Click to copy'}
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <button onClick={handleShare}
              className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}>
              💬 Share
            </button>
            <button onClick={handleCopyCode}
              className="btn-ghost text-sm px-5">
              {copied ? '✅ Copied!' : '📋 Copy Code'}
            </button>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
      )}

      {/* Sign Out */}
      <button onClick={signOut}
        className="w-full p-4 rounded-xl font-medium text-sm transition-all duration-300 animate-fade-in-up"
        style={{
          animationDelay: '0.15s',
          background: 'rgba(239,68,68,0.08)',
          color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}>
        Sign Out
      </button>
    </div>
  );
}
