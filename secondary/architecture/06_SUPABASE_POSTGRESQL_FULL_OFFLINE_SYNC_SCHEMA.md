# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 06: SUPABASE POSTGRESQL FULL OFFLINE SYNC SCHEMA SPECIFICATION

## 1. Supabase PostgreSQL Schema Integration (`SUPABASE_MASTER_OFFLINE_SYNC_SCHEMA.sql`)

> ⚠️ **EXECUTE IN SUPABASE SQL EDITOR**:
> This script sets up automatic `updated_at` triggers for conflict resolution, sync audit tracking, `diary_metadata`, `diary_security_config` tables, and automatic seeding for the 5 default diaries.

```sql
-- ============================================================================
-- HABIT HACKER MASTER SUPABASE POSTGRESQL SCHEMA WITH OFFLINE SYNC & SEED DATA
-- EXECUTE THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Automatic Timestamp Update Function
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure Updated Timestamp Columns Exist on Core Task Tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='updated_at') THEN
        ALTER TABLE public.tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subtasks' AND column_name='updated_at') THEN
        ALTER TABLE public.subtasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 3. Create Triggers for Tasks & Subtasks
DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS trg_subtasks_updated_at ON public.subtasks;
CREATE TRIGGER trg_subtasks_updated_at
BEFORE UPDATE ON public.subtasks
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 4. Create Sync Audit Log Table (Tracking Offline Uploads)
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Diary Metadata Table (Metadata ONLY — NO CONTENT TEXT BANNED FROM CLOUD)
CREATE TABLE IF NOT EXISTS public.diary_metadata (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'CUSTOM',
    icon VARCHAR(64) DEFAULT 'BookOpen',
    is_locked BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Diary Security Config Table (Salted Password Verification Hashes)
CREATE TABLE IF NOT EXISTS public.diary_security_config (
    user_id VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    lock_policy VARCHAR(64) DEFAULT 'BACKGROUND',
    inactivity_timeout_mins INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sync_audit_user ON public.sync_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_meta_user ON public.diary_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_meta_type ON public.diary_metadata(type);

-- 8. Enable Row Level Security
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_security_config ENABLE ROW LEVEL SECURITY;

-- 9. Permissive RLS Policies for Synchronized Account Data
DROP POLICY IF EXISTS "Permissive sync audit" ON public.sync_audit_log;
CREATE POLICY "Permissive sync audit" ON public.sync_audit_log FOR ALL USING (true);

DROP POLICY IF EXISTS "Permissive diary metadata" ON public.diary_metadata;
CREATE POLICY "Permissive diary metadata" ON public.diary_metadata FOR ALL USING (true);

DROP POLICY IF EXISTS "Permissive diary security" ON public.diary_security_config;
CREATE POLICY "Permissive diary security" ON public.diary_security_config FOR ALL USING (true);

-- ============================================================================
-- 10. FIVE DEFAULT DIARIES SEEDING FUNCTION & INITIAL DATA INSERTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.seed_default_user_diary_metadata(target_user_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES 
        ('diary-lessons-' || target_user_id, target_user_id, 'Today''s Lessons', 'DAILY_LESSONS', 'Lightbulb', FALSE, 1),
        ('diary-proverb-' || target_user_id, target_user_id, 'Today''s Proverb', 'PROVERB', 'Quote', FALSE, 2),
        ('diary-story-' || target_user_id, target_user_id, 'Today''s Story', 'STORY_HUB', 'BookOpen', FALSE, 3),
        ('diary-events-' || target_user_id, target_user_id, 'Daily Day Events', 'DAILY_EVENTS', 'Calendar', FALSE, 4),
        ('diary-personal-' || target_user_id, target_user_id, 'Personal Diary', 'PERSONAL_JOURNAL', 'Lock', TRUE, 5)
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute Seed Function for Default System Accounts
SELECT public.seed_default_user_diary_metadata('default_user');
SELECT public.seed_default_user_diary_metadata('demo_user');

-- Direct SQL Insert Seed Records for Master Admin User
INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
VALUES 
    ('diary-meta-1', '00000000-0000-0000-0000-000000000000', 'Today''s Lessons', 'DAILY_LESSONS', 'Lightbulb', FALSE, 1),
    ('diary-meta-2', '00000000-0000-0000-0000-000000000000', 'Today''s Proverb', 'PROVERB', 'Quote', FALSE, 2),
    ('diary-meta-3', '00000000-0000-0000-0000-000000000000', 'Today''s Story', 'STORY_HUB', 'BookOpen', FALSE, 3),
    ('diary-meta-4', '00000000-0000-0000-0000-000000000000', 'Daily Day Events', 'DAILY_EVENTS', 'Calendar', FALSE, 4),
    ('diary-meta-5', '00000000-0000-0000-0000-000000000000', 'Personal Diary', 'PERSONAL_JOURNAL', 'Lock', TRUE, 5)
ON CONFLICT (id) DO NOTHING;
```
