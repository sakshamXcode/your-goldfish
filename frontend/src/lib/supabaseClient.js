// frontend/src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.warn('[supabaseClient] VITE_SUPABASE_* is not set. Auth will not work until env vars are configured.');
}

export const supabase = createClient(URL || '', KEY || '');

// Silently swallow the harmless React 18 Strict Mode double-mount WebSocket drop.
// Supabase Realtime throws this when React tears down the effect instantly, closing the 
// socket before the handshake finishes. It is totally benign but scares users.
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args &&
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('WebSocket is closed before the connection is established')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args &&
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('WebSocket is closed before the connection is established')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

export default supabase;
