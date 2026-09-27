-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 15 — TEST ACCOUNT CREATION & 3-DAY DATASET
-- 1. Creates Test Account: test@habithacker.com (Password: Test@1234)
-- 2. Also registers/updates: premnaraynnl1304@gmail.com (Password: Test@1234)
-- 3. Injects the complete 12 habits dataset (3 Parents x 3 Subhabits each)
--    with 3 days of dynamic measures, missed days, and ready for today!
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

-- STEP 2: INSERT / UPDATE TEST ACCOUNTS (SHA-256 of 'Test@1234')
INSERT INTO public.app_users (id, email, password_hash, display_name, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'test@habithacker.com', '849f1575ccfbf3a4d6cf00e6c5641b7fd4da2ed3e212c2d79ba9161a5a432ff0', 'Test User', NOW(), NOW()),
    (gen_random_uuid(), 'premnaraynnl1304@gmail.com', '849f1575ccfbf3a4d6cf00e6c5641b7fd4da2ed3e212c2d79ba9161a5a432ff0', 'Prem Narayan', NOW(), NOW())
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- STEP 3: ENSURE ID DEFAULTS ON LOG TABLES
ALTER TABLE IF EXISTS public.event_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.task_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE IF EXISTS public.subtask_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- STEP 4: INJECT 12 HABITS & 3-DAY DYNAMIC DATA FOR TEST ACCOUNTS
DO $$
DECLARE
    target_users TEXT[] := ARRAY['test@habithacker.com', 'premnaraynnl1304@gmail.com'];
    v_user_id TEXT;
    d_day3 DATE := CURRENT_DATE - 3;
    d_day2 DATE := CURRENT_DATE - 2;
    d_day1 DATE := CURRENT_DATE - 1;
    d_today DATE := CURRENT_DATE;
BEGIN
    FOREACH v_user_id IN ARRAY target_users LOOP
        RAISE NOTICE 'Injecting 12 habits for user: %', v_user_id;

        -- Clean up previous test habits for this user
        DELETE FROM public.subtask_logs 
        WHERE user_id = v_user_id AND (
            parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
            OR subtask_id IN ('sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                              'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                              'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
        );

        DELETE FROM public.event_logs 
        WHERE user_id = v_user_id AND (
            task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones') 
            OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
        );

        DELETE FROM public.task_logs 
        WHERE user_id = v_user_id AND (
            task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones', 
                        'sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                        'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                        'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
        );

        DELETE FROM public.subtasks 
        WHERE user_id = v_user_id AND (
            id IN ('sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                   'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                   'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
            OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones')
        );

        DELETE FROM public.tasks 
        WHERE user_id = v_user_id AND (
            id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones', 
                   'sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                   'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                   'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing')
        );

        -- [P1] Parent Habit 1: Type 1 (Date Range)
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

        -- [P2] Parent Habit 2: Type 2 (Day Count)
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

        -- [P3] Parent Habit 3: Type 3 (Event Count)
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
            EXECUTE 'UPDATE public.tasks SET start_date = planned_start, end_date = planned_end WHERE user_id = $1 AND id IN (''parent-type1-wellness-routine'', ''parent-type2-coding-sprint'', ''parent-type3-project-milestones'')' USING v_user_id;
        END IF;

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

    END LOOP;

    RAISE NOTICE 'SUCCESS: Test account test@habithacker.com and premnaraynnl1304@gmail.com initialized with 12 habits!';
END $$;
