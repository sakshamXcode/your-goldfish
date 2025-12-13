// frontend/src/features/invites/useInvite.js
import { useState } from 'react';
import { createInviteAPI } from '../../lib/api';

/**
 * useInvite - helper to create invites from the client
 * Returns: createInvite(toPhone, fromUserId) -> { ok, token, link }
 */
export default function useInvite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createInvite(toPhone, fromUserId) {
    setLoading(true);
    setError(null);
    try {
      const resp = await createInviteAPI({ to_phone: toPhone, from_user_id: fromUserId });
      setLoading(false);
      if (!resp?.ok) {
        setError(resp?.error || 'Invite failed');
      }
      return resp;
    } catch (err) {
      setError(err.message || 'Invite failed');
      setLoading(false);
      return { ok: false, error: err.message || 'invite_error' };
    }
  }

  return { createInvite, loading, error };
}
