// frontend/src/lib/inviteClient.js
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function createInvite({ to_phone, from_user_id, message }) {
  const res = await fetch(`${API_BASE}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_phone, from_user_id, message }),
  });
  const json = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(json?.error || 'invite_failed');
  return json;
}

export async function acceptInvite({ token, accepting_user_id }) {
  const res = await fetch(`${API_BASE}/invite_accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, accepting_user_id }),
  });
  const json = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(json?.error || 'accept_failed');
  return json;
}

export default { createInvite, acceptInvite };
