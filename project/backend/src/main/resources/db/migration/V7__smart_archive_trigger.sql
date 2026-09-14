-- Habit Hacker Supabase Migration Schema V7
-- Smart Archive Trigger & Automatic Deadline Shifting Logic

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tracking_mode_type') THEN
        CREATE TYPE tracking_mode_type AS ENUM ('end_date', 'count_days', 'count_event');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    section VARCHAR(100),
    tags TEXT[],
    is_optional BOOLEAN DEFAULT FALSE,
    tracking_mode tracking_mode_type DEFAULT 'end_date',
    
    target_count INT DEFAULT NULL,
    current_count INT DEFAULT 0,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger Function for Automatic End Date Shifting Upon Unarchiving
CREATE OR REPLACE FUNCTION adjust_end_date_on_unarchive()
RETURNS TRIGGER AS $$ 
DECLARE 
    days_archived INT; 
BEGIN 
    IF OLD.is_archived = TRUE AND NEW.is_archived = FALSE THEN 
        days_archived := DATE_PART('day', NOW() - OLD.archived_at); 
        IF days_archived > 0 THEN 
            NEW.end_date := OLD.end_date + (days_archived || ' days')::INTERVAL; 
        END IF; 
        NEW.archived_at := NULL; 
    ELSIF OLD.is_archived = FALSE AND NEW.is_archived = TRUE THEN 
        NEW.archived_at := NOW(); 
    END IF; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_adjust_archive_end_date ON public.tasks;

CREATE TRIGGER trigger_adjust_archive_end_date
BEFORE UPDATE ON public.tasks
FOR EACH ROW
WHEN (OLD.is_archived IS DISTINCT FROM NEW.is_archived)
EXECUTE FUNCTION adjust_end_date_on_unarchive();
