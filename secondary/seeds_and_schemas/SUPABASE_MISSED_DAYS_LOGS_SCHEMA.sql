-- =========================================================================
-- HABIT HACKER — SUBTASK LOGS & PARENT MISSED DAYS DATABASE SCHEMA
-- Execute this script in your PostgreSQL database or Supabase SQL Editor
-- =========================================================================

-- 1. CREATE SUBTASK_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.subtask_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtask_id VARCHAR(255) NOT NULL,
    parent_task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default-user',
    log_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    measured_value NUMERIC(10, 2) DEFAULT 0.0,
    event_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_subtask_date UNIQUE (subtask_id, log_date)
);

-- Index for fast lookup by parent_task_id and log_date
CREATE INDEX IF NOT EXISTS idx_subtask_logs_parent_date ON public.subtask_logs (parent_task_id, log_date);
CREATE INDEX IF NOT EXISTS idx_subtask_logs_subtask_date ON public.subtask_logs (subtask_id, log_date);

-- 2. CREATE VIEW FOR AGGREGATING PARENT TASK MISSED DAYS AND MISSED MANDATORY SUBTASKS
CREATE OR REPLACE VIEW public.view_parent_task_missed_days AS
WITH mandatory_subtasks AS (
    -- Select all mandatory (non-optional) subtasks
    SELECT 
        id AS subtask_id,
        parent_task_id,
        title AS subtask_title
    FROM public.subtasks
    WHERE is_optional = FALSE OR is_optional IS NULL
),
daily_missed_records AS (
    -- Identify days where mandatory subtasks were not completed
    SELECT 
        ms.parent_task_id,
        sl.log_date,
        ms.subtask_title
    FROM mandatory_subtasks ms
    JOIN public.subtask_logs sl ON ms.subtask_id = sl.subtask_id
    WHERE sl.is_completed = FALSE
)
SELECT 
    parent_task_id,
    log_date,
    COUNT(subtask_title) AS missed_subtasks_count,
    STRING_AGG(subtask_title, ', ' ORDER BY subtask_title) AS missed_subtasks_list,
    ARRAY_AGG(subtask_title ORDER BY subtask_title) AS missed_subtasks_array
FROM daily_missed_records
GROUP BY parent_task_id, log_date
ORDER BY log_date DESC;

-- 3. SEED SAMPLE DATA FOR TESTING MISSED DAYS
-- Example Parent Task: '10000000-0000-4000-a000-111111111111'
-- Subtask 1: LeetCode Problems (Mandatory)
-- Subtask 2: GFG Problems (Mandatory)
-- Subtask 3: Learning Java (Mandatory)

INSERT INTO public.subtask_logs (subtask_id, parent_task_id, user_id, log_date, is_completed, measured_value)
VALUES 
  -- Day 1 (02 Sep 2026): LeetCode missed, GFG & Java done
  ('st-leetcode-1', '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-02', FALSE, 0),
  ('st-gfg-2',      '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-02', TRUE,  2),
  ('st-java-3',     '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-02', TRUE,  3),

  -- Day 2 (04 Sep 2026): GFG & Learning Java missed (2 missed on same day!)
  ('st-leetcode-1', '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-04', TRUE,  4),
  ('st-gfg-2',      '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-04', FALSE, 0),
  ('st-java-3',     '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-04', FALSE, 0),

  -- Day 3 (06 Sep 2026): Learning Java missed
  ('st-leetcode-1', '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-06', TRUE,  4),
  ('st-gfg-2',      '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-06', TRUE,  2),
  ('st-java-3',     '10000000-0000-4000-a000-111111111111', 'default-user', '2026-09-06', FALSE, 0)
ON CONFLICT (subtask_id, log_date) DO UPDATE 
SET is_completed = EXCLUDED.is_completed, measured_value = EXCLUDED.measured_value;
