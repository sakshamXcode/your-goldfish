// frontend/src/features/invite/ProfileConnect.jsx
import React, { useState } from 'react';
import { createInvite as apiCreateInvite } from '../../lib/inviteClient';
import { useAuthContext } from '../../contexts/AuthContext';

export default function ProfileConnect() {
  const { user } = useAuthContext() || {};
  const userId = user?.id || null;

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Hey — join me on UsBook!');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);

  async function sendInvite(e) {
    e.preventDefault();
    if (!phone || !userId) {
      setStatus({ ok: false, text: 'Please login and provide a phone with country code.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiCreateInvite({ to_phone: phone.trim(), from_user_id: userId, message });
      if (res?.ok) {
        setStatus({ ok: true, text: 'Invite created. Send this link to your partner or we will attempt to send SMS if configured.' });
        setInviteLink(res.link || null);
      } else {
        setStatus({ ok: false, text: res?.error || 'Invite failed' });
      }
    } catch (err) {
      setStatus({ ok: false, text: err?.message || 'Invite error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold">Connect a Partner</h3>
      <p className="text-sm text-gray-500 mt-1">Enter your partner's phone to invite them. They will receive a link to accept.</p>

      <form onSubmit={sendInvite} className="mt-3 flex flex-col gap-3">
        <input
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-3 border rounded-lg"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white">
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
          {inviteLink && (
            <a href={inviteLink} target="_blank" rel="noreferrer" className="text-sm text-[#6E6E6E] underline">
              Open invite link
            </a>
          )}
        </div>

        {status && (
          <div className={`text-sm ${status.ok ? 'text-green-600' : 'text-red-600'}`}>{status.text}</div>
        )}
      </form>
    </div>
  );
}
