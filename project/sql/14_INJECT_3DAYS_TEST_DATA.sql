-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 14 — INJECT 3-DAY DYNAMIC DATASET
-- 12 Habits: 3 Parent Types × 3 Subhabit Types Each
-- Dynamic Measures, Over-Target & Under-Target Values, Missed Days,
-- Multi-Day Event Accumulation, and Ready-For-Today (Uncompleted Today)
-- Run this script in your Supabase SQL Editor.
-- ============================================================================

DO $$
DECLARE
    v_user_id TEXT;
    d_day3 DATE := CURRENT_DATE - 3;
    d_day2 DATE := CURRENT_DATE - 2;
    d_day1 DATE := CURRENT_DATE - 1;
    d_today DATE := CURRENT_DATE;
BEGIN
    -- 1. IDENTIFY THE TARGET USER AUTOMATICALLY
    -- Searches app_users, existing tasks, or defaults to naraynpremn1304@gmail.com
    SELECT COALESCE(
        (SELECT email FROM public.app_users ORDER BY created_at ASC LIMIT 1),
        (SELECT user_id FROM public.tasks WHERE user_id IS NOT NULL AND user_id != '' LIMIT 1),
        'naraynpremn1304@gmail.com'
    ) INTO v_user_id;

    RAISE NOTICE 'Injecting 3-day dataset for user: %', v_user_id;

    -- 2. CLEAN UP ANY PREVIOUS RUN OF THESE 12 TEST HABITS FOR RE-RUNNABILITY
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
       OR parent_task_id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones');

    DELETE FROM public.tasks 
    WHERE id IN ('parent-type1-wellness-routine', 'parent-type2-coding-sprint', 'parent-type3-project-milestones', 
                 'sub-p1-s1-morning-yoga', 'sub-p1-s2-hydration-focus', 'sub-p1-s3-mindfulness-sessions',
                 'sub-p2-s1-tech-reading', 'sub-p2-s2-leetcode-problems', 'sub-p2-s3-git-pull-requests',
                 'sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing');

    -- =========================================================================
    -- 3. INSERT THE 3 PARENT HABITS INTO public.tasks
    -- Note: Today they are NOT completed (is_done_today = false, logged_measure_val = 0)
    -- =========================================================================
    
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
        FALSE, 7, (d_day3)::text, (d_today + 27)::text, (d_today + 27)::text, 45, NULL
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
        FALSE, 3, (d_day3)::text, (d_today + 57)::text, (d_today + 57)::text, 60, NULL
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
        FALSE, 20, (d_day3)::text, (d_today + 30)::text, (d_today + 30)::text, 90, NULL
    );

    -- =========================================================================
    -- 4. INSERT THE 9 SUBHABITS (3 FOR EACH PARENT) INTO public.tasks & public.subtasks
    -- =========================================================================

    -- --- SUBHABITS FOR PARENT 1 ---
    -- S1.1: Type 1 Subhabit
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
    -- S1.2: Type 2 Subhabit
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
    -- S1.3: Type 3 Subhabit (2 target events)
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
    -- S2.1: Type 1 Subhabit
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
    -- S2.2: Type 2 Subhabit
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
    -- S2.3: Type 3 Subhabit (2 target events)
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
    -- S3.1: Type 1 Subhabit
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
    -- S3.2: Type 2 Subhabit
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
    -- S3.3: Type 3 Subhabit (2 target events)
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

    -- ALSO POPULATE public.subtasks FOR HYBRID QUERY SUPPORT
    INSERT INTO public.subtasks (
        id, parent_task_id, user_id, title, description, status,
        has_measure_tracking, measure_target, measure_unit, logged_measure_val, is_done_today,
        tracking_mode, target_count, current_count
    )
    SELECT id, parent_task_id, user_id, title, description, 'PLANNED',
           has_measure_tracking, measure_target, measure_unit, 0, FALSE,
           tracking_mode, target_count, current_count
    FROM public.tasks
    WHERE parent_task_id IS NOT NULL;


    -- =========================================================================
    -- 5. HISTORICAL EXECUTION LOGS FOR THE PAST 3 DAYS
    -- =========================================================================

    -- -------------------------------------------------------------------------
    -- [DAY -3] (3 Days Ago: d_day3)
    -- SCENARIO: All 3 subhabits completed on Day -3! Both Parents exceed targets!
    -- Parent 1 Target: 30 -> Subtasks: 14 + 12 + 13 (2 events) = 39 total!
    -- Parent 2 Target: 40 -> Subtasks: 20 + 18 + 19 (2 events) = 57 total!
    -- Parent 3 completes Event #1: 20 + 30 + 25 = 75 total work!
    -- -------------------------------------------------------------------------
    
    -- Subtasks Day -3: Parent 1
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 14, 'Deep vinyasa flow (Exceeded target: 14/10 mins)'),
        ('sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 12, '12 glasses electrolytes logged'),
        ('sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 13, '2 Zen sessions completed (contribution: 13)');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p1-s1-morning-yoga', v_user_id, d_day3, (d_day3 + TIME '08:30:00'), 1, 14, TRUE),
        ('sub-p1-s2-hydration-focus', v_user_id, d_day3, (d_day3 + TIME '12:00:00'), 1, 12, TRUE),
        ('sub-p1-s3-mindfulness-sessions', v_user_id, d_day3, (d_day3 + TIME '18:00:00'), 2, 13, TRUE),
        ('parent-type1-wellness-routine', v_user_id, d_day3, (d_day3 + TIME '18:05:00'), 1, 39, TRUE);

    -- Subtasks Day -3: Parent 2
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 20, '20 pages distributed systems architecture'),
        ('sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 18, '18 graph & DP problems solved'),
        ('sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 19, '2 PR reviews merged');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p2-s1-tech-reading', v_user_id, d_day3, (d_day3 + TIME '10:00:00'), 1, 20, TRUE),
        ('sub-p2-s2-leetcode-problems', v_user_id, d_day3, (d_day3 + TIME '15:30:00'), 1, 18, TRUE),
        ('sub-p2-s3-git-pull-requests', v_user_id, d_day3, (d_day3 + TIME '19:00:00'), 2, 19, TRUE),
        ('parent-type2-coding-sprint', v_user_id, d_day3, (d_day3 + TIME '19:05:00'), 1, 57, TRUE);

    -- Subtasks Day -3: Parent 3 (Completes Event #1!)
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 20, 'Auth service & DB connection pooling'),
        ('sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 30, 'Kanban board & dashboard widgets'),
        ('sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 25, '2 test cycles passed');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p3-s1-core-backend-api', v_user_id, d_day3, (d_day3 + TIME '11:00:00'), 1, 20, TRUE),
        ('sub-p3-s2-frontend-ui-views', v_user_id, d_day3, (d_day3 + TIME '16:00:00'), 1, 30, TRUE),
        ('sub-p3-s3-integration-testing', v_user_id, d_day3, (d_day3 + TIME '20:00:00'), 2, 25, TRUE),
        ('parent-type3-project-milestones', v_user_id, d_day3, (d_day3 + TIME '20:05:00'), 1, 75, TRUE);

    INSERT INTO public.event_logs (task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 1, d_day3, (d_day3 + TIME '20:05:00')::timestamptz,
        75, '{"sub_p3_s1": 20, "sub_p3_s2": 30, "sub_p3_s3": 25}'::jsonb, 'FINALIZED'
    );


    -- -------------------------------------------------------------------------
    -- [DAY -2] (2 Days Ago: d_day2) — THE MISSED DAY
    -- SCENARIO: 2 subhabits completed, but 1 subhabit was NOT completed!
    -- Parent 1: S1.1 = 4, S1.2 = 3, but S1.3 = NOT COMPLETED! -> Parent 1 UNCOMPLETED!
    -- Parent 2: S2.1 = 12, S2.3 = 6, but S2.2 = NOT COMPLETED! -> Parent 2 UNCOMPLETED!
    -- Parent 3: S3.1 = 25, S3.2 = 20 logged at night; S3.3 not finished (persists across days!)
    -- -------------------------------------------------------------------------

    -- Subtasks Day -2: Parent 1 (Missed Day)
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 4, 'Short 4 min stretch session (Below target)'),
        ('sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 3, 'Only 3 glasses water logged'),
        ('sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day2, FALSE, 0, 'SKIPPED: Zen session missed due to meeting');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p1-s1-morning-yoga', v_user_id, d_day2, (d_day2 + TIME '09:00:00'), 1, 4, TRUE),
        ('sub-p1-s2-hydration-focus', v_user_id, d_day2, (d_day2 + TIME '13:00:00'), 1, 3, TRUE),
        ('parent-type1-wellness-routine', v_user_id, d_day2, (d_day2 + TIME '23:59:59'), 0, 7, FALSE); -- INCOMPLETE!

    -- Subtasks Day -2: Parent 2 (Missed Day)
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 12, '12 pages design patterns'),
        ('sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day2, FALSE, 0, 'SKIPPED: No LeetCode solved today'),
        ('sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 6, '1 PR review completed');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p2-s1-tech-reading', v_user_id, d_day2, (d_day2 + TIME '11:00:00'), 1, 12, TRUE),
        ('sub-p2-s3-git-pull-requests', v_user_id, d_day2, (d_day2 + TIME '17:00:00'), 1, 6, TRUE),
        ('parent-type2-coding-sprint', v_user_id, d_day2, (d_day2 + TIME '23:59:59'), 0, 18, FALSE); -- INCOMPLETE!

    -- Subtasks Day -2: Parent 3 (In-Progress Event #2 Across Days)
    -- Completed S3.1 (25) and S3.2 (20), but S3.3 not yet done -> work carries forward!
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 25, 'Night coding: Redis caching layer (25 pts)'),
        ('sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 20, 'Night coding: Form validation & modals (20 pts)'),
        ('sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day2, FALSE, 0, 'Not completed yet — carrying over into next day');


    -- -------------------------------------------------------------------------
    -- [DAY -1] (Yesterday: d_day1)
    -- SCENARIO: All completed with dynamic values!
    -- Parent 1: S1.1 = 8, S1.2 = 9, S1.3 = 1 event (4.3) -> 21.3 completed (lower efficiency)
    -- Parent 2: S2.1 = 14, S2.2 = 16, S2.3 = 2 events (15) -> 45 completed!
    -- Parent 3: Subhabit 3 finishes with 30! Finishes Event #2 with 25+20+30 = 75 total!
    -- -------------------------------------------------------------------------

    -- Subtasks Day -1: Parent 1 (Completed with lower measure: 21.3)
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 8, '8 mins yoga flow'),
        ('sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 9, '9 glasses water'),
        ('sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 4.3, '1 zen session completed');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p1-s1-morning-yoga', v_user_id, d_day1, (d_day1 + TIME '08:15:00'), 1, 8, TRUE),
        ('sub-p1-s2-hydration-focus', v_user_id, d_day1, (d_day1 + TIME '12:30:00'), 1, 9, TRUE),
        ('sub-p1-s3-mindfulness-sessions', v_user_id, d_day1, (d_day1 + TIME '18:45:00'), 1, 4.3, TRUE),
        ('parent-type1-wellness-routine', v_user_id, d_day1, (d_day1 + TIME '18:50:00'), 1, 21.3, TRUE);

    -- Subtasks Day -1: Parent 2 (Completed with 45)
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 14, '14 pages clean architecture'),
        ('sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 16, '16 algorithmic challenges'),
        ('sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 15, '2 review PRs approved');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p2-s1-tech-reading', v_user_id, d_day1, (d_day1 + TIME '10:30:00'), 1, 14, TRUE),
        ('sub-p2-s2-leetcode-problems', v_user_id, d_day1, (d_day1 + TIME '16:00:00'), 1, 16, TRUE),
        ('sub-p2-s3-git-pull-requests', v_user_id, d_day1, (d_day1 + TIME '19:30:00'), 2, 15, TRUE),
        ('parent-type2-coding-sprint', v_user_id, d_day1, (d_day1 + TIME '19:35:00'), 1, 45, TRUE);

    -- Subtasks Day -1: Parent 3 (Completes Event #2 Across Days!)
    -- Subtask 3 finishes today with 30 -> completing Event #2 with 25 + 20 + 30 = 75!
    INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, notes)
    VALUES 
        ('sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day1, TRUE, 30, 'Completed test suites: finishes Event #2 with 25+20+30=75 points!');

    INSERT INTO public.task_logs (task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        ('sub-p3-s3-integration-testing', v_user_id, d_day1, (d_day1 + TIME '17:00:00'), 2, 30, TRUE),
        ('parent-type3-project-milestones', v_user_id, d_day1, (d_day1 + TIME '17:05:00'), 1, 75, TRUE);

    INSERT INTO public.event_logs (task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 2, d_day1, (d_day1 + TIME '17:05:00')::timestamptz,
        75, '{"sub_p3_s1_day2": 25, "sub_p3_s2_day2": 20, "sub_p3_s3_day1": 30}'::jsonb, 'FINALIZED'
    );

    RAISE NOTICE 'SUCCESS: Successfully injected 3-day dynamic dataset for 12 habits!';
    RAISE NOTICE 'Parent 1: 39 (Day -3), MISSED 7 (Day -2), 21.3 (Day -1)';
    RAISE NOTICE 'Parent 2: 57 (Day -3), MISSED 18 (Day -2), 45 (Day -1)';
    RAISE NOTICE 'Parent 3: Event 1 (75 pts on Day -3), Event 2 across days (75 pts on Day -1)';
    RAISE NOTICE 'Today: All 12 habits reset and ready (is_done_today = false)';
END $$;
