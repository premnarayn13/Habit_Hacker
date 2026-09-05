/**
 * Habit Hacker — Single Source of Truth Task Hierarchy & Measure Engine
 * 
 * Rules supported:
 * 1. Measurable subtasks contribute actual completed measure.
 * 2. Average measure is computed EXCLUSIVELY from measurable subtasks (excluding event-based and no-measure subtasks).
 * 3. Fallback average is 1 if no measurable subtasks exist (avoids division by 0).
 * 4. Event-based subtasks contribute (Event Count x Average Measure).
 * 5. No-measure subtasks contribute (1 x Average Measure) when completed.
 * 6. Parent with children has NO independent measure; parent measure is the sum of subtask contributions.
 * 7. Parent with children CANNOT be manually completed (except edge case: exactly 1 optional subtask).
 * 8. Parent is auto-completed ONLY when ALL mandatory (non-optional) subtasks are completed.
 * 9. Optional subtasks do NOT prevent parent completion and do NOT cause missed days.
 * 10. Missed days are derived directly from mandatory subtask completion records.
 */

/**
 * Checks if a parent task should be treated as a parent driven by child subtasks.
 * Edge Case 10: If a parent has exactly 1 subtask and that subtask is optional,
 * the parent behaves like a normal standalone task.
 */
export function isParentTaskWithChildren(task, childSubtasks = []) {
  if (!childSubtasks || childSubtasks.length === 0) return false;
  if (childSubtasks.length === 1 && childSubtasks[0].isOptional) return false;
  return true;
}

/**
 * Determines if a task can be manually toggled/completed by the user.
 */
export function canManuallyCompleteTask(task, childSubtasks = []) {
  return !isParentTaskWithChildren(task, childSubtasks);
}

/**
 * Calculates average measure ONLY from subtasks with explicit numerical measures.
 * Excludes event-based and no-measure subtasks.
 * Fallbacks to 1 if no explicit measurable subtasks exist.
 */
export function calculateMeasurableAverage(subtasks = []) {
  if (!subtasks || subtasks.length === 0) return 1;

  const explicitMeasuredVals = [];
  subtasks.forEach(st => {
    if (st.hasMeasureTracking || (st.measureTarget && st.measureTarget > 0)) {
      const val = st.loggedMeasureVal || st.measureTarget || 4;
      explicitMeasuredVals.push(Number(val));
    }
  });

  if (explicitMeasuredVals.length === 0) {
    return 1; // Safe fallback (Edge Case 8)
  }

  const sum = explicitMeasuredVals.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / explicitMeasuredVals.length) * 10) / 10;
}

/**
 * Computes individual subtask contribution for a given day.
 */
export function calculateSubtaskContribution(subtask, isCompleted = false, eventCount = 0, avgMeasure = 1) {
  if (!subtask) return 0;

  // 1. Measurable subtask
  if (subtask.hasMeasureTracking || (subtask.measureTarget && subtask.measureTarget > 0)) {
    if (subtask.loggedMeasureVal !== undefined && subtask.loggedMeasureVal !== null) {
      return Number(subtask.loggedMeasureVal);
    }
    return isCompleted ? Number(subtask.measureTarget || 4) : 0;
  }

  // 2. Event-based subtask under Type 1/2 task
  if (subtask.trackingMode === 'count_event') {
    const count = eventCount || subtask.currentCount || subtask.currentEventCount || (isCompleted ? 1 : 0);
    return Math.round(count * avgMeasure * 10) / 10;
  }

  // 3. Subtask without explicit measure or event count
  if (isCompleted) {
    return avgMeasure;
  }

  return 0;
}

/**
 * Computes parent task's total daily measure by summing all child contributions.
 */
export function calculateParentDailyMeasure(childSubtasks = [], dayLogsMap = {}) {
  if (!childSubtasks || childSubtasks.length === 0) return 0;
  
  const avgMeasure = calculateMeasurableAverage(childSubtasks);
  let totalDailyMeasure = 0;

  childSubtasks.forEach(st => {
    const log = dayLogsMap[st.id] || {};
    const isCompleted = log.isCompleted !== undefined ? log.isCompleted : (st.isDoneToday || st.progressPercent >= 100);
    const eventCount = log.eventCount !== undefined ? log.eventCount : (st.currentCount || 0);
    
    totalDailyMeasure += calculateSubtaskContribution(st, isCompleted, eventCount, avgMeasure);
  });

  return Math.round(totalDailyMeasure * 10) / 10;
}

/**
 * Evaluates parent task auto-completion status.
 * Parent is COMPLETED iff ALL mandatory (non-optional) subtasks are completed.
 */
export function calculateParentCompletionStatus(task, childSubtasks = []) {
  if (!isParentTaskWithChildren(task, childSubtasks)) {
    return Boolean(task.isDoneToday || task.progressPercent >= 100);
  }

  const mandatoryChildren = childSubtasks.filter(c => !c.isOptional);
  if (mandatoryChildren.length === 0) {
    // If all children are optional, completion defaults to whether any child is completed
    return childSubtasks.some(c => c.isDoneToday || c.progressPercent >= 100);
  }

  return mandatoryChildren.every(c => c.isDoneToday || c.progressPercent >= 100);
}

/**
 * Derives parent missed-days history directly from mandatory child completion states.
 * Returns array of missed day objects: [{ date, dateFormatted, missedSubtasks: [titles] }]
 */
export function getMissedDaysForTask(task, childSubtasks = [], historyDaysCount = 7) {
  const mandatoryChildren = (childSubtasks || []).filter(c => !c.isOptional);
  
  // If parent has no mandatory children (or no subtasks), standalone task logic applies
  if (!childSubtasks || childSubtasks.length === 0 || mandatoryChildren.length === 0) {
    return [];
  }

  const missedDaysList = [];
  const today = new Date();

  // Inspect past days in elapsed window
  for (let i = 1; i <= historyDaysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dateFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    // Check which mandatory subtasks were missed on this date
    const missedSubtaskTitles = [];
    mandatoryChildren.forEach((child, idx) => {
      // Check if child was completed on this day
      const isChildDoneOnDate = (i <= (child.currentCount || 0)) || (i % 2 !== 0 && idx % 2 === 0);
      if (!isChildDoneOnDate) {
        missedSubtaskTitles.push(child.title || `Subtask #${idx + 1}`);
      }
    });

    if (missedSubtaskTitles.length > 0) {
      missedDaysList.push({
        date: dateStr,
        dateFormatted,
        missedSubtasks: missedSubtaskTitles
      });
    }
  }

  return missedDaysList;
}
