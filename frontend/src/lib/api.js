// frontend/src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Generic JSON fetch wrapper
 */
async function jsonFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...opts,
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/** Preview */
export async function fetchPreview(linkUrl) {
  if (!linkUrl) return null;
  try {
    const encoded = encodeURIComponent(linkUrl);
    const data = await jsonFetch(`/preview?url=${encoded}`, { method: 'GET' });
    return data?.data || null;
  } catch (err) {
    console.warn('[fetchPreview] fallback null', err?.message || err);
    return null;
  }
}

/** Invite creation */
export async function createInviteAPI({ to_phone, from_user_id, message }) {
  try {
    const data = await jsonFetch('/invite', {
      method: 'POST',
      body: JSON.stringify({ to_phone, from_user_id, message }),
    });
    return data;
  } catch (err) {
    return { ok: false, error: err.message || 'invite_failed' };
  }
}

/** Accept invite */
export async function acceptInviteAPI({ token, accepting_user_id }) {
  try {
    const data = await jsonFetch('/invite_accept', {
      method: 'POST',
      body: JSON.stringify({ token, accepting_user_id }),
    });
    return data;
  } catch (err) {
    return { ok: false, error: err.message || 'accept_failed' };
  }
}

/** Create idea (server side) */
export async function createIdeaAPI(payload) {
  try {
    const data = await jsonFetch('/ideas_create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch (err) {
    return { ok: false, error: err.message || 'create_idea_failed' };
  }
}

/** Places search */
export async function placesSearch(query) {
  if (!query) return [];
  try {
    const encoded = encodeURIComponent(query);
    const data = await jsonFetch(`/places_search?query=${encoded}`, { method: 'GET' });
    return data?.results || [];
  } catch (err) {
    console.warn('[placesSearch] failed', err?.message || err);
    return [];
  }
}

/** Notifications (get list) */
export async function fetchNotifications(userId) {
  if (!userId) return { ok: false, notifications: [] };
  try {
    const data = await jsonFetch(`/notifications?user_id=${encodeURIComponent(userId)}`, { method: 'GET' });
    return data;
  } catch (err) {
    console.warn('[fetchNotifications] failed', err?.message || err);
    return { ok: false, notifications: [] };
  }
}

/** Notification handle */
export async function handleNotification(notificationId, action) {
  try {
    const data = await jsonFetch('/notifications_handle', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId, action }),
    });
    return data;
  } catch (err) {
    return { ok: false, error: err.message || 'notification_handle_failed' };
  }
}

/** Upload helper (not mandatory here but handy) */
export async function createSignedUploadAPI(fileName, fileType) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType })
  });
  const json = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(json?.error || 'signed_url_failed');
  return json;
}

/** Default export (for modules importing default) */
export default {
  fetchPreview,
  createInviteAPI,
  acceptInviteAPI,
  createIdeaAPI,
  placesSearch,
  fetchNotifications,
  handleNotification,
  createSignedUploadAPI,
};
