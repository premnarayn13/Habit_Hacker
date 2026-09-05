-- =========================================================================
-- HABIT HACKER — MASTER COMPLETED TASKS & FULL HIERARCHY TEST SEED SCRIPT
-- Execute this script in your PostgreSQL database or Supabase SQL Editor
-- =========================================================================

-- 1. ENSURE ALL TABLES AND COLUMNS EXIST (HANDLES PRE-EXISTING TABLES SAFELY)

CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist on public.tasks table
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

-- Ensure all required columns exist on public.subtasks table
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

-- =========================================================================
-- 2. SEED DATA FOR TESTING EXTEND & COMPLETE TASK HIERARCHY LOGIC
-- =========================================================================

-- Clear existing sample records to allow clean re-runs
DELETE FROM public.subtasks WHERE parent_task_id IN ('parent-type1-academics', 'parent-type2-fitness', 'parent-type3-coding', 'completed-task-python', 'completed-task-dsa');
DELETE FROM public.tasks WHERE id IN ('parent-type1-academics', 'parent-type2-fitness', 'parent-type3-coding', 'completed-task-python', 'completed-task-dsa');

-- A. TYPE 1 PARENT TASK (Start Date / End Date Daily Plan)
INSERT INTO public.tasks (id, user_id, title, description, tracking_mode, planned_start, planned_end, measure_target, measure_unit, is_optional, is_done_today, progress_percent)
VALUES ('parent-type1-academics', 'default-user', 'Academics & Tech Mastery', 'Type 1 Parent Task — Driven by subtask daily measure contributions', 'end_date', '2026-08-01', '2026-09-15', 15.0, 'problems', FALSE, FALSE, 65);

-- Subtasks for Type 1 Parent Task (Includes Measured, No-Measure, and Optional)
INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, logged_measure_val, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-leetcode',  'parent-type1-academics', 'default-user', 'LeetCode Problems', 'end_date', TRUE,  4.0, 'problems', 4.0, FALSE, TRUE,  100), -- Mandatory, Measured (4)
  ('st-gfg',       'parent-type1-academics', 'default-user', 'GeeksForGeeks',     'end_date', TRUE,  2.0, 'problems', 2.0, FALSE, TRUE,  100), -- Mandatory, Measured (2)
  ('st-learnjava', 'parent-type1-academics', 'default-user', 'Learning Java',    'end_date', FALSE, 0.0, 'units',    0.0, FALSE, TRUE,  100), -- Mandatory, No Measure (Derives Avg: (4+2)/2 = 3)
  ('st-techread',  'parent-type1-academics', 'default-user', 'Tech Documentation','end_date', FALSE, 0.0, 'units',    0.0, TRUE,  FALSE, 0);   -- Optional, No Measure (Does NOT block parent completion!)

-- B. TYPE 2 PARENT TASK (Day Count Task)
INSERT INTO public.tasks (id, user_id, title, description, tracking_mode, planned_start, planned_end, target_count, current_count, is_optional, is_done_today, progress_percent)
VALUES ('parent-type2-fitness', 'default-user', 'Fitness & Health Mastery', 'Type 2 Parent Task — 30 Days Target Day Count', 'count_days', '2026-08-10', '2026-09-30', 30, 18, FALSE, FALSE, 60);

-- Subtasks for Type 2 Parent Task (Includes Measured, Event-based, and Optional)
INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, logged_measure_val, current_count, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-running', 'parent-type2-fitness', 'default-user', 'Morning Running',  'count_days',  TRUE,  5.0, 'km',    5.0, 18, FALSE, TRUE,  100), -- Mandatory, Measured (5 km)
  ('st-pushups', 'parent-type2-fitness', 'default-user', 'Pushups Session',  'count_event', FALSE, 0.0, 'events',0.0, 2,  FALSE, TRUE,  100), -- Mandatory, Event-Based (2 events x Avg)
  ('st-yoga',    'parent-type2-fitness', 'default-user', 'Evening Yoga',     'count_days',  FALSE, 0.0, 'units', 0.0, 0,  TRUE,  FALSE, 0);   -- Optional, No Measure

-- C. TYPE 3 PARENT TASK (Event Count Task: 10 questions = 1 Event)
INSERT INTO public.tasks (id, user_id, title, description, tracking_mode, planned_start, planned_end, target_count, current_count, event_unit_target, event_unit_name, is_optional, is_done_today, progress_percent)
VALUES ('parent-type3-coding', 'default-user', 'Coding & System Design Sprint', 'Type 3 Parent Task — 10 Questions = 1 Event Definition', 'count_event', '2026-08-01', '2026-09-20', 10, 3, 10.0, 'questions', FALSE, FALSE, 30);

-- Subtasks for Type 3 Parent Task
INSERT INTO public.subtasks (id, parent_task_id, user_id, title, tracking_mode, has_measure_tracking, measure_target, measure_unit, current_event_work, is_optional, is_done_today, progress_percent)
VALUES 
  ('st-lc-hard',   'parent-type3-coding', 'default-user', 'LeetCode Hard',   'count_event', TRUE, 6.0, 'questions', 6.0, FALSE, TRUE,  100), -- Mandatory, Measured (6)
  ('st-gfg-med',   'parent-type3-coding', 'default-user', 'GFG Medium',      'count_event', TRUE, 3.0, 'questions', 3.0, FALSE, TRUE,  100), -- Mandatory, Measured (3)
  ('st-codeforces','parent-type3-coding', 'default-user', 'Codeforces',      'count_event', TRUE, 1.0, 'questions', 1.0, FALSE, TRUE,  100), -- Mandatory, Measured (1) Total = 10 (Finalizes Event!)
  ('st-notes',     'parent-type3-coding', 'default-user', 'System Notes',   'count_event', FALSE,0.0, 'units',     0.0, TRUE,  FALSE, 0);   -- Optional, No Measure

-- D. COMPLETED TASKS FOR TESTING THE EXTEND BUTTON FUNCTIONALITY
INSERT INTO public.tasks (id, user_id, title, description, tracking_mode, planned_start, planned_end, target_count, current_count, is_optional, is_done_today, progress_percent)
VALUES 
  ('completed-task-python', 'default-user', 'Completed 30-Day Python Bootcamp', 'Completed 30-Day task ready for Extend testing in task list and info page', 'count_days', '2026-07-01', '2026-07-31', 30, 30, FALSE, TRUE, 100),
  ('completed-task-dsa',    'default-user', 'Completed 100-Problem DSA Challenge', 'Completed 100-Problem task ready for Extend testing', 'end_date', '2026-06-01', '2026-07-15', 45, 45, FALSE, TRUE, 100);

-- Query to verify all seeded tasks and subtasks
SELECT t.id AS parent_id, t.title AS parent_title, t.tracking_mode, t.progress_percent, s.title AS subtask_title, s.is_optional, s.has_measure_tracking
FROM public.tasks t
LEFT JOIN public.subtasks s ON t.id = s.parent_task_id
ORDER BY t.created_at DESC;
