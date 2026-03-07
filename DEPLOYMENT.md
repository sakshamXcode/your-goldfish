# 🚀 Deployment Guide - Your Goldfish

This document explains how to correctly deploy and maintain the **Your Goldfish** production environment on Vercel and Supabase.

## 📁 Architecture Overview
The project is a monorepo:
- `/frontend`: React + Vite application.
- `/server/api`: Node.js serverless functions (Vercel Functions).
- `/vercel.json`: Routing and build configuration.

---

## ⚡ Vercel Configuration
The project uses a custom `vercel.json` to handle the monorepo structure. **Do not change the `rewrites` without testing**, as absolute paths in the frontend depend on them.

### Build Settings
Vercel is configured to build the frontend and serve the serverless functions separately:
- **Frontend Build**: Runs `npm run build` inside `/frontend`, outputting to `/frontend/dist`.
- **Serverless Aliasing**: Rewrites `/api/*` to `/server/api/*`.

### ⚠️ Common Issue: MIME Type Errors
If you see `Expected a... module script but the server responded with a MIME type of "text/html"`, it means a JS file request hit the SPA fallback and returned `index.html`.
- **Fix**: Ensure `vercel.json` has the explicit `/assets` rewrite:
  ```json
  { "source": "/assets/(.*)", "destination": "/frontend/assets/$1" }
  ```
- **Vite Config**: `frontend/vite.config.js` should have `base: './'` for relative pathing.

---

## 🔑 Environment Variables
You must set these in the Vercel Project Settings for both **Preview** and **Production**:

| Variable | Source | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase Dashboard | Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Private key for backend (CRITICAL - DO NOT EXPOSE) |
| `VITE_SUPABASE_URL` | Same as above | Needed for frontend |
| `VITE_SUPABASE_ANON_KEY` | Same as above | Needed for frontend |

---

## 🗄️ Database Migrations (Supabase)
When adding features like "Collaborative Voting", new columns are often required.

### Required SQL for current version:
Run this in the Supabase SQL Editor:
```sql
-- Adds voting tracking to ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS votes JSONB DEFAULT '{}';

-- Optional: Ensure Realtime is enabled for the 'ideas' and 'timeline_events' tables
-- Navigate to Database -> Replication -> supabase_realtime and toggle these tables.
```

---

## 🛠️ Local Development
To run both backend and frontend locally:
1. Run `./run_dev.bat` from the root.
2. Ensure you have a `.env` in the root with your Supabase keys.
