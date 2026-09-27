-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 13 — EVENT-BASED PERSISTENCE,
-- SUBTASK STANDALONE ON PARENT DELETION, AND DAILY RESET ENGINE
-- Run this script in your Supabase SQL Editor.
-- ============================================================================

-- STEP 1: CREATE EVENT LOGS TABLE FOR EVENT-COUNT TYPE 3 HABITS
CREATE TABLE IF NOT EXISTS public.event_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255),
    parent_task_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    event_number INT DEFAULT 1,
    completion_date DATE DEFAULT CURRENT_DATE,
    completion_timestamp TIMESTAMPTZ DEFAULT NOW(),
    total_work_accumulated NUMERIC DEFAULT 0,
    subtask_breakdown JSONB,
    subtask_contributions_json TEXT DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'FINALIZED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on event_logs even if table already existed previously
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) DEFAULT 'default-user';
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS event_number INT DEFAULT 1;
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS completion_timestamp TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS total_work_accumulated NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS subtask_breakdown JSONB;
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS subtask_contributions_json TEXT DEFAULT '[]';
ALTER TABLE IF EXISTS public.event_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'FINALIZED';

-- Synchronize task_id and parent_task_id on event_logs so both are always populated
UPDATE public.event_logs SET task_id = parent_task_id WHERE task_id IS NULL AND parent_task_id IS NOT NULL;
UPDATE public.event_logs SET parent_task_id = task_id WHERE parent_task_id IS NULL AND task_id IS NOT NULL;

-- STEP 2: ENSURE TASKS & SUBTASKS COLUMNS EXIST
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(50) DEFAULT 'end_date';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS current_event_work NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS current_event_work NUMERIC DEFAULT 0;

-- STEP 3: AUTOMATED TRIGGER — ON PARENT HABIT DELETION, SUBHABITS BECOME STANDALONE PARENT HABITS
-- Whenever any parent task is deleted, all its child subhabits have parent_task_id set to NULL
-- so they instantly become standalone top-level habits in both tasks and subtasks tables.
CREATE OR REPLACE FUNCTION public.trg_unmap_subtasks_on_parent_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Unmap child tasks in public.tasks
    UPDATE public.tasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    -- Unmap child subtasks in public.subtasks
    UPDATE public.subtasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks;
CREATE TRIGGER trg_tasks_unmap_children
BEFORE DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_unmap_subtasks_on_parent_delete();

-- STEP 4: STORED FUNCTION FOR 12:00 AM MIDNIGHT DAILY RESET
-- Resets Type 1 and Type 2 tasks that were completed on previous days.
-- Leaves Type 3 (count_event) parent tasks and their subhabits intact (persists beyond calendar day).
CREATE OR REPLACE FUNCTION public.fn_reset_daily_tasks()
RETURNS void AS $$
BEGIN
    -- Reset Type 1 and Type 2 tasks where completed_at is before CURRENT_DATE
    UPDATE public.tasks
    SET is_done_today = FALSE, logged_measure_val = 0
    WHERE is_done_today = TRUE
      AND (tracking_mode IS NULL OR tracking_mode != 'count_event')
      AND (parent_task_id IS NULL OR parent_task_id NOT IN (
          SELECT id FROM public.tasks WHERE tracking_mode = 'count_event'
      ))
      AND (completed_at IS NULL OR completed_at::text::date < CURRENT_DATE);

    -- Reset subtasks of Type 1 and Type 2 parents
    UPDATE public.subtasks
    SET is_done_today = FALSE, logged_measure_val = 0
    WHERE is_done_today = TRUE
      AND (parent_task_id IS NULL OR parent_task_id NOT IN (
          SELECT id FROM public.tasks WHERE tracking_mode = 'count_event'
      ));
END;
$$ LANGUAGE plpgsql;

-- STEP 5: CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_event_logs_task_id ON public.event_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_parent_task_id ON public.event_logs(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON public.event_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_parent_task_id ON public.subtasks(parent_task_id);

-- STEP 6: DISABLE ROW LEVEL SECURITY & GRANT FULL PERMISSIONS
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtask_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.task_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtask_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.event_logs TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
