-- ============================================================================
-- HABIT HACKER: SUPABASE SEED SCRIPT FOR 3 NEW ADVANCED TASKS & SUBTASKS
-- Tasks: task_1_EndDate, task_2_Daycount, task_3_Eventcount
-- Includes 5-6 diverse child subtasks per master task with full daily history logs.
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

-- 3. CLEANUP OLD TEST DATA
DELETE FROM public.task_logs WHERE task_id IN ('t-10000000-0000-4000-a000-111111111111', 't-20000000-0000-4000-a000-222222222222', 't-30000000-0000-4000-a000-333333333333');
DELETE FROM public.subtask_logs WHERE parent_task_id IN ('t-10000000-0000-4000-a000-111111111111', 't-20000000-0000-4000-a000-222222222222', 't-30000000-0000-4000-a000-333333333333');
DELETE FROM public.task_archive_logs WHERE task_id IN ('t-10000000-0000-4000-a000-111111111111', 't-20000000-0000-4000-a000-222222222222', 't-30000000-0000-4000-a000-333333333333');
DELETE FROM public.tasks WHERE title IN ('task_1_EndDate', 'task_2_Daycount', 'task_3_Eventcount') OR parent_task_id IN ('t-10000000-0000-4000-a000-111111111111', 't-20000000-0000-4000-a000-222222222222', 't-30000000-0000-4000-a000-333333333333');

-- ============================================================================
-- TASK 1: task_1_EndDate (TYPE 3 — START/END DAILY PLAN)
-- ============================================================================
WITH t1 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_count, current_count, progress_percent,
        has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        't-10000000-0000-4000-a000-111111111111',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'task_1_EndDate',
        'Daily Full Stack Software Architecture Review and Microservice Optimization over a 45-day window.',
        'Coding', 'CRITICAL', 'end_date',
        (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date,
        45, 15, 33, TRUE, 'Pages', 15.0, FALSE, FALSE, 2, 4, 'Daily', NOW() - INTERVAL '15 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 't-10000000-0000-4000-a000-111111111112', user_id, id::text, 'Child 1.1 — System Architecture Diagrams (Mandatory, Measured)', 'Coding', 'HIGH', 'end_date', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date, 35, 15, 42, TRUE, 'Diagrams', 3.0, FALSE, FALSE FROM t1
UNION ALL SELECT 't-10000000-0000-4000-a000-111111111113', user_id, id::text, 'Child 1.2 — Redis Caching Profiling (Mandatory, Measured)', 'Coding', 'CRITICAL', 'end_date', (CURRENT_DATE - INTERVAL '12 days')::date, (CURRENT_DATE + INTERVAL '18 days')::date, 30, 12, 40, TRUE, 'Mins', 25.0, FALSE, FALSE FROM t1
UNION ALL SELECT 't-10000000-0000-4000-a000-111111111114', user_id, id::text, 'Child 1.3 — Code Refactoring Review (Optional, Standard Check)', 'Coding', 'LOW', 'end_date', (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date, 30, 8, 26, FALSE, 'Units', 1.0, TRUE, FALSE FROM t1
UNION ALL SELECT 't-10000000-0000-4000-a000-111111111115', user_id, id::text, 'Child 1.4 — PostgreSQL Query Optimization (Mandatory, Measured)', 'Coding', 'HIGH', 'end_date', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 30, 14, 46, TRUE, 'Queries', 10.0, FALSE, FALSE FROM t1
UNION ALL SELECT 't-10000000-0000-4000-a000-111111111116', user_id, id::text, 'Child 1.5 — Optional API Security Audit (Optional, Measured)', 'Coding', 'MEDIUM', 'end_date', (CURRENT_DATE - INTERVAL '8 days')::date, (CURRENT_DATE + INTERVAL '22 days')::date, 30, 6, 20, TRUE, 'Endpoints', 4.0, TRUE, FALSE FROM t1;

-- ============================================================================
-- TASK 2: task_2_Daycount (TYPE 2 — DAYS COUNT TASK: 30 TARGET DAYS IN 45 CALENDAR DAYS)
-- ============================================================================
WITH t2 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_day_count, target_count, current_day_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        't-20000000-0000-4000-a000-222222222222',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'task_2_Daycount',
        'Mandatory 30 Successful Cardio Running Days required within a 45-day window.',
        'Health', 'HIGH', 'count_days',
        (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date,
        30, 30, 18, 18, 60, TRUE, 'Km', 5.0, FALSE, FALSE, 1, 3, 'Daily', NOW() - INTERVAL '15 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 't-20000000-0000-4000-a000-222222222223', user_id, id::text, 'Child 2.1 — Warmup Dynamic Stretches (Mandatory, Measured)', 'Health', 'MEDIUM', 'count_days', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date, 30, 18, 60, TRUE, 'Mins', 10.0, FALSE, FALSE FROM t2
UNION ALL SELECT 't-20000000-0000-4000-a000-222222222224', user_id, id::text, 'Child 2.2 — Core & Abdominal Workout (Mandatory, Measured)', 'Health', 'HIGH', 'count_days', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date, 30, 16, 53, TRUE, 'Reps', 50.0, FALSE, FALSE FROM t2
UNION ALL SELECT 't-20000000-0000-4000-a000-222222222225', user_id, id::text, 'Child 2.3 — Hydration & Electrolytes Tracking (Mandatory, Standard)', 'Health', 'HIGH', 'count_days', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date, 30, 18, 60, FALSE, 'Litres', 2.0, FALSE, FALSE FROM t2
UNION ALL SELECT 't-20000000-0000-4000-a000-222222222226', user_id, id::text, 'Child 2.4 — Foam Rolling Muscle Recovery (Optional, Measured)', 'Health', 'LOW', 'count_days', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date, 30, 10, 33, TRUE, 'Mins', 15.0, TRUE, FALSE FROM t2
UNION ALL SELECT 't-20000000-0000-4000-a000-222222222227', user_id, id::text, 'Child 2.5 — Heart Rate Zone Monitoring (Optional, Standard)', 'Health', 'LOW', 'count_days', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '30 days')::date, 30, 12, 40, FALSE, 'Units', 1.0, TRUE, FALSE FROM t2;

-- ============================================================================
-- TASK 3: task_3_Eventcount (TYPE 1 — EVENT COUNT TASK: 110 REPETITIONS IN 30 DAYS)
-- ============================================================================
WITH t3 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_event_count, target_count, current_event_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        't-30000000-0000-4000-a000-333333333333',
        COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
        'task_3_Eventcount',
        'Solving 110 Algorithmic & Data Structures LeetCode Problems before tech interview.',
        'Education', 'CRITICAL', 'count_event',
        (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date,
        110, 110, 72, 72, 65, TRUE, 'Problems', 4.0, FALSE, FALSE, 0, 0, 'Daily', NOW() - INTERVAL '15 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 't-30000000-0000-4000-a000-333333333334', user_id, id::text, 'Child 3.1 — Dynamic Programming Practice (Mandatory, Measured)', 'Education', 'HIGH', 'count_event', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 40, 28, 70, TRUE, 'Problems', 2.0, FALSE, FALSE FROM t3
UNION ALL SELECT 't-30000000-0000-4000-a000-333333333335', user_id, id::text, 'Child 3.2 — Graph Traversals BFS/DFS (Mandatory, Measured)', 'Education', 'HIGH', 'count_event', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 30, 22, 73, TRUE, 'Problems', 2.0, FALSE, FALSE FROM t3
UNION ALL SELECT 't-30000000-0000-4000-a000-333333333336', user_id, id::text, 'Child 3.3 — Mock System Design Notes (Optional, Standard)', 'Education', 'LOW', 'count_event', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 20, 12, 60, FALSE, 'Reviews', 1.0, TRUE, FALSE FROM t3
UNION ALL SELECT 't-30000000-0000-4000-a000-333333333337', user_id, id::text, 'Child 3.4 — Array & String Pointers (Mandatory, Measured)', 'Education', 'MEDIUM', 'count_event', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 20, 10, 50, TRUE, 'Problems', 2.0, FALSE, FALSE FROM t3
UNION ALL SELECT 't-30000000-0000-4000-a000-333333333338', user_id, id::text, 'Child 3.5 — Sliding Window Problems (Optional, Measured)', 'Education', 'LOW', 'count_event', (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date, 20, 8, 40, TRUE, 'Problems', 1.0, TRUE, FALSE FROM t3;

-- Daily Log History Data for Task 1, 2, and 3
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 't-10000000-0000-4000-a000-111111111111', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE, TRUE, 15.0 + (i % 5), 'end_date' FROM generate_series(0, 14) AS i;

INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 't-20000000-0000-4000-a000-222222222222', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE, TRUE, 5.0 + (i % 3), 'count_days' FROM generate_series(0, 14) AS i;

INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 't-30000000-0000-4000-a000-333333333333', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE, TRUE, 4.0 + (i % 4), 'count_event' FROM generate_series(0, 14) AS i;

-- Archive Logs
INSERT INTO public.task_archive_logs (id, task_id, user_id, archived_at, unarchived_at, paused_days, extension_applied_days)
VALUES 
('a-10000000-0000-4000-a000-111111111111', 't-10000000-0000-4000-a000-111111111111', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 2, 2),
('a-20000000-0000-4000-a000-222222222222', 't-20000000-0000-4000-a000-222222222222', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days', 3, 3);
