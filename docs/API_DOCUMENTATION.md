# Habit Hacker - REST API & Supabase Endpoints Reference

## Endpoints
- GET /api/v1/tasks - Retrieve active & archived tasks.
- POST /api/v1/tasks - Create new task/subtask entity.
- PUT /api/v1/tasks/{id} - Update task configuration and dates.
- DELETE /api/v1/tasks/{id} - Remove task entity.
- POST /api/v1/tasks/{id}/toggle - Toggle turn completion for today.
- GET /api/v1/capacity - Compute daily workload capacity.
