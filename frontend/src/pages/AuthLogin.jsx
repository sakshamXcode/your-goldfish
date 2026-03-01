// frontend/src/pages/AuthLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) {
        setStatus({ ok: false, text: error.message || String(error) });
      } else {
        navigate('/auth/verify', { state: { email: email.trim() } });
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
        <div className="text-5xl mb-4 animate-float">🐠</div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Welcome Back
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Sign in to your Goldfish account
        </p>
      </div>

      <form onSubmit={sendOtp} className="glass-card-static p-6 flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-aurora py-3.5 text-sm">
          {loading ? 'Sending...' : '✉️ Send Login Code'}
        </button>

        {status && (
          <div className="text-sm p-3 rounded-xl" style={{
            background: status.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: status.ok ? '#22c55e' : '#ef4444',
          }}>
            {status.text}
          </div>
        )}

        <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          We'll send a secure login code to your inbox.
        </div>
      </form>
    </div>
  );
}
