-- ===========================================================
-- QUICK FIX: Add missing columns to the ideas table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ===========================================================

-- Add the missing columns one at a time
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS added_by UUID;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS pair_id BIGINT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Also make sure invites.to_email is nullable
ALTER TABLE invites ALTER COLUMN to_email DROP NOT NULL;

-- Also add username to users if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Done!
