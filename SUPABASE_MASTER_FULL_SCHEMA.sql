-- ============================================================================
-- HABIT HACKER: MASTER SUPABASE TASK ANALYTICS FULL SCHEMA & SEED SCRIPT
-- Paste and execute this entire script in your Supabase SQL Editor.
-- Covers Section 5 of the Master Specification.
-- ============================================================================

-- 1. ENSURE ALL REQUIRED COLUMNS EXIST ON public.tasks TABLE
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tracking_mode TEXT DEFAULT 'end_date';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_day_count INT DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_day_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_event_count INT DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_event_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_unit TEXT DEFAULT 'units';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archive_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS paused_days INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT DEFAULT 'Daily';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id TEXT;

-- 2. CREATE LOGGING TABLES
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

CREATE TABLE IF NOT EXISTS public.task_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT TRUE,
    measured_value NUMERIC(10, 2) DEFAULT 0,
    tracking_mode TEXT DEFAULT 'end_date',
    created_at TIMESTAMPTZ DEFAULT NOW()
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
                NEW.planned_end := (NEW.planned_end::DATE + (paused_duration_days || ' days')::INTERVAL)::DATE;
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

-- 4. CLEANUP & SEED TEST DATA
DELETE FROM public.task_logs WHERE task_id IN ('11111111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333');
DELETE FROM public.subtask_logs WHERE parent_task_id IN ('11111111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333');
DELETE FROM public.task_archive_logs WHERE task_id IN ('11111111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333');
DELETE FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3') OR parent_task_id IN ('11111111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333');

-- INSERT Test1 (end_date)
WITH new_parent1 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_count, current_count, progress_percent,
        has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '11111111-1111-4111-a111-111111111111',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'Test1',
        'Mastering Advanced Java & Spring Boot Microservices over a 45-day fixed schedule window.',
        'Coding', 'CRITICAL', 'end_date',
        (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date,
        45, 15, 33, TRUE, 'Pages', 12.0, FALSE, FALSE, 2, 4, 'Daily', NOW() - INTERVAL '15 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '11111111-1111-4111-a111-111111111112', user_id, id::text,
    'Child 1.1 - Spring Data JPA Exercises (Mandatory, Measured)',
    'Coding', 'HIGH', 'end_date', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    25, 12, 48, TRUE, 'Exercises', 5.0, FALSE, FALSE
FROM new_parent1
UNION ALL
SELECT 
    '11111111-1111-4111-a111-111111111113', user_id, id::text,
    'Child 1.2 - JDBC Optimization Reading (Optional, Measured)',
    'Coding', 'MEDIUM', 'end_date', (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 8, 26, TRUE, 'Pages', 10.0, TRUE, FALSE
FROM new_parent1;

-- INSERT Test2 (count_days)
WITH new_parent2 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_day_count, target_count, current_day_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '22222222-2222-4222-a222-222222222222',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'Test2',
        'Mandatory 30-Day Morning Cardio Running Program to build stamina and heart discipline.',
        'Health', 'HIGH', 'count_days',
        (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
        30, 30, 18, 18, 60, TRUE, 'Km', 5.0, FALSE, FALSE, 1, 3, 'Daily', NOW() - INTERVAL '10 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '22222222-2222-4222-a222-222222222223', user_id, id::text,
    'Child 2.1 - Warmup Stretches (Mandatory, Measured in Mins)',
    'Health', 'MEDIUM', 'count_days', (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 18, 60, TRUE, 'Mins', 10.0, FALSE, FALSE
FROM new_parent2;

-- INSERT Test3 (count_event)
WITH new_parent3 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_event_count, target_count, current_event_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '33333333-3333-4333-a333-333333333333',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'Test3',
        'Solving 100 Algorithmic Data Structure & LeetCode problems before final technical interview.',
        'Education', 'CRITICAL', 'count_event',
        (CURRENT_DATE - INTERVAL '20 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
        100, 100, 65, 65, 65, TRUE, 'Problems', 3.0, FALSE, FALSE, 0, 0, 'Daily', NOW() - INTERVAL '20 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '33333333-3333-4333-a333-333333333334', user_id, id::text,
    'Child 3.1 - Dynamic Programming Practice (Mandatory, Measured)',
    'Education', 'HIGH', 'count_event', (CURRENT_DATE - INTERVAL '20 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    40, 28, 70, TRUE, 'Problems', 2.0, FALSE, FALSE
FROM new_parent3;

-- ============================================================================
-- MASTER SCHEMA AND SEED SCRIPT EXECUTED CLEANLY!
-- ============================================================================
