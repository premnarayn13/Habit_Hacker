-- =============================================================================
-- HABIT HACKER — Truncate All Tables (Wipes data, keeps schema intact)
-- Run this in Supabase SQL Editor
-- =============================================================================

TRUNCATE TABLE
    app_users,
    task_logs,
    subtask_logs,
    event_logs,
    subtasks,
    tasks,
    habits,
    habit_occurrences,
    diary_entries,
    profiles,
    categories,
    projects,
    tags,
    task_tags,
    subtask_tags,
    checklist_items,
    task_occurrences,
    subtask_occurrences,
    goals,
    goal_tasks,
    goal_habits,
    notes,
    attachments,
    reminders,
    calendar_events,
    task_time_blocks,
    focus_sessions,
    productivity_daily,
    countdowns,
    templates,
    routines,
    routine_items,
    task_history,
    subtask_history
RESTART IDENTITY CASCADE;

-- Done. All data removed, schema and structure preserved.
