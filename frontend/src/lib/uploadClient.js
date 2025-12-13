// frontend/src/lib/uploadClient.js
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Request a signed upload URL from server
 * Returns { ok, signedUrl, path }
 */
export async function createSignedUpload(fileName, fileType) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error || 'signed_url_failed');
  }
  return json;
}

/**
 * Upload file binary to the signed URL (PUT)
 */
export async function uploadFileToSignedUrl(signedUrl, file, contentType) {
  const resp = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!resp.ok) {
    throw new Error(`upload to signed url failed: ${resp.status}`);
  }
  return true;
}
