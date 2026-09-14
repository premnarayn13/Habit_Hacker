-- =========================================================================
-- HABIT HACKER — EVENT-COUNT TASK SYSTEM DATABASE SCHEMA
-- Execute this script in your PostgreSQL database or Supabase SQL Editor
-- =========================================================================

-- 1. CREATE EVENT_LOGS TABLE (IMMUTABLE FINALIZED HISTORICAL EVENTS)
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

CREATE INDEX IF NOT EXISTS idx_event_logs_task_date ON public.event_logs (parent_task_id, completion_date);

-- 2. CREATE CURRENT_EVENT_STATE TABLE (UN-FINALIZED ACTIVE EVENT WORK ACCUMULATION)
CREATE TABLE IF NOT EXISTS public.current_event_state (
    parent_task_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    current_work_accumulated NUMERIC(10, 2) DEFAULT 0.0,
    subtask_works_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SEED SAMPLE EVENT-COUNT TASK & FINALIZED HISTORICAL EVENTS
-- Example Parent Task: '10000000-0000-4000-a000-111111111111' (Coding: 10 questions = 1 event)

INSERT INTO public.event_logs (id, parent_task_id, user_id, event_number, completion_date, event_unit_target, event_unit_name, total_work_accumulated, subtask_contributions_json)
VALUES
  -- Day 1 (05 Sep 2026) Event 1: LeetCode 6, GFG 3, Codeforces 1 = 10 questions
  ('ev-1001', '10000000-0000-4000-a000-111111111111', 'default-user', 1, '2026-09-05', 10.0, 'questions', 10.0, 
   '[{"subtaskId": "st-leetcode-1", "subtaskTitle": "LeetCode Problems", "workAmount": 6, "color": "#4F46E5", "percentage": 60}, {"subtaskId": "st-gfg-2", "subtaskTitle": "GFG Problems", "workAmount": 3, "color": "#F59E0B", "percentage": 30}, {"subtaskId": "st-java-3", "subtaskTitle": "Codeforces", "workAmount": 1, "color": "#10B981", "percentage": 10}]'::jsonb),

  -- Day 1 (05 Sep 2026) Event 2: LeetCode 4, GFG 3, Codeforces 3 = 10 questions (2nd Event on Same Day!)
  ('ev-1002', '10000000-0000-4000-a000-111111111111', 'default-user', 2, '2026-09-05', 10.0, 'questions', 10.0,
   '[{"subtaskId": "st-leetcode-1", "subtaskTitle": "LeetCode Problems", "workAmount": 4, "color": "#4F46E5", "percentage": 40}, {"subtaskId": "st-gfg-2", "subtaskTitle": "GFG Problems", "workAmount": 3, "color": "#F59E0B", "percentage": 30}, {"subtaskId": "st-java-3", "subtaskTitle": "Codeforces", "workAmount": 3, "color": "#10B981", "percentage": 30}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
