-- ============================================================================
-- HABIT HACKER: DATABASE SCHEMA INSPECTOR SCRIPT
-- Paste and run this SQL query in Supabase SQL Editor to list all tables,
-- column names, and data types in your database!
-- ============================================================================

SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name, 
    ordinal_position;
