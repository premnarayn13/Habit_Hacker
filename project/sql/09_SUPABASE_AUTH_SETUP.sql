-- =============================================================================
-- HABIT HACKER — Supabase Auth Setup Script
-- Run this entire script in Supabase SQL Editor
-- =============================================================================

-- 1. Create the app_users table (custom auth — no Supabase Auth involved)
CREATE TABLE IF NOT EXISTS app_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disable RLS on app_users so the backend (service key or anon key) can read/write freely
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- 3. Ensure tasks table has user_id as TEXT (email will be stored here)
-- If tasks already exists, just make sure user_id can hold email strings
-- (VARCHAR(36) might be too short for some emails — expand if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tasks') THEN
        ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 4. Ensure subtasks table user_id is also TEXT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subtasks') THEN
        ALTER TABLE subtasks ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 5. Disable RLS on all app tables so backend service-role key works cleanly
--    (These are already disabled by default for new tables — this is just explicit)
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subtask_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits DISABLE ROW LEVEL SECURITY;

-- 6. Grant anon and authenticated roles full access (since we manage auth ourselves)
GRANT ALL ON app_users TO anon;
GRANT ALL ON app_users TO authenticated;
GRANT ALL ON app_users TO service_role;

-- Done. Now the backend can register/login by reading from app_users.
-- user_id in tasks/subtasks will be the user's email address.
