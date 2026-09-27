-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 15 (FIXED) — DEDICATED TEST ACCOUNT & DATASET
-- Account: example@gmail.com
-- Password: 123456
-- (Does NOT touch or alter any other existing user accounts)
-- Injects the complete 12 habits dataset with 3 days of dynamic execution
-- ============================================================================

-- STEP 1: ENSURE app_users TABLE EXISTS & PERMISSIONS GRANTED
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.app_users TO anon, authenticated, service_role;

-- STEP 2: CREATE / UPDATE example@gmail.com WITH PASSWORD 123456
-- SHA-256 of '123456' is: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
INSERT INTO public.app_users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'example@gmail.com',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    'Example User',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    display_name = 'Example User',
    updated_at = NOW();

-- STEP 3: DROP OBSOLETE BEFORE DELETE TRIGGERS & CONSTRAINTS (PREVENTS TUPLE MODIFICATION CONFLICT)
DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks CASCADE;
ALTER TABLE IF EXISTS public.tasks DROP CONSTRAINT IF EXISTS tasks_parent_id_fkey;
ALTER TABLE IF EXISTS public.tasks DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE IF EXISTS public.subtasks DROP CONSTRAINT IF EXISTS subtasks_parent_id_fkey;
ALTER TABLE IF EXISTS public.subtasks DROP CONSTRAINT IF EXISTS subtasks_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.subtasks DROP CONSTRAINT IF EXISTS subtasks_user_id_fkey;

-- STEP 4: ENSURE ID DEFAULTS ON LOG TABLES
ALTER TABLE IF EXISTS public.event_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.task_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.subtask_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- STEP 5: INJECT 12 HABITS & 3-DAY DATASET EXCLUSIVELY FOR example@gmail.com
DO $$
DECLARE
    v_user_id CONSTANT TEXT := 'example@gmail.com';
    d_day3 DATE := CURRENT_DATE - 3;
    d_day2 DATE := CURRENT_DATE - 2;
    d_day1 DATE := CURRENT_DATE - 1;
    d_today DATE := CURRENT_DATE;
    r RECORD;
BEGIN
    RAISE NOTICE 'Injecting 12 habits exclusively for %', v_user_id;

    -- Drop any unmap triggers dynamically to guarantee zero trigger conflicts during deletion/injection
    FOR r IN (
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('tasks', 'subtasks') 
          AND trigger_schema = 'public'
          AND trigger_name ILIKE '%unmap%'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', r.trigger_name, r.event_object_table);
    END LOOP;

    -- 1. CLEAN UP LOGS AND SUBTASKS FIRST
    DELETE FROM public.subtask_logs 
    WHERE parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
       OR subtask_id IN ('sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                         'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                         'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing');

    DELETE FROM public.event_logs 
    WHERE task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones') 
       OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones');

    DELETE FROM public.task_logs 
    WHERE task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones', 
                      'sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                      'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                      'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing');

    DELETE FROM public.subtasks 
    WHERE id IN ('sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                 'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                 'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
       OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
       OR parent_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones');

    -- 2. DELETE CHILD TASKS IN public.tasks FIRST (ONLY SUBTASK IDs, PREVENTS CONFLICT WITH PARENT TRIGGERS)
    DELETE FROM public.tasks 
    WHERE id IN ('sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                 'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                 'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
       OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
       OR parent_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones');

    -- 3. DELETE PARENT TASKS IN public.tasks (CHILDREN ARE GONE, ZERO RISK OF TUPLE CONFLICT)
    DELETE FROM public.tasks 
    WHERE id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones');

    -- 3. INSERT THE 3 PARENT HABITS
    -- [P1] Parent Habit 1: Type 1 (Date Range / end_date)
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id
    ) VALUES (
        'parent-type1-wellness-routine', v_user_id,
        '[P1] Daily Wellness Mastery (Type 1 - Date Range)',
        'Comprehensive health system: requires all 3 subhabits to complete each day',
        'Health', 'HIGH', 'end_date',
        30, 2, 'DAILY', 1,
        TRUE, 'mins', 30, 0, 21.3,
        FALSE, 7, d_day3, (d_today + 27), (d_today + 27), 45, NULL
    );

    -- [P2] Parent Habit 2: Type 2 (Day Count / count_days)
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id
    ) VALUES (
        'parent-type2-coding-sprint', v_user_id,
        '[P2] 60-Day Full-Stack Sprint (Type 2 - Day Count)',
        'Track day counts across learning tracks: target 40 pages/points per day',
        'Career', 'HIGH', 'count_days',
        60, 2, 'DAILY', 1,
        TRUE, 'pages', 40, 0, 45,
        FALSE, 3, d_day3, (d_today + 57), (d_today + 57), 60, NULL
    );

    -- [P3] Parent Habit 3: Type 3 (Event Count / count_event)
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id
    ) VALUES (
        'parent-type3-project-milestones', v_user_id,
        '[P3] Production Feature Shipments (Type 3 - Event Count)',
        'Event milestone parent: completes 1 event when all 3 subtasks finish, carrying work across days',
        'Projects', 'HIGH', 'count_event',
        10, 2, 'DAILY', 1,
        TRUE, 'points', 60, 0, 75,
        FALSE, 20, d_day3, (d_today + 30), (d_today + 30), 90, NULL
    );

    -- Sync start_date and end_date if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='start_date') THEN
        EXECUTE 'UPDATE public.tasks SET start_date = planned_start, end_date = planned_end WHERE id IN (''parent-type1-wellness-routine'', ''parent-type2-coding-sprint'', ''parent-type3-project-milestones'')';
    END IF;

    -- 4. INSERT THE 9 SUBHABITS (3 FOR EACH PARENT)
    -- --- SUBHABITS FOR PARENT 1 ---
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p1-s1-morning-yoga', v_user_id,
        '[S1.1] Morning Yoga & Breathwork (Type 1)',
        'End-date tracked physical mobility session', 'Health', 'MEDIUM', 'end_date',
        30, 2, TRUE, 'mins', 10, 0, FALSE, 'parent-type1-wellness-routine'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p1-s2-hydration-focus', v_user_id,
        '[S1.2] Hydration & Nutrition Tracker (Type 2)',
        'Count-days tracked hydration intake', 'Health', 'MEDIUM', 'count_days',
        30, 2, TRUE, 'glasses', 10, 0, FALSE, 'parent-type1-wellness-routine'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p1-s3-mindfulness-sessions', v_user_id,
        '[S1.3] Guided Zen Sessions (Type 3 - 2 Events)',
        'Event count subhabit: 2 zen sessions per cycle', 'Health', 'MEDIUM', 'count_event',
        2, 2, TRUE, 'mins', 10, 0, FALSE, 'parent-type1-wellness-routine'
    );

    -- --- SUBHABITS FOR PARENT 2 ---
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p2-s1-tech-reading', v_user_id,
        '[S2.1] Architectural Book Study (Type 1)',
        'End-date technical literature reading', 'Career', 'MEDIUM', 'end_date',
        60, 2, TRUE, 'pages', 15, 0, FALSE, 'parent-type2-coding-sprint'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p2-s2-leetcode-problems', v_user_id,
        '[S2.2] Algorithm Challenges (Type 2)',
        'Count-days code challenge solving', 'Career', 'HIGH', 'count_days',
        60, 2, TRUE, 'problems', 15, 0, FALSE, 'parent-type2-coding-sprint'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p2-s3-git-pull-requests', v_user_id,
        '[S2.3] PR Review Sprints (Type 3 - 2 Events)',
        'Event-count code review commits', 'Career', 'MEDIUM', 'count_event',
        2, 2, TRUE, 'reviews', 10, 0, FALSE, 'parent-type2-coding-sprint'
    );

    -- --- SUBHABITS FOR PARENT 3 ---
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p3-s1-core-backend-api', v_user_id,
        '[S3.1] Backend Services & Migration (Type 1)',
        'End-date API development milestones', 'Projects', 'HIGH', 'end_date',
        10, 2, TRUE, 'points', 20, 0, FALSE, 'parent-type3-project-milestones'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p3-s2-frontend-ui-views', v_user_id,
        '[S3.2] React UI Component Polishing (Type 2)',
        'Count-days design system implementation', 'Projects', 'HIGH', 'count_days',
        10, 2, TRUE, 'points', 25, 0, FALSE, 'parent-type3-project-milestones'
    );
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, is_done_today, parent_task_id
    ) VALUES (
        'sub-p3-s3-integration-testing', v_user_id,
        '[S3.3] E2E Integration Cycles (Type 3 - 2 Events)',
        'Event-count test deployment suite', 'Projects', 'HIGH', 'count_event',
        2, 2, TRUE, 'points', 20, 0, FALSE, 'parent-type3-project-milestones'
    );

    -- POPULATE subtasks TABLE
    INSERT INTO public.subtasks (
        id, parent_task_id, user_id, title, description, status,
        has_measure_tracking, measure_target, measure_unit, logged_measure_val, is_done_today,
        tracking_mode, target_count, current_count
    )
    SELECT id, parent_task_id, user_id, title, description, 'PLANNED',
           has_measure_tracking, measure_target, measure_unit, 0, FALSE,
           tracking_mode, target_count, current_count
    FROM public.tasks
    WHERE parent_task_id IS NOT NULL AND user_id = v_user_id;

    -- 5. HISTORICAL EXECUTION LOGS FOR THE PAST 3 DAYS
    -- [DAY -3] (3 Days Ago) LOGS
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 14, 'Deep vinyasa flow (Exceeded target: 14/10 mins)'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 12, '12 glasses electrolytes logged'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 13, '2 Zen sessions completed (contribution: 13)'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 20, '20 pages architecture'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 18, '18 problems solved'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 19, '2 PR reviews merged'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 20, 'Auth service & DB pool'),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 30, 'Kanban board & widgets'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 25, '2 test cycles passed');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day3, (d_day3 + TIME '08:30:00')::timestamptz, 1, 14, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day3, (d_day3 + TIME '12:00:00')::timestamptz, 1, 12, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', v_user_id, d_day3, (d_day3 + TIME '18:00:00')::timestamptz, 2, 13, TRUE),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', v_user_id, d_day3, (d_day3 + TIME '18:05:00')::timestamptz, 1, 39, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day3, (d_day3 + TIME '10:00:00')::timestamptz, 1, 20, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', v_user_id, d_day3, (d_day3 + TIME '15:30:00')::timestamptz, 1, 18, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day3, (d_day3 + TIME '19:00:00')::timestamptz, 2, 19, TRUE),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', v_user_id, d_day3, (d_day3 + TIME '19:05:00')::timestamptz, 1, 57, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', v_user_id, d_day3, (d_day3 + TIME '11:00:00')::timestamptz, 1, 20, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', v_user_id, d_day3, (d_day3 + TIME '16:00:00')::timestamptz, 1, 30, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', v_user_id, d_day3, (d_day3 + TIME '20:00:00')::timestamptz, 2, 25, TRUE),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', v_user_id, d_day3, (d_day3 + TIME '20:05:00')::timestamptz, 1, 75, TRUE);

    INSERT INTO public.event_logs (id, task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        gen_random_uuid()::text,
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 1, d_day3, (d_day3 + TIME '20:05:00')::timestamptz,
        75, '{"sub_p3_s1": 20, "sub_p3_s2": 30, "sub_p3_s3": 25}'::jsonb, 'FINALIZED'
    );

    -- [DAY -2] (2 Days Ago — THE MISSED DAY)
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 4, 'Short 4 min stretch session (Below target)'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 3, 'Only 3 glasses water logged'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day2, FALSE, 0, 'SKIPPED: Zen session missed'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 12, '12 pages design patterns'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day2, FALSE, 0, 'SKIPPED: LeetCode missed today'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 6, '1 PR review completed'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 25, 'Night coding: Redis layer (25 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 20, 'Night coding: Modal views (20 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day2, FALSE, 0, 'Carrying over into next day');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day2, (d_day2 + TIME '09:00:00')::timestamptz, 1, 4, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day2, (d_day2 + TIME '13:00:00')::timestamptz, 1, 3, TRUE),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', v_user_id, d_day2, (d_day2 + TIME '23:59:59')::timestamptz, 0, 7, FALSE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day2, (d_day2 + TIME '11:00:00')::timestamptz, 1, 12, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day2, (d_day2 + TIME '17:00:00')::timestamptz, 1, 6, TRUE),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', v_user_id, d_day2, (d_day2 + TIME '23:59:59')::timestamptz, 0, 18, FALSE);

    -- [DAY -1] (Yesterday) LOGS
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 8, '8 mins yoga flow'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 9, '9 glasses water'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 4.3, '1 zen session completed'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 14, '14 pages clean code'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 16, '16 algorithmic challenges'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 15, '2 review PRs approved'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day1, TRUE, 30, 'Completed test suites: finishes Event #2 with 25+20+30=75 points!');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day1, (d_day1 + TIME '08:15:00')::timestamptz, 1, 8, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day1, (d_day1 + TIME '12:30:00')::timestamptz, 1, 9, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', v_user_id, d_day1, (d_day1 + TIME '18:45:00')::timestamptz, 1, 4.3, TRUE),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', v_user_id, d_day1, (d_day1 + TIME '18:50:00')::timestamptz, 1, 21.3, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day1, (d_day1 + TIME '10:30:00')::timestamptz, 1, 14, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', v_user_id, d_day1, (d_day1 + TIME '16:00:00')::timestamptz, 1, 16, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day1, (d_day1 + TIME '19:30:00')::timestamptz, 2, 15, TRUE),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', v_user_id, d_day1, (d_day1 + TIME '19:35:00')::timestamptz, 1, 45, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', v_user_id, d_day1, (d_day1 + TIME '17:00:00')::timestamptz, 2, 30, TRUE),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', v_user_id, d_day1, (d_day1 + TIME '17:05:00')::timestamptz, 1, 75, TRUE);

    INSERT INTO public.event_logs (id, task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        gen_random_uuid()::text,
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 2, d_day1, (d_day1 + TIME '17:05:00')::timestamptz,
        75, '{"sub_p3_s1_day2": 25, "sub_p3_s2_day2": 20, "sub_p3_s3_day1": 30}'::jsonb, 'FINALIZED'
    );

    -- Recreate AFTER DELETE trigger (guarantees safe trigger recreation even if only DO block is run)
    EXECUTE 'CREATE OR REPLACE FUNCTION public.trg_unmap_subtasks_on_parent_delete()
    RETURNS TRIGGER AS $trg$
    BEGIN
        UPDATE public.tasks 
        SET parent_task_id = NULL, parent_id = NULL 
        WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

        UPDATE public.subtasks 
        SET parent_task_id = NULL, parent_id = NULL 
        WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

        RETURN NULL;
    END;
    $trg$ LANGUAGE plpgsql';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks CASCADE';
    EXECUTE 'CREATE TRIGGER trg_tasks_unmap_children
    AFTER DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_unmap_subtasks_on_parent_delete()';

    RAISE NOTICE 'SUCCESS: Successfully created example@gmail.com (Password: 123456) with all 12 habits!';
END $$;

-- STEP 6: RECREATE trg_tasks_unmap_children AS AFTER DELETE
CREATE OR REPLACE FUNCTION public.trg_unmap_subtasks_on_parent_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    UPDATE public.subtasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks;
CREATE TRIGGER trg_tasks_unmap_children
AFTER DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_unmap_subtasks_on_parent_delete();
