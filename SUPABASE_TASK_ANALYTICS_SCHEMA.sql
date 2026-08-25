-- ============================================================================
-- HABIT HACKER: TASK INFO & ANALYTICS EXTENSION SCHEMA
-- Execute this script in your Supabase SQL Editor to enable full analytics tracking,
-- archive logs, subtask performance logs, and dynamic unarchive date extension triggers.
-- ============================================================================

-- 1. TASK ARCHIVE LOGS TABLE
-- Tracks historical archive and unarchive periods, calculation of paused days, and extensions.
CREATE TABLE IF NOT EXISTS public.task_archive_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unarchived_at TIMESTAMPTZ,
    paused_days INT DEFAULT 0,
    extension_applied_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast retrieval by task_id
CREATE INDEX IF NOT EXISTS idx_task_archive_logs_task_id ON public.task_archive_logs(task_id);

-- 2. SUBTASK PERFORMANCE LOGS TABLE
-- Tracks daily granular subtask execution, measures recorded, and completion status per date.
CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtask_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    parent_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    measured_value NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subtask_id, log_date)
);

-- Index for date-range analytics and parent aggregation
CREATE INDEX IF NOT EXISTS idx_subtask_logs_parent_date ON public.subtask_logs(parent_task_id, log_date);

-- 3. FUNCTION & TRIGGER: DYNAMIC END DATE EXTENSION ON UNARCHIVE
-- When a task is unarchived, automatically calculates the paused days duration
-- and shifts planned_end forward by the exact number of paused days.
CREATE OR REPLACE FUNCTION public.handle_task_unarchive_extension()
RETURNS TRIGGER AS $$
DECLARE
    last_archive_record RECORD;
    calculated_paused_days INT;
BEGIN
    -- Check if task is transitioning from is_archived = true to is_archived = false
    IF OLD.is_archived = TRUE AND NEW.is_archived = FALSE THEN
        -- Find the open archive log record
        SELECT * INTO last_archive_record 
        FROM public.task_archive_logs 
        WHERE task_id = NEW.id AND unarchived_at IS NULL
        ORDER BY archived_at DESC 
        LIMIT 1;

        IF FOUND THEN
            -- Calculate paused days
            calculated_paused_days := GREATEST(1, DATE_PART('day', NOW() - last_archive_record.archived_at)::INT);
            
            -- Close open archive log
            UPDATE public.task_archive_logs
            SET unarchived_at = NOW(),
                paused_days = calculated_paused_days,
                extension_applied_days = calculated_paused_days
            WHERE id = last_archive_record.id;

            -- Extend task planned_end date automatically if planned_end is set
            IF NEW.planned_end IS NOT NULL THEN
                NEW.planned_end := NEW.planned_end + (calculated_paused_days || ' days')::INTERVAL;
            END IF;
        END IF;
    -- Check if task is being archived
    ELSIF OLD.is_archived = FALSE AND NEW.is_archived = TRUE THEN
        -- Create a new archive log entry
        INSERT INTO public.task_archive_logs (task_id, user_id, archived_at)
        VALUES (NEW.id, NEW.user_id, NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS trg_task_unarchive_extension ON public.tasks;
CREATE TRIGGER trg_task_unarchive_extension
BEFORE UPDATE OF is_archived ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_task_unarchive_extension();

-- 4. ANALYTICAL VIEW: MOST MISSED SUBTASKS SUMMARY
CREATE OR REPLACE VIEW public.v_subtask_failure_summary AS
SELECT 
    subtask_id,
    parent_task_id,
    COUNT(*) FILTER (WHERE is_completed = FALSE) AS total_missed_days,
    COUNT(*) AS total_logged_days,
    ROUND(
        (COUNT(*) FILTER (WHERE is_completed = FALSE)::NUMERIC / GREATEST(COUNT(*), 1)::NUMERIC) * 100, 
        1
    ) AS failure_rate_percentage
FROM public.subtask_logs
GROUP BY subtask_id, parent_task_id;

-- 5. RLS SECURITY POLICIES
ALTER TABLE public.task_archive_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtask_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task archive logs"
    ON public.task_archive_logs FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subtask logs"
    ON public.subtask_logs FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
