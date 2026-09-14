-- Flyway Migration V9: Add Quantitative Measure Tracking to Tasks and Task Logs

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS has_measure_tracking BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50) DEFAULT 'units';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS measure_target NUMERIC DEFAULT 0;

ALTER TABLE task_logs ADD COLUMN IF NOT EXISTS measured_value NUMERIC DEFAULT 0;
