-- =========================================================================
-- HABIT HACKER — CLEAN MASTER TEST SEED SCRIPT (TASKS 1 THROUGH 7)
-- Execute this script in your PostgreSQL database or Supabase SQL Editor
-- This script removes all existing tasks and populates exact edge-case tasks
-- =========================================================================

-- 1. ENSURE ALL REQUIRED COLUMNS EXIST ON ALL TABLES

CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(50) DEFAULT 'end_date';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_count INT DEFAULT 30;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS event_unit_target NUMERIC(10, 2) DEFAULT 10.0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS event_unit_name VARCHAR(100) DEFAULT 'units';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC(10, 2) DEFAULT 15.0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(255) DEFAULT '';

CREATE TABLE IF NOT EXISTS public.subtasks (
    id VARCHAR(255) PRIMARY KEY,
    parent_task_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) DEFAULT 'default-user';
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(50) DEFAULT 'end_date';
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS logged_measure_val NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS current_event_work NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS current_count INT DEFAULT 0;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subtask_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    log_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    measured_value NUMERIC(10, 2) DEFAULT 0.0,
    event_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_logs (
    id VARCHAR(255) PRIMARY KEY,
    parent_task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    event_number INT NOT NULL,
    completion_date DATE NOT NULL,
    completion_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_unit_target NUMERIC(10, 2) NOT NULL DEFAULT 10.0,
    event_unit_name VARCHAR(100) DEFAULT 'units',
    total_work_accumulated NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    subtask_contributions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'FINALIZED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 2. WIPE ALL EXISTING TASKS, SUBTASKS, AND LOGS (CLEAN SLATE RESET)
-- =========================================================================

DELETE FROM public.subtask_logs;
DELETE FROM public.event_logs;
DELETE FROM public.subtasks;
DELETE FROM public.tasks;

-- =========================================================================
-- 3. INSERT THE 7 MASTER TEST TASKS & SUBTASKS
-- =========================================================================

-- -------------------------------------------------------------------------
-- TASK 1: Type Start Date / End Date (5 Subtasks: 3 Measured, 1 No Measure, 1 Optional)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, measure_target, measure_unit, is_optional, is_done_today, progress_percent)
VALUES ('task-1-enddate', 'default-user', 'Task 1 — Start Date End Date (5 Subtasks)', 'Type 1 Parent Task — 5 subtasks (3 measured types, 1 no measure, 1 optional)', 'Academics', 'HIGH', 'end_date', '2026-08-01', '2026-09-15', 15.0, 'units', FALSE, FALSE, 55);

INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, logged_measure_val, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-1-1', 'task-1-enddate', 'default-user', 'Subtask 1.1 — Measured End Date',   'end_date',   TRUE,  4.0, 'problems', 4.0, FALSE, TRUE,  100),
  ('st-1-2', 'task-1-enddate', 'default-user', 'Subtask 1.2 — Measured Day Count',  'count_days', TRUE,  2.0, 'days',     2.0, FALSE, TRUE,  100),
  ('st-1-3', 'task-1-enddate', 'default-user', 'Subtask 1.3 — Measured Event Count','count_event',TRUE,  5.0, 'events',   5.0, FALSE, TRUE,  100),
  ('st-1-4', 'task-1-enddate', 'default-user', 'Subtask 1.4 — No Measure Subtask',  'end_date',   FALSE, 0.0, 'units',    0.0, FALSE, TRUE,  100), -- Derives Avg: (4+2+5)/3 = 3.67
  ('st-1-5', 'task-1-enddate', 'default-user', 'Subtask 1.5 — Optional Subtask',    'end_date',   FALSE, 0.0, 'units',    0.0, TRUE,  FALSE, 0);   -- Does NOT block completion

-- -------------------------------------------------------------------------
-- TASK 2: Type Day Count (5 Subtasks: 3 Measured, 1 No Measure, 1 Optional)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, target_count, current_count, is_optional, is_done_today, progress_percent)
VALUES ('task-2-daycount', 'default-user', 'Task 2 — Day Count (5 Subtasks)', 'Type 2 Parent Task — 30 Target Days with 5 subtasks', 'Fitness', 'CRITICAL', 'count_days', '2026-08-10', '2026-09-30', 30, 18, FALSE, FALSE, 60);

INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, logged_measure_val, current_count, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-2-1', 'task-2-daycount', 'default-user', 'Subtask 2.1 — Measured End Date',   'end_date',   TRUE,  5.0, 'km',     5.0, 18, FALSE, TRUE,  100),
  ('st-2-2', 'task-2-daycount', 'default-user', 'Subtask 2.2 — Measured Day Count',  'count_days', TRUE,  3.0, 'days',   3.0, 18, FALSE, TRUE,  100),
  ('st-2-3', 'task-2-daycount', 'default-user', 'Subtask 2.3 — Measured Event Count','count_event',TRUE,  4.0, 'events', 4.0, 18, FALSE, TRUE,  100),
  ('st-2-4', 'task-2-daycount', 'default-user', 'Subtask 2.4 — No Measure Subtask',  'count_days', FALSE, 0.0, 'units',  0.0, 18, FALSE, TRUE,  100), -- Derives Avg: (5+3+4)/3 = 4.0
  ('st-2-5', 'task-2-daycount', 'default-user', 'Subtask 2.5 — Optional Subtask',    'count_days', FALSE, 0.0, 'units',  0.0, 0,  TRUE,  FALSE, 0);

-- -------------------------------------------------------------------------
-- TASK 3: Type Event Count (10 Questions = 1 Event; 5 Subtasks)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, target_count, current_count, event_unit_target, event_unit_name, is_optional, is_done_today, progress_percent)
VALUES ('task-3-eventcount', 'default-user', 'Task 3 — Event Count (5 Subtasks)', 'Type 3 Parent Task — 10 Questions = 1 Event Definition', 'Coding', 'CRITICAL', 'count_event', '2026-08-01', '2026-09-20', 10, 3, 10.0, 'questions', FALSE, FALSE, 30);

INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, current_event_work, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-3-1', 'task-3-eventcount', 'default-user', 'Subtask 3.1 — Measured End Date',   'count_event', TRUE, 6.0, 'questions', 6.0, FALSE, TRUE,  100),
  ('st-3-2', 'task-3-eventcount', 'default-user', 'Subtask 3.2 — Measured Day Count',  'count_event', TRUE, 3.0, 'questions', 3.0, FALSE, TRUE,  100),
  ('st-3-3', 'task-3-eventcount', 'default-user', 'Subtask 3.3 — Measured Event Count','count_event', TRUE, 1.0, 'questions', 1.0, FALSE, TRUE,  100), -- Total = 10!
  ('st-3-4', 'task-3-eventcount', 'default-user', 'Subtask 3.4 — No Measure Subtask',  'count_event', FALSE,0.0, 'units',     0.0, FALSE, TRUE,  100),
  ('st-3-5', 'task-3-eventcount', 'default-user', 'Subtask 3.5 — Optional Subtask',    'count_event', FALSE,0.0, 'units',     0.0, TRUE,  FALSE, 0);

-- -------------------------------------------------------------------------
-- TASK 4: Parent with ONLY ONE Optional Subtask (Edge Case 10)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, measure_target, measure_unit, is_optional, is_done_today, progress_percent)
VALUES ('task-4-singleoptional', 'default-user', 'Task 4 — Single Optional Subtask Parent', 'Edge Case 10: Parent with only 1 optional child behaves standalone', 'General', 'MEDIUM', 'end_date', '2026-08-01', '2026-09-30', 20.0, 'pages', FALSE, FALSE, 40);

INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, is_optional, is_done_today, progress_percent)
VALUES ('st-4-1', 'task-4-singleoptional', 'default-user', 'Subtask 4.1 — Optional Child', 'end_date', FALSE, TRUE, FALSE, 0);

-- -------------------------------------------------------------------------
-- TASK 5: Standalone Task with No Measure & No Child Tasks (Edge Case 11)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, has_measure_tracking, measure_target, is_optional, is_done_today, progress_percent)
VALUES ('task-5-standalone-nomeasure', 'default-user', 'Task 5 — Standalone No Measure', 'Edge Case 11: Task with 0 children and no measure tracking', 'General', 'LOW', 'end_date', '2026-08-01', '2026-09-10', FALSE, 0.0, FALSE, FALSE, 50);

-- -------------------------------------------------------------------------
-- TASK 6: Parent Task with No Measure with 5 Child Tasks
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, has_measure_tracking, measure_target, is_optional, is_done_today, progress_percent)
VALUES ('task-6-parent-nomeasure', 'default-user', 'Task 6 — Parent No Measure with 5 Children', 'Parent task has no independent measure; measure derived from subtasks', 'Projects', 'HIGH', 'end_date', '2026-08-01', '2026-09-25', FALSE, 0.0, FALSE, FALSE, 70);

INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, logged_measure_val, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-6-1', 'task-6-parent-nomeasure', 'default-user', 'Subtask 6.1 — Measured End Date',   'end_date',   TRUE,  6.0, 'tasks', 6.0, FALSE, TRUE,  100),
  ('st-6-2', 'task-6-parent-nomeasure', 'default-user', 'Subtask 6.2 — Measured Day Count',  'count_days', TRUE,  4.0, 'days',  4.0, FALSE, TRUE,  100),
  ('st-6-3', 'task-6-parent-nomeasure', 'default-user', 'Subtask 6.3 — Measured Event Count','count_event',TRUE,  2.0, 'events',2.0, FALSE, TRUE,  100),
  ('st-6-4', 'task-6-parent-nomeasure', 'default-user', 'Subtask 6.4 — No Measure Subtask',  'end_date',   FALSE, 0.0, 'units', 0.0, FALSE, TRUE,  100), -- Derives Avg: (6+4+2)/3 = 4.0
  ('st-6-5', 'task-6-parent-nomeasure', 'default-user', 'Subtask 6.5 — Optional Subtask',    'end_date',   FALSE, 0.0, 'units', 0.0, TRUE,  FALSE, 0);

-- -------------------------------------------------------------------------
-- TASK 7: Day Count Task — COMPLETED (For Testing Extend Functionality)
-- -------------------------------------------------------------------------
INSERT INTO public.tasks (id, user_id, title, description, category, priority, tracking_mode, planned_start, planned_end, target_count, current_count, is_optional, is_done_today, progress_percent)
VALUES ('task-7-completed-extend', 'default-user', 'Task 7 — Completed 30-Day Fitness Challenge', 'Completed task ready for testing Extend button in task list and info page', 'Fitness', 'MEDIUM', 'count_days', '2026-07-01', '2026-07-31', 30, 30, FALSE, TRUE, 100);

-- =========================================================================
-- 4. VERIFICATION QUERY (VERIFIES ALL 7 TASKS & MAPPED SUBTASKS)
-- =========================================================================

SELECT 
    t.id AS parent_id, 
    t.title AS parent_title, 
    t.tracking_mode, 
    t.progress_percent, 
    s.id AS subtask_id,
    s.title AS subtask_title, 
    s.is_optional, 
    s.has_measure_tracking
FROM public.tasks t
LEFT JOIN public.subtasks s ON t.id = s.parent_task_id
ORDER BY t.id ASC, s.id ASC;
