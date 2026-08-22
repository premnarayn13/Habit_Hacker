-- Habit Hacker Database Migration Schema V4
-- Support for Target Day Counts (e.g. 50 days), Target Event Counts (e.g. 50 times), Repeat Intervals & Task Archiving

-- 1. Add Completion Target & Repeat Interval Columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_mode VARCHAR(30) DEFAULT 'TARGET_DAYS';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS target_day_count INT DEFAULT 50;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS target_event_count INT DEFAULT 50;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_day_count INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_event_count INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_interval_days INT DEFAULT 1;

-- 2. Add Archiving Columns to tasks and subtasks tables
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- 3. Index for Archived Tasks Lookups
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(user_id, is_archived);
