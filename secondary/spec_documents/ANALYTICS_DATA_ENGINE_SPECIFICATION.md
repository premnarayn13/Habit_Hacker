# Habit Hacker — Analytics Data Engine Specification

## 1. Engine Analytical Formulas & Calculations

This document specifies the mathematical models, statistical formulas, pacing engines, and insight rules driving `analyticsEngine.js`.

---

### 1.1 Level 1 & Level 2: Core Metrics & Distributions
* **Overall Completion Rate ($C_r$)**:
  $$C_r = \left( \frac{\text{Completed Logs / Days}}{\text{Total Planned Tasks / Days}} \right) \times 100$$
* **Category Concentration Share ($S_c$)**:
  $$S_c = \left( \frac{\text{Workload in Category } c}{\text{Total Executed Workload}} \right) \times 100$$

---

### 1.2 Level 3 & Level 4: Parent-Subtask Hierarchy & Measure Contributions
* **Subtask Contribution ($W_{sub}$)**:
  - Measurable Subtask: $W_{sub} = \text{loggedValue}$
  - Event Subtask: $W_{sub} = \text{eventCount} \times \text{avgMeasure}$
  - Checkbox Subtask: $W_{sub} = (1 \text{ if completed else } 0) \times \text{avgMeasure}$
* **Parent Daily Total Measure ($M_{parent}$)**:
  $$M_{parent} = \sum_{k=1}^{N} W_{sub, k}$$
* **Mandatory Blocker Failure Contribution ($F_{blocker}$)**:
  $$F_{blocker} = \left( \frac{\text{Missed Days Caused by Subtask } k}{\text{Total Parent Missed Days}} \right) \times 100$$

---

### 1.3 Level 5 & Level 6: Momentum, Volatility & Streak Retention
* **Momentum Index ($M_i$)**:
  $$M_i = \text{Avg Completion (Recent 7 Days)} - \text{Avg Completion (Previous 30-Day Baseline)}$$
  - Classifications:
    - $M_i \ge +10\%$: **Accelerating**
    - $+3\% \le M_i < +10\%$: **Improving**
    - $-3\% < M_i < +3\%$: **Stable**
    - $-10\% < M_i \le -3\%$: **Weakening**
    - $M_i \le -10\%$: **Declining**
* **Streak Retention Survival ($R_d$)**:
  $$R_d = \left( \frac{\text{Count of Streaks } \ge d \text{ Days}}{\text{Total Initiated Streaks}} \right) \times 100 \quad \text{for } d \in \{1, 3, 7, 14, 30\}$$

---

### 1.4 Level 7: Pacing, Feasibility & Forecasting Engine
* **Required Daily Pace ($P_{req}$)**:
  $$P_{req} = \frac{\text{Target Count} - \text{Current Count}}{\text{Remaining Days}}$$
* **Mathematical Feasibility Flag ($IsFeasible$)**:
  $$IsFeasible = \begin{cases} \text{FALSE} & \text{if } \text{Remaining Days} < (\text{Target Days} - \text{Current Days}) \text{ in } count\_days \text{ mode} \\ \text{TRUE} & \text{otherwise} \end{cases}$$
* **Projected Completion Date ($D_{projected}$)**:
  $$D_{projected} = \text{Today} + \left( \frac{\text{Remaining Target}}{\text{Historical 14-Day Average Pace}} \right) \text{ Days}$$

---

### 1.5 Level 8: Evidence-Backed Insight Generation Rules
1. **Bottleneck Insight**: Triggered when a single mandatory subtask accounts for $>35\%$ of parent failures.
2. **Workload Overload Insight**: Triggered when planned daily workload exceeds capacity (480 mins) on $\ge 3$ days.
3. **Priority Inversion Insight**: Triggered when Low priority completion rate exceeds Critical priority completion rate by $>15\%$.
4. **Feasibility Alert**: Triggered when $IsFeasible === \text{FALSE}$.
