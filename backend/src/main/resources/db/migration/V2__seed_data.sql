-- Habit Hacker Seed Data Migration V2

-- 1. Default Categories for Demo User
INSERT INTO categories (id, user_id, name, color, icon, position) VALUES
('cat-1', 'demo-user-123', 'Education', '#6366F1', 'book', 1),
('cat-2', 'demo-user-123', 'Career', '#3B82F6', 'briefcase', 2),
('cat-3', 'demo-user-123', 'Coding', '#06B6D4', 'code', 3),
('cat-4', 'demo-user-123', 'Health', '#10B981', 'activity', 4),
('cat-5', 'demo-user-123', 'Personal', '#F59E0B', 'user', 5);

-- 2. Sample Tasks
INSERT INTO tasks (id, user_id, category_id, title, description, status, priority, is_optional, progress_percent, target_value, completed_value, unit, planned_start, planned_end, deadline, estimated_minutes, actual_minutes, difficulty) VALUES
('t-101', 'demo-user-123', 'cat-1', 'Complete Machine Learning Architecture Document', 'Draft technical flow diagram and system benchmarks.', 'IN_PROGRESS', 'CRITICAL', FALSE, 65, 1.0, 0.65, 'count', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE + INTERVAL '2' DAY, 180, 120, 'HARD'),
('t-102', 'demo-user-123', 'cat-2', 'Submit Weekly Habit Hacker Progress Report', 'Review task history, discipline scorecards, and submit report.', 'PLANNED', 'HIGH', FALSE, 40, 1.0, 0.4, 'count', CURRENT_DATE, CURRENT_DATE + INTERVAL '1' DAY, CURRENT_DATE + INTERVAL '1' DAY, 120, 45, 'MEDIUM'),
('t-103', 'demo-user-123', 'cat-3', 'Review React Native UI Components & Animations', 'Test subtask progress bars, quantity inputs, and white theme.', 'COMPLETED', 'LOW', TRUE, 100, 1.0, 1.0, 'count', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE + INTERVAL '5' DAY, 90, 80, 'EASY');

-- 3. Sample Subtasks
INSERT INTO subtasks (id, parent_task_id, user_id, title, status, priority, is_optional, progress_percent, target_value, completed_value, unit, planned_start, planned_end, scheduled_time, estimated_minutes, actual_minutes, position) VALUES
('sub-101-1', 't-101', 'demo-user-123', 'Subtask 1: Build Data Flow Diagram', 'COMPLETED', 'HIGH', FALSE, 100, 1.0, 1.0, 'diagram', CURRENT_DATE, CURRENT_DATE, '10:00', 60, 55, 1),
('sub-101-2', 't-101', 'demo-user-123', 'Subtask 2: Draft Technical Specification Notes', 'IN_PROGRESS', 'MEDIUM', FALSE, 80, 5.0, 4.0, 'pages', CURRENT_DATE, CURRENT_DATE, '11:30', 45, 30, 2);

-- 4. Sample Habits
INSERT INTO habits (id, user_id, category_id, name, description, habit_type, target_value, unit, frequency_type, start_date, color, is_active) VALUES
('h-1', 'demo-user-123', 'cat-1', 'Learn 5 New Words', 'Expand vocabulary daily', 'COUNT', 5.0, 'words', 'DAILY', CURRENT_DATE - INTERVAL '30' DAY, '#10B981', TRUE),
('h-2', 'demo-user-123', 'cat-4', '30 mins Daily Workout', 'Physical exercise session', 'DURATION', 30.0, 'mins', 'DAILY', CURRENT_DATE - INTERVAL '30' DAY, '#3B82F6', TRUE),
('h-3', 'demo-user-123', 'cat-4', 'Drink 8 Glasses of Water', 'Stay hydrated', 'QUANTITY', 8.0, 'glasses', 'DAILY', CURRENT_DATE - INTERVAL '30' DAY, '#06B6D4', TRUE);

-- 5. Routines Presets
INSERT INTO routines (id, user_id, name, description, time_of_day) VALUES
('r-1', 'demo-user-123', 'Morning Routine', 'Hydrate, exercise, read, and plan daily commitments.', 'MORNING'),
('r-2', 'demo-user-123', 'Evening Review Routine', 'Write daily reflection diary and review discipline score.', 'EVENING');

INSERT INTO routine_items (id, routine_id, title, duration_minutes, position) VALUES
('ri-1', 'r-1', 'Drink 500ml Water', 5, 1),
('ri-2', 'r-1', 'Light Exercise / Stretch', 15, 2),
('ri-3', 'r-1', 'Review & Schedule Today Tasks', 10, 3);
