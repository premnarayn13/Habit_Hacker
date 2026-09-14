# Habit Hacker
## Final Product Feature & Functionality Specification

**Product type:** Personal task management, scheduling, habit tracking, productivity and self-discipline platform

**Product philosophy:**  
Habit Hacker should be a focused personal productivity system inspired by the strongest parts of TickTick, while adding only a very small number of carefully selected capabilities that materially improve planning and self-management.

This specification intentionally avoids unnecessary integrations, email-to-task workflows, excessive AI features, enterprise collaboration, CRM-style functionality, and unrelated automation.

---

# 1. Product Scope

Habit Hacker is built around six connected areas:

1. **Tasks** — capture and manage work.
2. **Scheduling** — decide when work should happen.
3. **Habits** — repeatedly perform behaviors.
4. **Calendar & History** — see planned and completed activity over time.
5. **Productivity & Discipline** — understand consistency and execution.
6. **Notes & Diary** — preserve useful information and personal reflection.

The central loop is:

**Capture → Organize → Schedule → Execute → Complete → Review → Improve**

---

# 2. Task Management

## 2.1 Task Creation

Every task should support:

- Task title
- Description
- Notes
- Date
- Time
- Start date
- End date
- Duration
- Priority
- Category
- List/project
- Tags
- Reminder
- Repeat rule
- Subtasks
- Checklist
- Attachments
- Progress
- Optional/required status

Tasks should be quick to create and easy to edit.

---

## 2.2 Task Status

Tasks should support more than simply completed/uncompleted.

Recommended statuses:

- Inbox
- Planned
- Scheduled
- In Progress
- Partially Completed
- Completed
- Skipped
- Deferred
- Cancelled
- Blocked

The normal user experience should remain simple, while advanced states are available when required.

---

## 2.3 Task Priority

Support four or five priority levels.

Recommended:

- Critical
- High
- Medium
- Low
- None

Priority should influence sorting, daily planning and reminders.

---

## 2.4 Optional Tasks

Every task can be marked:

- Required
- Optional

Optional tasks should not reduce the user's main completion/discipline score when skipped.

Example:

**Required**
- Study 30 minutes

**Optional**
- Review extra examples
- Watch an additional lecture

---

## 2.5 Task Progress Percentage

Tasks can have measurable progress:

- 0%
- 25%
- 50%
- 75%
- 100%

Progress can be updated manually or calculated automatically from subtasks.

Example:

**Build Project — 65%**

---

## 2.6 Quantity-Based Tasks

Tasks can have measurable targets instead of binary completion.

Examples:

- Learn 5 words
- Read 20 pages
- Solve 10 problems
- Drink 8 glasses
- Exercise 30 minutes
- Write 1000 words

The task should record:

**Target → Actual → Progress**

Example:

`Target: 5 words | Completed: 4 | Progress: 80%`

---

## 2.7 Partial Completion

A task can be partially completed without being considered completely finished.

Examples:

- 40/100 pages
- 3/5 words
- 25/50 problems
- 20/30 minutes

This is important for realistic productivity tracking.

---

## 2.8 Start Date and End Date

Tasks can have a working period.

Example:

**Exam Preparation**

Start: August 20  
End: September 5

The task remains active throughout the defined period.

---

## 2.9 Planned Date vs Deadline — Differentiating Feature #1

Habit Hacker should distinguish between:

**Planned Date:** when the user intends to work on something.

**Deadline:** the final date by which it must be completed.

Example:

Task: Final Project Report

- Planned work: August 20
- Planned work: August 22
- Deadline: August 25

This allows a long-term task to be scheduled across several working sessions without confusing its working dates with its actual deadline.

---

## 2.10 Task Duration

Every scheduled task may have:

- Estimated duration
- Planned duration
- Actual duration

Example:

`Estimated: 60 min`
`Actual: 78 min`

This data should later feed productivity statistics.

---

# 3. Subtasks and Checklists

## 3.1 Subtasks

A task can contain multiple subtasks.

Example:

**Prepare Project Report**

- Research
- Introduction
- Methodology
- Results
- Conclusion
- References
- Proofread

---

## 3.2 Subtask Properties

Each subtask can independently have:

- Date
- Time
- Duration
- Priority
- Reminder
- Tags
- Progress
- Status
- Notes
- Attachments

---

## 3.3 Subtask Calendar

Each subtask can have its own calendar placement.

Example:

**Project Report**

- Research → Monday
- Methodology → Tuesday
- Results → Wednesday
- Proofreading → Thursday
- Submission → Friday

The parent task shows overall progress while the calendar shows the individual work.

---

## 3.4 Automatic Parent Progress

If a task has 10 subtasks:

- 7 completed
- 2 partially completed
- 1 pending

Habit Hacker calculates overall progress.

The user may optionally override the calculated percentage.

---

## 3.5 Checklist

A checklist is different from a subtask.

Use a checklist for small verification items.

Example:

**Travel**

- Passport
- Wallet
- Charger
- Tickets

Checklist items should be lightweight and should not clutter the main task system.

---

# 4. Recurring Tasks

## 4.1 Recurrence

Tasks can repeat:

- Daily
- Weekdays
- Weekends
- Weekly
- Every 2 weeks
- Monthly
- Yearly
- Custom interval

---

## 4.2 Custom Recurrence

Examples:

- Every 3 days
- Every Monday and Thursday
- Every second Friday
- First Monday of every month
- Last day of every month

---

## 4.3 Recurrence Date Range

A recurring task can have:

- Start date
- End date
- Unlimited duration

Example:

`Learn vocabulary → Every day → Aug 20 to Dec 20`

---

## 4.4 Completion-Based Recurrence

Support two recurrence models:

**Calendar-based**

Repeat every Monday.

**Completion-based**

Repeat one week after completion.

This gives users more control over recurring work.

---

## 4.5 Recurring Task History

Every occurrence should preserve its own history.

Example:

| Date | Result |
|---|---|
| Aug 20 | Completed |
| Aug 21 | Completed |
| Aug 22 | Partial |
| Aug 23 | Skipped |
| Aug 24 | Completed |

---

# 5. Categories, Lists and Tags

## 5.1 Lists

Lists organize tasks into practical groups.

Examples:

- College
- Personal
- Projects
- Learning
- Health

---

## 5.2 Categories

Categories represent broader life areas.

Examples:

- Education
- Career
- Health
- Finance
- Personal

A task should belong to a meaningful category while still being able to carry multiple tags.

---

## 5.3 Folders

Folders group lists/categories.

Example:

```text
COLLEGE
 ├── Subjects
 ├── Assignments
 └── Projects

PERSONAL
 ├── Health
 ├── Finance
 └── Reading
```

---

## 5.4 Tags

Tags provide flexible cross-category classification.

Examples:

- #urgent
- #coding
- #exam
- #deepwork
- #quick
- #important

A task can contain multiple tags.

---

# 6. Smart Views and Filtering

## 6.1 Search

Search should work across:

- Tasks
- Subtasks
- Notes
- Habits
- Projects
- Tags
- Categories

---

## 6.2 Filters

Users can create custom task views.

Examples:

**High priority + due this week**

**Coding + incomplete**

**Tasks under 30 minutes**

**Overdue + required**

---

## 6.3 Smart Lists

A smart list automatically updates according to its rules.

Example:

**Today's Important Tasks**

Conditions:

- Date = Today
- Priority = High/Critical
- Status ≠ Completed

---

# 7. Calendar and Scheduling

## 7.1 Calendar Views

Support:

- Day
- Multi-day
- Week
- Multi-week
- Month
- Year
- Agenda

---

## 7.2 Task Calendar

Scheduled tasks appear directly on the calendar.

Users can move them to another time/day through drag-and-drop.

---

## 7.3 Habit Calendar

Habits can optionally appear alongside tasks.

Users can see:

- Scheduled habits
- Completed habits
- Missed habits

---

## 7.4 Calendar History

Selecting a previous date should show the complete activity for that day:

- Tasks
- Subtasks
- Habits
- Focus sessions
- Notes
- Diary
- Completion records

This turns the calendar into a personal historical record.

---

## 7.5 Time Blocking

Users can assign tasks to exact time blocks.

Example:

`7:00–8:00 PM → Machine Learning`

`8:15–8:45 PM → Vocabulary`

---

## 7.6 Multiple Work Sessions

One task can be worked on over several sessions.

Example:

**Project**

- Monday: 60 min
- Tuesday: 90 min
- Wednesday: 60 min

Total actual work: 3h 30m

---

## 7.7 Schedule Conflict Detection

If two tasks overlap:

`7:00–9:00 PM → Task A`

`8:00–10:00 PM → Task B`

Habit Hacker should clearly indicate the conflict.

---

## 7.8 Capacity-Aware Daily Planning — Differentiating Feature #2

Habit Hacker should not allow the user to blindly overload a day.

Each day should display:

**Available capacity**
vs
**Planned workload**

Example:

`Available: 7h`

`Planned: 9h 30m`

`Overload: 2h 30m`

The system should visually warn:

**This day is overplanned.**

The user can then move, shorten or defer tasks.

This concept is inspired by workload/capacity planning found in productivity systems such as Amazing Marvin, but should be kept simple rather than turning Habit Hacker into a complex project-management system.

---

# 8. Reminders and Alerts

## 8.1 Task Reminders

Support:

- Exact time
- Before task
- Before deadline
- Start reminder
- End reminder

---

## 8.2 Multiple Reminders

Important tasks can have more than one reminder.

Example:

- 1 day before
- 1 hour before
- At deadline

---

## 8.3 Recurring Reminders

Recurring tasks can automatically generate reminders for every occurrence.

---

## 8.4 Overdue Alerts

If a required task passes its deadline:

- Mark overdue
- Display clearly
- Offer rescheduling

---

## 8.5 Daily Planning Reminder

Optional daily reminder:

> Review and plan today's tasks.

---

# 9. Habit Management

## 9.1 Habit Creation

Every habit should support:

- Name
- Description
- Target
- Unit
- Frequency
- Reminder
- Category
- Tags
- Color
- Start date
- End date
- Goal association

---

## 9.2 Habit Frequency

Support:

- Daily
- Specific weekdays
- X times per week
- X times per month
- Every N days
- Custom

---

## 9.3 Habit Types

### Binary

Did it happen?

### Count

5 words.

### Duration

30 minutes.

### Quantity

20 pages.

### Minimum target

At least 30 minutes.

### Maximum target

No more than 30 minutes.

---

## 9.4 Flexible Weekly Habits

Example:

**Exercise 4 times per week**

The user does not have to specify exactly which four days.

If they complete Monday, Tuesday, Thursday and Saturday:

`4/4 → 100%`

---

## 9.5 Habit Streaks

Track:

- Current streak
- Best streak
- Streak history
- Missed periods

---

## 9.6 Habit History

Every check-in should preserve:

- Date
- Target
- Actual value
- Completion percentage
- Status
- Optional note

---

# 10. Heatmaps

## 10.1 Task Completion Heatmap

Show how many tasks were completed each day across a month/year.

---

## 10.2 Habit Heatmap

Show habit consistency across the calendar.

---

## 10.3 Discipline Heatmap

Show daily discipline/completion performance.

Example intensity:

- 0 = no activity
- Low = poor completion
- Medium = moderate
- High = strong
- Excellent = very strong

---

## 10.4 Category Heatmap

Show which areas received the most activity.

Examples:

- Education
- Coding
- Health
- Personal

---

## 10.5 Heatmap Drill-Down

Clicking a day should reveal the underlying activity.

Example:

`August 16`

- 8 tasks completed
- 5 habits completed
- 3 focus sessions
- 82% plan adherence

---

# 11. Notes and Task Documents

## 11.1 Notes

Users can create standalone notes.

Notes should support:

- Rich text
- Headings
- Lists
- Checklists
- Links
- Images

---

## 11.2 Task Attachments

A task can contain:

- PDF
- DOCX
- Images
- Text
- Spreadsheet
- Audio
- Other supported files

---

## 11.3 Task Document

A task can have an evolving document attached to it.

Example:

**Daily Vocabulary**

The user maintains one document containing the five words learned each day.

The document can become a historical knowledge record associated with the recurring task.

---

# 12. Diary and Daily Reflection

## 12.1 Daily Diary

Each date can have an optional diary entry.

Support:

- Rich text
- Images
- Notes
- Attachments
- Date
- Title

---

## 12.2 Daily Reflection

Optional prompts:

- What did I accomplish?
- What went well?
- What went wrong?
- What did I learn?
- What should I improve tomorrow?

---

## 12.3 Calendar Diary History

Calendar dates should visually indicate whether a diary entry exists.

Selecting a date opens the day's diary alongside its tasks and habits.

---

# 13. Focus and Time Tracking

## 13.1 Focus Timer

Users can start a focus session directly from a task.

---

## 13.2 Pomodoro

Support:

- Custom focus duration
- Short break
- Long break
- Session count

---

## 13.3 Stopwatch

Allow free-form time tracking for tasks that do not fit Pomodoro.

---

## 13.4 Actual Time Tracking

Record:

- Start time
- Pause time
- Resume time
- End time
- Total focus duration

---

## 13.5 Task Focus History

Each task can show:

`Estimated: 2h`

`Actual: 2h 35m`

This allows users to improve future estimates.

---

# 14. Productivity Analytics

## 14.1 Task Statistics

Track:

- Tasks created
- Tasks completed
- Tasks skipped
- Tasks overdue
- Tasks deferred
- Partial tasks
- Completion percentage

---

## 14.2 Completion Rate

Calculate:

`Completed Required Tasks / Total Required Tasks × 100`

Optional tasks should be reported separately.

---

## 14.3 On-Time Completion

Measure how many tasks were completed before their deadline.

---

## 14.4 Overdue Analysis

Show:

- Overdue count
- Average overdue duration
- Overdue by category
- Overdue by priority

---

## 14.5 Rescheduling Analysis

Track how often tasks are postponed.

Example:

`Study SQL → postponed 6 times`

This identifies tasks that may be unrealistic or repeatedly avoided.

---

## 14.6 Estimated vs Actual Time

Compare estimated duration against actual time.

Example:

`Estimated: 60 min`

`Average actual: 87 min`

The user can gradually improve planning accuracy.

---

# 15. Discipline System

## 15.1 Daily Discipline Score

Create a simple score based mainly on:

- Required task completion
- On-time completion
- Habit completion
- Plan adherence

The score should not reward simply creating more tasks.

---

## 15.2 Plan Adherence

Measure:

`Completed Planned Work / Planned Work × 100`

Example:

`Planned: 10`

`Completed: 8`

`Plan adherence: 80%`

---

## 15.3 Habit Consistency

Measure:

`Successful Habit Periods / Expected Habit Periods × 100`

---

## 15.4 Daily Scorecard

Example:

**August 16**

- Tasks: 8/10
- Habits: 5/6
- Focus: 3h 20m
- Plan adherence: 82%
- Discipline: 86%

---

# 16. Goals

## 16.1 Goal Creation

Goals should contain:

- Name
- Description
- Start date
- Target date
- Progress
- Category
- Related projects
- Related habits
- Related tasks

---

## 16.2 Goal Progress

Progress can be calculated from:

- Milestones
- Tasks
- Projects
- Numeric targets

---

## 16.3 Goal → Habit → Task Relationship

Example:

**Goal:** Improve English

↓

**Habit:** Learn 5 words/day

↓

**Recurring Task:** Complete today's vocabulary

↓

**Document:** Vocabulary collection

This relationship should be visible from the goal page.

---

# 17. Projects

## 17.1 Project Structure

A project contains:

- Tasks
- Subtasks
- Deadlines
- Progress
- Categories
- Tags
- Milestones

---

## 17.2 Project Progress

Show:

- Total tasks
- Completed tasks
- Remaining tasks
- Overdue tasks
- Completion percentage

---

## 17.3 Project Views

Support:

- List
- Kanban
- Timeline
- Calendar

---

# 18. Kanban

Columns can include:

- Backlog
- Planned
- In Progress
- Blocked
- Review
- Completed

Users can customize columns.

---

# 19. Timeline

Show project tasks across dates.

Example:

```text
Research       █████
Backend            ███████
Frontend                ██████
Testing                       ███
```

Timeline should support moving task dates and durations.

---

# 20. Countdown

Users can create countdowns for:

- Exams
- Birthdays
- Deadlines
- Trips
- Events
- Goals

Example:

`Final Exam — 18 days`

---

# 21. Daily Planning

The daily planning screen should show:

1. Today's calendar
2. Required tasks
3. Habits
4. Deadlines
5. Top priorities
6. Available capacity
7. Planned workload
8. Focus sessions

The user should be able to quickly create a realistic plan.

---

# 22. Daily Review

At the end of the day, show:

- Completed tasks
- Incomplete tasks
- Habits
- Focus time
- Plan adherence
- Discipline
- Diary

The user can move unfinished tasks to another date.

---

# 23. Weekly Review

Show:

- Weekly completion
- Habit consistency
- Focus time
- Discipline
- Overdue tasks
- Most productive category
- Best day
- Weakest day

---

# 24. Monthly Review

Show:

- Monthly task completion
- Habit performance
- Focus hours
- Discipline trend
- Overdue trend
- Goal progress
- Monthly heatmap

---

# 25. Yearly Review

Show:

- Year heatmap
- Total completed tasks
- Total habit completions
- Focus hours
- Best streak
- Best month
- Most consistent habit
- Goal achievements
- Discipline trend

Users should be able to inspect previous years.

---

# 26. Streaks

Track:

- Task streaks
- Habit streaks
- Daily planning streak
- Diary streak

The system should distinguish between:

**Current streak**

and

**Best historical streak**

---

# 27. Achievements

Achievements can recognize meaningful milestones.

Examples:

- First task completed
- 7-day habit streak
- 30-day habit streak
- 100 tasks completed
- 100 focus sessions
- First goal completed
- 100% weekly plan adherence

Gamification should remain optional.

---

# 28. Templates

Templates should exist for:

- Tasks
- Checklists
- Projects
- Routines
- Habits

Example:

**Daily Study Session**

- Review previous material
- Learn new topic
- Practice
- Take notes
- Test yourself

---

# 29. Routines

A routine is a reusable sequence of tasks/habits.

Example:

**Morning Routine**

- Wake up
- Drink water
- Exercise
- Read
- Plan day

A routine should show overall completion while retaining individual items.

---

# 30. Inbox

The Inbox is the fastest place to capture tasks before organizing them.

Example:

`Buy charger`

Later the user can assign:

- Category
- Date
- Priority
- Tag

---

# 31. Quick Add

Quick Add should allow fast creation of:

- Task
- Habit
- Note
- Diary entry
- Checklist

The main goal is minimum friction.

---

# 32. Natural Language Date Entry

Users should be able to write:

`Study Java tomorrow at 7 PM`

and the application should recognize:

- Task name
- Date
- Time

This should complement normal manual scheduling rather than replacing it.

---

# 33. Rescheduling

Users should be able to move tasks:

- Today
- Tomorrow
- Next available day
- Specific date
- Next week

Bulk rescheduling should be supported for multiple selected tasks.

---

# 34. Bulk Operations

Allow multiple tasks to be selected and:

- Complete
- Delete
- Move
- Reschedule
- Change priority
- Change category
- Add/remove tags
- Change list

---

# 35. Task History

Every important task should retain:

- Creation date
- Changes
- Reschedules
- Partial completions
- Completion date
- Status changes

This allows users to understand what happened to a task over time.

---

# 36. Personal Activity History

Maintain a chronological activity record:

- Task completed
- Habit checked
- Note created
- Diary written
- Focus session completed
- Goal updated

The user can review activity for any date.

---

# 37. Today Dashboard

The main dashboard should prioritize clarity.

Recommended sections:

### Today

- Top priorities
- Scheduled tasks
- Habits
- Calendar
- Progress

### Quick metrics

- Completion
- Discipline
- Focus
- Streak

### Quick actions

- Add task
- Add habit
- Start focus
- Write diary

---

# 38. Upcoming Dashboard

Show:

- Tomorrow
- Next 7 days
- Upcoming deadlines
- Upcoming recurring tasks
- Upcoming habits
- Countdowns

---

# 39. Overdue Dashboard

Show overdue items grouped by:

- Priority
- Category
- Age
- Deadline

Example:

`Critical — 2`

`High — 5`

`Medium — 8`

---

# 40. Productivity Trends

Charts should show:

- Tasks completed over time
- Completion percentage
- Habit consistency
- Focus time
- Discipline score
- Overdue tasks
- Plan adherence

---

# 41. Best Productivity Period

Based on historical data, show when the user tends to complete the most work.

Examples:

- Best day
- Best weekday
- Best time of day

This should be descriptive rather than presented as an infallible prediction.

---

# 42. Category Productivity

Show performance by category.

Example:

| Category | Completion |
|---|---:|
| Learning | 91% |
| Coding | 87% |
| Health | 95% |
| Personal | 74% |

This helps identify neglected areas.

---

# 43. Habit Analytics

For each habit show:

- Current streak
- Best streak
- Completion rate
- Target achievement
- Weekly trend
- Monthly trend
- Historical heatmap

---

# 44. Task Difficulty and Friction

Allow users to optionally classify tasks by difficulty.

Recommended:

- Easy
- Medium
- Hard

Analytics can compare completion rates.

Example:

`Hard tasks have a 61% completion rate.`

This helps users break unrealistic tasks into smaller work.

---

# 45. Quick Wins

Provide a view for short tasks.

Example criteria:

`Duration <= 15 minutes`

Useful when the user has limited time.

---

# 46. Backlog / Someday

Keep inactive ideas separate from today's working tasks.

Examples:

- Learn guitar
- Read this book
- Build side project
- Travel somewhere

This prevents the active task list from becoming overloaded.

---

# 47. Focus Mode

When a user starts a task, Habit Hacker can enter a distraction-free screen showing:

- Current task
- Progress
- Timer
- Checklist/subtasks
- Completion controls

Everything else can be hidden.

---

# 48. Custom Dashboard

Users can choose which widgets appear:

- Today's tasks
- Calendar
- Habits
- Heatmap
- Discipline
- Goals
- Focus
- Countdown
- Diary
- Statistics

The dashboard should be customizable without becoming complicated.

---

# 49. Personalization

Support:

- Light/dark mode
- Theme
- Accent color
- Category colors
- Habit colors
- Calendar colors
- Start page
- Week-start day
- Date format
- Time format
- Notification preferences

---

# 50. Notifications

Notifications should cover:

- Upcoming tasks
- Deadlines
- Habit reminders
- Overdue tasks
- Daily planning
- Daily review
- Weekly review

Users should be able to disable each category independently.

---

# 51. Data Backup and Export

Users should be able to export their personal data, including:

- Tasks
- Habits
- Notes
- Diary
- History
- Goals
- Statistics

Backup should preserve historical records rather than only active tasks.

---

# 52. Cross-Platform Synchronization

The same account should maintain synchronized:

- Tasks
- Calendar
- Habits
- Notes
- Diary
- Goals
- History
- Statistics

Changes on one device should appear on the others.

---

# 53. Widgets and Quick Access

Useful widgets:

- Today's tasks
- Add task
- Today's habits
- Habit heatmap
- Calendar
- Countdown
- Focus timer
- Discipline score

Widgets should prioritize quick viewing and completion.

---

# 54. Keyboard and Quick Actions

Desktop/web users should have shortcuts for:

- Add task
- Search
- Complete
- Reschedule
- Start focus
- Open calendar
- Open today
- Navigate dates

---

# 55. Core Search and Organization Rules

The application should make it possible to find a task through any useful property:

- Name
- Date
- Status
- Priority
- Category
- Tag
- Project
- Habit
- Goal

Search and filters should work together.

---

# 56. Product-Level Differentiation

Habit Hacker should **not** try to beat TickTick by adding hundreds of unrelated features.

The product differentiation should be deliberately small and strong.

## Differentiator 1 — Planned Date vs Deadline

Separate:

**When I plan to work**

from

**When it must be finished**

This enables better long-running task planning.

## Differentiator 2 — Capacity-Aware Planning

Show:

**Available time vs planned workload**

before the user overloads a day.

The system should encourage realistic planning instead of rewarding users for filling their calendar.

These two features are enough to provide meaningful differentiation without turning the product into an unnecessarily complex AI/project-management platform.

---

# 57. Final Feature Architecture

The final product can therefore be organized into these modules:

```text
HABIT HACKER
│
├── 01. Dashboard
│
├── 02. Inbox
│
├── 03. Tasks
│   ├── Subtasks
│   ├── Checklists
│   ├── Progress
│   ├── Priority
│   ├── Dates
│   ├── Recurrence
│   ├── Tags
│   └── Attachments
│
├── 04. Projects
│   ├── List
│   ├── Kanban
│   └── Timeline
│
├── 05. Habits
│   ├── Targets
│   ├── Streaks
│   ├── History
│   └── Heatmap
│
├── 06. Calendar
│   ├── Day
│   ├── Week
│   ├── Month
│   ├── Agenda
│   └── Year
│
├── 07. Notes
│
├── 08. Diary
│
├── 09. Goals
│
├── 10. Focus
│
├── 11. Statistics
│
├── 12. Discipline
│
├── 13. Heatmaps
│
├── 14. Countdown
│
├── 15. Templates
│
├── 16. History
│
├── 17. Reviews
│   ├── Daily
│   ├── Weekly
│   ├── Monthly
│   └── Yearly
│
└── 18. Settings
```

---

# 58. Final Product Positioning

Habit Hacker should be positioned as:

> **A focused personal task, habit, calendar and discipline management platform.**

Not:

- An enterprise project-management tool
- An email automation platform
- A CRM
- An AI chatbot
- A communication platform
- A massive integration hub

Its strength should come from doing a small number of personal-productivity functions extremely well.

The essential experience is:

**Create → Schedule → Execute → Track → Review**

with strong connections between:

**Tasks ↔ Subtasks ↔ Habits ↔ Calendar ↔ Goals ↔ Notes ↔ Diary ↔ History ↔ Analytics**

---

# 59. Final Feature Count

The final specification contains **59 focused product capabilities**, covering:

- Task management
- Partial completion
- Quantity targets
- Optional tasks
- Priorities
- Start/end dates
- Planned dates
- Deadlines
- Subtasks
- Subtask scheduling
- Checklists
- Recurring tasks
- Categories
- Tags
- Filters
- Calendar
- Time blocking
- Capacity planning
- Reminders
- Habits
- Habit targets
- Streaks
- Heatmaps
- Notes
- Attachments
- Diary
- Focus
- Pomodoro
- Time tracking
- Statistics
- Discipline
- Goals
- Projects
- Kanban
- Timeline
- Countdown
- Daily/weekly/monthly/yearly reviews
- Templates
- Routines
- Inbox
- Quick Add
- Search
- Rescheduling
- Bulk operations
- History
- Dashboard
- Trends
- Habit analytics
- Difficulty
- Quick wins
- Backlog
- Focus mode
- Custom dashboard
- Personalization
- Notifications
- Backup/export
- Synchronization
- Widgets
- Keyboard shortcuts

---

# 60. Product Principle

The most important rule for Habit Hacker:

> **Every feature must help the user capture, plan, execute, track, review, or improve their personal commitments.**

If a feature does not strengthen one of those six areas, it should not be added merely because another productivity application has it.

The objective is not to create the application with the most features.

The objective is to create the application that gives the user the clearest answer to:

> **What should I do, when should I do it, did I actually do it, and how consistently am I improving?**
