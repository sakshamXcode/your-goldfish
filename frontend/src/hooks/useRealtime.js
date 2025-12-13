// frontend/src/hooks/useRealtime.js
// Small helper to subscribe to Supabase realtime channels and clean up automatically
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(channelSpec, callback) {
  useEffect(() => {
    if (!supabase || !channelSpec || !callback) return;
    const sub = supabase.from(channelSpec).on('INSERT', (payload) => callback(payload)).subscribe();
    return () => {
      try { supabase.removeSubscription(sub); } catch (e) {console.log(e);}
    };
  }, [channelSpec, callback]);
}
