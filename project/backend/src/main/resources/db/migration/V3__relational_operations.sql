-- Habit Hacker Database Migration Schema V3 (Fixed Profiles UUID Type Mismatch for Supabase)
-- Relational Task Operations, Skip Reasons, Sections, and Security Policies

-- 1. Add skip_reason column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skip_reason VARCHAR(255);

-- 2. Add section_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS section_id VARCHAR(36);

-- 3. Sections Table for User-Defined Schedule Tabs & Categories
CREATE TABLE IF NOT EXISTS task_sections (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#DC2626',
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Task Skip Logs Table for Historical Skip Analytics
CREATE TABLE IF NOT EXISTS task_skip_logs (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    skip_reason VARCHAR(255) NOT NULL,
    skipped_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed default task sections for demo user
INSERT INTO task_sections (id, user_id, name, color, position) VALUES
('sec-1', 'demo-user-123', 'Not Sectioned', '#64748B', 1),
('sec-2', 'demo-user-123', 'Fitness', '#DC2626', 2),
('sec-3', 'demo-user-123', 'Non-Academic', '#D97706', 3),
('sec-4', 'demo-user-123', 'Work', '#DC2626', 4)
ON CONFLICT (id) DO NOTHING;
