/**
 * Habit Hacker — Single Source of Truth Event-Count Task Engine
 * 
 * Rules supported:
 * 1. 1 Event is defined by eventUnitTarget (e.g., 10 pages = 1 event).
 * 2. Subtasks contribute actual work amounts towards the Current Event.
 * 3. Subtask completion DOES NOT automatically mean event completion.
 * 4. Work accumulates across days until totalWork >= eventUnitTarget.
 * 5. Event completion date is the date on which the event condition is satisfied.
 * 6. Finalized events are stored immutably with subtask contribution breakdown.
 * 7. Each finalized event gets its own horizontal segmented bar.
 * 8. Multiple events completed on the same day render separate bars.
 * 9. After finalization, subtask current-event measures reset to 0 for the next event.
 * 10. Optional subtasks never block event finalization.
 */

export const DEFAULT_SUBTASK_COLORS = [
  '#4F46E5', // Indigo
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EC4899'  // Pink
];

/**
 * Calculates current accumulated work toward the active Current Event across all subtasks.
 */
export function calculateCurrentEventWork(subtasks = [], avgMeasure = 1) {
  if (!subtasks || subtasks.length === 0) return 0;
  
  let totalWork = 0;
  subtasks.forEach(st => {
    let work = Number(st.currentEventWork || st.loggedMeasureVal || 0);
    
    // Handle no-measure subtasks deriving average measure
    if (work === 0 && st.isDoneToday && !st.hasMeasureTracking && !st.measureTarget) {
      work = avgMeasure;
    }
    
    totalWork += work;
  });

  return Math.round(totalWork * 10) / 10;
}

/**
 * Evaluates whether the Current Event condition is satisfied.
 * Condition: total work >= eventUnitTarget (or mandatory subtasks satisfied).
 */
export function isEventConditionSatisfied(parentTask, subtasks = []) {
  if (!parentTask) return false;
  
  const eventUnitTarget = Number(parentTask.eventUnitTarget || parentTask.measureTarget || 10);
  const avgMeasure = 1;
  const currentWork = calculateCurrentEventWork(subtasks, avgMeasure);

  // Mandatory subtasks check
  const mandatorySubtasks = subtasks.filter(s => !s.isOptional);
  const mandatorySatisfied = mandatorySubtasks.length === 0 || mandatorySubtasks.every(s => Boolean(s.isDoneToday || s.currentEventWork > 0));

  return currentWork >= eventUnitTarget && mandatorySatisfied;
}

/**
 * Finalizes the Current Event, creating an immutable historical event record,
 * incrementing completedEventCount, and resetting subtask current-event measures to 0.
 */
export function finalizeCurrentEvent(parentTask, subtasks = [], completionDate = null) {
  if (!parentTask) return null;

  const todayStr = completionDate || new Date().toISOString().split('T')[0];
  const eventUnitTarget = Number(parentTask.eventUnitTarget || parentTask.measureTarget || 10);
  const eventUnitName = parentTask.eventUnitName || parentTask.measureUnit || 'units';
  const completedEventCount = (parentTask.completedEventCount || parentTask.currentCount || 0) + 1;
  
  // Calculate individual subtask contributions
  let totalWorkAccumulated = 0;
  const subtaskContributions = subtasks.map((st, idx) => {
    const workAmount = Number(st.currentEventWork || st.loggedMeasureVal || (st.isDoneToday ? (st.measureTarget || 4) : 0));
    totalWorkAccumulated += workAmount;
    return {
      subtaskId: st.id,
      subtaskTitle: st.title,
      color: DEFAULT_SUBTASK_COLORS[idx % DEFAULT_SUBTASK_COLORS.length],
      workAmount: Math.round(workAmount * 10) / 10
    };
  });

  totalWorkAccumulated = Math.round(totalWorkAccumulated * 10) / 10;

  // Calculate percentage segments for horizontal bar rendering
  const subtaskSegments = subtaskContributions.map(c => ({
    ...c,
    percentage: totalWorkAccumulated > 0 ? Math.round((c.workAmount / totalWorkAccumulated) * 100) : 0
  }));

  const finalizedEventRecord = {
    id: `ev-${parentTask.id}-${Date.now()}-${completedEventCount}`,
    taskId: parentTask.id,
    eventNumber: completedEventCount,
    completionDate: todayStr,
    completionTimestamp: new Date().toISOString(),
    eventUnitTarget,
    eventUnitName,
    totalWorkAccumulated,
    subtaskContributions: subtaskSegments,
    status: 'FINALIZED'
  };

  // Reset subtasks for the next event
  const resetSubtasks = subtasks.map(st => ({
    ...st,
    currentEventWork: 0,
    loggedMeasureVal: 0,
    isDoneToday: false
  }));

  const updatedParentTask = {
    ...parentTask,
    completedEventCount,
    currentCount: completedEventCount,
    currentEventWork: 0,
    isDoneToday: completedEventCount >= (parentTask.targetEventCount || parentTask.targetCount || 10)
  };

  return {
    finalizedEventRecord,
    updatedParentTask,
    resetSubtasks
  };
}

/**
 * Prepares segmented horizontal event bar rendering data for a finalized event.
 */
export function getSegmentedBarMetrics(finalizedEvent, customColors = DEFAULT_SUBTASK_COLORS) {
  if (!finalizedEvent || !finalizedEvent.subtaskContributions) {
    return { segments: [], total: 0 };
  }

  const total = finalizedEvent.totalWorkAccumulated || 10;
  const segments = finalizedEvent.subtaskContributions.map((st, idx) => ({
    ...st,
    color: st.color || customColors[idx % customColors.length],
    percentage: total > 0 ? (st.workAmount / total) * 100 : 0
  }));

  return {
    eventNumber: finalizedEvent.eventNumber,
    date: finalizedEvent.completionDate,
    totalWork: total,
    unitName: finalizedEvent.eventUnitName || 'units',
    segments
  };
}
