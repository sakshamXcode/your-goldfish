// server/utils/rateLimiter.js
// Simple in-memory IP-based rate limiter for endpoints like /preview
const hits = {}; // { key: { count, resetAt } }

export function rateLimit(key, limit = 30, windowSec = 60) {
  const now = Date.now();
  if (!hits[key] || now > hits[key].resetAt) {
    hits[key] = { count: 1, resetAt: now + windowSec * 1000 };
    return { ok: true, remaining: limit - 1 };
  }
  hits[key].count++;
  if (hits[key].count > limit) {
    return { ok: false, retryAfter: Math.ceil((hits[key].resetAt - now)/1000) };
  }
  return { ok: true, remaining: limit - hits[key].count };
}
