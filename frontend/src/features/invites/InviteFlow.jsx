// frontend/src/features/invites/InviteFlow.jsx
import React, { useState } from 'react';
import useInvite from './useInvite';
import PrimaryButton from '../../components/PrimaryButton';

/**
 * InviteFlow - small UI allowing user to send invite by phone
 * Props:
 *  - fromUserId (string) : current user id (optional)
 */
export default function InviteFlow({ fromUserId }) {
  const [phone, setPhone] = useState('');
  const { createInvite, loading, error } = useInvite();
  const [result, setResult] = useState(null);

  async function handleSend() {
    if (!phone) return;
    const resp = await createInvite(phone, fromUserId);
    if (resp?.ok) {
      setResult({ success: true, link: resp.link, token: resp.token });
    } else {
      setResult({ success: false, error: resp.error });
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <label className="text-sm text-[#6E6E6E]">Invite partner by phone</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" className="w-full p-3 rounded-lg border mt-2" />
      <div className="mt-3">
        <PrimaryButton onClick={handleSend}>{loading ? 'Sending…' : 'Send Invite'}</PrimaryButton>
      </div>

      {result && result.success && (
        <div className="mt-3 p-3 rounded-lg bg-[#F8F6F9]">
          <div className="text-sm">Invite sent! Share this link with your partner:</div>
          <div className="mt-2 break-all text-xs text-[#6E6E6E]">{result.link}</div>
        </div>
      )}

      {result && !result.success && <div className="mt-3 text-sm text-red-600">{result.error || error}</div>}
    </div>
  );
}
