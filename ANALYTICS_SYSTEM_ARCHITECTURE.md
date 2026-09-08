# Habit Hacker — Analytics Intelligence System Architecture

## 1. Architectural Overview & System Design

The **Habit Hacker Analytics Intelligence System** serves as the central brain and deepest statistical intelligence layer of the application. It transforms raw database records from PostgreSQL into statistical information, cross-relational patterns, failure root-cause analysis, workload capacity modeling, and evidence-backed human-readable insights.

```
+-----------------------------------------------------------------------------------+
|                            POSTGRESQL / SUPABASE DATA                             |
| tasks | subtasks | task_logs | subtask_logs | event_logs | current_event_state     |
| task_archive_logs | habits | capacity_settings | reflections_diary | goals       |
| view_parent_task_missed_days | v_subtask_failure_summary                          |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                 ANALYTICS INTELLIGENCE ENGINE (analyticsEngine.js)                |
| - Filter & Time Window Aggregator      - Subtask & Blocker Forensics              |
| - Level 1: Raw Performance & Totals    - Workload & Capacity Utilization          |
| - Level 2: Category & Priority Spatial - Event Velocity & Segmented Composition   |
| - Level 3: Consistency & Output        - Cross-Relational Correlation Engine      |
| - Level 4: Parent Hierarchy & Misses   - Mathematical Pacing & Risk Forecast      |
| - Level 5: Momentum & Volatility       - Evidence-Backed Insight Generator        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|               REACT UI LAYER (AnalyticsIntelligenceView.jsx)                      |
| - Executive Command Bar & Filter Deck   - Hierarchy Forensics & Failure Pareto    |
| - Automatic Insight Cards (Why?)        - Workload vs Capacity Sweet Spot         |
| - Interactive Productivity Pulse        - Multi-Dimensional Cross Explorer        |
| - Category & Task Performance Matrix    - Risk & Forecast Center                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core UI Component Breakdown & Layout Hierarchy

The UI is constructed as a narrative analytical workspace using the **Executive Red, White & Gold** theme (`#DC2626`, `#F59E0B`, `#FFFFFF`, `#F8FAFC`, `#0F172A`).

```
+-----------------------------------------------------------------------------------+
| 1. GLOBAL COMMAND CENTER                                                          |
| Time Picker [7D | 30D | 90D | YTD | ALL] | Compare [Prev Period] | Category/Mode Filter|
+-----------------------------------------------------------------------------------+
| 2. EXECUTIVE OVERVIEW METRICS                                                     |
| Completion % | Output Total | Missed Work | Active Streak | Capacity Load | Risk Count|
+-----------------------------------------------------------------------------------+
| 3. AUTOMATIC EVIDENCE-BACKED PRODUCTIVITY INSIGHTS                                |
| [Top Strength Card] [Top Bottleneck Card] [Workload Insight] [Risk/Forecast Card] |
+-----------------------------------------------------------------------------------+
| 4. PRODUCTIVITY PULSE (TIME SERIES CHART)                                         |
| [Toggle Metric: Completion % | Output | Workload | Missed Work | Capacity]        |
+-----------------------------------------------------------------------------------+
| 5. CATEGORY INTELLIGENCE & CONCENTRATION PARETO                                   |
| [Category Rankings] | [Category x Weekday Matrix] | [Pareto Effort Concentration] |
+-----------------------------------------------------------------------------------+
| 6. TASK PERFORMANCE MATRIX & QUADRANTS                                            |
| [Best/Worst Task Rankings] | [Quadrant Scatter: Completion vs Workload]            |
+-----------------------------------------------------------------------------------+
| 7. PARENT-SUBTASK HIERARCHY FORENSICS & FAILURE PARETO                            |
| [Hierarchy Tree Breakdown] | [Mandatory Subtask Blocker Ranking]                  |
+-----------------------------------------------------------------------------------+
| 8. MISSED-DAY INTELLIGENCE & RECOVERY                                             |
| [Missed Days Timeline] | [Day-of-Week Failures] | [Recovery Time After Misses]     |
+-----------------------------------------------------------------------------------+
| 9. STREAK LAB & SURVIVAL CURVE                                                    |
| [Streak Leaderboard] | [Streak Retention Curve: 1d -> 3d -> 7d -> 14d -> 30d]     |
+-----------------------------------------------------------------------------------+
| 10. WORKLOAD & CAPACITY UTILIZATION                                               |
| [Planned Work vs 480m Capacity] | [Overcommitment Alerts] | [Sweet Spot Range]   |
+-----------------------------------------------------------------------------------+
| 11. MEASUREMENT & EVENT INTELLIGENCE                                              |
| [Unit Output Velocity] | [Segmented Event Composition] | [Transient Event Work]   |
+-----------------------------------------------------------------------------------+
| 12. MULTI-DIMENSIONAL CROSS-RELATIONAL EXPLORER                                  |
| [X-Axis vs Y-Axis Explorer] | [Correlation Heatmap Matrix]                       |
+-----------------------------------------------------------------------------------+
| 13. RISK, PACING & MATHEMATICAL FORECAST CENTER                                   |
| [Pace Deficit Alerts] | [Feasibility Warnings] | [Projected Completion Dates]      |
+-----------------------------------------------------------------------------------+
| 14. PERSONAL RECORDS & MILESTONES WALL OF FAME                                    |
| [Best Day] | [Highest Output] | [Longest Streak] | [Most Improved Category]      |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Integration & Pipeline Architecture

1. **Supabase Real-Time Queries**:
   - `tasks`: Fetches task metadata, tracking modes, categories, target counts, priority, and parent links.
   - `subtasks`: Fetches mandatory/optional classification, estimated minutes, priority.
   - `task_logs` & `subtask_logs`: Fetches daily completion, logged measure values, and notes.
   - `event_logs` & `current_event_state`: Fetches finalized event history and active event work.
   - `task_archive_logs`: Fetches pause durations and unarchive extensions.
   - `view_parent_task_missed_days`: Fetches aggregated parent missed days and missing mandatory subtasks.
   - `v_subtask_failure_summary`: Fetches subtask failure rates.
   - `goals`, `habits`, `capacity_settings`, `reflections_diary`: Ingested as secondary contextual dimensions.

2. **State Management & Caching**:
   - `useMemo` hooks inside `analyticsEngine.js` prevent redundant re-computations during UI filter changes.
