# HABIT HACKER — COMPLETE PROJECT SPECIFICATION & TECHNICAL ARCHITECTURE

## 📌 Executive Summary

**Habit Hacker** is an advanced, mobile-first personal productivity intelligence platform and task execution system. Built with React, Vite, Vanilla CSS, and Supabase PostgreSQL, it bridges the gap between daily task execution, complex hierarchical task planning, measurable habit tracking, and high-level productivity intelligence.

Unlike generic todo applications, Habit Hacker enforces strict parent-subtask completion mechanics, supports multi-modal task tracking (Date Ranges, Day Counts, Event Counts), tracks measurable quantities (pages read, questions solved, minutes exercised), and provides an observational **Master Home Dashboard** alongside an actionable **Today Command Center**.

---

## 🎯 Core Product & Architectural Philosophy

### 1. View & Interaction Boundaries
- **Home Dashboard (`HomeDashboardView.jsx`)**: **VIEW → UNDERSTAND → EXPLORE**
  - Strictly read-only productivity intelligence layer.
  - Zero task toggles, edit buttons, or log buttons.
  - Clicking any element navigates to specialized execution or detail pages.
- **Today Dashboard (`TodayDashboard.jsx`)**: **EXECUTE & LOG**
  - Daily execution command center for completing tasks, logging measure amounts, and monitoring daily performance.
- **Tasks & Subtasks View (`TaskSubtaskView.jsx`)**: **MANAGE & CONFIGURE**
  - Full CRUD task lifecycle management, parent-subtask mapping, drag-and-drop hierarchy configuration, and category filtering.
- **Dedicated Task Page (`TaskDedicatedPageView.jsx`)**: **INSPECT & DRILL DOWN**
  - Full-screen deep inspection of parent/subtask relationships, measure history, and event contribution logs (triggered on double-clicking any task).

### 2. Task Hierarchy & Completion Engine (`taskHierarchyEngine.js`)
- **Parent-Subtask Relationship**: Tasks can act as standalone root items or as parent tasks containing child subtasks.
- **Completion Rules**:
  - A parent task is considered **Completed** if and only if **all mandatory subtasks** are complete.
  - **Optional Subtasks** do NOT block parent task completion. If all mandatory subtasks are checked, the parent task turns completed even if an optional subtask remains pending.
  - Standalone tasks (no child subtasks) are completed via manual check-off or measure target attainment.

### 3. Task Tracking Modes
1. **Start-End Date (`end_date`)**:
   - Scheduled within a specific calendar range (`plannedStart` to `plannedEnd`).
2. **Day Count (`count_days`)**:
   - Target number of days required for task completion (e.g. 30 Days of Habit Execution).
3. **Event Count (`count_event`)**:
   - Target event accumulation mode (e.g., 10 LeetCode Contests). Logs incremental event contributions from child subtasks.

### 4. Measurable Work Support
- Tasks can record numeric measure targets and log values (e.g., Target: 15 Problems; Unit: `questions`; Logged: 4 Problems).
- On checking off a measurable task in Today page, a measure modal prompts the user to enter the logged numerical value.

---

## 📱 Visual Design System & Palette

- **Dominant Canvas**: Pure Clean White (`#FFFFFF`) with subtle background slate (`#F8FAFC`).
- **Primary Accent**: Habit Hacker Red (`#DC2626` / `#B91C1C` / `#EF4444`).
- **Neutral Hierarchy**: Dark Slate (`#0F172A`), Slate Grays (`#475569`, `#64748B`, `#94A3B8`, `#CBD5E1`, `#E2E8F0`).
- **Semantic Accents (Used Sparingly)**:
  - Green (`#16A34A` / `#DCFCE7`): Completion, streak milestones, success states.
  - Amber (`#D97706` / `#FFFBEB`): Upcoming warnings, pending workload.
  - Purple (`#7E22CE` / `#FAF5FF`): Event-count analytics.
  - Blue (`#2563EB` / `#EFF6FF`): Date range tasks & mandatory subtask metrics.

---

## 🏛️ Comprehensive View Architecture

```
                               ┌────────────────────────────────┐
                               │     Sidebar Navigation Drawer  │
                               │   Dynamic Categories + Icons   │
                               └───────────────┬────────────────┘
                                               │
          ┌────────────────────────────────────┼────────────────────────────────────┐
          ▼                                    ▼                                    ▼
┌──────────────────┐                 ┌──────────────────┐                 ┌──────────────────┐
│   MASTER HOME    │                 │ TODAY DASHBOARD  │                 │ TASKS & SUBTASKS │
│  (Read-Only)     │                 │   (Execution)    │                 │   (Management)   │
└─────────┬────────┘                 └─────────┬────────┘                 └─────────┬────────┘
          │                                    │                                    │
          └────────────────────────────────────┼────────────────────────────────────┘
                                               │ Double-Click Task
                                               ▼
                                 ┌──────────────────────────┐
                                 │ DEDICATED TASK INFO PAGE │
                                 │ (Deep Task Inspection)   │
                                 └──────────────────────────┘
```

### 1. Master Home Dashboard (`HomeDashboardView.jsx`)
- **Global Time Selector**: `Today` | `This Week` | `This Month` | `This Year` | `All Time`.
- **Master Productivity Snapshot**: Deterministic Productivity Score (0-100 gauge), Active Tasks, Completed Tasks, Pending Tasks, Completion Rate %.
- **Task Inventory & Hierarchy Health**: Parent vs Subtask counts, Mandatory vs Optional breakdown, Blocked Parents count.
- **Task Type Matrix**: Performance & completion rates for Date Range, Day Count, and Event Count tasks.
- **Category Intelligence**: Category task distribution %, Strongest Area, Needs Attention, Most Active Area.
- **Consistency Heatmap**: 12-week GitHub-style activity matrix with cell intensity.
- **Streaks & Momentum**: Current Streak (🔥), Longest Streak, Average Streak, Weekly Momentum (↑ X pts).
- **Measures & Event Progress**: Accumulated questions solved, pages read, exercise minutes, study hours, event targets.
- **Workload & Missed Activity**: Missed days count, missed subtasks, affected parent tasks, net workload growth (+4).
- **Upcoming Schedule & Routines**: Chronological upcoming tasks list and recurring routine adherence.
- **Performance Patterns & System Insights**: Peak time of day (Afternoon, Morning, Evening), best/lowest performance days, streak goals, and dynamic AI-style system insights.

### 2. Today Dashboard (`TodayDashboard.jsx`)
- **Header & Date Navigation**: `‹ Previous | Today | Next ›`.
- **Section 1: Daily Tasks Overview**: Complete list of parent tasks and nested subtasks for today with inline completion dropdowns and double-click navigation.
- **Section 2: Pending Tasks**: Filtered view showing pending task names, quick completion triggers, and measure editing modal triggers.
- **Section 3: Category-Wise Breakdown**: Hierarchical category groupings.
- **Section 4: Completed Tasks Archive**: Finished task list (kept bold and fully legible without line-through strikethroughs).
- **Section 5: Task Type Schedule Performance & Statistical Insights**: Single-row side-by-side performance cards for Date Range, Day Count, and Event Count tasks + workload analytics.

### 3. Tasks & Subtasks View (`TaskSubtaskView.jsx`)
- Full task repository management with filter pickers (Status, Priority, Category, Task Type).
- Drag-and-drop or modal parent-subtask mapping and unmapping.
- Quick task creation modal with parameters (tracking mode, priority, category, measure units, target counts).

### 4. Dedicated Task Page (`TaskDedicatedPageView.jsx`)
- Opened whenever any parent task or subtask is **double-clicked** across the application.
- Displays complete task metadata, parent-child links, measure logging history, event breakdown, subtask contribution bars, and progress timeline.

### 5. Sidebar Drawer & Category Creator (`SidebarDrawer.jsx`)
- Dynamic category extraction from active system tasks (`Academics`, `Coding`, `Fitness`, `Health`, `Education`, `Work`, `Personal`, `General`, `Shopping`, `Learning`).
- **40-Icon Lucide Grid Step Picker**: Allows users to create custom categories, choose from a palette of 40 Lucide icons (`Briefcase`, `GraduationCap`, `Code`, `Activity`, `Heart`, `Smile`, `Coffee`, `Music`, `Camera`, `DollarSign`, `Globe`, `Terminal`, `Laptop`, `Palette`, `Utensils`, `Shield`, `Cpu`, `Sparkles`, `PhoneCall`, etc.), and persist them to `localStorage`.

---

## 🗄️ Database & Supabase Schema Architecture

The backend database is hosted on Supabase PostgreSQL with Row Level Security (RLS). Key schemas include:

### `tasks` Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'General',
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    tracking_mode VARCHAR(30) CHECK (tracking_mode IN ('end_date', 'count_days', 'count_event')),
    planned_start DATE,
    planned_end DATE,
    target_count INT DEFAULT 1,
    current_count INT DEFAULT 0,
    has_measure_tracking BOOLEAN DEFAULT FALSE,
    measure_target NUMERIC(10, 2) DEFAULT 0.00,
    measure_unit VARCHAR(50) DEFAULT 'units',
    logged_measure_val NUMERIC(10, 2) DEFAULT 0.00,
    is_optional BOOLEAN DEFAULT FALSE,
    is_done_today BOOLEAN DEFAULT FALSE,
    progress_percent INT DEFAULT 0,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    recurrence_pattern VARCHAR(50) DEFAULT 'Daily',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Additional System Tables
- `event_count_logs`: Stores incremental event log entries per subtask/task.
- `missed_days_logs`: Records missed task occurrences and daily compliance logs.
- `habits`: Stores habit streak counts and check-in history.
- `daily_reflections`: Stores journal entries, mood scores, and daily reflection logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Functional Components, Hooks, `useMemo`, `useState`, `useEffect`) |
| **Build Tool & Server** | Vite 5.4 |
| **Styling** | Vanilla CSS Design System with HSL tokens, glassmorphism panels, and CSS Grid/Flexbox |
| **Icons** | Lucide React (40+ curated icons) |
| **Backend & Database** | Supabase PostgreSQL, Auth, and Realtime Subscriptions |
| **Version Control** | Git & GitHub (`premnarayn13/Habit_Hacker`) |

---

## 🚀 Running & Building Locally

### Development Server
```bash
cd mobile
npm run dev
# Server running at http://localhost:3000/
```

### Production Build
```bash
cd mobile
npm run build
```

---

## 📜 Repository Information
- **Repository**: `premnarayn13/Habit_Hacker`
- **Branch**: `main`
- **Main Components**:
  - `mobile/src/App.jsx`
  - `mobile/src/components/HomeDashboardView.jsx`
  - `mobile/src/components/TodayDashboard.jsx`
  - `mobile/src/components/TaskSubtaskView.jsx`
  - `mobile/src/components/TaskDedicatedPageView.jsx`
  - `mobile/src/components/SidebarDrawer.jsx`
  - `mobile/src/lib/taskHierarchyEngine.js`
