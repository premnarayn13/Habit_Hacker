# HABIT HACKER
## Final Technical Implementation Plan
### Mobile-First Personal Task, Habit, Calendar & Discipline Platform

**Document type:** Technical architecture and implementation specification  
**Target:** Android + iOS mobile application, with optional web/admin support later  
**Backend:** Java + Spring Boot  
**Database:** PostgreSQL through Supabase  
**Authentication:** Supabase Auth  
**Storage:** Supabase Storage  
**Mobile:** Flutter  
**Deployment goal:** Free/low-cost-first architecture, production-ready structure, smooth UX, secure multi-user data isolation

---

# 1. Executive Technical Decision

Habit Hacker should be implemented as a **Flutter mobile application + Java Spring Boot backend + Supabase PostgreSQL/Auth/Storage** system.

Recommended architecture:

```text
                    HABIT HACKER MOBILE APP
                           Flutter
                              │
                              │ HTTPS / JSON
                              ▼
                    Java Spring Boot API
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        Supabase Auth     PostgreSQL       Supabase Storage
        User Sessions     Application DB    Documents/Files
              │               │                │
              └───────────────┼────────────────┘
                              │
                       Analytics Services
                              │
                              ▼
                       Notification Layer
```

The mobile application should **not directly contain business-critical database logic**.

The Java backend should own:

- Task business rules
- Habit calculations
- Recurrence generation
- Progress calculations
- Discipline calculations
- Analytics
- Calendar aggregation
- Authorization checks
- File metadata rules
- Validation
- Scheduled processing

Supabase should provide:

- Authentication
- PostgreSQL
- Storage
- Optional realtime functionality
- Database backup facilities
- Optional future extensions

Supabase Auth issues and refreshes JWT sessions, and its authentication system is integrated with its PostgreSQL environment. citeturn0search9turn0search13

---

# 2. Primary Technical Stack

## Mobile

**Flutter**

Language:

**Dart**

Recommended architecture:

- Feature-first
- Clean Architecture
- Repository pattern
- Riverpod for state management
- Dio for HTTP
- GoRouter for navigation
- Freezed/json_serializable for models
- Local SQLite/Drift for offline cache
- Secure storage for authentication/session secrets

Flutter is suitable because one codebase can target Android and iOS while still allowing platform-specific integrations when necessary. citeturn0search8

---

# 3. Backend

## Java

Use:

**Java 21 LTS**

Framework:

**Spring Boot**

Core libraries:

- Spring Web
- Spring Security
- Spring Validation
- Spring Data JPA
- Hibernate
- PostgreSQL JDBC Driver
- Flyway
- Jackson
- Spring Actuator
- Spring Cache
- Spring Scheduling

The backend should be a **modular monolith initially**, not microservices.

This is important.

Do not start with:

- Kubernetes
- Microservices
- Kafka
- Service mesh
- Multiple databases

They add complexity without helping the first version.

---

# 4. Database

## PostgreSQL through Supabase

Supabase provides managed PostgreSQL and database capabilities including extensions, indexes, functions, triggers and related infrastructure. citeturn0search4

PostgreSQL should store:

- User profiles
- Tasks
- Subtasks
- Checklists
- Habits
- Habit occurrences
- Categories
- Tags
- Projects
- Goals
- Calendar data
- Reminders
- Notes
- Diary entries
- Attachments metadata
- Focus sessions
- Analytics aggregates
- Discipline records
- History
- Notifications
- Settings

---

# 5. Authentication Architecture

Use:

**Supabase Auth**

Do not build password authentication manually in Spring Boot.

Authentication responsibilities:

- Registration
- Login
- Logout
- Email verification
- Password reset
- Session refresh
- Optional Google login
- Optional Apple login
- Optional MFA later

Supabase Auth manages authentication sessions and JWT access tokens. citeturn0search9turn0search13

---

# 6. Authentication Flow

## Registration

```text
Flutter
  │
  │ email + password
  ▼
Supabase Auth
  │
  ├── validate credentials
  ├── create auth user
  └── issue session
  │
  ▼
Flutter receives JWT
  │
  ▼
Flutter calls Spring Boot
  │
  ▼
Spring validates JWT
  │
  ▼
Profile initialized
```

---

# 7. Login Flow

```text
User
 ↓
Flutter Login
 ↓
Supabase Auth
 ↓
JWT Access Token
 ↓
Flutter secure session storage
 ↓
Spring Boot API
 ↓
JWT validation
 ↓
User-specific data
```

Every protected backend request should include:

```text
Authorization: Bearer <access_token>
```

Supabase documents JWT authorization using the Bearer token pattern. citeturn0search13

---

# 8. Backend Authentication Strategy

Spring Security should validate the Supabase-issued JWT.

The backend should extract:

```text
sub = Supabase user UUID
```

and use that UUID as the application's primary user identity.

Do not trust:

```text
userId
```

sent in request bodies for ownership.

Instead:

```text
authenticatedUserId = JWT.sub
```

Then query:

```text
WHERE user_id = authenticatedUserId
```

---

# 9. User Data Isolation

Every user-owned table should contain:

```text
user_id UUID NOT NULL
```

Example:

```text
tasks
-----
id
user_id
title
...
```

A user can only access records belonging to their authenticated user ID.

This must be enforced at:

1. Mobile layer
2. Spring Security
3. Service layer
4. Repository query
5. Database/RLS where applicable

Supabase recommends Row Level Security for granular row-level authorization, with policies commonly tied to `auth.uid()`. citeturn0search0turn0search6

---

# 10. Supabase RLS Strategy

Even though the main application uses the Java backend, RLS should remain enabled as a defense-in-depth layer.

Every exposed user-owned table should have policies restricting rows to the authenticated user.

Conceptually:

```sql
auth.uid() = user_id
```

Supabase explicitly recommends enabling RLS for exposed tables and creating policies appropriate to the application's access model. citeturn0search0turn0search11

---

# 11. Important Security Rule

Never place these inside Flutter:

- Supabase service-role key
- PostgreSQL password
- Backend database password
- Private signing secrets
- Administrative credentials

Supabase explicitly states that service-role/secret keys must never be exposed on the frontend because they bypass RLS. citeturn0search3

Flutter should contain only:

- Supabase project URL
- Public/publishable client key where required
- Public application configuration

---

# 12. Database Connection Strategy

Spring Boot should connect to Supabase PostgreSQL using a secure server-side database connection.

Use:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
```

through environment variables.

Do not commit credentials.

Use connection pooling.

---

# 13. Database Schema

Recommended core tables:

```text
profiles
tasks
task_occurrences
subtasks
checklist_items
projects
categories
tags
task_tags
habits
habit_occurrences
habit_tags
goals
goal_tasks
goal_habits
notes
diary_entries
attachments
reminders
calendar_events
focus_sessions
task_time_blocks
notifications
discipline_daily
productivity_daily
task_history
habit_history
countdowns
templates
routines
routine_items
user_settings
```

---

# 14. Profiles Table

```text
profiles
--------
id UUID PK
email
display_name
avatar_url
timezone
locale
week_start_day
date_format
time_format
created_at
updated_at
```

`id` should correspond to the Supabase Auth user UUID.

---

# 15. Tasks Table

Core fields:

```text
tasks
-----
id UUID PK
user_id UUID
project_id UUID NULL
category_id UUID NULL
parent_task_id UUID NULL
title
description
status
priority
is_optional
progress_percent
target_value
completed_value
unit
planned_start
planned_end
deadline
estimated_minutes
actual_minutes
recurrence_rule
timezone
color
created_at
updated_at
completed_at
```

---

# 16. Planned Date vs Deadline

The database should explicitly distinguish:

```text
planned_start
planned_end
deadline
```

This prevents the common problem of using one date for two different meanings.

Example:

```text
planned_start = 2026-08-20
planned_end   = 2026-08-22
deadline      = 2026-08-25
```

---

# 17. Subtasks

Use:

```text
parent_task_id
```

for hierarchical tasks.

A subtask should still have its own:

- ID
- status
- dates
- duration
- progress
- reminders
- tags

This allows subtasks to appear independently on the calendar.

---

# 18. Checklist Items

Separate checklist items from subtasks.

```text
checklist_items
---------------
id
task_id
title
position
is_completed
created_at
completed_at
```

Checklist items should remain lightweight.

---

# 19. Task Occurrences

Recurring tasks should not be represented only by one database row.

Use:

```text
task_occurrences
----------------
id
task_id
occurrence_date
planned_start
planned_end
status
progress_percent
completed_at
skipped_at
created_at
```

This provides historical tracking.

---

# 20. Recurrence Engine

Store the recurrence rule on the parent task.

Generate individual occurrences when needed.

Examples:

```text
DAILY
WEEKLY
WEEKDAYS
EVERY_N_DAYS
CUSTOM_WEEKLY
MONTHLY
YEARLY
```

Avoid creating thousands of future rows.

Generate a reasonable future window and maintain historical occurrences permanently.

---

# 21. Habit Schema

```text
habits
------
id
user_id
name
description
habit_type
target_value
unit
frequency_type
frequency_rule
start_date
end_date
reminder_time
category_id
color
is_active
created_at
updated_at
```

---

# 22. Habit Occurrences

```text
habit_occurrences
-----------------
id
habit_id
user_id
date
target_value
actual_value
completion_percent
status
note
created_at
updated_at
```

This becomes the foundation for:

- Streaks
- Heatmaps
- Habit statistics
- Discipline

---

# 23. Habit Calculation Engine

For each habit calculate:

```text
target
actual
completion %
current streak
best streak
weekly completion
monthly completion
yearly completion
```

Do not calculate every historical statistic repeatedly from millions of raw rows.

Use optimized queries and daily aggregate tables where appropriate.

---

# 24. Goals

```text
goals
-----
id
user_id
name
description
target_date
progress_percent
status
category_id
created_at
updated_at
```

Relationship tables:

```text
goal_tasks
goal_habits
goal_projects
```

---

# 25. Projects

```text
projects
--------
id
user_id
name
description
status
start_date
deadline
progress_percent
category_id
created_at
updated_at
```

Tasks belong to projects.

---

# 26. Categories

```text
categories
----------
id
user_id
name
color
icon
position
created_at
```

Examples:

- Education
- Career
- Health
- Personal

---

# 27. Tags

Use normalized tags:

```text
tags
----
id
user_id
name
color
```

Many-to-many:

```text
task_tags
---------
task_id
tag_id
```

---

# 28. Notes

```text
notes
-----
id
user_id
title
content
category_id
created_at
updated_at
```

Notes should be independent from tasks.

---

# 29. Task Attachments

Do not store large files directly in PostgreSQL.

Store files in:

**Supabase Storage**

and metadata in:

```text
attachments
-----------
id
user_id
task_id
file_name
storage_path
mime_type
size_bytes
created_at
```

Supabase Storage supports access policies through RLS on its storage objects. citeturn0search5

---

# 30. Storage Structure

Recommended:

```text
habit-hacker-private/
    {user_id}/
        tasks/
        notes/
        diary/
        profile/
```

The user ID should be part of the object path.

---

# 31. Storage Security

Users must only access their own files.

Storage policies should enforce:

```text
storage.object.owner == authenticated user
```

Do not expose public URLs for private personal documents.

---

# 32. Diary

```text
diary_entries
-------------
id
user_id
entry_date
title
content
mood
energy
created_at
updated_at
```

Unique constraint:

```text
(user_id, entry_date)
```

if the product uses one primary diary entry per day.

---

# 33. Calendar Events

```text
calendar_events
---------------
id
user_id
title
description
start_time
end_time
all_day
color
location
created_at
updated_at
```

Initially these can be internal Habit Hacker events.

External calendar integrations should be a later phase.

---

# 34. Task Time Blocks

```text
task_time_blocks
----------------
id
task_id
user_id
start_time
end_time
actual_start
actual_end
status
```

One task can have multiple time blocks.

---

# 35. Focus Sessions

```text
focus_sessions
--------------
id
user_id
task_id
start_time
end_time
duration_seconds
session_type
completed
```

This powers focus analytics.

---

# 36. Reminders

```text
reminders
---------
id
user_id
task_id
habit_id
reminder_type
scheduled_at
repeat_rule
status
```

Do not rely entirely on the backend for mobile reminders.

The mobile device should schedule local notifications for predictable reminders.

---

# 37. Notification Architecture

Use two mechanisms.

## Local notifications

For:

- Daily habit reminder
- Task reminder
- Calendar reminder
- Focus reminder

## Server push

For:

- Account notifications
- Important synchronization events
- Future server-generated notifications

This reduces backend dependency for ordinary reminders.

---

# 38. Analytics Tables

Do not calculate every dashboard metric from raw task tables on every screen load.

Create daily aggregates.

Example:

```text
productivity_daily
------------------
user_id
date
tasks_completed
tasks_planned
tasks_overdue
habits_completed
habits_expected
focus_minutes
plan_adherence
discipline_score
```

---

# 39. Discipline Calculation

Recommended formula:

```text
Discipline =
    40% Required Task Completion
  + 25% On-Time Completion
  + 25% Habit Consistency
  + 10% Plan Adherence
```

Keep the formula versioned.

Example:

```text
discipline_formula_version = 1
```

If the formula changes later, historical scores remain explainable.

---

# 40. Heatmap Calculation

Generate daily values:

```text
date
completed_tasks
habit_completion
discipline_score
focus_minutes
```

The mobile UI converts these values into:

- Task heatmap
- Habit heatmap
- Discipline heatmap

Do not store visual colors in the database.

Store numeric values.

---

# 41. Capacity Calculation

For each day:

```text
available_minutes
scheduled_minutes
estimated_task_minutes
overload_minutes
```

Example:

```text
Available = 420 min
Planned   = 510 min
Overload  = 90 min
```

The backend can return:

```json
{
  "availableMinutes": 420,
  "plannedMinutes": 510,
  "overloadMinutes": 90,
  "overloaded": true
}
```

---

# 42. Daily Planning API

Example:

```text
GET /api/v1/planning/today
```

Response should aggregate:

- Tasks
- Habits
- Calendar events
- Deadlines
- Workload
- Capacity
- Top priorities

This avoids multiple mobile requests for the dashboard.

---

# 43. API Architecture

Base URL:

```text
/api/v1
```

Major API groups:

```text
/auth
/profile
/tasks
/subtasks
/checklists
/projects
/categories
/tags
/habits
/goals
/calendar
/reminders
/notes
/diary
/attachments
/focus
/analytics
/discipline
/heatmaps
/countdowns
/templates
/routines
/planning
/history
/settings
```

---

# 44. REST API Design

Example:

```text
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{id}
PUT    /api/v1/tasks/{id}
PATCH  /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}
```

Complete:

```text
POST /api/v1/tasks/{id}/complete
```

Progress:

```text
PATCH /api/v1/tasks/{id}/progress
```

Reschedule:

```text
POST /api/v1/tasks/{id}/reschedule
```

---

# 45. API Response Format

Use a consistent response model.

Success:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}
```

---

# 46. Validation

Validate on both:

## Flutter

For immediate UX.

## Backend

For security and correctness.

Never trust frontend validation alone.

Examples:

- Title length
- Date validity
- End date after start date
- Duration > 0
- Progress between 0 and 100
- Target values > 0
- Valid recurrence rules

---

# 47. Backend Architecture

Use:

```text
Controller
   ↓
Service
   ↓
Domain/Business Logic
   ↓
Repository
   ↓
PostgreSQL
```

Do not put business logic in controllers.

---

# 48. Suggested Spring Boot Package Structure

```text
com.habithacker
│
├── config
│   ├── SecurityConfig
│   ├── JacksonConfig
│   └── CorsConfig
│
├── security
│   ├── JwtAuthenticationFilter
│   ├── JwtTokenService
│   └── CurrentUser
│
├── common
│   ├── exception
│   ├── response
│   ├── validation
│   └── util
│
├── user
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
│
├── task
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
│
├── habit
├── project
├── goal
├── calendar
├── reminder
├── note
├── diary
├── focus
├── analytics
├── discipline
├── planning
├── attachment
├── notification
└── history
```

Each module should follow the same internal pattern.

---

# 49. Flutter Architecture

Use feature-first architecture:

```text
lib/
│
├── core/
│   ├── network/
│   ├── auth/
│   ├── storage/
│   ├── database/
│   ├── routing/
│   ├── theme/
│   ├── notifications/
│   ├── errors/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   ├── habits/
│   ├── calendar/
│   ├── projects/
│   ├── goals/
│   ├── notes/
│   ├── diary/
│   ├── focus/
│   ├── analytics/
│   ├── discipline/
│   ├── heatmap/
│   ├── countdown/
│   ├── planning/
│   ├── settings/
│   └── profile/
│
└── main.dart
```

---

# 50. Flutter Feature Structure

Example:

```text
features/tasks/
│
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
│
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
│
└── presentation/
    ├── providers/
    ├── screens/
    ├── widgets/
    └── controllers/
```

This keeps UI, business rules and network/database code separated.

---

# 51. State Management

Recommended:

**Riverpod**

Use it for:

- Auth state
- User profile
- Tasks
- Habits
- Calendar
- Dashboard
- Analytics
- Settings
- Network state

Avoid putting all state into one giant global provider.

Keep state feature-specific.

---

# 52. Local Database / Offline Mode

The app should support local caching.

Recommended:

**Drift + SQLite**

Local storage should contain:

- Recently loaded tasks
- Habits
- Calendar data
- User settings
- Pending mutations
- Cached dashboard data

---

# 53. Offline-First Behavior

When the network disappears:

User should still be able to:

- View recent tasks
- Complete tasks
- Check habits
- Update progress
- View calendar cache
- Write diary entries
- Start focus sessions

Changes should be queued locally.

When connectivity returns:

```text
Local Queue
    ↓
Sync Engine
    ↓
Spring Boot API
    ↓
PostgreSQL
```

---

# 54. Sync Strategy

Every mutable entity should have:

```text
id
updated_at
created_at
version
deleted_at
```

For offline sync:

- UUIDs generated client-side
- Changes queued
- Server validates
- Server acknowledges
- Local queue removes acknowledged mutations

Use soft deletion where synchronization requires it.

---

# 55. Conflict Handling

If the same task changes on two devices:

Prefer:

1. Latest valid server version
2. Version comparison
3. Explicit conflict resolution for important fields

Do not silently overwrite data when a conflict can cause data loss.

---

# 56. Mobile Navigation

Recommended bottom navigation:

```text
Home
Tasks
Calendar
Habits
More
```

More contains:

- Projects
- Goals
- Notes
- Diary
- Analytics
- Focus
- Settings

Avoid putting 15 icons in the bottom navigation.

---

# 57. Home Screen

The Home screen should be extremely fast.

Recommended order:

```text
Good morning

Today's date

Top 3
────────────
1. ...
2. ...
3. ...

Today's Habits
────────────
✓ Exercise
○ Vocabulary
○ Reading

Today's Schedule
────────────
09:00 ...
14:00 ...
19:00 ...

Progress
────────────
Tasks 72%
Habits 80%
Discipline 84%
```

---

# 58. Task Creation UX

The primary add button should open a fast creation sheet.

Minimum fields:

```text
Task name
Date
Priority
List
```

Advanced fields appear only when requested.

This prevents the task creation screen from becoming overwhelming.

---

# 59. Task Detail Screen

Structure:

```text
Title
Status
Progress
────────────────
Date / Deadline
Priority
Category
Tags
────────────────
Subtasks
Checklist
────────────────
Notes
Attachments
────────────────
Reminder
Repeat
────────────────
Focus
History
```

---

# 60. Habit Screen

Each habit card should show:

```text
Exercise

4 / 5 this week

🔥 12 day streak

████████░░ 80%
```

Tap opens:

- Calendar
- Heatmap
- Statistics
- History
- Notes

---

# 61. Calendar UX

Calendar should not be overloaded.

Use:

- Compact month selector
- Day timeline
- Tasks
- Habits
- Events
- Color-coded categories

Tapping an item opens its detail.

Dragging changes its schedule.

---

# 62. Heatmap UX

Use a GitHub-style compact visual grid.

Provide tabs:

```text
Tasks
Habits
Discipline
```

Selecting a day opens:

```text
August 16

Tasks completed: 8
Habits: 5/6
Focus: 3h 20m
Discipline: 86
```

---

# 63. Analytics UX

Analytics should focus on decisions rather than dozens of charts.

Top cards:

```text
Completion
Discipline
Habit Consistency
Focus Time
Plan Adherence
```

Then:

- Weekly trend
- Monthly trend
- Heatmap
- Category performance
- Overdue analysis

---

# 64. Visual Design System

The UI should feel:

- Modern
- Calm
- Fast
- Premium
- Minimal
- Friendly
- Focused

Avoid excessive gradients, excessive cards and unnecessary animations.

---

# 65. Color System

Use semantic colors rather than random colors.

Example:

```text
Primary → brand
Success → completed
Warning → approaching deadline
Danger → overdue
Info → scheduled
Neutral → inactive
```

Users can customize accents without breaking semantic meaning.

---

# 66. Typography

Use a highly readable mobile font.

Hierarchy:

```text
Display
Heading
Section
Body
Caption
Metadata
```

Keep task titles prominent.

Dates and metadata should remain visually secondary.

---

# 67. Micro-Interactions

Use subtle animations for:

- Completing a task
- Checking a habit
- Updating progress
- Moving calendar items
- Opening task details
- Changing streaks

Animations should be short and never delay interaction.

---

# 68. Haptic Feedback

Optional haptic feedback for:

- Task completion
- Habit check-in
- Timer completion
- Important confirmation

Allow disabling it.

---

# 69. Empty States

Do not show blank screens.

Examples:

No tasks:

> "Your day is clear. Nice."

No habits:

> "Start with one habit."

No diary:

> "Write your first reflection."

No goals:

> "What are you working toward?"

---

# 70. Loading Strategy

Never block the whole application unnecessarily.

Use:

- Skeleton loading
- Cached data
- Progressive rendering
- Optimistic updates

Example:

When completing a task:

```text
Tap Complete
↓
UI immediately changes
↓
API request runs
↓
Server confirms
```

If the request fails:

```text
Restore state
Show retry
```

---

# 71. Optimistic Updates

Use for:

- Completing tasks
- Checking habits
- Updating progress
- Adding checklist items
- Reordering tasks

This makes the app feel instant.

---

# 72. Pagination

Do not download thousands of historical tasks at once.

Use pagination for:

- Task history
- Completed tasks
- Diary
- Activity history
- Analytics details

Dashboard endpoints should return only the required range.

---

# 73. Caching

Cache:

- Today
- Tomorrow
- Current week
- Current month calendar
- Recent habits
- Current dashboard metrics

Invalidate cache after relevant mutations.

---

# 74. API Performance

Optimize for:

```text
Fast first screen
Few API calls
Small JSON responses
Database indexes
Pagination
Caching
Aggregated dashboard endpoints
```

The mobile dashboard should ideally require one primary request rather than ten sequential API calls.

---

# 75. Database Indexes

Important indexes:

```text
tasks(user_id)
tasks(user_id, status)
tasks(user_id, planned_start)
tasks(user_id, deadline)
tasks(user_id, priority)

task_occurrences(task_id, occurrence_date)

habits(user_id)
habit_occurrences(habit_id, date)

projects(user_id)
goals(user_id)

diary_entries(user_id, entry_date)

calendar_events(user_id, start_time)

focus_sessions(user_id, start_time)
```

RLS policy columns such as `user_id` should be indexed because Supabase specifically recommends indexing columns used by RLS policies for performance. citeturn0search0

---

# 76. Database Migration

Use:

**Flyway**

Never manually modify production schema without a migration.

Example:

```text
V1__initial_schema.sql
V2__add_habits.sql
V3__add_calendar.sql
V4__add_discipline.sql
```

Every schema change becomes reproducible.

---

# 77. API Versioning

Use:

```text
/api/v1
```

Do not expose unversioned APIs in production.

Future breaking changes can use:

```text
/api/v2
```

---

# 78. Error Handling

Create standardized errors:

```text
AUTH_REQUIRED
FORBIDDEN
TASK_NOT_FOUND
INVALID_DATE
INVALID_RECURRENCE
VALIDATION_ERROR
RATE_LIMITED
SERVER_ERROR
SYNC_CONFLICT
```

Flutter maps these into user-friendly messages.

Never display raw Java exceptions to users.

---

# 79. Security

Backend security should include:

- JWT validation
- HTTPS only
- CORS restriction
- Input validation
- SQL parameterization
- Secure headers
- Rate limiting
- Request size limits
- File type validation
- File size limits
- Authentication checks
- Authorization checks
- Audit logging

---

# 80. Rate Limiting

Protect endpoints such as:

- Login-related APIs
- Registration
- Password-related flows
- Attachment uploads
- Search
- Analytics
- Bulk operations

Use reasonable per-user/IP limits.

---

# 81. File Upload Security

For attachments:

Validate:

- MIME type
- File extension
- File size
- User ownership

Never trust the filename.

Store objects under generated UUID-based paths.

---

# 82. Secrets Management

Use environment variables or a secure secret manager.

Never commit:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_PASSWORD
JWT_SECRET
API_KEYS
```

to Git.

---

# 83. CORS

Only allow trusted application origins.

For mobile clients, CORS is not the primary security boundary; JWT authorization is.

---

# 84. Logging

Backend logs should include:

- Request ID
- User ID where appropriate
- Endpoint
- Status
- Duration
- Error code

Never log:

- Passwords
- Access tokens
- Refresh tokens
- Private file contents

---

# 85. Monitoring

Spring Boot Actuator should expose health information.

Monitor:

- API latency
- Error rate
- Database connection health
- Memory
- CPU
- Request counts

Keep monitoring lightweight for the free-first deployment.

---

# 86. Crash Reporting

Mobile app should record production crashes.

Use a free-tier crash monitoring service if needed.

Do not send sensitive diary/task content unnecessarily.

---

# 87. Testing Strategy

## Backend unit tests

Test:

- Recurrence
- Progress
- Discipline
- Habit streaks
- Capacity
- Date calculations

## Integration tests

Test:

- PostgreSQL
- Authentication
- API
- Repositories

## Flutter tests

Test:

- Widgets
- State
- Navigation
- Offline queue
- Task completion

---

# 88. Critical Business Logic Tests

The following must have extensive tests:

### Recurrence

Daily/weekly/monthly/custom.

### Time zones

Date changes around midnight.

### Partial progress

0–100%.

### Habit streaks

Completed/missed/partial.

### Capacity

Available vs planned time.

### Deadline

Overdue detection.

### Offline sync

Create/update/delete while offline.

---

# 89. Time Zone Strategy

Every user has:

```text
timezone
```

Store timestamps in:

**UTC**

Convert to the user's timezone for display and date-based calculations.

Habit dates and recurring tasks must use the user's configured timezone.

This is essential for users traveling or using multiple devices.

---

# 90. Soft Delete

For synchronized user data, prefer:

```text
deleted_at
```

instead of immediately deleting rows where historical synchronization requires tombstones.

The UI can treat deleted records as absent.

Permanent cleanup can happen later.

---

# 91. Data Retention

Keep historical productivity data unless the user explicitly deletes it.

Historical data powers:

- Heatmaps
- Statistics
- Discipline
- Streaks
- Reviews

---

# 92. Account Deletion

Provide:

**Delete Account**

This should permanently remove or schedule deletion of:

- Profile
- Tasks
- Habits
- Notes
- Diary
- Attachments
- Goals
- History

The process must be explicit and irreversible after confirmation.

---

# 93. Privacy

The application should clearly state:

- What data is stored
- What is synced
- What files are uploaded
- What notifications are generated
- What optional integrations exist

Diary and attachment content should be treated as private user data.

---

# 94. Supabase Storage vs Database

Use:

### PostgreSQL

For structured data:

- Tasks
- Habits
- Goals
- Metadata
- History

### Supabase Storage

For binary files:

- PDFs
- Images
- Documents
- Audio

Do not put binary documents directly into PostgreSQL unless there is a strong reason.

---

# 95. Realtime

Realtime should **not** be mandatory for Version 1.

The mobile application can refresh after mutations.

Optional future use:

- Multi-device instant updates
- Live dashboard changes
- Shared functionality

This keeps the first release simpler and cheaper.

---

# 96. Background Jobs

Spring scheduled jobs can handle:

- Recurrence maintenance
- Daily analytics aggregation
- Old cache cleanup
- Reminder preparation
- Historical statistics

Do not create a distributed queue for Version 1.

---

# 97. Backend Scheduled Tasks

Examples:

```text
Every 15 minutes
→ maintenance

Every hour
→ recurrence preparation

Every night
→ daily analytics aggregation

Every night
→ discipline calculation

Weekly
→ weekly statistics
```

Jobs must be idempotent.

Running twice should not corrupt data.

---

# 98. Dashboard API

Provide a consolidated endpoint:

```text
GET /api/v1/dashboard/today
```

Return:

```text
user
date
topTasks
scheduledTasks
habits
calendarEvents
deadlines
progress
discipline
capacity
focus
```

This dramatically reduces mobile API chatter.

---

# 99. Analytics API

Examples:

```text
GET /api/v1/analytics/overview
GET /api/v1/analytics/tasks
GET /api/v1/analytics/habits
GET /api/v1/analytics/focus
GET /api/v1/analytics/discipline
GET /api/v1/analytics/heatmap
```

Allow date ranges:

```text
7d
30d
90d
year
custom
```

---

# 100. Calendar API

Examples:

```text
GET /api/v1/calendar?from=...&to=...
GET /api/v1/calendar/day/{date}
POST /api/v1/calendar/events
PUT /api/v1/calendar/events/{id}
DELETE /api/v1/calendar/events/{id}
```

The backend should aggregate:

- Tasks
- Subtasks
- Habits
- Events
- Time blocks

---

# 101. Sync API

For offline support:

```text
POST /api/v1/sync
```

Payload contains queued mutations.

Response contains:

- Accepted operations
- Conflicts
- Updated server records
- Deleted records
- Sync cursor

Keep synchronization logic centralized.

---

# 102. Recommended Development Phases

## Phase 1 — Foundation

Implement:

- Flutter project
- Spring Boot project
- Supabase project
- Auth
- Database
- Profile
- Security
- Basic navigation

---

# 103. Phase 2 — Task Engine

Implement:

- Tasks
- Status
- Priority
- Categories
- Tags
- Dates
- Start/end
- Deadline
- Optional
- Progress
- Subtasks
- Checklists

---

# 104. Phase 3 — Recurrence

Implement:

- Daily
- Weekly
- Custom
- Occurrences
- History
- Recurrence engine

---

# 105. Phase 4 — Calendar

Implement:

- Day
- Week
- Month
- Agenda
- Time blocks
- Drag/drop
- Subtask calendar
- Deadline visualization

---

# 106. Phase 5 — Habits

Implement:

- Habit creation
- Frequency
- Targets
- Count/duration habits
- Check-ins
- Streaks
- History
- Heatmap

---

# 107. Phase 6 — Notes and Diary

Implement:

- Notes
- Task documents
- Attachments
- Diary
- Daily history
- Storage integration

---

# 108. Phase 7 — Focus

Implement:

- Focus timer
- Pomodoro
- Stopwatch
- Time tracking
- Focus history

---

# 109. Phase 8 — Analytics

Implement:

- Completion rate
- Habit consistency
- Focus statistics
- Discipline
- Heatmaps
- Weekly review
- Monthly review
- Yearly review

---

# 110. Phase 9 — Capacity Planning

Implement the differentiating capability:

- Available time
- Planned time
- Overload detection
- Daily capacity indicator
- Rescheduling suggestions

Keep this deterministic before adding AI.

---

# 111. Phase 10 — Polish

Focus on:

- Animations
- Haptics
- Skeleton loading
- Offline cache
- Optimistic updates
- Error states
- Accessibility
- Performance
- Notification quality

---

# 112. Phase 11 — Production Hardening

Before release:

- Security review
- RLS review
- API authorization review
- Database indexes
- Backup verification
- Crash testing
- Offline testing
- Network failure testing
- Authentication testing
- Rate-limit testing
- File upload testing

Supabase's production checklist specifically emphasizes RLS, security review and production readiness. citeturn0search11

---

# 113. Free-First Infrastructure

Recommended starting deployment:

```text
Flutter
   ↓
Free/low-cost mobile distribution during development

Spring Boot
   ↓
Free-tier capable hosting

Supabase
   ↓
PostgreSQL
Auth
Storage
```

Do not architect around expensive infrastructure.

---

# 114. Free-Tier Design Principles

To keep operating costs low:

- Avoid unnecessary background jobs
- Avoid microservices
- Avoid Redis initially
- Avoid Kafka
- Avoid Kubernetes
- Avoid always-on AI
- Avoid storing large files unnecessarily
- Cache dashboard data
- Paginate history
- Aggregate analytics
- Compress images before upload
- Limit attachment sizes
- Use local notifications where possible

---

# 115. Performance Target

The application should feel:

**instant for local interactions**

Target UX:

```text
Tap Complete
→ Immediate UI change

Open Today
→ Cached content appears immediately

Refresh
→ Server synchronization occurs in background
```

Network should not make ordinary task interaction feel slow.

---

# 116. Mobile Performance

Optimize:

- Lazy lists
- Pagination
- Image caching
- Database indexes
- Minimal rebuilds
- Riverpod scoped state
- Background synchronization
- JSON response size

Avoid rendering thousands of calendar/task items simultaneously.

---

# 117. Calendar Performance

For a year view:

Do not download every task.

Request aggregated data:

```text
date
task_count
habit_count
discipline_score
```

Load detailed records only after selecting a date.

---

# 118. Heatmap Performance

Heatmap endpoint should return compact numeric data.

Example:

```json
[
  {
    "date": "2026-08-16",
    "value": 82
  }
]
```

The Flutter UI determines the visual intensity.

---

# 119. Analytics Performance

Use:

- Daily aggregates
- Weekly aggregates
- Monthly aggregates
- Indexed queries
- Cached results

Do not calculate year-long analytics from raw task records every time the screen opens.

---

# 120. API Documentation

Use:

**OpenAPI / Swagger**

Document:

- Endpoint
- Request
- Response
- Authentication
- Error codes

This makes mobile/backend development much easier.

---

# 121. Git Repository Structure

Recommended:

```text
habit-hacker/
│
├── mobile/
│   └── Flutter application
│
├── backend/
│   └── Spring Boot application
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── policies/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── product/
│
├── scripts/
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# 122. Environment Structure

Never hardcode environments.

Use:

```text
.env.development
.env.staging
.env.production
```

Backend environment variables:

```text
SPRING_PROFILES_ACTIVE
SUPABASE_URL
SUPABASE_JWT_ISSUER
SUPABASE_JWT_AUDIENCE
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
STORAGE_BUCKET
```

Mobile:

```text
API_BASE_URL
SUPABASE_URL
SUPABASE_PUBLIC_KEY
```

Only public values belong in the mobile bundle.

---

# 123. Development Environments

Use:

```text
LOCAL
STAGING
PRODUCTION
```

### Local

Developer machine.

### Staging

Testing deployment.

### Production

Real users.

Never develop directly against production data.

---

# 124. CI/CD

Use GitHub Actions.

Pipeline:

```text
Push
 ↓
Lint
 ↓
Unit tests
 ↓
Build
 ↓
Integration tests
 ↓
Security checks
 ↓
Deploy staging
 ↓
Manual approval
 ↓
Production
```

Mobile releases should have separate Android/iOS build pipelines.

---

# 125. Backend Deployment

Deploy Spring Boot as a single service initially.

Requirements:

- Java 21
- Environment variables
- HTTPS
- Health check
- Database connection
- Logging

Avoid unnecessary infrastructure.

---

# 126. Database Deployment

Schema changes:

```text
Git
 ↓
Flyway migration
 ↓
Staging
 ↓
Test
 ↓
Production
```

Never manually change production tables as the normal workflow.

---

# 127. Supabase Responsibilities

Use Supabase for:

### Auth

- Users
- Sessions
- Email verification
- Password reset

### Database

- PostgreSQL

### Storage

- Attachments

### Optional

- Realtime
- Database functions
- Extensions

Supabase supports PostgreSQL extensions including `pgvector`, `PostGIS` and `pg_cron`, but these should only be introduced when a concrete product requirement needs them. citeturn0search4

---

# 128. Java Responsibilities

Spring Boot owns:

- Business rules
- Task operations
- Habit operations
- Recurrence
- Progress
- Analytics
- Discipline
- Capacity
- Calendar aggregation
- Authorization
- Validation
- Sync
- File metadata
- History

This separation keeps the backend predictable and testable.

---

# 129. Flutter Responsibilities

Flutter owns:

- UI
- Navigation
- Local state
- Local cache
- Offline queue
- Local notifications
- User interaction
- Optimistic updates
- Device-specific behavior

---

# 130. What NOT to Build Initially

Do not include in Version 1:

- Microservices
- Kubernetes
- Kafka
- Redis cluster
- AI chatbot
- Complex external integrations
- Team collaboration
- Enterprise RBAC
- Email-to-task
- CRM
- Complex social features
- Marketplace
- Excessive gamification

These can be evaluated only after the core product is stable.

---

# 131. Recommended Version 1 Feature Set

The first production-capable release should contain:

### Authentication

- Register
- Login
- Logout
- Password reset
- Session persistence

### Tasks

- Create
- Edit
- Delete
- Complete
- Partial progress
- Priority
- Optional
- Categories
- Tags
- Start/end dates
- Deadline
- Recurrence

### Structure

- Subtasks
- Subtask dates
- Checklists
- Projects

### Calendar

- Day
- Week
- Month
- Agenda
- Time blocking

### Habits

- Frequency
- Targets
- Streak
- History
- Heatmap

### Productivity

- Focus
- Statistics
- Discipline
- Daily review

### Personal

- Notes
- Diary
- Attachments

### Differentiation

- Planned date vs deadline
- Capacity-aware planning

---

# 132. Version 2

After the core system is stable:

- Advanced analytics
- Better yearly review
- More powerful timeline
- Advanced templates
- More offline functionality
- Better synchronization
- Custom dashboard
- Advanced reminders
- More widgets
- Goal analytics

---

# 133. Version 3

Only if justified by user demand:

- AI task breakdown
- AI planning
- AI productivity insights
- External calendar integration
- Wearable integrations
- Advanced automation

AI should be an optional intelligence layer, not the foundation of the application.

---

# 134. Final Architecture

```text
                         ┌───────────────────────┐
                         │   Android / iOS       │
                         │       Flutter         │
                         └──────────┬────────────┘
                                    │
                              HTTPS + JWT
                                    │
                                    ▼
                         ┌───────────────────────┐
                         │   Spring Boot API     │
                         │       Java 21         │
                         ├───────────────────────┤
                         │ Auth Security         │
                         │ Task Engine            │
                         │ Habit Engine           │
                         │ Recurrence             │
                         │ Calendar               │
                         │ Analytics              │
                         │ Discipline             │
                         │ Capacity               │
                         │ Notifications          │
                         │ Sync                   │
                         └──────────┬────────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
              ┌────────────┐ ┌────────────┐ ┌──────────────┐
              │ Supabase   │ │ PostgreSQL │ │  Supabase    │
              │ Auth       │ │ Database   │ │  Storage      │
              └────────────┘ └────────────┘ └──────────────┘
```

---

# 135. Final Technical Principles

## Principle 1 — Mobile First

The application must be designed for one-handed mobile use first.

## Principle 2 — Backend Controlled

Business logic belongs in Spring Boot.

## Principle 3 — Secure by Default

Every user-owned record is protected.

## Principle 4 — Offline Friendly

Core task/habit interactions should remain usable without a connection.

## Principle 5 — Fast UI

Use local cache and optimistic updates.

## Principle 6 — Simple Infrastructure

Start with a modular monolith.

## Principle 7 — PostgreSQL First

Use relational modeling because tasks, subtasks, habits, goals and calendar relationships are strongly structured.

## Principle 8 — Analytics From Historical Data

Preserve occurrences and history rather than overwriting state.

## Principle 9 — No Feature Bloat

Only implement features that improve personal planning, execution or reflection.

## Principle 10 — AI Is Optional

Build deterministic productivity intelligence first. Add AI only where it provides measurable value.

---

# 136. Final Technology Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter |
| Language | Dart |
| State | Riverpod |
| Navigation | GoRouter |
| Networking | Dio |
| Local DB | SQLite + Drift |
| Secure Storage | Platform secure storage |
| Backend | Java 21 |
| Framework | Spring Boot |
| Security | Spring Security + Supabase JWT |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL |
| Database Platform | Supabase |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Migrations | Flyway |
| API | REST + JSON |
| API Docs | OpenAPI / Swagger |
| Notifications | Local notifications + push later |
| CI/CD | GitHub Actions |
| Monitoring | Spring Actuator + lightweight error monitoring |
| Hosting | Free-tier-capable managed services initially |

---

# 137. Final Build Strategy

The strongest implementation path is:

```text
Flutter Mobile App
        ↓
Spring Boot REST API
        ↓
Supabase Auth + PostgreSQL
        ↓
Supabase Storage
```

Start as a **single, clean, modular system**.

Then progressively add:

```text
Offline Sync
     ↓
Advanced Analytics
     ↓
Capacity Planning
     ↓
Better Notifications
     ↓
Advanced Productivity Intelligence
     ↓
Optional AI
```

Do not reverse this order.

The core product must remain excellent even if every AI feature is removed.

---

# 138. Definition of Done

Habit Hacker Version 1 should not be considered complete until:

- Authentication works reliably.
- Every user's data is isolated.
- RLS/security policies are reviewed.
- Tasks work offline for core interactions.
- Tasks synchronize correctly.
- Recurring tasks preserve occurrence history.
- Subtasks can have independent dates.
- Partial progress works.
- Habits calculate streaks correctly.
- Calendar renders tasks and habits correctly.
- Heatmaps display historical data correctly.
- Attachments are private and user-scoped.
- Diary entries are preserved by date.
- Discipline calculations are deterministic and explainable.
- Capacity warnings are correct.
- Dashboard loads quickly.
- Mobile UI remains responsive with large datasets.
- Database migrations are reproducible.
- API errors are standardized.
- Production secrets are never bundled into the mobile application.
- Backup/export works.
- Account deletion works correctly.
- Offline/online synchronization has been tested.
- Android production build is tested.
- iOS production build is tested.

---

# FINAL TECHNICAL VISION

Habit Hacker should be built as a **high-quality mobile-first modular monolith**:

**Flutter → Spring Boot → Supabase PostgreSQL/Auth/Storage**

The architecture should remain intentionally simple while the product experience is sophisticated.

The application should feel instant because of:

**local cache + optimistic updates + efficient APIs + indexed PostgreSQL + aggregated analytics**

It should feel reliable because of:

**offline support + synchronization + historical records + deterministic business rules**

It should feel secure because of:

**Supabase Auth + JWT + Spring Security + user-scoped authorization + PostgreSQL RLS + private Storage**

And it should remain inexpensive to operate because the initial architecture avoids unnecessary:

**microservices + Kubernetes + Kafka + Redis + always-on AI + expensive infrastructure.**

The result is a technically strong foundation for a polished personal productivity application that can start small, run on free/low-cost infrastructure, and scale its capabilities without requiring a complete architectural rewrite.
