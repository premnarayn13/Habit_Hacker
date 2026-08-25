-- ============================================================================
-- HABIT HACKER: MASTER SUPABASE TASK ANALYTICS SCHEMA & DDL
-- Execute this SQL script in Supabase SQL Editor to support the Task Info & Analytics Page.
-- Compatible with all column types (TEXT, VARCHAR, UUID).
-- ============================================================================

-- 1. TASK ARCHIVE HISTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.task_archive_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unarchived_at TIMESTAMPTZ,
    paused_days INT DEFAULT 0,
    extension_applied_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GRANULAR DAILY SUBTASK PERFORMANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtask_id TEXT NOT NULL,
    parent_task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    measured_value NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT subtask_logs_subtask_date_key UNIQUE(subtask_id, log_date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_task_archive_logs_task ON public.task_archive_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_parent ON public.subtask_logs(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_subtask ON public.subtask_logs(subtask_id);

-- 3. AUTOMATIC DATE EXTENSION TRIGGER ON TASK UNARCHIVE
CREATE OR REPLACE FUNCTION public.handle_task_unarchive_extension()
RETURNS TRIGGER AS $$
DECLARE
    paused_duration_days INT;
    active_archive_log_id TEXT;
BEGIN
    IF NEW.is_archived = FALSE AND OLD.is_archived = TRUE THEN
        SELECT id INTO active_archive_log_id
        FROM public.task_archive_logs
        WHERE task_id = NEW.id::text AND unarchived_at IS NULL
        ORDER BY archived_at DESC
        LIMIT 1;

        IF active_archive_log_id IS NOT NULL THEN
            UPDATE public.task_archive_logs
            SET 
                unarchived_at = NOW(),
                paused_days = GREATEST(1, EXTRACT(DAY FROM (NOW() - archived_at))::INT),
                extension_applied_days = GREATEST(1, EXTRACT(DAY FROM (NOW() - archived_at))::INT)
            WHERE id = active_archive_log_id;

            SELECT paused_days INTO paused_duration_days
            FROM public.task_archive_logs
            WHERE id = active_archive_log_id;

            IF NEW.planned_end IS NOT NULL AND paused_duration_days > 0 THEN
                NEW.planned_end := (NEW.planned_end::DATE + (paused_duration_days || ' days')::INTERVAL)::DATE::text;
            END IF;
            NEW.paused_days := COALESCE(OLD.paused_days, 0) + paused_duration_days;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_unarchive_extension ON public.tasks;

CREATE TRIGGER trg_task_unarchive_extension
BEFORE UPDATE ON public.tasks
FOR EACH ROW
WHEN (OLD.is_archived IS DISTINCT FROM NEW.is_archived)
EXECUTE FUNCTION public.handle_task_unarchive_extension();

-- 4. VIEW FOR MOST MISSED SUBTASK HIGHLIGHT ANALYTICS
CREATE OR REPLACE VIEW public.v_subtask_failure_summary AS
SELECT 
    parent_task_id,
    subtask_id,
    COUNT(*) FILTER (WHERE is_completed = FALSE) AS missed_days_count,
    COUNT(*) AS total_logged_days,
    ROUND((COUNT(*) FILTER (WHERE is_completed = FALSE)::NUMERIC / GREATEST(1, COUNT(*))) * 100, 1) AS failure_rate_percent
FROM public.subtask_logs
GROUP BY parent_task_id, subtask_id;
