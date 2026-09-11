-- ============================================================================
-- HABIT HACKER DIARY METADATA & SECURITY SCHEMA WITH DEFAULT SEED DATA
-- EXECUTE THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Create Diary Metadata Table (Metadata Only — Content text remains 100% device-local)
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

-- 2. Create Diary Password Security Metadata Table
CREATE TABLE IF NOT EXISTS public.diary_security_config (
    user_id VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    lock_policy VARCHAR(64) DEFAULT 'BACKGROUND',
    inactivity_timeout_mins INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diary_meta_user ON public.diary_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_meta_type ON public.diary_metadata(type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.diary_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_security_config ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Permissive account metadata access)
DROP POLICY IF EXISTS "Public access to diary metadata" ON public.diary_metadata;
CREATE POLICY "Public access to diary metadata" ON public.diary_metadata FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access to diary security config" ON public.diary_security_config;
CREATE POLICY "Public access to diary security config" ON public.diary_security_config FOR ALL USING (true);

-- ============================================================================
-- 6. FIVE DEFAULT DIARIES SEEDING FUNCTION & INITIAL DATA INSERTIONS
-- ============================================================================

-- Function to seed the 5 mandatory default diaries for any user
CREATE OR REPLACE FUNCTION public.seed_default_user_diary_metadata(target_user_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    -- 1. Today's Lessons
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES (
        'diary-lessons-' || target_user_id,
        target_user_id,
        'Today''s Lessons',
        'DAILY_LESSONS',
        'Lightbulb',
        FALSE,
        1
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Today's Proverb
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES (
        'diary-proverb-' || target_user_id,
        target_user_id,
        'Today''s Proverb',
        'PROVERB',
        'Quote',
        FALSE,
        2
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Today's Story
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES (
        'diary-story-' || target_user_id,
        target_user_id,
        'Today''s Story',
        'STORY_HUB',
        'BookOpen',
        FALSE,
        3
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Daily Day Events
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES (
        'diary-events-' || target_user_id,
        target_user_id,
        'Daily Day Events',
        'DAILY_EVENTS',
        'Calendar',
        FALSE,
        4
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Personal Diary
    INSERT INTO public.diary_metadata (id, user_id, name, type, icon, is_locked, display_order)
    VALUES (
        'diary-personal-' || target_user_id,
        target_user_id,
        'Personal Diary',
        'PERSONAL_JOURNAL',
        'Lock',
        TRUE,
        5
    ) ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute Seed Function for 'default_user' and 'demo_user'
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

-- Verification Helper Function
CREATE OR REPLACE FUNCTION public.get_user_diary_count(target_user_id VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.diary_metadata WHERE user_id = target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
