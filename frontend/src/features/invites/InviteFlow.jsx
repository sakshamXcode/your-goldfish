// frontend/src/features/invites/InviteFlow.jsx
import React, { useState, useEffect } from 'react';
import useInvite from './useInvite';
import { useAuthContext } from '../../contexts/AuthContext';

export default function InviteFlow() {
  const { user } = useAuthContext();
  const { getCode, requestPartner, loading, error } = useInvite();
  
  const [myCode, setMyCode] = useState('');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getCode().then(code => {
        if (code) setMyCode(code);
      });
    }
  }, [user?.id, getCode]);

  async function handleConnect() {
    if (!partnerCodeInput.trim() || partnerCodeInput.trim().length !== 8) {
      setStatus({ ok: false, text: "Code must be exactly 8 characters long." });
      return;
    }
    
    setStatus(null);
    const success = await requestPartner(partnerCodeInput);
    
    if (success) {
      setStatus({ ok: true, text: 'Connection request sent! They will see it in their notifications.' });
      setPartnerCodeInput('');
    } else {
      setStatus({ ok: false, text: error || 'Failed to send request.' });
    }
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}/invite/${myCode}`;
    const text = `Connect with me on UsBook! My connection code is: ${myCode}\n\nJoin here: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'UsBook Connection Code',
        text: text,
      }).catch(console.error);
    } else {
      // Fallback to WhatsApp deep link if Web Share API isn't supported (e.g. desktop)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  function handleCopy() {
    const shareUrl = `${window.location.origin}/invite/${myCode}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  }

  return (
    <div className="space-y-4">
      {/* 1. Share My Code */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FFE7F2]">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Invite your partner</h3>
        <p className="text-xs text-gray-500 mb-4">
          Share your unique connection code so they can instantly link their account to yours.
        </p>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center tracking-widest font-mono font-bold text-lg text-[#FF6FAF]">
            {myCode || "........"}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="flex-1 px-4 py-2.5 rounded-full bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span> Share via WhatsApp
          </button>
          <button 
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* 2. Enter Partner's Code */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Have a partner's code?</h3>
        <p className="text-xs text-gray-500 mb-4">
          Enter their 8-letter code below to send them a connection request.
        </p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={partnerCodeInput} 
            onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())} 
            placeholder="A7X9MP2W" 
            maxLength={8}
            className="flex-1 p-3 rounded-xl border border-gray-200 uppercase tracking-widest font-mono text-center placeholder:normal-case placeholder:tracking-normal" 
          />
          <button 
            onClick={handleConnect}
            disabled={loading || partnerCodeInput.length !== 8}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white font-medium disabled:opacity-50 transition-opacity"
          >
            {loading ? '...' : 'Connect'}
          </button>
        </div>

        {/* Status Messaging */}
        {status && (
          <div className={`mt-3 text-sm p-3 rounded-lg ${status.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {status.text}
          </div>
        )}
        {error && !status && (
          <div className="mt-3 text-sm p-3 rounded-lg bg-red-50 text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
