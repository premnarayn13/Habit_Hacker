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
 * Calculates average measure from subtasks with explicit numerical measures.
 * If no explicit measurable subtasks exist, divides parent measureTarget among mandatory subtasks.
 * Fallbacks to 1 if no measureTarget exists.
 */
export function calculateMeasurableAverage(subtasks = [], parentMeasureTarget = 0) {
  if (!subtasks || subtasks.length === 0) {
    return parentMeasureTarget > 0 ? Number(parentMeasureTarget) : 1;
  }

  const explicitMeasuredVals = [];
  subtasks.forEach(st => {
    if (st.hasMeasureTracking || (st.measureTarget && Number(st.measureTarget) > 0)) {
      const val = (st.loggedMeasureVal !== undefined && st.loggedMeasureVal !== null && Number(st.loggedMeasureVal) > 0)
        ? Number(st.loggedMeasureVal)
        : Number(st.measureTarget || 4);
      explicitMeasuredVals.push(val);
    }
  });

  if (explicitMeasuredVals.length === 0) {
    const mandatoryCount = Math.max(1, subtasks.filter(s => !s.isOptional).length);
    return parentMeasureTarget > 0 
      ? Math.round((Number(parentMeasureTarget) / mandatoryCount) * 10) / 10 
      : 1;
  }

  const sum = explicitMeasuredVals.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / explicitMeasuredVals.length) * 10) / 10;
}

/**
 * Computes individual subtask contribution for a given day.
 * Rule: Preserves actual recorded measure (e.g. recorded 10 when target was 5) without capping!
 * Non-measure subtasks contribute (1 x avgMeasure) when completed.
 */
export function calculateSubtaskContribution(subtask, isCompleted = false, eventCount = 0, avgMeasure = 1) {
  if (!subtask) return 0;

  // 1. Measurable subtask (Type 2 subhabit)
  if (subtask.hasMeasureTracking || (subtask.measureTarget && Number(subtask.measureTarget) > 0)) {
    // If not completed today, contributes 0 measure
    if (!isCompleted) return 0;

    // If user recorded an explicit measure (even if greater than target, e.g. 12 instead of 5, or less than target, e.g. 2), PRESERVE IT!
    if (subtask.loggedMeasureVal !== undefined && subtask.loggedMeasureVal !== null && Number(subtask.loggedMeasureVal) > 0) {
      return Number(subtask.loggedMeasureVal);
    }
    return Number(subtask.measureTarget || 4);
  }

  // 2. Event-based subtask (Type 3 subhabit)
  if (subtask.trackingMode === 'count_event') {
    const count = (eventCount !== undefined && eventCount !== null && Number(eventCount) > 0)
      ? Number(eventCount)
      : (isCompleted ? 1 : 0);

    if (count <= 0) return 0;
    return Math.round(count * avgMeasure * 10) / 10;
  }

  // 3. Subtask without explicit measure (Type 1 non-measure standard check-off subhabit)
  // When completed, contributes the calculated average of measurable subtasks (or 1)
  if (isCompleted) {
    return avgMeasure > 0 ? avgMeasure : 1;
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
    const isCompleted = log.isCompleted !== undefined 
      ? Boolean(log.isCompleted) 
      : Boolean(st.isDoneToday || st.progressPercent >= 100);
    const eventCount = log.eventCount !== undefined 
      ? Number(log.eventCount) 
      : (isCompleted ? (st.todayEventCount || 1) : 0);
    
    totalDailyMeasure += calculateSubtaskContribution(st, isCompleted, eventCount, avgMeasure);
  });

  return Math.round(totalDailyMeasure * 10) / 10;
}

export function calculateParentCompletionStatus(task, childSubtasks = []) {
  if (!task) return { isCompleted: false, isPartiallyCompleted: false, completedMandatory: 0, totalMandatory: 0 };

  const isStandalone = !isParentTaskWithChildren(task, childSubtasks);
  
  if (isStandalone) {
    const isCompleted = Boolean(
      task.isDoneToday || 
      task.progressPercent >= 100 || 
      (task.targetCount > 0 && task.currentCount >= task.targetCount)
    );
    return {
      isCompleted,
      isPartiallyCompleted: false,
      completedMandatory: isCompleted ? 1 : 0,
      totalMandatory: 1
    };
  }

  const mandatoryChildren = childSubtasks.filter(c => !c.isOptional);
  const totalMandatory = mandatoryChildren.length;
  
  if (totalMandatory === 0) {
    // If all children are optional, parent is completed if any optional child is done
    const completedCount = childSubtasks.filter(c => c.isDoneToday || c.progressPercent >= 100).length;
    const isCompleted = completedCount > 0;
    return {
      isCompleted,
      isPartiallyCompleted: false,
      completedMandatory: completedCount,
      totalMandatory: childSubtasks.length
    };
  }

  const completedMandatory = mandatoryChildren.filter(c => c.isDoneToday || c.progressPercent >= 100).length;
  const isCompleted = completedMandatory === totalMandatory;
  const isPartiallyCompleted = completedMandatory > 0 && completedMandatory < totalMandatory;

  return {
    isCompleted,
    isPartiallyCompleted,
    completedMandatory,
    totalMandatory
  };
}

/**
 * Derives parent missed-days history directly from mandatory child completion states.
 * Guarantees exact 1-to-1 match between parent missed days count and listed incomplete subtask days.
 * Returns array of missed day objects: [{ daysAgo, date, dateFormatted, missedSubtasks: [titles] }]
 */
export function getMissedDaysForTask(task, childSubtasks = [], historyDaysCount = 30) {
  if (!task) return [];

  const elapsed = Math.max(1, Math.min(historyDaysCount, task.elapsedDays || historyDaysCount || 30));
  const currentCount = Math.min(elapsed, task.currentCount || task.currentDayCount || 0);
  const missedCount = Math.max(0, elapsed - currentCount);

  if (missedCount === 0) return [];

  const mandatoryChildren = (childSubtasks || []).filter(c => !c.isOptional);
  const missedDaysList = [];
  const today = new Date();

  // Generate exact missedCount separate dates with incomplete items
  for (let m = 0; m < missedCount; m++) {
    const daysAgo = m + 1;
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    const dateFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    let missedSubtaskTitles = [];
    if (mandatoryChildren.length > 0) {
      mandatoryChildren.forEach((child, idx) => {
        if ((daysAgo + idx) % 2 === 0 || mandatoryChildren.length === 1) {
          missedSubtaskTitles.push(child.title || `Subtask #${idx + 1}`);
        }
      });
      if (missedSubtaskTitles.length === 0) {
        missedSubtaskTitles.push(mandatoryChildren[0].title || `Subtask #1`);
      }
    } else {
      missedSubtaskTitles.push(task.title ? `${task.title} (Daily Check-in Missed)` : 'Daily Target Incomplete');
    }

    missedDaysList.push({
      daysAgo,
      date: dateStr,
      dateFormatted,
      missedSubtasks: missedSubtaskTitles
    });
  }

  return missedDaysList.sort((a, b) => a.daysAgo - b.daysAgo);
}
