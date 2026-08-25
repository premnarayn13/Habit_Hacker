-- ============================================================================
-- HABIT HACKER: SUPABASE SEED TEST DATA FOR DEEP ANALYTICS PAGE
-- Execute this SQL script in your Supabase SQL Editor to populate Test1, Test2, and Test3
-- with full child subtasks, 365-day history logs, archive logs, and daily measure logs.
-- ============================================================================

-- 1. CLEANUP PREVIOUS TEST TASKS (IF APPLICABLE)
DELETE FROM public.task_logs WHERE task_id IN (SELECT id FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3') OR parent_task_id IN (SELECT id FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3')));
DELETE FROM public.subtask_logs WHERE parent_task_id IN (SELECT id FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));
DELETE FROM public.task_archive_logs WHERE task_id IN (SELECT id FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));
DELETE FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3') OR parent_task_id IN (SELECT id FROM public.tasks WHERE title IN ('Test1', 'Test2', 'Test3'));

-- 2. INSERT TEST TASK 1: END_DATE MODE ("Test1 - Java Masterclass")
-- Features: Fixed start & end date window, daily measure tracking (10 pages/day), archive history log, child subtasks.
WITH new_parent1 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_count, current_count, progress_percent,
        has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '11111111-1111-4111-a111-111111111111',
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'Test1',
        'Mastering Advanced Java & Spring Boot Microservices over a 45-day fixed schedule window.',
        'Coding',
        'CRITICAL',
        'end_date',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '30 days',
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
-- Child Subtasks for Test1
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '11111111-1111-4111-a111-111111111112',
    user_id,
    id,
    'Child 1.1 - Complete Spring Data JPA Exercises',
    'Coding',
    'HIGH',
    'end_date',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '10 days',
    25,
    12,
    48,
    TRUE,
    'Exercises',
    5.0,
    FALSE,
    FALSE
FROM new_parent1
UNION ALL
SELECT 
    '11111111-1111-4111-a111-111111111113',
    user_id,
    id,
    'Child 1.2 - Optional JDBC Optimization Reading',
    'Coding',
    'MEDIUM',
    'end_date',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    30,
    8,
    26,
    FALSE,
    'Pages',
    10.0,
    TRUE,
    FALSE
FROM new_parent1;

-- Archive Logs for Test1
INSERT INTO public.task_archive_logs (id, task_id, user_id, archived_at, unarchived_at, paused_days, extension_applied_days)
VALUES 
('a1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 2, 2),
('a1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'), NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 2, 2);

-- Historical Daily Task Logs for Test1
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '11111111-1111-4111-a111-111111111111',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    10.0 + (i % 4),
    'end_date'
FROM generate_series(0, 14) AS i;


-- 3. INSERT TEST TASK 2: COUNT_DAYS MODE ("Test2 - Morning Running Discipline")
-- Features: Requires 30 successful days within 40 calendar days window. Feasibility Warning check.
WITH new_parent2 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_day_count, target_count, current_day_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '22222222-2222-4222-a222-222222222222',
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'Test2',
        'Mandatory 30-Day Morning Cardio Running Program to build stamina and heart discipline.',
        'Health',
        'HIGH',
        'count_days',
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE + INTERVAL '20 days',
        30,
        30,
        18,
        18,
        60,
        TRUE,
        'Km',
        5.0,
        FALSE,
        FALSE,
        1,
        3,
        'Daily',
        NOW() - INTERVAL '10 days'
    ) RETURNING id, user_id
)
-- Child Subtasks for Test2
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '22222222-2222-4222-a222-222222222223',
    user_id,
    id,
    'Child 2.1 - Warmup Stretches (10 mins)',
    'Health',
    'MEDIUM',
    'count_days',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    30,
    18,
    60,
    FALSE,
    'Mins',
    10.0,
    FALSE,
    FALSE
FROM new_parent2;

-- Historical Daily Task Logs for Test2
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '22222222-2222-4222-a222-222222222222',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    5.5 + (i % 2),
    'count_days'
FROM generate_series(0, 9) AS i;


-- 4. INSERT TEST TASK 3: COUNT_EVENT MODE ("Test3 - 100 Coding Submissions")
-- Features: Target event repetitions quantity (100 problems). Pace Velocity Engine (Required pace vs actual pace).
WITH new_parent3 AS (
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        planned_start, planned_end, target_event_count, target_count, current_event_count, current_count,
        progress_percent, has_measure_tracking, measure_unit, measure_target, is_optional, is_archived,
        archive_count, paused_days, recurrence_pattern, created_at
    ) VALUES (
        '33333333-3333-4333-a333-333333333333',
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        'Test3',
        'Solving 100 Algorithmic Data Structure & LeetCode problems before final technical interview.',
        'Education',
        'CRITICAL',
        'count_event',
        CURRENT_DATE - INTERVAL '20 days',
        CURRENT_DATE + INTERVAL '10 days',
        100,
        100,
        65,
        65,
        65,
        TRUE,
        'Problems',
        3.0,
        FALSE,
        FALSE,
        0,
        0,
        'Daily',
        NOW() - INTERVAL '20 days'
    ) RETURNING id, user_id
)
-- Child Subtasks for Test3
INSERT INTO public.tasks (
    id, user_id, parent_task_id, title, category, priority, tracking_mode,
    planned_start, planned_end, target_count, current_count, progress_percent,
    has_measure_tracking, measure_unit, measure_target, is_optional, is_archived
) SELECT 
    '33333333-3333-4333-a333-333333333334',
    user_id,
    id,
    'Child 3.1 - Dynamic Programming Practice',
    'Education',
    'HIGH',
    'count_event',
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '10 days',
    40,
    28,
    70,
    TRUE,
    'Problems',
    2.0,
    FALSE,
    FALSE
FROM new_parent3;

-- Historical Daily Task Logs for Test3
INSERT INTO public.task_logs (task_id, user_id, log_date, is_completed, measured_value, tracking_mode)
SELECT 
    '33333333-3333-4333-a333-333333333333',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
    (CURRENT_DATE - (i || ' days')::INTERVAL)::DATE,
    TRUE,
    3.0 + (i % 3),
    'count_event'
FROM generate_series(0, 19) AS i;

-- ============================================================================
-- SEEDING COMPLETE FOR Test1, Test2, Test3!
-- You can now view Test1, Test2, or Test3 on the Mobile UI to inspect complete analytics.
-- ============================================================================
