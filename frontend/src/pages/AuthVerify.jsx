// frontend/src/pages/AuthVerify.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function AuthVerify() {
  const { state } = useLocation();
  const emailFromState = state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email'
      });
      if (error) {
        setStatus({ ok: false, text: error.message || String(error) });
      } else {
        setStatus({ ok: true, text: 'Signed in! Redirecting...' });
      }
    } catch (err) {
      setStatus({ ok: false, text: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8" style={{ color: '#c084fc' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Check your email
        </h2>
        <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
          We sent a 6-digit login code to<br />
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {email || 'your email'}
          </span>
        </p>
      </div>

      <form onSubmit={verify} className="glass-card-static p-6 flex flex-col gap-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {!emailFromState && (
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass text-center"
            required
          />
        )}

        <input
          placeholder="000000"
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="input-glass text-center text-3xl tracking-[0.3em] font-mono"
          required
          maxLength={8}
          autoFocus
        />

        <button type="submit" disabled={loading || token.length < 6 || !email}
          className="btn-aurora py-3.5 text-sm">
          {loading ? 'Verifying...' : '🔐 Verify & Sign in'}
        </button>

        {status && (
          <div className="text-sm text-center p-3 rounded-xl" style={{
            background: status.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: status.ok ? '#22c55e' : '#ef4444',
          }}>
            {status.text}
          </div>
        )}

        <div className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          Didn't receive a code?{' '}
          <Link to="/auth/login" className="font-medium" style={{ color: '#c084fc' }}>
            Try again
          </Link>
        </div>
      </form>
    </div>
  );
}
