-- ============================================================================
-- 20_CREATE_TASK_COLLABORATIONS_TABLE.sql
-- Creates public.task_collaborations table with full RLS and indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.task_collaborations (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    task_title TEXT,
    category TEXT,
    priority TEXT,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    receiver_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_collaborations ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for all users (or authenticated)
DROP POLICY IF EXISTS "Allow all access to task_collaborations" ON public.task_collaborations;
CREATE POLICY "Allow all access to task_collaborations" ON public.task_collaborations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Helpful indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_task_collab_receiver ON public.task_collaborations(receiver_email, status);
CREATE INDEX IF NOT EXISTS idx_task_collab_sender ON public.task_collaborations(sender_email);
CREATE INDEX IF NOT EXISTS idx_task_collab_task ON public.task_collaborations(task_id);
