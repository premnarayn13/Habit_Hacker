-- Habit Hacker Supabase Database Migration Schema V6
-- Refactor tracking_mode, target_count, current_count, start_date & end_date columns

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS tracking_mode VARCHAR(20) DEFAULT 'end_date' CHECK (tracking_mode IN ('end_date', 'count_days', 'count_event')),
ADD COLUMN IF NOT EXISTS target_count INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_count INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Index for Tracking Mode Filters
CREATE INDEX IF NOT EXISTS idx_tasks_tracking_mode ON public.tasks(user_id, tracking_mode);
