-- ============================================================================
-- HABIT HACKER: SQL MIGRATION 16
-- ENFORCE CONSTRAINT: TYPE-3 PARENT HABIT CAN ONLY HAVE TYPE-3 SUBHABITS
--
-- Logic:
-- 1. Updates any existing subhabits under a Type-3 (count_event) parent to count_event.
-- 2. Creates a BEFORE INSERT OR UPDATE trigger on public.tasks and public.subtasks
--    that rejects non-count_event subhabits under count_event parent habits
--    with the exact error: 'Unable to create subtask of this type for this parent'.
-- ============================================================================

-- 1. CONVERT EXISTING SUBTASKS UNDER TYPE-3 PARENTS TO count_event
UPDATE public.tasks child
SET tracking_mode = 'count_event'
FROM public.tasks parent
WHERE (child.parent_task_id = parent.id OR child.parent_id = parent.id)
  AND parent.tracking_mode = 'count_event'
  AND child.tracking_mode != 'count_event';

UPDATE public.subtasks child
SET tracking_mode = 'count_event'
FROM public.tasks parent
WHERE (child.parent_task_id = parent.id OR child.parent_id = parent.id)
  AND parent.tracking_mode = 'count_event'
  AND child.tracking_mode != 'count_event';

-- Specifically ensure test dataset parent-type3 subtasks are count_event
UPDATE public.tasks
SET tracking_mode = 'count_event'
WHERE parent_task_id = 'parent-type3-project-milestones'
   OR id IN ('sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing');

UPDATE public.subtasks
SET tracking_mode = 'count_event'
WHERE parent_task_id = 'parent-type3-project-milestones'
   OR id IN ('sub-p3-s1-core-backend-api', 'sub-p3-s2-frontend-ui-views', 'sub-p3-s3-integration-testing');

-- 2. CREATE VALIDATION TRIGGER FUNCTION FOR public.tasks
CREATE OR REPLACE FUNCTION public.check_type3_parent_subhabit_constraint()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_mode TEXT;
    v_parent_id TEXT;
BEGIN
    v_parent_id := COALESCE(NEW.parent_task_id, NEW.parent_id);

    -- Only check if this row is a child subtask
    IF v_parent_id IS NOT NULL AND v_parent_id <> '' THEN
        SELECT tracking_mode INTO v_parent_mode
        FROM public.tasks
        WHERE id = v_parent_id;

        IF v_parent_mode = 'count_event' AND (NEW.tracking_mode IS NULL OR NEW.tracking_mode <> 'count_event') THEN
            RAISE EXCEPTION 'Unable to create subtask of this type for this parent';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ATTACH TRIGGER TO public.tasks
DROP TRIGGER IF EXISTS trg_enforce_type3_subhabits_tasks ON public.tasks;
CREATE TRIGGER trg_enforce_type3_subhabits_tasks
BEFORE INSERT OR UPDATE OF parent_task_id, parent_id, tracking_mode
ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.check_type3_parent_subhabit_constraint();

-- 4. ATTACH TRIGGER TO public.subtasks
DROP TRIGGER IF EXISTS trg_enforce_type3_subhabits_subtasks ON public.subtasks;
CREATE TRIGGER trg_enforce_type3_subhabits_subtasks
BEFORE INSERT OR UPDATE OF parent_task_id, parent_id, tracking_mode
ON public.subtasks
FOR EACH ROW
EXECUTE FUNCTION public.check_type3_parent_subhabit_constraint();

-- Verification Output
DO $$
BEGIN
    RAISE NOTICE 'Migration 16 successfully executed: Type-3 parent constraint enforced on tasks and subtasks.';
END;
$$;
