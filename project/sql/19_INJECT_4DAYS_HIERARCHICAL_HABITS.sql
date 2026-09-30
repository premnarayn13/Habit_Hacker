-- =============================================================================
-- HABIT HACKER: SQL SCRIPT 2
-- INJECT COMPLETE 12-HABIT HIERARCHY WITH DYNAMIC MEASURE DATA (4-DAY TIMELINE)
-- Account:  example@gmail.com
-- Password: 123456
-- Hierarchy:
-- 1. Type-1 Parent Habit (Date Range)
--    - Subhabit 1.1: Type 1 (Date Range / end_date)        -> Dynamic Measure: 15 mins target
--    - Subhabit 1.2: Type 2 (Day Count / count_days)       -> Dynamic Measure: 8 glasses target
--    - Subhabit 1.3: Type 3 (Event Count / count_event)    -> Dynamic Measure: 12 mins target
-- 2. Type-2 Parent Habit (Day Count)
--    - Subhabit 2.1: Type 1 (Date Range / end_date)        -> Dynamic Measure: 20 pages target
--    - Subhabit 2.2: Type 2 (Day Count / count_days)       -> Dynamic Measure: 5 problems target
--    - Subhabit 2.3: Type 3 (Event Count / count_event)    -> Dynamic Measure: 3 reviews target
-- 3. Type-3 Parent Habit (Event Count)
--    - Subhabit 3.1: Type 3 (Event Count / count_event)    -> Dynamic Measure: 20 points target
--    - Subhabit 3.2: Type 3 (Event Count / count_event)    -> Dynamic Measure: 25 points target
--    - Subhabit 3.3: Type 3 (Event Count / count_event)    -> Dynamic Measure: 20 points target
-- 4-Day DYNAMIC TIMELINE (VARYING NUMERICAL MEASURES ACROSS DAYS & EVENTS):
--    - Day 1: CURRENT_DATE - 3 -> Event #1: S3.1=18, S3.2=23, S3.3=24 (Total Event 1: 65 pts)
--    - Day 2: CURRENT_DATE - 2 -> Analytical variance: S3.1=22, S3.2=28, S3.3=0 (Total: 50 pts)
--    - Day 3: CURRENT_DATE - 1 -> Event #2: S3.1=24, S3.2=27, S3.3=17 (Total Event 2: 68 pts)
--    - Day 4: CURRENT_DATE     -> Live Today: S3.1=21 pts logged, S3.2 & S3.3 pending today
-- Instructions: Run this script directly in Supabase SQL Editor.
-- =============================================================================
-- STEP 1: ENSURE app_users TABLE AND TEST CREDENTIALS EXIST
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

-- Upsert example@gmail.com with password '123456'
-- SHA-256 hash of '123456' = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
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

-- STEP 2: ENSURE ALL TABLES & DYNAMIC MEASURE COLUMNS EXIST
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS tracking_mode TEXT DEFAULT 'end_date';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 50;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS repeat_rule TEXT DEFAULT 'DAILY';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS custom_interval_days INT DEFAULT 1;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS measure_unit TEXT DEFAULT 'units';
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS last_measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 30;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS streak_count INT DEFAULT 1;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS max_streak INT DEFAULT 1;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS missed_streak INT DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS active_streak INT DEFAULT 1;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS collab TEXT;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS completed_date DATE;

CREATE TABLE IF NOT EXISTS public.subtasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    parent_task_id VARCHAR(255),
    parent_id VARCHAR(255),
    user_id VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(50) DEFAULT 'end_date';
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 1;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS last_measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.subtasks ADD COLUMN IF NOT EXISTS completed_date DATE;

CREATE TABLE IF NOT EXISTS public.task_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    increment_value INT DEFAULT 1,
    measured_value NUMERIC DEFAULT 0,
    is_successful BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS logged_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS log_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.task_logs ADD COLUMN IF NOT EXISTS increment_value INT DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtask_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    log_date DATE DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    measured_value NUMERIC DEFAULT 0,
    event_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS log_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.subtask_logs ADD COLUMN IF NOT EXISTS event_count INT DEFAULT 1;

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
    status VARCHAR(50) DEFAULT 'FINALIZED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_completion_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    task_title TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    measured_value NUMERIC DEFAULT 0,
    measure_unit VARCHAR(50) DEFAULT 'units',
    event_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_update_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255),
    task_title TEXT,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    update_type VARCHAR(100) NOT NULL DEFAULT 'TASK_UPDATED',
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subtask_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.habit_completion_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.habit_update_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.task_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtask_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.event_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_completion_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_update_history TO anon, authenticated, service_role;

-- STEP 3: INJECT DATA EXCLUSIVELY FOR example@gmail.com
DO $$
DECLARE
    v_user_id CONSTANT TEXT := 'example@gmail.com';
    d_day3 DATE := CURRENT_DATE - 3;
    d_day2 DATE := CURRENT_DATE - 2;
    d_day1 DATE := CURRENT_DATE - 1;
    d_today DATE := CURRENT_DATE;
    r RECORD;
BEGIN
    RAISE NOTICE 'Injecting complete 4-day hierarchical dataset for %', v_user_id;

    -- Drop unmap triggers to guarantee zero conflict during replace
    FOR r IN (
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('tasks', 'subtasks') 
          AND trigger_schema = 'public'
          AND trigger_name ILIKE '%unmap%'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', r.trigger_name, r.event_object_table);
    END LOOP;

    -- 1. PURGE EXISTING DATA FOR THIS USER
    DELETE FROM public.habit_completion_history WHERE user_id = v_user_id;
    DELETE FROM public.habit_update_history WHERE user_id = v_user_id;
    DELETE FROM public.subtask_logs WHERE user_id = v_user_id;
    DELETE FROM public.task_logs WHERE user_id = v_user_id;
    DELETE FROM public.event_logs WHERE user_id = v_user_id;
    DELETE FROM public.subtasks WHERE user_id = v_user_id;
    DELETE FROM public.tasks WHERE user_id = v_user_id AND (parent_task_id IS NOT NULL OR parent_id IS NOT NULL);
    DELETE FROM public.tasks WHERE user_id = v_user_id;

    -- =========================================================================
    -- 2. INSERT 3 PARENT HABITS
    -- =========================================================================

    -- [P1] Parent 1: Type 1 (Date Range / end_date)
    -- Target: 30 mins/day. Currently rolled up 16 mins today from yoga!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id,
        streak_count, max_streak, missed_streak, active_streak
    ) VALUES (
        'parent-type1-wellness-routine', v_user_id,
        '[P1] Daily Wellness Mastery (Type 1 - Date Range)',
        'Comprehensive health regimen with 3 subhabits: Type 1 (date range), Type 2 (day count), and Type 3 (event count)',
        'Health', 'HIGH', 'end_date',
        30, 3, 'DAILY', 1,
        TRUE, 'mins', 35, 16, 45,
        FALSE, 10, d_day3, (d_today + 26), (d_today + 26), 45, NULL,
        3, 3, 0, 3
    );

    -- [P2] Parent 2: Type 2 (Day Count / count_days)
    -- Target: 28 units/day (sum of subhabits: 20 pages + 5 problems + 3 reviews). Currently rolled up 22 pages today from tech reading!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id,
        streak_count, max_streak, missed_streak, active_streak
    ) VALUES (
        'parent-type2-coding-sprint', v_user_id,
        '[P2] 60-Day Full-Stack Sprint (Type 2 - Day Count)',
        'Software mastery sprint with 3 subhabits: Type 1 (reading), Type 2 (algorithms), and Type 3 (code reviews)',
        'Career', 'HIGH', 'count_days',
        60, 3, 'DAILY', 1,
        TRUE, 'points', 28, 22, 42,
        FALSE, 5, d_day3, (d_day3 + 90), (d_day3 + 90), 60, NULL,
        3, 3, 0, 3
    );

    -- [P3] Parent 3: Type 3 (Event Count / count_event)
    -- Target: 65 points per full cycle. Completed 2 events (65 pts on Day 1, 68 pts on Day 3). Currently rolled up 21 pts today!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, repeat_rule, custom_interval_days,
        has_measure_tracking, measure_unit, measure_target, logged_measure_val, last_measured_value,
        is_done_today, progress_percent, planned_start, planned_end, deadline, estimated_minutes, parent_task_id,
        streak_count, max_streak, missed_streak, active_streak
    ) VALUES (
        'parent-type3-project-milestones', v_user_id,
        '[P3] Production Feature Shipments (Type 3 - Event Count)',
        'Production release milestone parent: completes 1 event when all 3 event subtasks finish. All subhabits are Type 3.',
        'Projects', 'HIGH', 'count_event',
        10, 2, 'DAILY', 1,
        TRUE, 'points', 65, 21, 68,
        FALSE, 20, d_day3, (d_day3 + 45), (d_day3 + 45), 90, NULL,
        3, 3, 0, 3
    );

    -- =========================================================================
    -- 3. INSERT SUBHABITS FOR PARENT 1 (THREE SUBHABITS OF ALL 3 TYPES)
    -- =========================================================================

    -- Subhabit 1.1: Type 1 (end_date)
    -- Target: 15 mins. Logged 16 mins today!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline, completed_at
    ) VALUES (
        'sub-p1-s1-morning-yoga', v_user_id,
        '[S1.1] Morning Yoga & Mobility (Type 1)',
        'End-date tracked physical mobility session', 'Health', 'MEDIUM', 'end_date',
        30, 3, TRUE, 'mins', 15,
        16, 16, TRUE, 'parent-type1-wellness-routine', d_day3, (d_today + 26), (d_today + 26), (d_today + TIME '08:30:00')::timestamptz
    );

    -- Subhabit 1.2: Type 2 (count_days)
    -- Target: 8 glasses. Logged 9 glasses yesterday, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p1-s2-hydration-focus', v_user_id,
        '[S1.2] Hydration & Clean Diet (Type 2)',
        'Count-days tracked hydration intake (target 8 glasses/day)', 'Health', 'MEDIUM', 'count_days',
        30, 2, TRUE, 'glasses', 8,
        0, 9, FALSE, 'parent-type1-wellness-routine', d_day3, (d_today + 26), (d_today + 26)
    );

    -- Subhabit 1.3: Type 3 (count_event)
    -- Target: 12 mins. Logged 14 mins yesterday, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p1-s3-mindfulness-sessions', v_user_id,
        '[S1.3] Guided Zen Sessions (Type 3)',
        'Event count subhabit: 2 zen sessions per cycle', 'Health', 'MEDIUM', 'count_event',
        2, 2, TRUE, 'mins', 12,
        0, 14, FALSE, 'parent-type1-wellness-routine', d_day3, (d_today + 26), (d_today + 26)
    );

    -- =========================================================================
    -- 4. INSERT SUBHABITS FOR PARENT 2 (THREE SUBHABITS OF ALL 3 TYPES)
    -- =========================================================================

    -- Subhabit 2.1: Type 1 (end_date)
    -- Target: 20 pages. Logged 22 pages today!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline, completed_at
    ) VALUES (
        'sub-p2-s1-tech-reading', v_user_id,
        '[S2.1] Architectural Literature Study (Type 1)',
        'End-date technical literature reading', 'Career', 'MEDIUM', 'end_date',
        60, 3, TRUE, 'pages', 20,
        22, 22, TRUE, 'parent-type2-coding-sprint', d_day3, (d_today + 87), (d_today + 87), (d_today + TIME '10:00:00')::timestamptz
    );

    -- Subhabit 2.2: Type 2 (count_days)
    -- Target: 5 problems. Logged 6 problems yesterday, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p2-s2-leetcode-problems', v_user_id,
        '[S2.2] Algorithm Challenges (Type 2)',
        'Count-days code challenge solving (target 5 problems/day)', 'Career', 'HIGH', 'count_days',
        60, 2, TRUE, 'problems', 5,
        0, 6, FALSE, 'parent-type2-coding-sprint', d_day3, (d_today + 87), (d_today + 87)
    );

    -- Subhabit 2.3: Type 3 (count_event)
    -- Target: 3 reviews. Logged 4 reviews yesterday, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p2-s3-git-pull-requests', v_user_id,
        '[S2.3] PR Code Reviews (Type 3)',
        'Event-count code review commits (target 3 reviews/event)', 'Career', 'MEDIUM', 'count_event',
        2, 2, TRUE, 'reviews', 3,
        0, 4, FALSE, 'parent-type2-coding-sprint', d_day3, (d_today + 87), (d_today + 87)
    );

    -- =========================================================================
    -- 5. INSERT SUBHABITS FOR PARENT 3 (ALL THREE ARE TYPE 3 COUNT_EVENT)
    -- =========================================================================

    -- Subhabit 3.1: Type 3 (count_event)
    -- Target: 20 points. Logged 21 points today!
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline, completed_at
    ) VALUES (
        'sub-p3-s1-core-backend-api', v_user_id,
        '[S3.1] Backend Services & APIs (Type 3)',
        'Event-count API development milestones', 'Projects', 'HIGH', 'count_event',
        2, 2, TRUE, 'points', 20,
        21, 21, TRUE, 'parent-type3-project-milestones', d_day3, (d_today + 42), (d_today + 42), (d_today + TIME '14:00:00')::timestamptz
    );

    -- Subhabit 3.2: Type 3 (count_event)
    -- Target: 25 points. Logged 27 points in Event 2, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p3-s2-frontend-ui-views', v_user_id,
        '[S3.2] React UI Polish & Views (Type 3)',
        'Event-count design system implementation', 'Projects', 'HIGH', 'count_event',
        2, 2, TRUE, 'points', 25,
        0, 27, FALSE, 'parent-type3-project-milestones', d_day3, (d_today + 42), (d_today + 42)
    );

    -- Subhabit 3.3: Type 3 (count_event)
    -- Target: 20 points. Logged 17 points in Event 2, pending today
    INSERT INTO public.tasks (
        id, user_id, title, description, category, priority, tracking_mode,
        target_count, current_count, has_measure_tracking, measure_unit, measure_target,
        logged_measure_val, last_measured_value, is_done_today, parent_task_id, planned_start, planned_end, deadline
    ) VALUES (
        'sub-p3-s3-integration-testing', v_user_id,
        '[S3.3] E2E Integration Cycles (Type 3)',
        'Event-count test deployment suite', 'Projects', 'HIGH', 'count_event',
        2, 2, TRUE, 'points', 20,
        0, 17, FALSE, 'parent-type3-project-milestones', d_day3, (d_today + 42), (d_today + 42)
    );

    -- =========================================================================
    -- 6. POPULATE subtasks TABLE TO MIRROR CHILD TASKS
    -- =========================================================================
    INSERT INTO public.subtasks (
        id, parent_task_id, user_id, title, description, status,
        has_measure_tracking, measure_target, measure_unit, logged_measure_val, last_measured_value, is_done_today,
        completed_at, tracking_mode, target_count, current_count, planned_start, planned_end
    )
    SELECT id, parent_task_id, user_id, title, description, CASE WHEN is_done_today THEN 'COMPLETED' ELSE 'PLANNED' END,
           has_measure_tracking, measure_target, measure_unit, logged_measure_val, last_measured_value, is_done_today,
           completed_at, tracking_mode, target_count, current_count, planned_start, planned_end
    FROM public.tasks
    WHERE parent_task_id IS NOT NULL AND user_id = v_user_id;

    -- =========================================================================
    -- 7. 4-DAY HISTORICAL LOGS (DYNAMIC NUMERICAL MEASURES ACROSS DAYS & EVENTS)
    -- =========================================================================

    -- ─── [DAY 1: 3 DAYS AGO (CURRENT_DATE - 3)] ──────────────────────────────
    -- Dynamic Measure: Event #1 Completed: S3.1 = 18, S3.2 = 23, S3.3 = 24 (Total: 65 pts)
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 14, 1, '14 mins morning mobility completed'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 7, 1, '7 glasses clean water logged'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day3, TRUE, 11, 2, '2 Zen sessions completed (11 mins)'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 18, 1, '18 pages software architecture'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 4, 1, '4 algorithmic problem sets solved'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day3, TRUE, 3, 2, '3 PR code reviews merged'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 18, 1, 'Core auth and DB services (18 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 23, 1, 'Frontend UI components polished (23 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day3, TRUE, 24, 2, 'E2E integration test pass (24 pts) - Completes Event #1!');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day3, (d_day3 + TIME '08:30:00')::timestamptz, 1, 14, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day3, (d_day3 + TIME '12:00:00')::timestamptz, 1, 7, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', v_user_id, d_day3, (d_day3 + TIME '18:00:00')::timestamptz, 2, 11, TRUE),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', v_user_id, d_day3, (d_day3 + TIME '18:05:00')::timestamptz, 1, 32, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day3, (d_day3 + TIME '10:00:00')::timestamptz, 1, 18, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', v_user_id, d_day3, (d_day3 + TIME '15:30:00')::timestamptz, 1, 4, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day3, (d_day3 + TIME '19:00:00')::timestamptz, 2, 3, TRUE),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', v_user_id, d_day3, (d_day3 + TIME '19:05:00')::timestamptz, 1, 25, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', v_user_id, d_day3, (d_day3 + TIME '11:00:00')::timestamptz, 1, 18, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', v_user_id, d_day3, (d_day3 + TIME '16:00:00')::timestamptz, 1, 23, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', v_user_id, d_day3, (d_day3 + TIME '20:00:00')::timestamptz, 2, 24, TRUE),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', v_user_id, d_day3, (d_day3 + TIME '20:05:00')::timestamptz, 1, 65, TRUE);

    INSERT INTO public.event_logs (id, task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        gen_random_uuid()::text,
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 1, d_day3, (d_day3 + TIME '20:05:00')::timestamptz,
        65, '{"sub-p3-s1-core-backend-api": 18, "sub-p3-s2-frontend-ui-views": 23, "sub-p3-s3-integration-testing": 24, "backend_api": 18, "ui_views": 23, "integration_testing": 24, "sub_p3_s1": 18, "sub_p3_s2": 23, "sub_p3_s3": 24, "s1": 18, "s2": 23, "s3": 24}'::jsonb, 'FINALIZED'
    );

    INSERT INTO public.habit_completion_history (id, task_id, parent_task_id, task_title, user_id, user_name, completed_at, measured_value, measure_unit, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', NULL, '[P1] Daily Wellness Mastery (Type 1 - Date Range)', v_user_id, 'Example User', (d_day3 + TIME '18:05:00')::timestamptz, 32, 'mins', 1, 'Completed all wellness subtasks on Day 1 (32 mins)'),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', NULL, '[P2] 60-Day Full-Stack Sprint (Type 2 - Day Count)', v_user_id, 'Example User', (d_day3 + TIME '19:05:00')::timestamptz, 25, 'points', 1, 'Reading, algorithms, and PR reviews done on Day 1 (25 units)'),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', NULL, '[P3] Production Feature Shipments (Type 3 - Event Count)', v_user_id, 'Example User', (d_day3 + TIME '20:05:00')::timestamptz, 65, 'points', 1, 'Completed Event Cycle #1 (Backend: 18, UI: 23, Testing: 24 = 65 pts)');

    -- ─── [DAY 2: 2 DAYS AGO (CURRENT_DATE - 2)] ──────────────────────────────
    -- Dynamic Measure Variance: Higher yoga (18 mins), partial hydration (6), exceeded reading (26 pages)
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 18, 1, '18 mins extended yoga flow (exceeded target!)'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day2, TRUE, 6, 1, '6 glasses clean water logged'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day2, FALSE, 0, 0, 'SKIPPED: Zen session missed'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 26, 1, '26 pages high-scale system design (exceeded target!)'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day2, FALSE, 0, 0, 'SKIPPED: Algorithms missed today'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day2, TRUE, 2, 1, '2 PR reviews completed'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 22, 1, 'Event 2 progress: Redis caching layer (22 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day2, TRUE, 28, 1, 'Event 2 progress: Modal views & state (28 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day2, FALSE, 0, 0, 'Carrying over to next day');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day2, (d_day2 + TIME '09:00:00')::timestamptz, 1, 18, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day2, (d_day2 + TIME '13:00:00')::timestamptz, 1, 6, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day2, (d_day2 + TIME '11:00:00')::timestamptz, 1, 26, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day2, (d_day2 + TIME '17:00:00')::timestamptz, 1, 2, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', v_user_id, d_day2, (d_day2 + TIME '21:00:00')::timestamptz, 1, 22, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', v_user_id, d_day2, (d_day2 + TIME '21:30:00')::timestamptz, 1, 28, TRUE);

    -- ─── [DAY 3: YESTERDAY (CURRENT_DATE - 1)] ───────────────────────────────
    -- Peak Performance Day: Event #2 Completed: S3.1 = 24, S3.2 = 27, S3.3 = 17 (Total: 68 pts)
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 22, 1, '22 mins power yoga (exceeded target!)'),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 9, 1, '9 glasses hydration (exceeded target!)'),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', 'parent-type1-wellness-routine', v_user_id, d_day1, TRUE, 14, 2, '14 mins guided zen meditation'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 32, 1, '32 pages deep architectural patterns'),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 6, 1, '6 algorithmic challenges completed'),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', 'parent-type2-coding-sprint', v_user_id, d_day1, TRUE, 4, 2, '4 pull request code reviews completed'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_day1, TRUE, 24, 1, 'Endpoint security & JWT filters (24 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', 'parent-type3-project-milestones', v_user_id, d_day1, TRUE, 27, 1, 'Analytics intelligence views (27 pts)'),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', 'parent-type3-project-milestones', v_user_id, d_day1, TRUE, 17, 2, 'Integration suite passes (17 pts) - Finishes Event #2 with 68 points!');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_day1, (d_day1 + TIME '08:15:00')::timestamptz, 1, 22, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s2-hydration-focus', v_user_id, d_day1, (d_day1 + TIME '12:30:00')::timestamptz, 1, 9, TRUE),
        (gen_random_uuid()::text, 'sub-p1-s3-mindfulness-sessions', v_user_id, d_day1, (d_day1 + TIME '18:45:00')::timestamptz, 2, 14, TRUE),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', v_user_id, d_day1, (d_day1 + TIME '18:50:00')::timestamptz, 1, 45, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_day1, (d_day1 + TIME '10:30:00')::timestamptz, 1, 32, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s2-leetcode-problems', v_user_id, d_day1, (d_day1 + TIME '16:00:00')::timestamptz, 1, 6, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s3-git-pull-requests', v_user_id, d_day1, (d_day1 + TIME '19:30:00')::timestamptz, 2, 4, TRUE),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', v_user_id, d_day1, (d_day1 + TIME '19:35:00')::timestamptz, 1, 42, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', v_user_id, d_day1, (d_day1 + TIME '11:00:00')::timestamptz, 1, 24, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s2-frontend-ui-views', v_user_id, d_day1, (d_day1 + TIME '15:00:00')::timestamptz, 1, 27, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s3-integration-testing', v_user_id, d_day1, (d_day1 + TIME '17:00:00')::timestamptz, 2, 17, TRUE),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', v_user_id, d_day1, (d_day1 + TIME '17:05:00')::timestamptz, 1, 68, TRUE);

    INSERT INTO public.event_logs (id, task_id, parent_task_id, user_id, event_number, completion_date, completion_timestamp, total_work_accumulated, subtask_breakdown, status)
    VALUES (
        gen_random_uuid()::text,
        'parent-type3-project-milestones', 'parent-type3-project-milestones', v_user_id, 2, d_day1, (d_day1 + TIME '17:05:00')::timestamptz,
        68, '{"sub-p3-s1-core-backend-api": 24, "sub-p3-s2-frontend-ui-views": 27, "sub-p3-s3-integration-testing": 17, "backend_api": 24, "ui_views": 27, "integration_testing": 17, "sub_p3_s1": 24, "sub_p3_s2": 27, "sub_p3_s3": 17, "s1": 24, "s2": 27, "s3": 17}'::jsonb, 'FINALIZED'
    );

    INSERT INTO public.habit_completion_history (id, task_id, parent_task_id, task_title, user_id, user_name, completed_at, measured_value, measure_unit, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', NULL, '[P1] Daily Wellness Mastery (Type 1 - Date Range)', v_user_id, 'Example User', (d_day3 + TIME '18:05:00')::timestamptz, 45, 'mins', 1, 'Completed all wellness subtasks on Day 3 (45 mins)'),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', NULL, '[P2] 60-Day Full-Stack Sprint (Type 2 - Day Count)', v_user_id, 'Example User', (d_day1 + TIME '19:35:00')::timestamptz, 42, 'points', 1, 'All sprint items checked off on Day 3 (42 units)'),
        (gen_random_uuid()::text, 'parent-type3-project-milestones', NULL, '[P3] Production Feature Shipments (Type 3 - Event Count)', v_user_id, 'Example User', (d_day1 + TIME '17:05:00')::timestamptz, 68, 'points', 1, 'Completed Event Cycle #2 (Backend: 24, UI: 27, Testing: 17 = 68 pts)');

    -- ─── [DAY 4: TODAY (CURRENT_DATE)] ───────────────────────────────────────
    INSERT INTO public.subtask_logs (id, subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', v_user_id, d_today, TRUE, 16, 1, 'Morning yoga done today (16 mins logged)'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', v_user_id, d_today, TRUE, 22, 1, 'Architecture study completed today (22 pages logged)'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', v_user_id, d_today, TRUE, 21, 1, 'Event 3 kickoff: API endpoints built today (21 pts logged)');

    INSERT INTO public.task_logs (id, task_id, user_id, logged_date, logged_at, increment_value, measured_value, is_successful)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', v_user_id, d_today, (d_today + TIME '08:30:00')::timestamptz, 1, 16, TRUE),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', v_user_id, d_today, (d_today + TIME '10:00:00')::timestamptz, 1, 22, TRUE),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', v_user_id, d_today, (d_today + TIME '14:00:00')::timestamptz, 1, 21, TRUE);

    INSERT INTO public.habit_completion_history (id, task_id, parent_task_id, task_title, user_id, user_name, completed_at, measured_value, measure_unit, event_count, notes)
    VALUES 
        (gen_random_uuid()::text, 'sub-p1-s1-morning-yoga', 'parent-type1-wellness-routine', '[S1.1] Morning Yoga & Mobility (Type 1)', v_user_id, 'Example User', (d_today + TIME '08:30:00')::timestamptz, 16, 'mins', 1, 'Completed morning yoga session on Day 4 (Today)'),
        (gen_random_uuid()::text, 'sub-p2-s1-tech-reading', 'parent-type2-coding-sprint', '[S2.1] Architectural Literature Study (Type 1)', v_user_id, 'Example User', (d_today + TIME '10:00:00')::timestamptz, 22, 'pages', 1, 'Completed 22 pages reading on Day 4 (Today)'),
        (gen_random_uuid()::text, 'sub-p3-s1-core-backend-api', 'parent-type3-project-milestones', '[S3.1] Backend Services & APIs (Type 3)', v_user_id, 'Example User', (d_today + TIME '14:00:00')::timestamptz, 21, 'points', 1, 'Completed Backend API milestone on Day 4 (Today)');

    INSERT INTO public.habit_update_history (id, task_id, parent_task_id, task_title, user_id, user_name, update_type, field_name, old_value, new_value, change_summary, created_at)
    VALUES 
        (gen_random_uuid()::text, 'parent-type3-project-milestones', NULL, '[P3] Production Feature Shipments (Type 3 - Event Count)', v_user_id, 'Example User', 'SUBHABIT_ADDED', 'subtasks', NULL, '[S3.3] E2E Integration Cycles (Type 3)', 'Added subhabit: [S3.3] E2E Integration Cycles (Type 3 - Event Count)', (d_day3 + TIME '08:00:00')::timestamptz),
        (gen_random_uuid()::text, 'parent-type2-coding-sprint', NULL, '[P2] 60-Day Full-Stack Sprint (Type 2 - Day Count)', v_user_id, 'Example User', 'TARGET_CHANGED', 'target_count', '45', '60', 'Updated target day count to 60 days', (d_day2 + TIME '09:00:00')::timestamptz),
        (gen_random_uuid()::text, 'parent-type1-wellness-routine', NULL, '[P1] Daily Wellness Mastery (Type 1 - Date Range)', v_user_id, 'Example User', 'COLLABORATOR_INVITED', 'collab', NULL, 'partner@gmail.com', 'Invited partner@gmail.com to shared habit', (d_day1 + TIME '10:00:00')::timestamptz);

    RAISE NOTICE 'SUCCESS: Injected all 12 habits with dynamic measures across 4 days for % (Password: 123456)', v_user_id;
END $$;

-- Recreate AFTER DELETE unmap trigger cleanly outside DO block
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

DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks CASCADE;
CREATE TRIGGER trg_tasks_unmap_children
AFTER DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_unmap_subtasks_on_parent_delete();
