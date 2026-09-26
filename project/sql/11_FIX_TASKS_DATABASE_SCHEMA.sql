-- ============================================================================
-- HABIT HACKER: FIX TASKS DATABASE SCHEMA & USER IDENTITY MAPPING
-- Run this script in your Supabase SQL Editor to make sure all tables accept
-- user email addresses as user_id and accept string/UUID task IDs cleanly.
-- ============================================================================

-- 1. ALTER public.tasks TABLE COLUMNS & CONSTRAINTS
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE public.tasks ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Ensure all required columns exist on public.tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS collab TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_unit TEXT DEFAULT 'units';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_start TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_end TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tracking_mode TEXT DEFAULT 'end_date';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 50;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_rule TEXT DEFAULT 'DAILY';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_interval_days INT DEFAULT 2;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_measured_value NUMERIC(10, 2) DEFAULT 0;

-- 2. ALTER public.subtasks TABLE COLUMNS & CONSTRAINTS
CREATE TABLE IF NOT EXISTS public.subtasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    parent_task_id VARCHAR(255),
    parent_id VARCHAR(255),
    user_id VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNED',
    is_optional BOOLEAN DEFAULT FALSE,
    target_value NUMERIC(10, 2) DEFAULT 0,
    completed_value NUMERIC(10, 2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units',
    has_measure_tracking BOOLEAN DEFAULT FALSE,
    measure_target NUMERIC(10, 2) DEFAULT 0,
    measure_unit TEXT DEFAULT 'units',
    logged_measure_val NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subtasks ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE public.subtasks ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE public.subtasks DROP CONSTRAINT IF EXISTS subtasks_user_id_fkey;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS measure_unit TEXT DEFAULT 'units';
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC(10, 2) DEFAULT 0;

-- 3. ALTER LOG TABLES (RECORDS WHICH DAY, WHICH TASK, WHICH MEASURE)
CREATE TABLE IF NOT EXISTS public.task_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    increment_value INT DEFAULT 1,
    measured_value NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_logs ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE public.task_logs ALTER COLUMN task_id TYPE VARCHAR(255);
ALTER TABLE public.task_logs DROP CONSTRAINT IF EXISTS task_logs_user_id_fkey;
ALTER TABLE public.task_logs ADD COLUMN IF NOT EXISTS logged_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.task_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC(10, 2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtask_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    measured_value NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subtask_logs ALTER COLUMN user_id TYPE VARCHAR(255);
ALTER TABLE public.subtask_logs DROP CONSTRAINT IF EXISTS subtask_logs_user_id_fkey;
ALTER TABLE public.subtask_logs ADD COLUMN IF NOT EXISTS log_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.subtask_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC(10, 2) DEFAULT 0;

-- 4. DISABLE RLS & GRANT ALL PERMISSIONS
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtask_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.tasks TO anon, authenticated, service_role;
GRANT ALL ON public.subtasks TO anon, authenticated, service_role;
GRANT ALL ON public.task_logs TO anon, authenticated, service_role;
GRANT ALL ON public.subtask_logs TO anon, authenticated, service_role;
