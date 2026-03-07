// server/lib/fcm.js
import fetch from 'node-fetch';

const FCM_KEY = process.env.FCM_SERVER_KEY;

/**
 * sendFCM(toToken, payload)
 * - toToken: device token or array of tokens
 * - payload: { title, body, data }
 */
export async function sendFCM(toToken, payload = {}) {
  if (!FCM_KEY) {
    console.warn("[fcm] no FCM key configured, skipping push");
    return { ok: false, error: "no_fcm_key" };
  }
  try {
    const body = {
      to: toToken,
      notification: { title: payload.title, body: payload.body },
      data: payload.data || {}
    };
    const resp = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: { Authorization: `key=${FCM_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await resp.json();
    return { ok: true, resp: json };
  } catch (err) {
    console.error('[fcm] send error', err);
    return { ok: false, error: String(err) };
  }
}
