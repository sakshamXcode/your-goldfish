import PlacesSearch from "../pages/PlacesSearch";
import { supabase } from "./supabaseClient";

// frontend/src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Generic JSON fetch wrapper
 */
export async function jsonFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    ...opts,
  };

  // Securely attach the JWT access token to every outgoing request
  const token = window.__SUPABASE_TOKEN__;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      data?.error || data?.message || `Request failed: ${res.status}`
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

/* =========================
   Preview
========================= */
export async function fetchPreview(linkUrl) {
  if (!linkUrl) return null;
  try {
    const encoded = encodeURIComponent(linkUrl);
    const res = await jsonFetch(`/preview?url=${encoded}`, { method: "GET" });
    return res?.data || null;
  } catch (err) {
    console.warn("[fetchPreview]", err?.message || err);
    return null;
  }
}

/* =========================
   Partner Code Pairing
========================= */
export async function getCodeAPI() {
  try {
    const data = await jsonFetch("/invites?action=get_code");
    return data;
  } catch (err) {
    return { ok: false, error: err.message || "failed_to_get_code" };
  }
}

export async function requestPartnerAPI(code) {
  try {
    return await jsonFetch("/invites?action=request_partner", {
      method: "POST",
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
  } catch (err) {
    return { ok: false, error: err.message || "request_failed" };
  }
}

export async function acceptPartnerAPI(token) {
  try {
    return await jsonFetch("/invites?action=accept_partner", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    return { ok: false, error: err.message || "accept_failed" };
  }
}

/* =========================
   Ideas
========================= */
export async function createIdeaAPI(payload) {
  try {
    return await jsonFetch("/ideas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { ok: false, error: err.message || "create_idea_failed" };
  }
}

export async function updateIdeaStatusAPI(payload) {
  try {
    return await jsonFetch("/ideas", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { ok: false, error: err.message || "update_idea_failed" };
  }
}

/* =========================
   Notifications
========================= */
export async function fetchNotifications({ user_id, to_phone }) {
  const params = new URLSearchParams();
  if (user_id) params.set("user_id", user_id);
  if (to_phone) params.set("to_phone", to_phone);

  try {
    return await jsonFetch(`/notifications?${params.toString()}`, {
      method: "GET",
    });
  } catch (err) {
    console.warn("[fetchNotifications]", err?.message || err);
    return { ok: false, notifications: [] };
  }
}

export async function handleNotificationByToken({ token, action }) {
  try {
    return await jsonFetch("/notifications", {
      method: "POST",
      body: JSON.stringify({ token, action }),
    });
  } catch (err) {
    return { ok: false, error: err.message || "notification_failed" };
  }
}

/* =========================
   Timeline (Unified)
========================= */
export async function fetchTimeline(pair_id) {
  if (!pair_id) return { ok: true, timeline: [] };
  try {
    return await jsonFetch(`/timeline?pair_id=${pair_id}`, {
      method: "GET",
    });
  } catch (err) {
    console.warn("[fetchTimeline]", err?.message || err);
    return { ok: false, timeline: [] };
  }
}

/* =========================
   Upload
========================= */
// Upload is handled directly in component via FormData now
export async function uploadImageAPI(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const headers = {};
    const token = window.__SUPABASE_TOKEN__;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE}/upload`;
    const res = await fetch(url, {
      method: "POST",
      headers, // Attach JWT, but do NOT set Content-Type for FormData
      body: formData, 
    });

    const dataRes = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(dataRes?.error || "upload_failed");
    }
    return dataRes;
  } catch (err) {
    console.error("upload API error", err);
    throw err;
  }
}

/* =========================
   Default export
========================= */
export default {
  fetchPreview,
  getCodeAPI,
  requestPartnerAPI,
  acceptPartnerAPI,
  createIdeaAPI,
  updateIdeaStatusAPI,
  fetchNotifications,
  handleNotificationByToken,
  fetchTimeline,
  PlacesSearch,
  uploadImageAPI,
};
