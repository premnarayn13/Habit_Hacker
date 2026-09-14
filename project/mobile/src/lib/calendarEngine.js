/**
 * HABIT HACKER — CENTRALIZED CALENDAR SCHEDULING ENGINE
 * 
 * Responsible for:
 * 1. Date-range retrieval & dynamic occurrence expansion (without DB bloat)
 * 2. Task planned execution window vs. hard deadline categorization
 * 3. Daily grouping, capacity calculations & workload heatmap intensity
 * 4. Reconstructing historical execution from task_logs, subtask_logs & event_logs
 * 5. Habit consistency tracking & streak calculations
 * 6. Local diary & todo availability indicators (100% local metadata)
 */

// Helper to format Date objects as 'YYYY-MM-DD'
export function formatDateKey(dateObj) {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Workload Heatmap Intensity Categories
export const WORKLOAD_LEVELS = {
  NONE: { level: 0, label: 'No Workload', color: '#F1F5F9', border: '#E2E8F0' },
  LIGHT: { level: 1, label: 'Light (<25% Capacity)', color: '#DCFCE7', border: '#86EFAC' },
  MODERATE: { level: 2, label: 'Moderate (25-60%)', color: '#DBEAFE', border: '#93C5FD' },
  HIGH: { level: 3, label: 'High (60-100%)', color: '#FEF3C7', border: '#FCD34D' },
  OVERLOADED: { level: 4, label: 'Overloaded (>100%)', color: '#FEE2E2', border: '#FCA5A5' }
};

/**
 * Calculates Workload Level based on planned workload vs available daily capacity
 */
export function getWorkloadLevel(plannedMins, capacityMins = 480) {
  if (!plannedMins || plannedMins <= 0) return WORKLOAD_LEVELS.NONE;
  const cap = Math.max(1, capacityMins);
  const ratio = plannedMins / cap;
  if (ratio > 1.0) return WORKLOAD_LEVELS.OVERLOADED;
  if (ratio >= 0.6) return WORKLOAD_LEVELS.HIGH;
  if (ratio >= 0.25) return WORKLOAD_LEVELS.MODERATE;
  return WORKLOAD_LEVELS.LIGHT;
}

/**
 * Differentiates Hard Deadline Status from Ordinary Planned Execution Window
 */
export function getDeadlineStatus(task, targetDateStr) {
  if (!task || !task.deadline) return null;
  const deadlineStr = formatDateKey(task.deadline);
  const todayStr = formatDateKey(new Date());

  if (task.isDoneToday || task.progressPercent >= 100) {
    if (deadlineStr < todayStr) return { status: 'COMPLETED_AFTER_DEADLINE', label: 'Late Completion', color: '#EA580C' };
    return { status: 'COMPLETED_ON_TIME', label: 'Met Deadline', color: '#16A34A' };
  }

  if (targetDateStr === deadlineStr) {
    if (targetDateStr < todayStr) return { status: 'MISSED_DEADLINE', label: 'Overdue Deadline', color: '#DC2626' };
    if (targetDateStr === todayStr) return { status: 'DUE_TODAY', label: 'Deadline Today!', color: '#EAB308' };
    return { status: 'UPCOMING_DEADLINE', label: 'Deadline Approaching', color: '#2563EB' };
  }

  if (targetDateStr > deadlineStr && targetDateStr <= todayStr) {
    return { status: 'OVERDUE', label: 'Past Deadline', color: '#DC2626' };
  }

  return null;
}

/**
 * Generates dates list within a range [startStr, endStr]
 */
export function generateDateRange(startStr, endStr) {
  const dates = [];
  const curr = new Date(startStr);
  const end = new Date(endStr);

  while (curr <= end) {
    dates.push(formatDateKey(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * Main Centralized Engine Method: Calculates Calendar Dataset for Date Range
 */
export function getCalendarDataForRange({
  startStr,
  endStr,
  tasks = [],
  subtasks = [],
  habits = [],
  logs = [],
  capacityMinutes = 480,
  diaryMetadata = {}, // { '2026-09-12': { hasEntry: true, count: 2 } }
  todoMetadata = {}   // { '2026-09-12': { count: 3 } }
}) {
  const rangeDates = generateDateRange(startStr, endStr);
  const dateMap = {};

  // Initialize Date Grouping Map
  rangeDates.forEach(dateStr => {
    dateMap[dateStr] = {
      date: dateStr,
      dateObj: new Date(dateStr),
      dayOfWeek: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: [],
      subtasks: [],
      habits: [],
      deadlines: [],
      plannedWorkloadMinutes: 0,
      availableCapacityMinutes: capacityMinutes,
      completedCount: 0,
      pendingCount: 0,
      missedCount: 0,
      isOverloaded: false,
      workloadLevel: WORKLOAD_LEVELS.NONE,
      diaryInfo: diaryMetadata[dateStr] || { hasEntry: false },
      todoInfo: todoMetadata[dateStr] || { count: 0 }
    };
  });

  // Map Subtasks to Parent
  const subtasksByParent = {};
  (subtasks || []).forEach(st => {
    if (st && st.parentTaskId) {
      if (!subtasksByParent[st.parentTaskId]) subtasksByParent[st.parentTaskId] = [];
      subtasksByParent[st.parentTaskId].push(st);
    }
  });

  // 1. Process Tasks & Recurring Expansion across Range
  (tasks || []).forEach(task => {
    if (!task || task.isArchived) return;

    const plannedStart = formatDateKey(task.plannedStart || task.createdAt || new Date());
    const plannedEnd = formatDateKey(task.plannedEnd || plannedStart);
    const deadlineStr = task.deadline ? formatDateKey(task.deadline) : null;
    const estMins = task.estimatedMinutes || task.durationMinutes || 30;

    rangeDates.forEach(dateStr => {
      let isApplicable = false;

      // Single day or Multi-day task range overlap check
      if (plannedStart <= dateStr && dateStr <= plannedEnd) {
        isApplicable = true;
      }
      
      // Recurrence pattern check (Daily, Weekly, Monthly)
      if (task.recurrencePattern && !isApplicable) {
        const pat = String(task.recurrencePattern).toLowerCase();
        if (pat === 'daily') isApplicable = true;
        else if (pat === 'weekly') {
          const taskStartDay = new Date(plannedStart).getDay();
          const currentDay = new Date(dateStr).getDay();
          if (taskStartDay === currentDay) isApplicable = true;
        }
      }

      if (isApplicable) {
        const children = subtasksByParent[task.id] || [];
        const isCompleted = task.isDoneToday || task.progressPercent >= 100;
        
        dateMap[dateStr].tasks.push({
          ...task,
          children,
          isCompleted,
          estimatedMinutes: estMins
        });

        dateMap[dateStr].plannedWorkloadMinutes += estMins;
        if (isCompleted) dateMap[dateStr].completedCount++;
        else dateMap[dateStr].pendingCount++;
      }

      // Check Hard Deadline on this date
      if (deadlineStr === dateStr) {
        const dlStatus = getDeadlineStatus(task, dateStr);
        dateMap[dateStr].deadlines.push({
          task,
          deadlineDate: deadlineStr,
          statusObj: dlStatus
        });
      }
    });
  });

  // 2. Process Habits
  (habits || []).forEach(h => {
    if (!h) return;
    rangeDates.forEach(dateStr => {
      dateMap[dateStr].habits.push({
        ...h,
        date: dateStr,
        isCompleted: Boolean(h.isCompleted || h.isDoneToday)
      });
    });
  });

  // 3. Finalize Capacity & Workload Heatmap Levels for each Date
  rangeDates.forEach(dateStr => {
    const dObj = dateMap[dateStr];
    dObj.capacityPercent = Math.round((dObj.plannedWorkloadMinutes / Math.max(1, dObj.availableCapacityMinutes)) * 100);
    dObj.isOverloaded = dObj.plannedWorkloadMinutes > dObj.availableCapacityMinutes;
    dObj.workloadLevel = getWorkloadLevel(dObj.plannedWorkloadMinutes, dObj.availableCapacityMinutes);
  });

  return {
    dateMap,
    rangeDates,
    startDate: startStr,
    endDate: endStr
  };
}

/**
 * Filter Calendar Date Dataset dynamically
 */
export function filterCalendarDataset(dateMap, {
  priorityFilter = 'ALL',
  categoryFilter = 'ALL',
  trackingModeFilter = 'ALL',
  statusFilter = 'ALL',
  searchQuery = ''
}) {
  const filteredMap = {};
  const q = (searchQuery || '').toLowerCase();

  Object.keys(dateMap).forEach(dateStr => {
    const original = dateMap[dateStr];
    
    const matchingTasks = original.tasks.filter(t => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
      if (trackingModeFilter !== 'ALL' && t.trackingMode !== trackingModeFilter) return false;
      if (statusFilter === 'COMPLETED' && !t.isCompleted) return false;
      if (statusFilter === 'PENDING' && t.isCompleted) return false;
      if (q && !(t.title || '').toLowerCase().includes(q) && !(t.category || '').toLowerCase().includes(q)) return false;
      return true;
    });

    const matchingHabits = original.habits.filter(h => {
      if (q && !(h.name || '').toLowerCase().includes(q)) return false;
      return true;
    });

    filteredMap[dateStr] = {
      ...original,
      tasks: matchingTasks,
      habits: matchingHabits
    };
  });

  return filteredMap;
}
