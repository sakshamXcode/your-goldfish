// server/lib/cache.js
import fetch from 'node-fetch';

let memoryCache = {}; // { key: { value, expiresAt } }

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashGet(key) {
  const url = `${UPSTASH_URL}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }});
  const json = await res.json().catch(()=>null);
  return json?.result ?? null;
}

async function upstashSet(key, value, ttl=300) {
  const url = `${UPSTASH_URL}/set`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, ex: ttl })
  });
}

export async function cacheGet(key) {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try { return await upstashGet(key); } catch (e) { /* fallback to memory */ }
  }
  const entry = memoryCache[key];
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    delete memoryCache[key];
    return null;
  }
  return entry.value;
}

export async function cacheSet(key, value, ttl=300) {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try { return await upstashSet(key, value, ttl); } catch (e) { /* fallback */ }
  }
  memoryCache[key] = { value, expiresAt: Date.now() + ttl * 1000 };
}
