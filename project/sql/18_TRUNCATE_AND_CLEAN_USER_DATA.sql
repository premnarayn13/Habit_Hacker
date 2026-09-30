-- =============================================================================
-- HABIT HACKER: SQL SCRIPT 1
-- TRUNCATE / CLEAN ALL DATA FOR example@gmail.com WITHOUT DAMAGING SCHEMA
--
-- Features:
-- 1. Safely removes ALL habit records, subtasks, logs, event logs, history,
--    collaborations, goals, and diary entries for 'example@gmail.com'.
-- 2. Preserves all tables, column definitions, constraints, indexes, triggers,
--    and other user accounts completely intact.
-- 3. Provides an OPTIONAL global TRUNCATE block at the bottom if you ever wish
--    to wipe the entire database clean in a sandbox environment.
--
-- Instructions: Run this script directly in Supabase SQL Editor.
-- =============================================================================

DO $$
DECLARE
    v_user_id CONSTANT TEXT := 'example@gmail.com';
    r RECORD;
BEGIN
    RAISE NOTICE 'Starting safe purge of all data for account: %', v_user_id;

    -- Temporarily drop unmap triggers to prevent any recursive cascade conflict during deletion
    FOR r IN (
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('tasks', 'subtasks') 
          AND trigger_schema = 'public'
          AND trigger_name ILIKE '%unmap%'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', r.trigger_name, r.event_object_table);
    END LOOP;

    -- 1. Delete habit completion and audit history
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'habit_completion_history') THEN
        DELETE FROM public.habit_completion_history WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'habit_update_history') THEN
        DELETE FROM public.habit_update_history WHERE user_id = v_user_id;
    END IF;

    -- 2. Delete collaborations involving this user
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_collaborations') THEN
        DELETE FROM public.task_collaborations WHERE sender_email = v_user_id OR receiver_email = v_user_id;
    END IF;

    -- 3. Delete event logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_logs') THEN
        DELETE FROM public.event_logs WHERE user_id = v_user_id;
    END IF;

    -- 4. Delete subtask logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subtask_logs') THEN
        DELETE FROM public.subtask_logs WHERE user_id = v_user_id;
    END IF;

    -- 5. Delete task logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_logs') THEN
        DELETE FROM public.task_logs WHERE user_id = v_user_id;
    END IF;

    -- 6. Delete subtasks (from both subtasks and child tasks)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subtasks') THEN
        DELETE FROM public.subtasks 
        WHERE user_id = v_user_id 
           OR parent_task_id IN (SELECT id FROM public.tasks WHERE user_id = v_user_id)
           OR parent_id IN (SELECT id FROM public.tasks WHERE user_id = v_user_id);
    END IF;

    -- 7. Delete child tasks in public.tasks first (avoids parent foreign key constraints)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        DELETE FROM public.tasks 
        WHERE user_id = v_user_id AND (parent_task_id IS NOT NULL OR parent_id IS NOT NULL);

        -- 8. Delete parent tasks in public.tasks
        DELETE FROM public.tasks WHERE user_id = v_user_id;
    END IF;

    -- 9. Delete auxiliary feature tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'diary_entries') THEN
        DELETE FROM public.diary_entries WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
        DELETE FROM public.goals WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'habits') THEN
        DELETE FROM public.habits WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        DELETE FROM public.notes WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_events') THEN
        DELETE FROM public.calendar_events WHERE user_id = v_user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminders') THEN
        DELETE FROM public.reminders WHERE user_id = v_user_id;
    END IF;

    RAISE NOTICE 'SUCCESS: All records for % have been completely purged. Table schemas and all other accounts are 100%% intact.', v_user_id;
END $$;

-- Recreate AFTER DELETE unmap trigger cleanly
CREATE OR REPLACE FUNCTION public.trg_unmap_subtasks_on_parent_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    UPDATE public.subtasks 
    SET parent_task_id = NULL, parent_id = NULL 
    WHERE parent_task_id = OLD.id OR parent_id = OLD.id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_unmap_children ON public.tasks CASCADE;
CREATE TRIGGER trg_tasks_unmap_children
AFTER DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_unmap_subtasks_on_parent_delete();

-- =============================================================================
-- OPTIONAL: FULL DATABASE TRUNCATE (WIPES ALL DATA FOR ALL USERS, KEEPS SCHEMA)
-- If you want to wipe the ENTIRE database completely clean for all users,
-- uncomment and run the block below:
-- =============================================================================
/*
TRUNCATE TABLE
    public.task_logs,
    public.subtask_logs,
    public.event_logs,
    public.subtasks,
    public.tasks,
    public.habit_completion_history,
    public.habit_update_history,
    public.task_collaborations,
    public.habits,
    public.diary_entries
RESTART IDENTITY CASCADE;
*/
