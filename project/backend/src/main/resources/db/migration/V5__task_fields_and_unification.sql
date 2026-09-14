-- Habit Hacker Database Migration Schema V5
-- Add Collaborators, Section, Tags, Reminder Time, Repeat Rules, Parent Task Linking & Attachment Columns to Supabase

-- 1. Add Columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS collab TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS section VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(20);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_rule VARCHAR(50) DEFAULT 'DAILY';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(100);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Add Index for Parent Task Subtask Hierarchy Lookups
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(user_id, parent_task_id);
