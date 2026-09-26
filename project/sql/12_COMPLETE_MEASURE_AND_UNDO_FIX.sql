-- ============================================================================
-- HABIT HACKER: DEFINITIVE POSTGRESQL SCHEMA FIX FOR MEASURE & UNDO TRACKING
-- Run this ENTIRE script in your Supabase SQL Editor.
-- It safely drops dependent views, automatically drops foreign keys,
-- checks column existence before type alterations, adds all measure columns,
-- and grants full access to anon and authenticated roles.
-- ============================================================================

-- STEP 0: DROP ANY BLOCKING VIEWS THAT DEPEND ON TASKS / SUBTASKS COLUMNS
DROP VIEW IF EXISTS public.view_parent_task_missed_days CASCADE;
DROP VIEW IF EXISTS public.view_task_missed_days CASCADE;
DROP VIEW IF EXISTS public.view_parent_tasks CASCADE;
DROP VIEW IF EXISTS public.view_tasks CASCADE;
DROP VIEW IF EXISTS public.view_task_logs CASCADE;
DROP VIEW IF EXISTS public.view_subtasks CASCADE;

-- Dynamically drop any other view in public schema that depends on tasks, subtasks, or logs
DO $$
DECLARE
    v_rec RECORD;
BEGIN
    FOR v_rec IN 
        SELECT DISTINCT dependent_ns.nspname AS schemaname, dependent_view.relname AS viewname
        FROM pg_depend 
        JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
        JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
        JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
        JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
        JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
        WHERE source_ns.nspname = 'public' 
          AND source_table.relname IN ('tasks', 'subtasks', 'task_logs', 'subtask_logs')
          AND dependent_view.relkind = 'v'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', v_rec.schemaname, v_rec.viewname);
    END LOOP;
END $$;

-- STEP 1: CREATE BASE TABLES IF NOT ALREADY EXISTING
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'MEDIUM',
    tracking_mode VARCHAR(50) DEFAULT 'end_date',
    target_count INT DEFAULT 50,
    current_count INT DEFAULT 0,
    repeat_rule VARCHAR(50) DEFAULT 'DAILY',
    custom_interval_days INT DEFAULT 1,
    has_measure_tracking BOOLEAN DEFAULT FALSE,
    measure_unit VARCHAR(50) DEFAULT 'units',
    measure_target NUMERIC DEFAULT 0,
    logged_measure_val NUMERIC DEFAULT 0,
    last_measured_value NUMERIC DEFAULT 0,
    is_done_today BOOLEAN DEFAULT FALSE,
    progress_percent INT DEFAULT 0,
    planned_start TEXT,
    planned_end TEXT,
    deadline TEXT,
    estimated_minutes INT DEFAULT 30,
    parent_task_id VARCHAR(255),
    parent_id VARCHAR(255),
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subtasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    parent_task_id VARCHAR(255),
    parent_id VARCHAR(255),
    user_id VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNED',
    is_optional BOOLEAN DEFAULT FALSE,
    target_value NUMERIC DEFAULT 1,
    completed_value NUMERIC DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units',
    has_measure_tracking BOOLEAN DEFAULT FALSE,
    measure_target NUMERIC DEFAULT 0,
    measure_unit VARCHAR(50) DEFAULT 'units',
    logged_measure_val NUMERIC DEFAULT 0,
    is_done_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    increment_value INT DEFAULT 1,
    measured_value NUMERIC DEFAULT 0,
    is_successful BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtask_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    measured_value NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: DROP ALL FOREIGN KEY CONSTRAINTS DYNAMICALLY
-- Prevents foreign key violations when using email user IDs and string/UUID task IDs
DO $$
DECLARE
    c RECORD;
BEGIN
    FOR c IN (
        SELECT conname, conrelid::regclass AS tabname
        FROM pg_constraint
        WHERE connamespace = 'public'::regnamespace
          AND conrelid::regclass::text IN ('tasks', 'subtasks', 'task_logs', 'subtask_logs', 'public.tasks', 'public.subtasks', 'public.task_logs', 'public.subtask_logs')
          AND contype = 'f'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || c.tabname || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(c.conname);
    END LOOP;
END $$;

-- STEP 3: CONVERT UUID COLUMNS TO VARCHAR(255) SAFELY
-- Only converts if column exists and is currently of type uuid
DO $$
BEGIN
    -- tasks.id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.tasks ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
    END IF;

    -- tasks.user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.tasks ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;
    END IF;

    -- subtasks.id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subtasks' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.subtasks ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
    END IF;

    -- subtasks.user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subtasks' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.subtasks ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;
    END IF;

    -- task_logs.id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_logs' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.task_logs ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
    END IF;

    -- task_logs.task_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_logs' AND column_name = 'task_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.task_logs ALTER COLUMN task_id TYPE VARCHAR(255) USING task_id::text;
    END IF;

    -- task_logs.user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_logs' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.task_logs ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;
    END IF;

    -- subtask_logs.id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subtask_logs' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.subtask_logs ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
    END IF;

    -- subtask_logs.subtask_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subtask_logs' AND column_name = 'subtask_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.subtask_logs ALTER COLUMN subtask_id TYPE VARCHAR(255) USING subtask_id::text;
    END IF;

    -- subtask_logs.user_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subtask_logs' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.subtask_logs ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;
    END IF;
END $$;

-- STEP 4: ENSURE ALL QUANTITATIVE MEASURE AND TRACKING COLUMNS EXIST
-- On tasks
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS last_measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS custom_interval_days INT DEFAULT 1;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(50) DEFAULT 'end_date';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 50;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS planned_start TEXT;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS planned_end TEXT;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS repeat_rule VARCHAR(50) DEFAULT 'DAILY';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- On subtasks
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;

-- On task_logs
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS logged_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS increment_value INT DEFAULT 1;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS is_successful BOOLEAN DEFAULT TRUE;

-- On subtask_logs
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS log_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- STEP 5: CREATE HIGH-PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id_date ON public.task_logs(task_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_user_id ON public.task_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_subtask_date ON public.subtask_logs(subtask_id, log_date);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_parent ON public.subtask_logs(parent_task_id);

-- STEP 6: DISABLE RLS & GRANT ALL PERMISSIONS
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtask_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tasks TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.subtasks TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.task_logs TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.subtask_logs TO anon, authenticated, service_role, postgres;

-- STEP 7: RECREATE CLEAN MISSED DAYS VIEW
CREATE OR REPLACE VIEW public.view_parent_task_missed_days AS
SELECT 
    t.id,
    t.title,
    t.user_id,
    t.target_count,
    t.current_count,
    GREATEST(0, COALESCE(t.target_count, 0) - COALESCE(t.current_count, 0)) AS missed_count
FROM public.tasks t;

GRANT ALL ON public.view_parent_task_missed_days TO anon, authenticated, service_role, postgres;
