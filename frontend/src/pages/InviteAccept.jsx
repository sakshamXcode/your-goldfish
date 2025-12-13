// frontend/src/pages/InviteAccept.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InviteAccept() {
  const { token } = useParams();
  const [status, setStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    // In real flow call /api/invite_accept with token and user id (after auth)
    // For demo we simulate success after 1.2s
    const t = setTimeout(() => {
      setStatus('accepted');
      // navigate to Home after a short delay
      setTimeout(() => navigate('/'), 900);
    }, 1200);
    return () => clearTimeout(t);
  }, [token, navigate]);

  return (
    <section className="text-center">
      <h2 className="text-xl font-semibold">Invite</h2>
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        {status === 'checking' && <div>Checking invite token <span className="text-sm text-[#6E6E6E]">({token})</span></div>}
        {status === 'accepted' && <div className="text-green-600 font-semibold">Invite accepted — connecting you now! ❤️</div>}
        {status === 'error' && <div className="text-red-600">Invalid or expired invite token.</div>}
      </div>
    </section>
  );
}
