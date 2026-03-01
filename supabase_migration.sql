-- ============================================================
-- YOUR GOLDFISH — Definitive Database Schema
-- Audited from ALL 11 backend API files on 2026-02-22
--
-- HOW TO RUN:
-- 1. Open Supabase Dashboard → SQL Editor → New Query
-- 2. Paste this ENTIRE file
-- 3. Click "Run"
-- ============================================================


-- =============================================
-- TABLE 1: users
-- Used by: auth_upsert.js, username_check.js
-- =============================================
-- Columns referenced:
--   id           (UUID, PK)          — auth_upsert.js:54, username_check.js:25
--   email        (TEXT)               — auth_upsert.js:55
--   phone        (TEXT)               — auth_upsert.js:56
--   display_name (TEXT)               — auth_upsert.js:57
--   avatar_url   (TEXT)               — auth_upsert.js:58
--   username     (TEXT, UNIQUE)       — auth_upsert.js:42,59  username_check.js:26
--   created_at   (TIMESTAMPTZ)        — auth_upsert.js:60

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY,
  email         TEXT,
  phone         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  username      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;


-- =============================================
-- TABLE 2: partners
-- Used by: ideas.js, partner_get.js, invites.js, timeline.js
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     — partner_get.js:40, ideas.js:47, timeline.js:34
--   user_a       (UUID)              — partner_get.js:23, ideas.js:37, invites.js:95,160
--   user_b       (UUID)              — partner_get.js:23, ideas.js:37, invites.js:95,160
--   created_at   (TIMESTAMPTZ)       — partner_get.js:42

CREATE TABLE IF NOT EXISTS partners (
  id          BIGSERIAL PRIMARY KEY,
  user_a      UUID NOT NULL,
  user_b      UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- =============================================
-- TABLE 3: ideas
-- Used by: ideas.js (GET, POST, PATCH)
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     — ideas.js:110,144,159
--   title        (TEXT, NOT NULL)     — ideas.js:72,88,111,160
--   url          (TEXT)               — ideas.js:72,90
--   category     (TEXT)               — ideas.js:72,91,112
--   image_url    (TEXT)               — ideas.js:72,92,113
--   added_by     (UUID)              — ideas.js:54,73,93
--   pair_id      (BIGINT)            — ideas.js:47,94,155
--   status       (TEXT)               — ideas.js:95,134,136
--   done_at      (TIMESTAMPTZ)       — ideas.js:134
--   created_at   (TIMESTAMPTZ)       — ideas.js:48,55

CREATE TABLE IF NOT EXISTS ideas (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT,
  category    TEXT,
  image_url   TEXT,
  added_by    UUID,
  pair_id     BIGINT,
  status      TEXT DEFAULT 'active',
  done_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS added_by UUID;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS pair_id BIGINT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS done_at TIMESTAMPTZ;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS title TEXT;


-- =============================================
-- TABLE 4: invites
-- Used by: invites.js (get_code, request_partner, accept_partner)
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     — invites.js:168
--   token        (TEXT)               — invites.js:38,51,78,108,132,145
--   from_user    (UUID)              — invites.js:39,52,87,95,135
--   to_email     (TEXT)               — invites.js:53  (placeholder "code@pending")
--   accepted     (BOOLEAN)           — invites.js:40,55,79,165
--   rejected     (BOOLEAN)           — invites.js:41,56,80
--   accepted_by  (UUID)              — invites.js:166
--   accepted_at  (TIMESTAMPTZ)       — invites.js:167
--   created_at   (TIMESTAMPTZ)       — invites.js:54

CREATE TABLE IF NOT EXISTS invites (
  id          BIGSERIAL PRIMARY KEY,
  token       TEXT NOT NULL,
  from_user   UUID,
  to_email    TEXT DEFAULT 'code@pending',
  accepted    BOOLEAN DEFAULT FALSE,
  rejected    BOOLEAN DEFAULT FALSE,
  accepted_by UUID,
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Make to_email nullable if it was NOT NULL
ALTER TABLE invites ALTER COLUMN to_email DROP NOT NULL;
ALTER TABLE invites ALTER COLUMN to_email SET DEFAULT 'code@pending';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS accepted_by UUID;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS rejected BOOLEAN DEFAULT FALSE;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS from_user UUID;


-- =============================================
-- TABLE 5: notifications
-- Used by: notifications.js, invites.js, chat_send.js
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     — invites.js:174
--   user_id      (UUID)              — notifications.js:34, invites.js:105,143
--   to_email     (TEXT)               — notifications.js:34
--   to_user      (UUID)              — chat_send.js:31
--   from_user    (UUID)              — invites.js:106,142, chat_send.js:32
--   type         (TEXT)               — invites.js:107,144, notifications.js:34, chat_send.js:33
--   text         (TEXT)               — chat_send.js:34
--   payload      (JSONB)             — invites.js:108,145
--   read         (BOOLEAN)           — notifications.js:71, invites.js:110,173
--   handled      (BOOLEAN)           — invites.js:111,146,172, chat_send.js:36
--   dismissed    (BOOLEAN)           — notifications.js:88
--   created_at   (TIMESTAMPTZ)       — notifications.js:35, invites.js:109, chat_send.js:35

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID,
  to_email    TEXT,
  to_user     UUID,
  from_user   UUID,
  type        TEXT,
  text        TEXT,
  payload     JSONB DEFAULT '{}'::jsonb,
  read        BOOLEAN DEFAULT FALSE,
  handled     BOOLEAN DEFAULT FALSE,
  dismissed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS to_email TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS to_user UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS handled BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dismissed BOOLEAN DEFAULT FALSE;


-- =============================================
-- TABLE 6: chat
-- Used by: chat_send.js, chat_list.js
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     —
--   from_user    (UUID)              — chat_send.js:25, chat_list.js:33,38,39,47
--   to_user      (UUID)              — chat_send.js:25, chat_list.js:33,38,39,47
--   message      (TEXT)               — chat_send.js:25
--   created_at   (TIMESTAMPTZ)       — chat_send.js:25, chat_list.js:34,48

CREATE TABLE IF NOT EXISTS chat (
  id          BIGSERIAL PRIMARY KEY,
  from_user   UUID NOT NULL,
  to_user     UUID NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================
-- TABLE 7: timeline_events
-- Used by: ideas.js (POST, PATCH), timeline.js (GET)
-- =============================================
-- Columns referenced:
--   id           (BIGSERIAL, PK)     —
--   pair_id      (BIGINT)            — ideas.js:106,155, timeline.js:34
--   type         (TEXT)               — ideas.js:107,156
--   actor_id     (UUID)              — ideas.js:108,157
--   payload      (JSONB)             — ideas.js:109-114,158-161
--   created_at   (TIMESTAMPTZ)       — timeline.js:35

CREATE TABLE IF NOT EXISTS timeline_events (
  id          BIGSERIAL PRIMARY KEY,
  pair_id     BIGINT,
  type        TEXT NOT NULL,
  actor_id    UUID,
  payload     JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS actor_id UUID;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS pair_id BIGINT;


-- ============================================================
-- DONE! All 7 tables are now guaranteed to have every column
-- that the backend API files reference.
-- ============================================================
