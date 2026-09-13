-- ============================================================================
-- HABIT HACKER - USER PROFILE AND SYSTEM SETTINGS SCHEMA
-- Migration 08: Persistent user preferences, daily capacity, security metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    display_name VARCHAR(255) DEFAULT 'Prem Narayn',
    email VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    capacity_hours INT DEFAULT 8,
    week_start_day VARCHAR(32) DEFAULT 'Monday',
    date_format VARCHAR(32) DEFAULT 'YYYY-MM-DD',
    theme VARCHAR(32) DEFAULT 'light',
    push_notifications BOOLEAN DEFAULT TRUE,
    sound_alerts BOOLEAN DEFAULT TRUE,
    habit_reminders BOOLEAN DEFAULT TRUE,
    todo_notifications BOOLEAN DEFAULT TRUE,
    ringtone_name VARCHAR(128) DEFAULT 'Default Bell',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Insert default user settings if not exists
INSERT INTO user_settings (id, user_id, display_name, email, capacity_hours, theme)
VALUES ('setting_default_01', 'usr_default_prem', 'Prem Narayn', 'prem.narayn@habithacker.app', 8, 'light')
ON CONFLICT (user_id) DO NOTHING;
