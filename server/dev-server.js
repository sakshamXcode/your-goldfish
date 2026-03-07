/**
 * Lightweight Express dev server that mimics Vercel's serverless routing.
 * Replaces `vercel dev` for local development — much more reliable.
 *
 * Usage:  node server/dev-server.js
 */
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

// ── JSON body parsing ──────────────────────────────────────────────
app.use(express.json());

// ── Adapt Vercel-style (req, res) handlers to Express ──────────────
function vercelHandler(handlerModule) {
  return async (req, res) => {
    // Vercel handlers expect req.query, req.body, req.method
    // Express already provides these. Just call the default export.
    try {
      const handler = handlerModule.default || handlerModule;
      await handler(req, res);
    } catch (err) {
      console.error('Handler error:', err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: 'server_error' });
      }
    }
  };
}

// ── Import all serverless functions ────────────────────────────────
const modules = await Promise.all([
  import('../api/auth_upsert.js'),
  import('../api/chat_list.js'),
  import('../api/chat_send.js'),
  import('../api/ideas.js'),
  import('../api/invites.js'),
  import('../api/notifications.js'),
  import('../api/partner_get.js'),
  import('../api/places_search.js'),
  import('../api/preview.js'),
  import('../api/timeline.js'),
  import('../api/upload.js'),
  import('../api/username_check.js'),
]);

const [
  authUpsert, chatList, chatSend, ideas, invites,
  notifications, partnerGet, placesSearch, preview,
  timeline, upload, usernameCheck,
] = modules;

// ── Import Middleware ──────────────────────────────────────────────
import { authMiddleware } from './utils/authMiddleware.js';

// ── Route mapping (mirrors vercel.json routes) ─────────────────────
// Public routes
app.all('/api/preview',       vercelHandler(preview));

// Protected routes (require JWT)
app.all('/api/auth_upsert',   authMiddleware, vercelHandler(authUpsert));
app.all('/api/chat_list',     authMiddleware, vercelHandler(chatList));
app.all('/api/chat_send',     authMiddleware, vercelHandler(chatSend));
app.all('/api/ideas',         authMiddleware, vercelHandler(ideas));
app.all('/api/invites',       authMiddleware, vercelHandler(invites));
app.all('/api/notifications', authMiddleware, vercelHandler(notifications));
app.all('/api/partner_get',   authMiddleware, vercelHandler(partnerGet));
app.all('/api/places_search', authMiddleware, vercelHandler(placesSearch));
app.all('/api/timeline',      authMiddleware, vercelHandler(timeline));
app.all('/api/upload',        authMiddleware, vercelHandler(upload));
app.all('/api/username_check', authMiddleware, vercelHandler(usernameCheck));

// ── Start ──────────────────────────────────────────────────────────
createServer(app).listen(PORT, () => {
  console.log(`\n  🐟 API dev server running at http://localhost:${PORT}\n`);
});
