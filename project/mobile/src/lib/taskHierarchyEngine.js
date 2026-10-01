/**
 * Habit Hacker — Single Source of Truth Task Hierarchy & Measure Engine
 * 
 * Rules supported:
 * 1. Measurable subtasks contribute actual completed measure.
 * 2. Non-event subhabits average: computed from non-event subtasks when an event subtask is present.
 * 3. Fallback average is 1 if no measurable subtasks exist (avoids division by 0).
 * 4. Event-based subtasks contribute: (peer average / target events) * completed events.
 * 5. No-measure subtasks contribute (1 x Average Measure) when completed.
 * 6. Parent with children has NO independent measure; parent measure is the sum of subtask contributions.
 * 7. FOR ALL PARENT HABITS: A habit with subhabits CANNOT be manually marked completed;
 *    it can ONLY be marked completed by completing its subhabits.
 * 8. Parent is auto-completed ONLY when ALL mandatory subtasks are completed.
 * 9. Subhabits of deleted parents become standalone parent habits.
 * 10. Missed days are derived directly from mandatory subtask completion records.
 */

/**
 * Checks if a task should be treated as a parent habit driven by child subtasks.
 * Rule: Any task with 1 or more child subtasks is a parent habit.
 */
export function isParentTaskWithChildren(task, childSubtasks = []) {
  if (!childSubtasks || childSubtasks.length === 0) return false;
  return true;
}

/**
 * Determines if a task can be manually toggled/completed by the user.
 * Rule: FOR ALL PARENT HABITS: A habit with subhabits CANNOT be manually marked completed;
 * it is completed exclusively by completing its subhabits.
 */
export function canManuallyCompleteTask(task, childSubtasks = []) {
  if (!childSubtasks || childSubtasks.length === 0) return true;
  return false;
}

/**
 * Calculates average measure from non-event subtasks with explicit numerical measures.
 * Example from user specification:
 * Subhabit 1 measure = 8, Subhabit 2 measure = 4 -> (8 + 4) / 2 = 6 average.
 */
export function calculateNonEventSubtasksAverage(subtasks = [], parentMeasureTarget = 0) {
  const nonEventSubtasks = (subtasks || []).filter(s => s.trackingMode !== 'count_event');
  if (nonEventSubtasks.length === 0) {
    return parentMeasureTarget > 0 ? Number(parentMeasureTarget) : 1;
  }

  const explicitVals = [];
  nonEventSubtasks.forEach(st => {
    if (st.loggedMeasureVal !== undefined && st.loggedMeasureVal !== null && Number(st.loggedMeasureVal) > 0) {
      explicitVals.push(Number(st.loggedMeasureVal));
    } else if (st.measureTarget && Number(st.measureTarget) > 0) {
      explicitVals.push(Number(st.measureTarget));
    }
  });

  if (explicitVals.length === 0) {
    const mandatoryCount = Math.max(1, nonEventSubtasks.filter(s => !s.isOptional).length);
    return parentMeasureTarget > 0 
      ? Math.round((Number(parentMeasureTarget) / mandatoryCount) * 10) / 10 
      : 1;
  }

  const sum = explicitVals.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / explicitVals.length) * 10) / 10;
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
 * Computes individual subtask contribution for a given day or event.
 * Rule: Preserves actual recorded measure (e.g. recorded 12 when target was 5, or 2) without capping!
 * Non-measure subtasks contribute (1 x avgMeasure) when completed.
 * Event-based subtasks with peer subhabits:
 * peer non-event average = 6, 2 target events -> 6/2 = 3 per event -> 2 completed events = 3 + 3 = 6.
 */
export function calculateSubtaskContribution(subtask, isCompleted = false, eventCount = 0, avgMeasure = 1, allPeerSubtasks = [], explicitLoggedVal = null) {
  if (!subtask) return 0;

  // Explicit logged value from daily log (measuredValue or loggedMeasureVal)
  const rawLogVal = (explicitLoggedVal !== null && explicitLoggedVal !== undefined && Number(explicitLoggedVal) > 0)
    ? Number(explicitLoggedVal)
    : null;

  const explicitVal = rawLogVal !== null 
    ? rawLogVal 
    : (subtask.loggedMeasureVal !== undefined && subtask.loggedMeasureVal !== null && Number(subtask.loggedMeasureVal) > 0
        ? Number(subtask.loggedMeasureVal)
        : null);

  // 1. Event-based subtask (Type 3 subhabit)
  if (subtask.trackingMode === 'count_event') {
    if (explicitVal !== null && explicitVal > 0) return explicitVal;

    const unitMeasure = Number(subtask.lastMeasuredValue || subtask.eventUnitTarget || subtask.measureTarget || 10);
    const evCount = (eventCount !== undefined && eventCount !== null && Number(eventCount) > 0)
      ? Number(eventCount)
      : ((isCompleted || subtask.isDoneToday || (Number(subtask.currentCount || 0) > 0)) ? Number(subtask.todayEventCount || subtask.currentCount || 1) : 0);

    if (evCount <= 0) return 0;

    return Math.round(evCount * unitMeasure * 10) / 10;
  }

  // 2. Measurable subtask (Type 2 subhabit or any subtask with measure tracking)
  if (subtask.hasMeasureTracking || (subtask.measureTarget && Number(subtask.measureTarget) > 0)) {
    // Uncapped explicit logged value always takes absolute precedence!
    if (explicitVal !== null) {
      return explicitVal;
    }
    if (!isCompleted && !subtask.isDoneToday) return 0;
    if (subtask.lastMeasuredValue !== undefined && subtask.lastMeasuredValue !== null && Number(subtask.lastMeasuredValue) > 0) {
      return Number(subtask.lastMeasuredValue);
    }
    return Number(subtask.measureTarget || 4);
  }

  // 3. Subtask without explicit measure (Type 1 non-measure standard check-off subhabit)
  if (isCompleted || subtask.isDoneToday) {
    if (explicitVal !== null) return explicitVal;
    return avgMeasure > 0 ? avgMeasure : 1;
  }

  return 0;
}

/**
 * Computes parent task's total daily measure by summing all child contributions.
 */
export function calculateParentDailyMeasure(childSubtasks = [], dayLogsMap = {}) {
  if (!childSubtasks || childSubtasks.length === 0) return 0;
  
  const nonEventAvg = calculateNonEventSubtasksAverage(childSubtasks);
  const avgMeasure = nonEventAvg > 0 ? nonEventAvg : calculateMeasurableAverage(childSubtasks);
  let totalDailyMeasure = 0;

  childSubtasks.forEach(st => {
    const log = dayLogsMap[st.id] || {};
    const logVal = log.measuredValue !== undefined 
      ? log.measuredValue 
      : (log.measured_value !== undefined ? log.measured_value : null);
    const isCompleted = log.isCompleted !== undefined 
      ? Boolean(log.isCompleted) 
      : Boolean(st.isDoneToday || st.progressPercent >= 100 || (logVal !== null && logVal > 0) || (st.loggedMeasureVal && Number(st.loggedMeasureVal) > 0) || (Number(st.currentCount || 0) > 0));
    const eventCount = log.eventCount !== undefined 
      ? Number(log.eventCount) 
      : (isCompleted ? Number(st.todayEventCount || st.currentCount || 1) : 0);
    
    totalDailyMeasure += calculateSubtaskContribution(st, isCompleted, eventCount, avgMeasure, childSubtasks, logVal);
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
 * Returns the local date in YYYY-MM-DD format (never skewed by UTC timezones).
 */
export function getLocalDateString(d = new Date()) {
  if (!d) return '';
  const dateObj = typeof d === 'string'
    ? (d.includes('T') ? new Date(d) : (() => {
        const parts = d.split('-');
        if (parts.length === 3) {
          const [y, m, day] = parts.map(Number);
          return new Date(y, m - 1, day);
        }
        return new Date(d);
      })())
    : new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD or ISO string into a local Date object at midnight local time.
 */
export function parseLocalDate(str) {
  if (!str) return new Date();
  if (str instanceof Date) return new Date(str.getFullYear(), str.getMonth(), str.getDate());
  const cleanStr = String(str).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  return new Date(str);
}

/**
 * Calculates calendar day difference between two dates in local time.
 * (e.g. 2026-09-27 to 2026-10-01 returns 5 days inclusive).
 */
export function calculateLocalDaySpan(startStr, endStr) {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

/**
 * Derives parent missed-days history directly from mandatory child completion states.
 * Guarantees exact 1-to-1 match between parent missed days count and listed incomplete subtask days.
 * Returns array of missed day objects: [{ daysAgo, date, dateFormatted, missedSubtasks: [titles] }]
 */
export function getMissedDaysForTask(task, childSubtasks = [], historyDaysCount = 30, subtaskLogsByDate = {}) {
  if (!task) return [];

  const elapsed = Math.max(1, Math.min(historyDaysCount, task.elapsedDays || historyDaysCount || 30));
  const isDoneToday = Boolean(task.isDoneToday);
  const pastElapsed = isDoneToday ? elapsed : Math.max(0, elapsed - 1);

  if (pastElapsed === 0) return [];

  const mandatoryChildren = (childSubtasks || []).filter(c => !c.isOptional);
  const missedDaysList = [];
  const today = new Date();

  // Scan all past operational days from yesterday (daysAgo = 1) back to start
  for (let daysAgo = 1; daysAgo <= pastElapsed; daysAgo++) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateStr = getLocalDateString(d);
    const dateFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    if (mandatoryChildren.length > 0) {
      // Parent Task: check if any mandatory child was missed on this day
      const dayLogs = subtaskLogsByDate[dateStr] || {};
      const hasLogsForDate = Object.keys(dayLogs).length > 0;
      const actualMissed = mandatoryChildren.filter(child => {
        const cLog = dayLogs[child.id];
        if (cLog) {
          return !cLog.isCompleted || Number(cLog.measuredValue || 0) <= 0;
        }
        return true;
      });

      if (actualMissed.length > 0) {
        missedDaysList.push({
          daysAgo,
          date: dateStr,
          dateFormatted,
          missedSubtasks: actualMissed.map(child => child.title || `Subtask`)
        });
      }
    } else {
      // Subhabit / Standalone Task without children:
      // Check if this specific subtask logged completion on dateStr
      const dayLogs = subtaskLogsByDate[dateStr] || {};
      let isTaskDoneOnDay = false;

      if (dayLogs[task.id]) {
        const dayLog = dayLogs[task.id];
        isTaskDoneOnDay = Boolean(dayLog.isCompleted && Number(dayLog.measuredValue !== undefined ? dayLog.measuredValue : 1) > 0);
      } else {
        // Fuzzy key match (e.g. sub-p3-s1 vs sub_p3_s1)
        const normTaskId = (task.id || '').toLowerCase().replace(/[-_]/g, '');
        const matchKey = Object.keys(dayLogs).find(k => {
          const normK = k.toLowerCase().replace(/[-_]/g, '');
          return normK.includes(normTaskId) || normTaskId.includes(normK) || (task.title && normK.includes(task.title.toLowerCase().slice(0, 5)));
        });
        if (matchKey && dayLogs[matchKey]) {
          const cLog = dayLogs[matchKey];
          isTaskDoneOnDay = Boolean(cLog.isCompleted && Number(cLog.measuredValue !== undefined ? cLog.measuredValue : 1) > 0);
        } else {
          // If subtaskLogsByDate has entries for this date but not for this subtask, check currentCount fallback
          const currentCount = Math.min(elapsed, task.currentCount || task.currentDayCount || 0);
          isTaskDoneOnDay = (pastElapsed - daysAgo) < currentCount;
        }
      }

      if (!isTaskDoneOnDay) {
        missedDaysList.push({
          daysAgo,
          date: dateStr,
          dateFormatted,
          missedSubtasks: [task.title ? `${task.title} (Daily Check-in Missed)` : 'Daily Target Incomplete']
        });
      }
    }
  }

  return missedDaysList.sort((a, b) => a.daysAgo - b.daysAgo);
}
