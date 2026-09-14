-- Habit Hacker Database Migration Schema V1
-- PostgreSQL & H2 compatible syntax

-- 1. Profiles Table
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en_US',
    week_start_day INT DEFAULT 1,
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(20) DEFAULT '24h',
    daily_capacity_minutes INT DEFAULT 480,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#4F46E5',
    icon VARCHAR(50) DEFAULT 'folder',
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects Table
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'PLANNED',
    start_date DATE,
    deadline DATE,
    progress_percent INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tags Table
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#6B7280'
);

-- 5. Tasks Table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36),
    category_id VARCHAR(36),
    parent_task_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'INBOX',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    is_optional BOOLEAN DEFAULT FALSE,
    progress_percent INT DEFAULT 0,
    target_value DOUBLE PRECISION DEFAULT 1.0,
    completed_value DOUBLE PRECISION DEFAULT 0.0,
    unit VARCHAR(50) DEFAULT 'count',
    planned_start DATE,
    planned_end DATE,
    deadline DATE,
    scheduled_time VARCHAR(10),
    estimated_minutes INT DEFAULT 30,
    actual_minutes INT DEFAULT 0,
    recurrence_rule VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    timezone VARCHAR(50) DEFAULT 'UTC',
    color VARCHAR(20),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Subtasks Table (First-Class Entities with Independent Heatmap, Analytics & Calendar Placement)
CREATE TABLE subtasks (
    id VARCHAR(36) PRIMARY KEY,
    parent_task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'PLANNED',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    is_optional BOOLEAN DEFAULT FALSE,
    progress_percent INT DEFAULT 0,
    target_value DOUBLE PRECISION DEFAULT 1.0,
    completed_value DOUBLE PRECISION DEFAULT 0.0,
    unit VARCHAR(50) DEFAULT 'count',
    planned_start DATE,
    planned_end DATE,
    scheduled_time VARCHAR(10),
    estimated_minutes INT DEFAULT 15,
    actual_minutes INT DEFAULT 0,
    recurrence_rule VARCHAR(100),
    position INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Task Tags & Subtask Tags
CREATE TABLE task_tags (
    task_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE subtask_tags (
    subtask_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (subtask_id, tag_id)
);

-- 8. Checklist Items Table
CREATE TABLE checklist_items (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36),
    subtask_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Task Occurrences (Historical Recurrence Records)
CREATE TABLE task_occurrences (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    occurrence_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PLANNED',
    progress_percent INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE subtask_occurrences (
    id VARCHAR(36) PRIMARY KEY,
    subtask_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    occurrence_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PLANNED',
    progress_percent INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped_at TIMESTAMP WITH TIME ZONE
);

-- 10. Habits Table
CREATE TABLE habits (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    habit_type VARCHAR(30) DEFAULT 'BINARY', -- BINARY, COUNT, DURATION, QUANTITY, MIN_TARGET, MAX_TARGET
    target_value DOUBLE PRECISION DEFAULT 1.0,
    unit VARCHAR(50) DEFAULT 'times',
    frequency_type VARCHAR(30) DEFAULT 'DAILY', -- DAILY, WEEKDAYS, WEEKLY_X_TIMES, CUSTOM
    frequency_rule VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    reminder_time VARCHAR(10),
    color VARCHAR(20) DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Habit Occurrences Table
CREATE TABLE habit_occurrences (
    id VARCHAR(36) PRIMARY KEY,
    habit_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    target_value DOUBLE PRECISION DEFAULT 1.0,
    actual_value DOUBLE PRECISION DEFAULT 0.0,
    completion_percent INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Goals Table
CREATE TABLE goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    target_date DATE,
    progress_percent INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Goal Tasks & Goal Habits
CREATE TABLE goal_tasks (
    goal_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (goal_id, task_id)
);

CREATE TABLE goal_habits (
    goal_id VARCHAR(36) NOT NULL,
    habit_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (goal_id, habit_id)
);

-- 14. Notes Table
CREATE TABLE notes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Diary Entries Table
CREATE TABLE diary_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_date DATE NOT NULL,
    title VARCHAR(200),
    content TEXT,
    mood VARCHAR(30) DEFAULT 'GOOD',
    energy VARCHAR(30) DEFAULT 'HIGH',
    accomplishments TEXT,
    learnings TEXT,
    improvements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_diary_date UNIQUE (user_id, entry_date)
);

-- 16. Attachments Table
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    subtask_id VARCHAR(36),
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Reminders & Local Notification Alerts Table
CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    subtask_id VARCHAR(36),
    habit_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    body TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_type VARCHAR(30) DEFAULT 'EXACT_TIME', -- EXACT_TIME, BEFORE_START, AT_DEADLINE, DAILY_PLANNING
    is_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Calendar Events Table
CREATE TABLE calendar_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#3B82F6',
    location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Task Time Blocks Table
CREATE TABLE task_time_blocks (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36),
    subtask_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Focus Sessions Table
CREATE TABLE focus_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    subtask_id VARCHAR(36),
    session_type VARCHAR(30) DEFAULT 'POMODORO', -- POMODORO, STOPWATCH
    duration_seconds INT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Daily Aggregate Productivity & Discipline Records
CREATE TABLE productivity_daily (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_planned INT DEFAULT 0,
    subtasks_completed INT DEFAULT 0,
    subtasks_planned INT DEFAULT 0,
    habits_completed INT DEFAULT 0,
    habits_expected INT DEFAULT 0,
    focus_minutes INT DEFAULT 0,
    plan_adherence INT DEFAULT 0,
    discipline_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_prod_date UNIQUE (user_id, date)
);

-- 22. Countdowns Table
CREATE TABLE countdowns (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    target_date DATE NOT NULL,
    category VARCHAR(50) DEFAULT 'EXAM',
    color VARCHAR(20) DEFAULT '#EC4899',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Templates & Routines
CREATE TABLE templates (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    template_type VARCHAR(30) DEFAULT 'TASK', -- TASK, PROJECT, ROUTINE
    content_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routines (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    time_of_day VARCHAR(30) DEFAULT 'MORNING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routine_items (
    id VARCHAR(36) PRIMARY KEY,
    routine_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT DEFAULT 15,
    position INT DEFAULT 0
);

-- 24. History & Audit Logging
CREATE TABLE task_history (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtask_history (
    id VARCHAR(36) PRIMARY KEY,
    subtask_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup and RLS policy performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_planned_start ON tasks(user_id, planned_start);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_subtasks_user_id ON subtasks(user_id);
CREATE INDEX idx_subtasks_parent_id ON subtasks(parent_task_id);
CREATE INDEX idx_subtasks_planned_start ON subtasks(user_id, planned_start);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_occurrences_date ON habit_occurrences(user_id, date);
CREATE INDEX idx_prod_daily_date ON productivity_daily(user_id, date);
CREATE INDEX idx_reminders_scheduled ON reminders(user_id, scheduled_at);
