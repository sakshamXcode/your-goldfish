// frontend/src/pages/AuthLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // Ensure phone has country code, e.g. +91...
      const { data, error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (error) {
        setStatus({ ok: false, text: error.message || String(error) });
      } else {
        // signInWithOtp returns data with maybe 'user' info; OTP sent
        setStatus({ ok: true, text: 'OTP sent — check your messages' });
        // Navigate to verify page where user will input the OTP code
        navigate('/auth/verify', { state: { phone: phone.trim() } });
      }
    } catch (err) {
      setStatus({ ok: false, text: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Sign in with phone</h2>
      <form onSubmit={sendOtp} className="flex flex-col gap-3">
        <input
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <button type="submit" className="px-4 py-3 bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white rounded-lg">
          {loading ? 'Sending...' : 'Send OTP'}
        </button>

        {status && (
          <div className={`text-sm ${status.ok ? 'text-green-600' : 'text-red-600'}`}>
            {status.text}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">Make sure the phone includes country code (e.g. +91)</div>
      </form>
    </div>
  );
}
