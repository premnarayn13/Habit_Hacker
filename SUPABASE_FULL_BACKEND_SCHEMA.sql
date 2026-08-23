-- ==============================================================================
-- HABIT HACKER COMPLETE MASTER SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Copy and execute this script directly in your Supabase SQL Editor.
-- ==============================================================================

-- 1. TASKS TABLE (Full unified schema with all tracking modes, measure tracking, parent-child links)
CREATE TABLE IF NOT EXISTS public.tasks (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    collab VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    is_optional BOOLEAN DEFAULT FALSE,
    has_measure_tracking BOOLEAN DEFAULT FALSE,
    measure_unit VARCHAR(50) DEFAULT 'units',
    measure_target NUMERIC DEFAULT 0,
    progress_percent INT DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    planned_start DATE,
    planned_end DATE,
    deadline DATE,
    estimated_minutes INT DEFAULT 30,
    actual_minutes INT DEFAULT 0,
    reminder_time VARCHAR(20),
    category VARCHAR(100) DEFAULT 'General',
    section VARCHAR(100) DEFAULT 'General',
    tracking_mode VARCHAR(50) DEFAULT 'end_date',
    target_count INT DEFAULT 50,
    current_count INT DEFAULT 0,
    target_day_count INT,
    current_day_count INT,
    target_event_count INT,
    current_event_count INT,
    repeat_rule VARCHAR(50) DEFAULT 'DAILY',
    parent_id VARCHAR(100),
    parent_task_id VARCHAR(100),
    attachment_name TEXT,
    tags TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    is_done_today BOOLEAN DEFAULT FALSE,
    skip_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist if table was previously created
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS collab VARCHAR(255);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS section VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(20);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS repeat_rule VARCHAR(50) DEFAULT 'DAILY';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(100);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR(100);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_day_count INT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_day_count INT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_event_count INT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_event_count INT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_done_today BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS skip_reason TEXT;


-- 2. SUBTASKS TABLE
CREATE TABLE IF NOT EXISTS public.subtasks (
    id VARCHAR(100) PRIMARY KEY,
    parent_task_id VARCHAR(100) REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    is_optional BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'PLANNED',
    target_value INT DEFAULT 1,
    completed_value INT DEFAULT 0,
    estimated_minutes INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. TASK LOGS TABLE (Daily activity completion & quantitative performance logs)
CREATE TABLE IF NOT EXISTS public.task_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    count_logged INT DEFAULT 1,
    increment_value INT DEFAULT 1,
    measured_value NUMERIC DEFAULT 0,
    is_successful BOOLEAN DEFAULT TRUE,
    skip_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.task_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
ALTER TABLE public.task_logs ADD COLUMN IF NOT EXISTS skip_reason TEXT;


-- 4. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    frequency VARCHAR(50) DEFAULT 'DAILY',
    target_value INT DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'times',
    is_completed_today BOOLEAN DEFAULT FALSE,
    streak_days INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 5. CAPACITY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.capacity_settings (
    user_id VARCHAR(100) PRIMARY KEY,
    available_capacity_minutes INT DEFAULT 480,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 6. REFLECTIONS DIARY TABLE
CREATE TABLE IF NOT EXISTS public.reflections_diary (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    mood VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 7. GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_date DATE,
    progress_percent INT DEFAULT 0,
    category VARCHAR(100) DEFAULT 'General',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(user_id, parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task_date ON public.task_logs(task_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_user ON public.task_logs(user_id);


-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated and anon clients
CREATE POLICY "Allow full access to tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow full access to subtasks" ON public.subtasks FOR ALL USING (true);
CREATE POLICY "Allow full access to task_logs" ON public.task_logs FOR ALL USING (true);
CREATE POLICY "Allow full access to habits" ON public.habits FOR ALL USING (true);
CREATE POLICY "Allow full access to capacity_settings" ON public.capacity_settings FOR ALL USING (true);
CREATE POLICY "Allow full access to reflections_diary" ON public.reflections_diary FOR ALL USING (true);
CREATE POLICY "Allow full access to goals" ON public.goals FOR ALL USING (true);

-- Automated updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
