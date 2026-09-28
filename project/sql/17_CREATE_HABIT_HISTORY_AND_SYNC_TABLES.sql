-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 17
-- HABIT HISTORY & AUDIT LOGS FOR COLLABORATIVE AND INDIVIDUAL HABITS
--
-- Creates:
-- 1. public.habit_completion_history
--    Tracks who completed what habit/subtask, timestamp, measure values, and user details.
-- 2. public.habit_update_history
--    Tracks who updated what changes (e.g. subhabit added, target updated, title changed, etc.)
-- ============================================================================

-- 1. CREATE habit_completion_history TABLE
CREATE TABLE IF NOT EXISTS public.habit_completion_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    task_title TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    measured_value NUMERIC DEFAULT 0,
    measure_unit VARCHAR(50) DEFAULT 'units',
    event_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE IF EXISTS public.habit_completion_history ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS task_title TEXT;
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS event_count INT DEFAULT 1;
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.habit_completion_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_habit_comp_task_id ON public.habit_completion_history(task_id);
CREATE INDEX IF NOT EXISTS idx_habit_comp_user_id ON public.habit_completion_history(user_id);

-- 2. CREATE habit_update_history TABLE
CREATE TABLE IF NOT EXISTS public.habit_update_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    task_title TEXT,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    update_type VARCHAR(100) NOT NULL DEFAULT 'TASK_UPDATED',
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE IF EXISTS public.habit_update_history ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS task_title TEXT;
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS update_type VARCHAR(100) DEFAULT 'TASK_UPDATED';
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS field_name VARCHAR(100);
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS old_value TEXT;
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS new_value TEXT;
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS change_summary TEXT;
ALTER TABLE IF EXISTS public.habit_update_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_habit_upd_task_id ON public.habit_update_history(task_id);
CREATE INDEX IF NOT EXISTS idx_habit_upd_user_id ON public.habit_update_history(user_id);

-- 3. PERMISSIONS & RLS SETUP
ALTER TABLE IF EXISTS public.habit_completion_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.habit_update_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.habit_completion_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_update_history TO anon, authenticated, service_role;

-- 4. SEED SAMPLE HISTORY FOR TEST DATASET
INSERT INTO public.habit_completion_history (
    id, task_id, parent_task_id, task_title, user_id, user_name, completed_at, measured_value, measure_unit, event_count, notes
) VALUES
    ('comp-hist-1', 'parent-type1-wellness-routine', NULL, '[P1] Daily Wellness Mastery', 'example@gmail.com', 'Example User', NOW() - INTERVAL '1 day', 42, 'mins', 1, 'Completed all 3 daily wellness subtasks'),
    ('comp-hist-2', 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', '[S1.1] Morning Yoga Flow', 'example@gmail.com', 'Example User', NOW() - INTERVAL '1 day', 12, 'mins', 1, 'Morning mobility completed'),
    ('comp-hist-3', 'parent-type3-project-milestones', NULL, '[P3] Production Feature Shipments', 'example@gmail.com', 'Example User', NOW() - INTERVAL '2 days', 65, 'points', 1, 'Full-cycle event milestone 1 achieved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.habit_update_history (
    id, task_id, parent_task_id, task_title, user_id, user_name, update_type, field_name, old_value, new_value, change_summary, created_at
) VALUES
    ('upd-hist-1', 'parent-type3-project-milestones', NULL, '[P3] Production Feature Shipments', 'example@gmail.com', 'Example User', 'SUBHABIT_ADDED', 'subtasks', NULL, '[S3.3] E2E Integration Cycles', 'Added subhabit: [S3.3] E2E Integration Cycles (Type 3 - Event Count)', NOW() - INTERVAL '3 days'),
    ('upd-hist-2', 'parent-type2-coding-sprint', NULL, '[P2] 60-Day Full-Stack Sprint', 'example@gmail.com', 'Example User', 'TARGET_CHANGED', 'target_count', '45', '60', 'Updated target day count from 45 to 60 days', NOW() - INTERVAL '2 days'),
    ('upd-hist-3', 'parent-type1-wellness-routine', NULL, '[P1] Daily Wellness Mastery', 'example@gmail.com', 'Example User', 'COLLABORATOR_INVITED', 'collab', NULL, 'partner@gmail.com', 'Invited collaborator partner@gmail.com to shared habit', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'Migration 17 successfully executed: Habit completion & update history tables created with public permissions.';
END;
$$;
