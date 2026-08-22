-- Habit Hacker Supabase Migration Schema V8
-- Activity Logs Table for Deep Analytics & LeetCode Heatmaps

CREATE TABLE IF NOT EXISTS public.task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_date DATE DEFAULT CURRENT_DATE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    count_logged INT DEFAULT 1,
    increment_value INT DEFAULT 1,
    is_successful BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for high speed analytical queries by task and date range
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id_logged_date ON public.task_logs(task_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_user_id ON public.task_logs(user_id);
