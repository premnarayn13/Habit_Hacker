-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 21 — CASCADE DELETIONS & UNMAPPING FIX
-- Run this script in your Supabase SQL Editor to make sure deleting any habit or
-- subtask is completely unblocked by foreign key constraints.
-- ============================================================================

-- 1. DROP ANY RESTRICTIVE FOREIGN KEY CONSTRAINTS BLOCKING TASK DELETIONS
ALTER TABLE IF EXISTS public.task_logs DROP CONSTRAINT IF EXISTS task_logs_task_id_fkey;
ALTER TABLE IF EXISTS public.task_logs DROP CONSTRAINT IF EXISTS task_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.subtask_logs DROP CONSTRAINT IF EXISTS subtask_logs_subtask_id_fkey;
ALTER TABLE IF EXISTS public.subtask_logs DROP CONSTRAINT IF EXISTS subtask_logs_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.subtasks DROP CONSTRAINT IF EXISTS subtasks_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.subtasks DROP CONSTRAINT IF EXISTS subtasks_parent_id_fkey;
ALTER TABLE IF EXISTS public.tasks DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.tasks DROP CONSTRAINT IF EXISTS tasks_parent_id_fkey;
ALTER TABLE IF EXISTS public.event_logs DROP CONSTRAINT IF EXISTS event_logs_task_id_fkey;
ALTER TABLE IF EXISTS public.event_logs DROP CONSTRAINT IF EXISTS event_logs_parent_task_id_fkey;
ALTER TABLE IF EXISTS public.habit_completion_history DROP CONSTRAINT IF EXISTS habit_completion_history_task_id_fkey;
ALTER TABLE IF EXISTS public.habit_update_history DROP CONSTRAINT IF EXISTS habit_update_history_task_id_fkey;
ALTER TABLE IF EXISTS public.task_collaborations DROP CONSTRAINT IF EXISTS task_collaborations_task_id_fkey;

-- 2. TRIGGER FUNCTION: AUTOMATIC CASCADE UNMAPPING AND CLEANUP ON TASK DELETION
CREATE OR REPLACE FUNCTION public.trg_cascade_delete_or_unmap_on_task_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Unmap child tasks in public.tasks (they become standalone parent habits)
    UPDATE public.tasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    -- Unmap child subtasks in public.subtasks
    UPDATE public.subtasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    -- Delete referencing rows from auxiliary tables
    DELETE FROM public.task_collaborations WHERE task_id = OLD.id;
    DELETE FROM public.event_logs WHERE task_id = OLD.id OR parent_task_id = OLD.id;
    DELETE FROM public.task_logs WHERE task_id = OLD.id;
    DELETE FROM public.subtask_logs WHERE subtask_id = OLD.id OR parent_task_id = OLD.id;
    DELETE FROM public.habit_completion_history WHERE task_id = OLD.id OR parent_task_id = OLD.id;
    DELETE FROM public.habit_update_history WHERE task_id = OLD.id OR parent_task_id = OLD.id;

    -- Delete matching record in subtasks table if it was also tracked there
    DELETE FROM public.subtasks WHERE id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. ATTACH TRIGGER BEFORE DELETE TO PREVENT ANY FOREIGN KEY INTERFERENCE
DROP TRIGGER IF EXISTS trg_tasks_cascade_cleanup ON public.tasks;
CREATE TRIGGER trg_tasks_cascade_cleanup
BEFORE DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_cascade_delete_or_unmap_on_task_delete();

-- 4. ENSURE FULL PERMISSIONS
GRANT ALL ON TABLE public.tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.event_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.task_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subtask_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_completion_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_update_history TO anon, authenticated, service_role;
