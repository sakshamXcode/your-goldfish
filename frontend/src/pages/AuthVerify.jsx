// frontend/src/pages/AuthVerify.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthVerify() {
  const { state } = useLocation();
  const phoneFromState = state?.phone || '';
  const [phone, setPhone] = useState(phoneFromState);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // verifyOtp: phone + token + type:'sms'
      const { data, error } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: token.trim(), type: 'sms' });
      if (error) {
        setStatus({ ok: false, text: error.message || String(error) });
      } else {
        setStatus({ ok: true, text: 'Signed in successfully' });
        // user session is now set; AuthProvider onAuthStateChange will upsert user
        navigate('/');
      }
    } catch (err) {
      setStatus({ ok: false, text: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>
      <form onSubmit={verify} className="flex flex-col gap-3">
        <input
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <input
          placeholder="6-digit code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <button type="submit" className="px-4 py-3 bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white rounded-lg">
          {loading ? 'Verifying...' : 'Verify & Sign in'}
        </button>

        {status && <div className={`text-sm ${status.ok ? 'text-green-600' : 'text-red-600'}`}>{status.text}</div>}
        <div className="text-xs text-gray-500 mt-2">If the code does not work, request a new OTP from the previous screen.</div>
      </form>
    </div>
  );
}
