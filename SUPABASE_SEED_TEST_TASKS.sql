-- ============================================================================
-- HABIT HACKER: SUPABASE COMPLETE SELF-CONTAINED SEED SCRIPT (DATE TYPE FIX)
-- Paste and run this ENTIRE script directly into Supabase SQL Editor.
-- Fixes DATE casting for planned_start and planned_end.
-- ============================================================================

-- 1. AUTOMATICALLY ADD ANY MISSING COLUMNS TO public.tasks TABLE
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

-- 2. DROP & RECREATE ANALYTICS TABLES WITH FLEXIBLE TEXT TYPES
DROP TABLE IF EXISTS public.subtask_logs CASCADE;
DROP TABLE IF EXISTS public.task_archive_logs CASCADE;

CREATE TABLE public.task_archive_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unarchived_at TIMESTAMPTZ,
    paused_days INT DEFAULT 0,
    extension_applied_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subtask_logs (
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

CREATE INDEX IF NOT EXISTS idx_task_archive_logs_task ON public.task_archive_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_parent ON public.subtask_logs(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_subtask ON public.subtask_logs(subtask_id);

-- 3. CLEANUP PREVIOUS TEST TASKS
DELETE FROM public.task_logs WHERE task_id IN (SELECT id::text FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3') OR parent_task_id IN (SELECT id::text FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3')));
DELETE FROM public.subtask_logs WHERE parent_task_id IN (SELECT id::text FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));
DELETE FROM public.task_archive_logs WHERE task_id IN (SELECT id::text FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));
DELETE FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3') OR parent_task_id IN (SELECT id::text FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));

-- 4. INSERT TEST TASK 1: END_DATE MODE ("Test1 - Java Masterclass")
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
        'Coding',
        'CRITICAL',
        'end_date',
        (CURRENT_DATE - INTERVAL '15 days')::date,
        (CURRENT_DATE + INTERVAL '30 days')::date,
        45,
        15,
        33,
        TRUE,
        'Pages',
        12.0,
        FALSE,
        FALSE,
        2,
        4,
        'Daily',
        NOW() - INTERVAL '15 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '11111111-1111-4111-a111-111111111112',
    user_id, id::text,
    'Child 1.1 - Spring Data JPA Exercises (Mandatory, Measured)',
    'Coding', 'HIGH', 'end_date',
    (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    25, 12, 48, TRUE, 'Exercises', 5.0, FALSE, FALSE
FROM new_parent1
UNION ALL
SELECT 
    '11111111-1111-4111-a111-111111111113',
    user_id, id::text,
    'Child 1.2 - JDBC Optimization Reading (Optional, Measured)',
    'Coding', 'MEDIUM', 'end_date',
    (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 8, 26, TRUE, 'Pages', 10.0, TRUE, FALSE
FROM new_parent1
UNION ALL
SELECT 
    '11111111-1111-4111-a111-111111111114',
    user_id, id::text,
    'Child 1.3 - Build REST Controllers (Mandatory, Standard Check)',
    'Coding', 'CRITICAL', 'end_date',
    (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '15 days')::date,
    30, 15, 50, FALSE, 'Units', 1.0, FALSE, FALSE
FROM new_parent1
UNION ALL
SELECT 
    '11111111-1111-4111-a111-111111111115',
    user_id, id::text,
    'Child 1.4 - Optional Security JWT Review (Optional, Standard Check)',
    'Coding', 'LOW', 'end_date',
    (CURRENT_DATE - INTERVAL '5 days')::date, (CURRENT_DATE + INTERVAL '25 days')::date,
    30, 5, 16, FALSE, 'Units', 1.0, TRUE, FALSE
FROM new_parent1;

-- Archive Logs for Test1
INSERT INTO public.task_archive_logs (id, task_id, user_id, archived_at, unarchived_at, paused_days, extension_applied_days)
VALUES 
('a1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 2, 2),
('a1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 2, 2);

-- Historical Daily Task Logs for Test1
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '11111111-1111-4111-a111-111111111111',
    COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    10.0 + (i % 4),
    'end_date'
FROM generate_series(0, 14) AS i;


-- 5. INSERT TEST TASK 2: COUNT_DAYS MODE ("Test2 - Morning Cardio Running")
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
        'Health',
        'HIGH',
        'count_days',
        (CURRENT_DATE - INTERVAL '10 days')::date,
        (CURRENT_DATE + INTERVAL '20 days')::date,
        30, 30, 18, 18,
        60, TRUE, 'Km', 5.0, FALSE, FALSE,
        1, 3, 'Daily', NOW() - INTERVAL '10 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '22222222-2222-4222-a222-222222222223',
    user_id, id::text,
    'Child 2.1 - Warmup Stretches (Mandatory, Measured in Mins)',
    'Health', 'MEDIUM', 'count_days',
    (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 18, 60, TRUE, 'Mins', 10.0, FALSE, FALSE
FROM new_parent2
UNION ALL
SELECT 
    '22222222-2222-4222-a222-222222222224',
    user_id, id::text,
    'Child 2.2 - Hydration & Electrolytes (Mandatory, Standard Check)',
    'Health', 'HIGH', 'count_days',
    (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 18, 60, FALSE, 'Litres', 2.0, FALSE, FALSE
FROM new_parent2
UNION ALL
SELECT 
    '22222222-2222-4222-a222-222222222225',
    user_id, id::text,
    'Child 2.3 - Post-run Foam Rolling (Optional, Measured)',
    'Health', 'LOW', 'count_days',
    (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '20 days')::date,
    30, 10, 33, TRUE, 'Mins', 15.0, TRUE, FALSE
FROM new_parent2;

-- Historical Daily Task Logs for Test2
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '22222222-2222-4222-a222-222222222222',
    COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    5.5 + (i % 2),
    'count_days'
FROM generate_series(0, 9) AS i;


-- 6. INSERT TEST TASK 3: COUNT_EVENT MODE ("Test3 - 100 Coding Submissions")
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
        'Education',
        'CRITICAL',
        'count_event',
        (CURRENT_DATE - INTERVAL '20 days')::date,
        (CURRENT_DATE + INTERVAL '10 days')::date,
        100, 100, 65, 65,
        65, TRUE, 'Problems', 3.0, FALSE, FALSE,
        0, 0, 'Daily', NOW() - INTERVAL '20 days'
    ) RETURNING id, user_id
)
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '33333333-3333-4333-a333-333333333334',
    user_id, id::text,
    'Child 3.1 - Dynamic Programming Practice (Mandatory, Measured)',
    'Education', 'HIGH', 'count_event',
    (CURRENT_DATE - INTERVAL '20 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    40, 28, 70, TRUE, 'Problems', 2.0, FALSE, FALSE
FROM new_parent3
UNION ALL
SELECT 
    '33333333-3333-4333-a333-333333333335',
    user_id, id::text,
    'Child 3.2 - Graph Algorithms & DFS/BFS (Mandatory, Measured)',
    'Education', 'CRITICAL', 'count_event',
    (CURRENT_DATE - INTERVAL '20 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    30, 22, 73, TRUE, 'Problems', 2.0, FALSE, FALSE
FROM new_parent3
UNION ALL
SELECT 
    '33333333-3333-4333-a333-333333333336',
    user_id, id::text,
    'Child 3.3 - Optional Mock Code Review Notes (Optional, Standard)',
    'Education', 'LOW', 'count_event',
    (CURRENT_DATE - INTERVAL '10 days')::date, (CURRENT_DATE + INTERVAL '10 days')::date,
    30, 15, 50, FALSE, 'Reviews', 1.0, TRUE, FALSE
FROM new_parent3;

-- Historical Daily Task Logs for Test3
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '33333333-3333-4333-a333-333333333333',
    COALESCE(auth.uid()::text, '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    3.0 + (i % 3),
    'count_event'
FROM generate_series(0, 19) AS i;

-- ============================================================================
-- SUCCESS: Test1, Test2, and Test3 seeded cleanly with DATE type compatibility!
-- ============================================================================
