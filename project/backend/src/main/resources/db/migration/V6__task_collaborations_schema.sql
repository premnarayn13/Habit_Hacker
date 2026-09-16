-- Habit Hacker Database Migration Schema V6
-- Task Collaborations Table for Invitations & Requests Management

CREATE TABLE IF NOT EXISTS public.task_collaborations (
    id VARCHAR(100) PRIMARY KEY,
    task_id VARCHAR(100) NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_category VARCHAR(100),
    task_priority VARCHAR(50),
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    receiver_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Receiver Lookups
CREATE INDEX IF NOT EXISTS idx_collab_receiver ON public.task_collaborations(receiver_email, status);

-- Index for Sender Lookups
CREATE INDEX IF NOT EXISTS idx_collab_sender ON public.task_collaborations(sender_email);
