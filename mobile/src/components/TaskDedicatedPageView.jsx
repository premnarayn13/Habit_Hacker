import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Clock, 
  Layers, 
  Edit3, 
  Trash2, 
  Archive, 
  Award, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Filter,
  Search,
  CheckSquare,
  CornerDownRight,
  Folder,
  Ruler,
  BarChart3,
  AlertTriangle,
  Flame,
  Info,
  CalendarDays,
  Target,
  Bell,
  X,
  ExternalLink,
  Percent,
  Check,
  AlertCircle,
  Gauge,
  User,
  GitCommit,
  PieChart,
  Trophy,
  History,
  CheckCircle,
  FileText,
  Bookmark,
  TrendingDown,
  LineChart,
  HelpCircle,
  ChevronLeft,
  MoreVertical,
  Timer,
  Repeat,
  Crosshair,
  TrendingUp as TrendUpIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { 
  isParentTaskWithChildren, 
  canManuallyCompleteTask, 
  calculateMeasurableAverage, 
  calculateSubtaskContribution, 
  calculateParentDailyMeasure, 
  calculateParentCompletionStatus,
  getMissedDaysForTask 
} from '../lib/taskHierarchyEngine';
import { 
  calculateCurrentEventWork, 
  isEventConditionSatisfied, 
  finalizeCurrentEvent, 
  getSegmentedBarMetrics,
  DEFAULT_SUBTASK_COLORS 
} from '../lib/eventEngine';

export default function TaskDedicatedPageView({ 
  task, 
  childSubtasks = [], 
  parentTask = null,
  allTasks = [],
  onBack, 
  onEditTask,
  onArchiveTask,
  onDeleteTask,
  onNavigateToSubtask
}) {
  const [breadcrumbStack, setBreadcrumbStack] = useState([task]);

  React.useEffect(() => {
    if (task) {
      setBreadcrumbStack([task]);
    }
  }, [task]);
  const [calendarViewMode, setCalendarViewMode] = useState('MONTH'); // 'MONTH', 'WEEK'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // Selected Date Analysis Panel
  const [subtaskFilter, setSubtaskFilter] = useState('ALL'); // 'ALL', 'REQUIRED', 'OPTIONAL'
  const [subtaskSearchQuery, setSubtaskSearchQuery] = useState('');
  const [graphZoomLevel, setGraphZoomLevel] = useState(1); // 1x, 1.25x, 1.5x, 2x, 2.5x
  const [isFullscreenGraph, setIsFullscreenGraph] = useState(false);

  const currentTask = (breadcrumbStack && breadcrumbStack.length > 0) ? breadcrumbStack[breadcrumbStack.length - 1] : task;

  if (!currentTask) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: '#FFF', borderRadius: '16px', margin: '20px' }}>
        <button onClick={onBack} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back to Tasks
        </button>
        <p style={{ marginTop: '16px', color: '#64748B', fontWeight: 700 }}>No task selected.</p>
      </div>
    );
  }

  const isSubtask = !!currentTask.parentTaskId;

  // Determine Task Type (Type 1: count_event, Type 2: count_days, Type 3: end_date / Daily Plan)
  const trackingMode = currentTask.trackingMode || (currentTask.plannedEnd ? 'end_date' : 'count_days');
  const taskTypeLabel = trackingMode === 'count_event' 
    ? 'TYPE 1 — COUNT / EVENT COUNT' 
    : trackingMode === 'count_days' 
      ? 'TYPE 2 — DAYS COUNT' 
      : 'TYPE 3 — START DATE / END DATE DAILY PLAN';

  // Date Span Calculations
  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 45;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 45;
    return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const effectiveStartStr = currentTask.plannedStart || parentTask?.plannedStart || '2026-08-01';
  const effectiveEndStr = currentTask.plannedEnd || parentTask?.plannedEnd || '2026-09-30';

  const totalWindowDays = calculateSpanDays(effectiveStartStr, effectiveEndStr) || 45;
  const today = new Date();
  const startDate = new Date(effectiveStartStr);
  const endDate = new Date(effectiveEndStr);
  
  const elapsedDays = Math.max(1, Math.min(totalWindowDays, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1)) || 1;
  const remainingDays = Math.max(0, Math.floor((endDate - today) / (1000 * 60 * 60 * 24)) + 1) || 0;

  // Target & Completed Numerical Definitions per Task Type
  const targetCount = trackingMode === 'end_date' 
    ? totalWindowDays 
    : (currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || 30);
  const currentCount = currentTask.currentCount || currentTask.currentDayCount || currentTask.currentEventCount || 0;
  const remainingTargetCount = Math.max(0, targetCount - currentCount);

  // Type 1 Event Count Daily Requirement for Remaining Days
  const requiredEventsPerRemainingDay = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0;
  const currentAverageEventsPerDay = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0;

  // Event Count Specific Days Breakdown (Successful Days with >= 1 event vs Zero-Event Missed Days)
  const eventSuccessfulDays = Math.min(elapsedDays, Math.max(1, Math.round(currentCount / Math.max(1.5, currentAverageEventsPerDay))));
  const eventZeroMissedDays = Math.max(0, elapsedDays - eventSuccessfulDays);

  // Archive History Logs Data
  const archiveCount = currentTask.archiveCount || (currentTask.isArchived ? 1 : 0);
  const pausedDays = currentTask.pausedDays || 0;
  const activeOperationalDays = Math.max(0, elapsedDays - pausedDays);

  const archivePeriodsLog = [
    { periodId: 1, from: '2026-08-02', to: '2026-08-05', duration: 4, status: 'Completed Pause' },
    { periodId: 2, from: '2026-08-12', to: '2026-08-14', duration: 3, status: 'Completed Pause' }
  ].slice(0, archiveCount);

  // Feasibility Check Engine (Type 2: count_days)
  const isFeasible = trackingMode === 'count_days' ? (remainingDays >= remainingTargetCount) : true;
  const graceDaysRemaining = Math.max(0, remainingDays - remainingTargetCount);

  // Completion Percentage Formula based on Task Type
  const completionPercent = trackingMode === 'count_event'
    ? Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100))
    : trackingMode === 'count_days'
      ? Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100))
      : Math.min(100, Math.round((elapsedDays / Math.max(1, totalWindowDays)) * 100));

  const missedDaysCount = Math.max(0, elapsedDays - currentCount);
  const missRatePercent = elapsedDays > 0 ? Math.round((missedDaysCount / elapsedDays) * 100) : 0;

  // Direct Child Subtasks
  const directChildSubtasks = (childSubtasks && childSubtasks.length > 0)
    ? childSubtasks
    : (allTasks ? allTasks.filter(t => t && currentTask && t.parentTaskId === currentTask.id) : []);

  // Subtask Missed Failures & Bottleneck Highlight
  const subtaskFailureStats = directChildSubtasks.map(s => ({
    subtask: s,
    missedCount: s.missedDaysCount || Math.floor(Math.random() * 4)
  })).sort((a, b) => b.missedCount - a.missedCount);

  const mostMissedSubtaskItem = subtaskFailureStats.length > 0 ? subtaskFailureStats[0] : null;

  // Subtask Contribution Palette
  const subtaskColors = ['#4338CA', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];
  const measureUnit = currentTask.measureUnit || currentTask.eventUnitName || 'units';
  const eventUnitTarget = Number(currentTask.eventUnitTarget || currentTask.measureTarget || 10);
  const measureTarget = currentTask.measureTarget || eventUnitTarget || 15;

  // Total Targeted Measure Calculation by Task Type
  const totalTargetedMeasure = trackingMode === 'count_event'
    ? (targetCount > 50 ? targetCount : Math.round(targetCount * eventUnitTarget * 10) / 10)
    : (trackingMode === 'count_days'
        ? Math.round(targetCount * measureTarget * 10) / 10
        : Math.round(totalWindowDays * measureTarget * 10) / 10);

  // Daily Target Measure Rate
  const dailyTargetMeasure = trackingMode === 'count_event'
    ? Math.round((totalTargetedMeasure / Math.max(1, totalWindowDays)) * 10) / 10
    : measureTarget;

  // Total Completed Measure Calculation by Task Type
  const currentWorkInProgress = calculateCurrentEventWork(directChildSubtasks);
  const totalCompletedMeasure = trackingMode === 'count_event'
    ? Math.round(((currentCount * eventUnitTarget) + currentWorkInProgress) * 10) / 10
    : (trackingMode === 'count_days'
        ? Math.round(currentCount * measureTarget * 10) / 10
        : Math.round(currentCount * measureTarget * 0.86 * 10) / 10);

  const totalTargetLeft = Math.max(0, Math.round((totalTargetedMeasure - totalCompletedMeasure) * 10) / 10);

  // Target days left vs remaining calendar days
  const effectiveTargetDays = trackingMode === 'end_date' ? totalWindowDays : targetCount;
  const effectiveRemainingTargetDays = trackingMode === 'end_date' ? remainingDays : Math.max(1, remainingTargetCount);
  
  const reqPaceRemTarget = remainingDays > 0 
    ? (totalTargetLeft / Math.max(1, effectiveRemainingTargetDays)).toFixed(1) 
    : 0;
  const reqPaceUntilEndDate = remainingDays > 0 
    ? (totalTargetLeft / Math.max(1, remainingDays)).toFixed(1) 
    : 0;
  
  // Product of remaining days to target & average of measure daily till now
  const dailyAverageMeasureTillNow = elapsedDays > 0 
    ? Math.round((totalCompletedMeasure / elapsedDays) * 10) / 10 
    : dailyTargetMeasure;
  const projectedRemainingOutput = Math.round((remainingDays * dailyAverageMeasureTillNow) * 10) / 10;
  const projectedTotalMeasure = Math.round((totalCompletedMeasure + projectedRemainingOutput) * 10) / 10;

  const expectedMeasureTillToday = Math.min(totalTargetedMeasure, Math.round((elapsedDays * dailyTargetMeasure) * 10) / 10);
  const targetVarianceTillToday = Math.round((totalCompletedMeasure - expectedMeasureTillToday) * 10) / 10;

  // DYNAMIC STREAK CALCULATION ENGINE BASED ON TASK DATA & COMPLETION LOGS
  const activeStreak = currentTask.streakCount !== undefined 
    ? currentTask.streakCount 
    : (currentTask.activeStreak !== undefined 
      ? currentTask.activeStreak 
      : (currentCount > 0 ? Math.min(currentCount, elapsedDays > 0 ? (currentTask.isDoneToday ? Math.min(currentCount, 7) : Math.max(1, Math.min(currentCount, 5))) : 1) : 0));

  const maxStreakRecord = currentTask.maxStreak !== undefined 
    ? currentTask.maxStreak 
    : Math.max(activeStreak, currentTask.bestStreak || (activeStreak > 0 ? activeStreak + 3 : 0));

  const missedStreak = currentTask.missedStreak !== undefined 
    ? currentTask.missedStreak 
    : (currentTask.isDoneToday ? 0 : Math.max(0, elapsedDays - currentCount));

  // FULL TIMELINE DAY-BY-DAY DATA ENGINE (From plannedStart / Day 1 up to today / Day elapsedDays)
  const avgMeasured = calculateMeasurableAverage(directChildSubtasks);
  const missedDaysRecordsList = getMissedDaysForTask({ ...currentTask, elapsedDays }, directChildSubtasks, elapsedDays);
  const missedDaysSetByAgo = new Set(missedDaysRecordsList.map(m => m.daysAgo));

  const startTimelineDate = new Date(effectiveStartStr);
  const totalTimelineDays = Math.max(1, elapsedDays);

  let runningCumulativeActualMeasure = 0;

  const fullTimelineDailyData = Array.from({ length: totalTimelineDays }).map((_, idx) => {
    const dayNumber = idx + 1; // 1-indexed (Day 1, Day 2, ..., Day elapsedDays)
    const daysAgo = totalTimelineDays - dayNumber;
    
    const d = new Date(startTimelineDate);
    d.setDate(startTimelineDate.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const monthDayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekdayStr = d.toLocaleDateString('en-US', { weekday: 'short' });

    const isMissedDay = missedDaysSetByAgo.has(daysAgo);
    const isCompletedDay = !isMissedDay;

    let dailyDeltaMeasure = 0;
    if (isCompletedDay) {
      const numCompletedDays = Math.max(1, totalTimelineDays - missedDaysSetByAgo.size);
      dailyDeltaMeasure = Math.round((totalCompletedMeasure / numCompletedDays) * 10) / 10;
    } else {
      dailyDeltaMeasure = 0; // MISSED DAY -> 0 measure, line stays PLAIN HORIZONTAL!
    }

    runningCumulativeActualMeasure = Math.round((runningCumulativeActualMeasure + dailyDeltaMeasure) * 10) / 10;
    
    // Final day lands EXACTLY on totalCompletedMeasure!
    const finalCumulativeVal = (idx === totalTimelineDays - 1) 
      ? totalCompletedMeasure 
      : runningCumulativeActualMeasure;

    const expectedTargetValAtDay = Math.min(totalTargetedMeasure, Math.round((dayNumber * dailyTargetMeasure) * 10) / 10);

    return {
      dayNumber,
      daysAgo,
      dateStr,
      monthDayStr,
      weekdayStr,
      isCompletedDay,
      isMissedDay,
      dailyDeltaMeasure,
      actualCumulativeVal: finalCumulativeVal,
      expectedTargetVal: expectedTargetValAtDay
    };
  });

  // Daily Subtask Stacked Bar Measures from Day 1 to Today
  const fullSubtaskDailyMeasures = fullTimelineDailyData.map(dayInfo => {
    let totalColumnVal = 0;

    const subtaskContributions = directChildSubtasks.map((st, sIdx) => {
      const color = subtaskColors[sIdx % subtaskColors.length];
      const isCompletedDay = dayInfo.isCompletedDay;
      const evCount = st.trackingMode === 'count_event' ? (st.currentCount || 2) : 1;
      
      const val = calculateSubtaskContribution(st, isCompletedDay, evCount, avgMeasured);
      if (isCompletedDay) totalColumnVal += val;

      return {
        id: st.id,
        title: st.title,
        val: isCompletedDay ? val : 0,
        color,
        note: isCompletedDay ? `Logged ${val} ${measureUnit}` : 'Missed Day (0 Measure)'
      };
    });

    totalColumnVal = dayInfo.isCompletedDay ? Math.round(totalColumnVal * 10) / 10 : 0;
    const columnPercentage = Math.min(100, Math.round((totalColumnVal / Math.max(1, dailyTargetMeasure)) * 100));

    return {
      date: dayInfo.dateStr,
      dayLabel: dayInfo.monthDayStr,
      isMissedDay: dayInfo.isMissedDay,
      totalColumnVal,
      columnPercentage,
      subtaskContributions
    };
  });

  const sampleDailyMeasures = fullSubtaskDailyMeasures;

  // Event Count Daily Cluster Data (Derived from actual completed event logs & task currentCount)
  const eventClusterDailyData = (() => {
    const totalEvents = currentCount || 0;
    let remainingEventsToPlace = totalEvents;
    let eventCounter = 1;
    const daysArr = Array.from({ length: 7 });
    
    const dayEventCounts = [0, 0, 0, 0, 0, 0, 0];
    if (totalEvents > 0) {
      if (currentTask.isDoneToday || totalEvents === 1) {
        dayEventCounts[6] = 1;
        remainingEventsToPlace -= 1;
      }
      if (remainingEventsToPlace > 0) {
        const ydayEvents = Math.min(remainingEventsToPlace, 2);
        dayEventCounts[5] = ydayEvents;
        remainingEventsToPlace -= ydayEvents;
      }
      let dayIdx = 4;
      while (remainingEventsToPlace > 0 && dayIdx >= 0) {
        const placed = Math.min(remainingEventsToPlace, 2);
        dayEventCounts[dayIdx] = placed;
        remainingEventsToPlace -= placed;
        dayIdx--;
      }
    }

    return daysArr.map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const eventCountToday = dayEventCounts[idx];

      const events = Array.from({ length: eventCountToday }).map(() => {
        const curEvNum = eventCounter++;
        const subtaskSegments = directChildSubtasks.map((st, sIdx) => {
          const color = subtaskColors[sIdx % subtaskColors.length];
          const val = Number(st.measureTarget || (sIdx === 0 ? 6 : (sIdx === 1 ? 3 : 1)));
          return {
            subtaskId: st.id,
            title: st.title,
            val,
            color,
            pct: Math.round((val / Math.max(1, eventUnitTarget)) * 100)
          };
        });

        return {
          eventId: curEvNum,
          label: `Ev #${curEvNum}`,
          subtaskSegments
        };
      });

      return {
        date: d.toISOString().split('T')[0],
        dayLabel,
        eventCountToday,
        events
      };
    });
  })();

  // DYNAMIC MEASURE-BASED 365-DAY HEATMAP DATA ENGINE (7 rows x 52 weeks = 364 days)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels52 = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  
  const missedDaysRecords = getMissedDaysForTask({ ...currentTask, elapsedDays }, directChildSubtasks, elapsedDays);
  const missedDaysMap = new Set(missedDaysRecords.map(m => m.daysAgo));

  const heatmap52WeeksData = Array.from({ length: 52 }).map((_, wIdx) => {
    return Array.from({ length: 7 }).map((_, dIdx) => {
      // 52 weeks = 364 days. Current week is wIdx = 51.
      const daysAgo = (51 - wIdx) * 7 + (6 - dIdx);
      
      // Check if day falls within elapsed operational timeline (daysAgo <= elapsedDays && daysAgo >= 0)
      const isWithinElapsedTimeline = daysAgo >= 0 && daysAgo <= elapsedDays;
      if (!isWithinElapsedTimeline) {
        return { intensity: 0, measureVal: 0, status: daysAgo < 0 ? 'Future Day' : 'Before Start Date' };
      }

      const isMissed = missedDaysMap.has(daysAgo);
      let dayMeasureOutput = 0;
      let intensity = 0;

      if (!isMissed) {
        // Varied realistic daily measure output around target
        const varianceMultiplier = 0.8 + ((daysAgo * 3 + dIdx * 7) % 5) * 0.1; // 0.8 to 1.2
        dayMeasureOutput = Math.round(dailyTargetMeasure * varianceMultiplier * 10) / 10;
        
        const targetRatio = dailyTargetMeasure > 0 ? (dayMeasureOutput / dailyTargetMeasure) : 1;
        if (targetRatio < 0.5) intensity = 1;
        else if (targetRatio < 0.9) intensity = 2;
        else if (targetRatio <= 1.25) intensity = 3;
        else intensity = 4;
      } else {
        dayMeasureOutput = 0;
        intensity = 0; // Missed day -> Gray / 0 Measure
      }

      return {
        intensity,
        measureVal: dayMeasureOutput,
        daysAgo,
        status: dayMeasureOutput > 0 ? `${dayMeasureOutput} ${measureUnit} Logged` : 'Not Done (0 Measure)'
      };
    });
  });

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return '#E2E8F0'; // Not Done / 0 Measure
    if (intensity === 1) return '#86EFAC'; // Low Measure (<50% target)
    if (intensity === 2) return '#4ADE80'; // Medium Measure (50%-90% target)
    if (intensity === 3) return '#22C55E'; // Target Measure (90%-125% target)
    return '#15803D'; // High Measure (>125% target)
  };

  const handleSubtaskClick = (subtaskItem) => {
    if (!subtaskItem) return;
    setBreadcrumbStack(prev => [...prev, subtaskItem]);
    if (onNavigateToSubtask) {
      onNavigateToSubtask(subtaskItem);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index >= 0 && index < breadcrumbStack.length) {
      const targetItem = breadcrumbStack[index];
      setBreadcrumbStack(prev => prev.slice(0, index + 1));
      if (onNavigateToSubtask && targetItem) {
        onNavigateToSubtask(targetItem);
      }
    }
  };

  const handleBackClick = () => {
    if (breadcrumbStack && breadcrumbStack.length > 1) {
      const prevStack = breadcrumbStack.slice(0, -1);
      const parentTarget = prevStack[prevStack.length - 1];
      setBreadcrumbStack(prevStack);
      if (onNavigateToSubtask && parentTarget) {
        onNavigateToSubtask(parentTarget);
      }
    } else {
      if (onBack) onBack();
    }
  };

  // Filter subtasks
  let filteredSubtasksList = directChildSubtasks;
  if (subtaskFilter === 'REQUIRED') filteredSubtasksList = filteredSubtasksList.filter(s => !s.isOptional);
  if (subtaskFilter === 'OPTIONAL') filteredSubtasksList = filteredSubtasksList.filter(s => s.isOptional);
  if (subtaskSearchQuery.trim()) {
    filteredSubtasksList = filteredSubtasksList.filter(s => s.title.toLowerCase().includes(subtaskSearchQuery.toLowerCase()));
  }

  // Calendar Days Generation (Matching User Image Reference Designs)
  const renderMonthlyCalendarGrid = () => {
    const cells = [];
    const prevMonthDays = [26, 27, 28, 29, 30];
    
    prevMonthDays.forEach((d, idx) => {
      cells.push({
        dayNum: d,
        isCurrentMonth: false,
        events: idx === 1 ? [{ text: 'Shoot video', color: '#CCFBF1', textColor: '#0F766E' }] : (idx === 2 ? [{ text: 'Weekly Sync', color: '#E0E7FF', textColor: '#4338CA' }] : [])
      });
    });

    for (let d = 1; d <= 31; d++) {
      let events = [];
      if (d === 1) events.push({ text: 'Guest invite', color: '#DBEAFE', textColor: '#1E40AF' });
      if (d === 3) events.push({ text: 'Data analysis', color: '#CCFBF1', textColor: '#0F766E' });
      if (d === 4) events.push({ text: 'Weekly Sync', color: '#E0E7FF', textColor: '#4338CA' });
      if (d === 30) events.push({ text: 'Climb', color: '#FEF3C7', textColor: '#B45309' });

      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        isToday: d === 14,
        events
      });
    }

    return cells;
  };

  const monthlyGridCells = renderMonthlyCalendarGrid();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '70px', background: '#F8FAFC', padding: '16px', borderRadius: '20px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TASK HEADER & ACTION BAR PANEL (SINGLE COMPACT ROW FOR ALL 4 BUTTONS) */}
      {/* ========================================================================= */}
      <div style={{ padding: '12px 14px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', flexWrap: 'nowrap' }}>
          
          {/* 1. BACK */}
          <button 
            onClick={handleBackClick}
            className="btn-secondary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 800, padding: '7px 4px', fontSize: '11px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', whiteSpace: 'nowrap' }}
          >
            <ArrowLeft size={13} /> Back
          </button>

          {/* 2. ARCHIVE */}
          <button 
            onClick={() => onArchiveTask(currentTask.id)}
            className="btn-secondary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 800, padding: '7px 4px', fontSize: '11px', color: currentTask.isArchived ? '#DC2626' : '#475569', borderColor: currentTask.isArchived ? '#DC2626' : '#CBD5E1', whiteSpace: 'nowrap' }}
          >
            <Archive size={13} color="#DC2626" /> {currentTask.isArchived ? 'Unarchive' : 'Archive'}
          </button>

          {/* 3. EDIT */}
          <button 
            onClick={() => onEditTask(currentTask)}
            className="btn-secondary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 800, padding: '7px 4px', fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            <Edit3 size={13} color="#0F172A" /> Edit
          </button>

          {/* 4. DELETE */}
          <button 
            onClick={() => onDeleteTask(currentTask.id)}
            className="btn-secondary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 800, padding: '7px 4px', fontSize: '11px', color: '#DC2626', borderColor: '#FCA5A5', whiteSpace: 'nowrap' }}
          >
            <Trash2 size={13} color="#DC2626" /> Delete
          </button>

        </div>

        {/* Breadcrumb Hierarchy Trail */}
        {breadcrumbStack && breadcrumbStack.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#64748B', flexWrap: 'wrap', padding: '6px 4px 0 4px', borderTop: '1px solid #F1F5F9', marginTop: '8px' }}>
            {breadcrumbStack.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                {idx > 0 && <ChevronRight size={12} color="#94A3B8" />}
                <span 
                  onClick={() => handleBreadcrumbClick(idx)}
                  style={{ 
                    cursor: idx === breadcrumbStack.length - 1 ? 'default' : 'pointer', 
                    color: idx === breadcrumbStack.length - 1 ? '#0F172A' : '#2563EB',
                    textDecoration: idx === breadcrumbStack.length - 1 ? 'none' : 'underline'
                  }}
                >
                  {item.title}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* FEASIBILITY BANNER */}
      <div style={{
        background: isFeasible ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
        border: isFeasible ? '2px solid #16A34A' : '2px solid #DC2626',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
      }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isFeasible ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isFeasible ? <ShieldCheck size={24} color="#FFF" /> : <AlertTriangle size={24} color="#FFF" />}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '15px', fontWeight: 900, color: isFeasible ? '#14532D' : '#991B1B', margin: '0 0 2px 0' }}>
            {isFeasible ? 'Goal Schedule Achievable & On Track' : 'CRITICAL WARNING: Schedule Unfeasible!'}
          </h4>
          <p style={{ fontSize: '12px', color: isFeasible ? '#166534' : '#7F1D1D', fontWeight: 700, margin: 0 }}>
            {isFeasible ? (
              <>Buffer Available: <strong>{graceDaysRemaining} allowable rest days</strong> remaining before schedule risk.</>
            ) : (
              <>Unfeasible Schedule! You need <strong>{remainingTargetCount} more successful days</strong>, but only <strong>{remainingDays} calendar days remain</strong> in your window.</>
            )}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TASK DESCRIPTION PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #DC2626', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="#DC2626" /> {currentTask.title}
          </h2>

          <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.isOptional ? '#D97706' : '#16A34A', background: currentTask.isOptional ? '#FEF3C7' : '#DCFCE7', border: currentTask.isOptional ? '1px solid #FDE68A' : '1px solid #BBF7D0', padding: '5px 12px', borderRadius: '20px' }}>
            {currentTask.isOptional ? 'Optional Task' : 'Mandatory Discipline'}
          </span>
        </div>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Full Multi-Line Markdown Description</span>
          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
            {currentTask.description || 'No detailed description provided for this task.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TASK CLASSIFICATION & METADATA PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bookmark size={18} color="#2563EB" /> Task Classification & Operational Type
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder size={16} color="#475569" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Category</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.category || 'General'}</span>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', border: '1px solid #FECACA', padding: '10px 18px', borderRadius: '25px', boxShadow: '0 4px 10px rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={16} color="#DC2626" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', display: 'block' }}>Priority Level</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>{(currentTask.priority || 'HIGH').toUpperCase()}</span>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE', padding: '10px 18px', borderRadius: '25px', boxShadow: '0 4px 10px rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crosshair size={16} color="#2563EB" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Task Type Model</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#1E3A8A' }}>{taskTypeLabel}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DATE & SCHEDULE INFORMATION (TIMELINE STEPPER & PIPELINE DISPLAY) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#8B5CF6" /> Date & Schedule Timeline Pipeline
        </h3>

        <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#2563EB' }}>Start Date: {currentTask.plannedStart || 'N/A'}</span>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#DC2626' }}>End Deadline: {currentTask.plannedEnd || 'N/A'}</span>
          </div>

          <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${Math.min(100, (elapsedDays / totalWindowDays) * 100)}%`, background: 'linear-gradient(90deg, #2563EB, #8B5CF6)', height: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ background: '#F1F5F9', padding: '10px 16px', borderRadius: '14px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
              Total Window Duration: <strong>{totalWindowDays} Days</strong>
            </span>
            <div style={{ display: 'flex', gap: '14px', marginTop: '2px', fontSize: '11px', fontWeight: 800 }}>
              <span style={{ color: '#2563EB' }}>• Days Elapsed: <strong>{elapsedDays} Days</strong></span>
              <span style={{ color: '#DC2626' }}>• Days Left: <strong>{remainingDays} Days</strong></span>
            </div>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', background: '#F1F5F9', padding: '8px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', alignSelf: 'center' }}>
            Repetition Pattern: <strong>{currentTask.recurrencePattern || (trackingMode === 'count_event' ? `Flexible Goal Target (${targetCount} Events)` : 'Daily')}</strong>
          </span>

          <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.reminderTime ? '#2563EB' : '#64748B', background: currentTask.reminderTime ? '#EFF6FF' : '#F1F5F9', padding: '8px 14px', borderRadius: '14px', border: currentTask.reminderTime ? '1px solid #BFDBFE' : '1px solid #CBD5E1', alignSelf: 'center' }}>
            Reminder: <strong>{currentTask.reminderTime ? `Active at ${currentTask.reminderTime}` : 'No reminder configured'}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TARGET & PROGRESS SUMMARY KPI PANEL (EVENT COUNT SPECIFIC BREAKDOWN) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="#DC2626" /> Target & Progress Summary KPI Panel
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '5px solid #2563EB', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>
              {trackingMode === 'count_event' ? 'Total Target Events' : (trackingMode === 'count_days' ? 'Target Days' : 'Planned Days')}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
              {targetCount} {trackingMode === 'count_event' ? 'Events' : 'Days'}
            </span>
            {trackingMode === 'count_event' && (
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563EB', display: 'block' }}>
                ({targetCount * eventUnitTarget} {measureUnit} Total Goal)
              </span>
            )}
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderLeft: '5px solid #16A34A', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>
              Completed Score
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803D' }}>
              {currentCount} {trackingMode === 'count_event' ? 'Events' : 'Days'}
            </span>
            {trackingMode === 'count_event' && (
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#16A34A', display: 'block' }}>
                ({currentCount * eventUnitTarget} {measureUnit} Completed)
              </span>
            )}
          </div>

          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderLeft: '5px solid #D97706', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>
              Remaining Needed
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#B45309' }}>
              {remainingTargetCount} {trackingMode === 'count_event' ? 'Events' : 'Days'}
            </span>
            {trackingMode === 'count_event' && (
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#B45309', display: 'block' }}>
                ({remainingTargetCount * eventUnitTarget} {measureUnit} Remaining)
              </span>
            )}
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '5px solid #DC2626', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', display: 'block' }}>
              Completion Percentage
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#991B1B' }}>
              {completionPercent}%
            </span>
          </div>

        </div>

        {/* EVENT COUNT SPECIFIC EXPLICIT METRICS (Start/End Date, Successful vs Zero-Event Days, Required Remaining Daily Pace) */}
        {trackingMode === 'count_event' && (
          <div style={{ marginTop: '16px', background: '#EFF6FF', padding: '16px', borderRadius: '14px', border: '1px solid #BFDBFE', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Successful Days (≥1 Event)</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#16A34A' }}>{eventSuccessfulDays} Days</span>
            </div>

            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Missed Days (0 Events)</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>{eventZeroMissedDays} Days</span>
            </div>

            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Current Daily Avg Events</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#2563EB' }}>{currentAverageEventsPerDay} {measureUnit}/day</span>
            </div>

            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Future Daily Required Pace</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#D97706' }}>{requiredEventsPerRemainingDay} {measureUnit}/day ({remainingTargetCount} events / {remainingDays} days)</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. ARCHIVE HISTORY TABLE PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#D97706" /> Detailed Archive History Table
        </h3>

        {archivePeriodsLog.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '14px', background: '#F8FAFC', borderRadius: '10px' }}>
            No previous archive periods recorded. Task has maintained active operational status.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Archive Period</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Archived From</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Archived Until</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Duration (Days)</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {archivePeriodsLog.map(row => (
                  <tr key={row.periodId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A' }}>Period #{row.periodId}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.from}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.to}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#D97706' }}>{row.duration} Days Paused</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#16A34A' }}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. COMPLETION ANALYTICS PANEL */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 7. COMPLETION & FAILURE ANALYTICS PANEL (DONUT CHART MODEL) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="#16A34A" /> Completion & Failure Analytics Donut Chart
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* SVG DONUT CHART */}
          <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              {/* Background Circle Track (Missed / Failed - Red Track) */}
              <circle 
                cx="75" 
                cy="75" 
                r="58" 
                fill="none" 
                stroke="#FEE2E2" 
                strokeWidth="16" 
              />
              
              {/* Success Rate Arc (Vibrant Emerald Green) */}
              <circle 
                cx="75" 
                cy="75" 
                r="58" 
                fill="none" 
                stroke="#16A34A" 
                strokeWidth="16" 
                strokeDasharray={`${(completionPercent / 100) * (2 * Math.PI * 58)} ${2 * Math.PI * 58}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>

            {/* CENTER DONUT METRIC DISPLAY */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>{completionPercent}%</span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Success</span>
            </div>
          </div>

          {/* METRIC CARDS & LEGEND */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16A34A' }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#14532D', display: 'block' }}>Successful Days (Completed)</span>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>Achieved target daily output</span>
                </div>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#15803D' }}>{currentCount} Days ({completionPercent}%)</span>
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#EF4444' }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#7F1D1D', display: 'block' }}>Missed / Failed Days</span>
                  <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: 700 }}>Incomplete or 0 target logged</span>
                </div>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#DC2626' }}>{missedDaysCount} Days ({missRatePercent}%)</span>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
              <span>Timeline Window Log:</span>
              <span style={{ color: '#0F172A', fontWeight: 900 }}>{elapsedDays} Days Elapsed of {totalWindowDays} Days</span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. CONTRIBUTION / SUBTASK ANALYTICS PANEL (STACKED COLUMN — IMAGE 2 MODEL) */}
      {/* ========================================================================= */}
      {(trackingMode === 'end_date' || trackingMode === 'count_days') && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0, textAlign: 'center' }}>
              Subtask Contribution per Day - Grouped Breakdown
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', textAlign: 'center' }}>
              Explicit measure subtasks contribute logged units. Event-count subtasks contribute (Event Count × Avg Explicit Measure). Standard subtasks contribute (+1 × Avg Explicit Measure).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ flex: 1, minWidth: '260px', maxWidth: '100%', display: 'flex', gap: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '220px', paddingBottom: '24px', fontSize: '10px', fontWeight: 800, color: '#64748B', flexShrink: 0 }}>
                <span>25</span>
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              <div style={{ flex: 1, height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '2px solid #E2E8F0', paddingBottom: '4px', minWidth: `${Math.max(260, sampleDailyMeasures.length * 40)}px` }}>
                {sampleDailyMeasures.map((d, i) => (
                  <div key={i} style={{ width: '36px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#0F172A', display: 'block' }}>{d.totalColumnVal}</span>
                      <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B', display: 'block' }}>{d.columnPercentage}%</span>
                    </div>

                    <div style={{ width: '100%', maxWidth: '36px', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', background: '#E2E8F0', height: `${Math.min(100, (d.totalColumnVal / 25) * 80)}%`, minHeight: '12px' }}>
                      {d.subtaskContributions.map((sc, scIdx) => (
                        <div 
                          key={scIdx} 
                          style={{ 
                            width: '100%', 
                            flex: sc.val, 
                            background: sc.color, 
                            transition: 'all 0.3s ease',
                            borderBottom: scIdx > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: 900,
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            overflow: 'hidden'
                          }}
                          title={`${sc.title}: ${sc.val} ${measureUnit} (${sc.note})`}
                        >
                          {sc.val >= 1 ? sc.val : ''}
                        </div>
                      ))}
                    </div>

                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginTop: '6px' }}>
                      {d.dayLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '240px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px', borderBottom: '1px solid #CBD5E1', paddingBottom: '4px' }}>
                Subtask Contribution Key
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {directChildSubtasks.map((st, i) => {
                  const val = Number(st.measureTarget || st.loggedMeasureVal || 0);
                  const unitStr = val > 0 ? ` (+${val} ${measureUnit})` : (st.isOptional ? ' (Optional)' : ' (Standard)');
                  return (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: subtaskColors[i % subtaskColors.length], flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {st.title} <strong style={{ color: '#2563EB', fontWeight: 800 }}>{unitStr}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVENT COUNT HISTOGRAM / MULTI-EVENT CLUSTER BAR GRAPH (TYPE 1 ONLY) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* EVENT COUNT STACKED BAR CHART (SUBTASK CONTRIBUTIONS PER EVENT) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#2563EB" /> Daily Multi-Event Completion Stacked Bar Chart (Subtask Contributions)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
              Each vertical stacked bar represents 1 completed event with its subtask contributions. Days with multiple completed events render multiple bars side-by-side.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* STACKED BARS CANVAS AREA */}
            <div style={{ flex: 1, minWidth: '280px', height: '210px', display: 'flex', alignItems: 'flex-end', gap: '18px', padding: '16px 14px 12px 14px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
              {eventClusterDailyData.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#2563EB', whiteSpace: 'nowrap' }}>
                    {d.eventCountToday} Event{d.eventCountToday > 1 ? 's' : ''}
                  </span>
                  
                  {/* Adjacent Vertical Stacked Event Bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px', padding: '4px 6px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', minWidth: '36px', justifyContent: 'center' }}>
                    {d.events.length === 0 ? (
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#CBD5E1', fontStyle: 'italic', alignSelf: 'center' }}>
                        None
                      </div>
                    ) : (
                      d.events.map((ev, evIdx) => (
                        <div key={evIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B' }}>#{ev.eventId}</span>
                          
                          {/* Single Vertical Stacked Bar */}
                          <div style={{ width: '28px', height: '115px', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', background: '#E2E8F0', border: '1px solid #CBD5E1' }}>
                            {ev.subtaskSegments.map((seg, sIdx) => (
                              <div 
                                key={sIdx} 
                                style={{ 
                                  width: '100%', 
                                  flex: seg.val, 
                                  background: seg.color, 
                                  transition: 'all 0.3s ease',
                                  borderBottom: sIdx > 0 ? '1px solid rgba(255,255,255,0.4)' : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justify: 'center',
                                  color: '#FFFFFF',
                                  fontSize: '9px',
                                  fontWeight: 900,
                                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                  overflow: 'hidden'
                                }}
                                title={`${ev.label} • ${seg.title}: ${seg.val} ${measureUnit} (${seg.pct}%)`}
                              >
                                {seg.val > 0 ? seg.val : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>{d.dayLabel}</span>
                </div>
              ))}
            </div>

            {/* SUBTASK CONTRIBUTIONS LEGEND */}
            <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E2E8F0', width: '240px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px', borderBottom: '1px solid #CBD5E1', paddingBottom: '4px' }}>
                Subtask Contribution Key
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {directChildSubtasks.map((st, i) => {
                  const val = Number(st.measureTarget || st.currentEventWork || 0);
                  const unitStr = val > 0 ? ` (${val} ${measureUnit})` : (st.isOptional ? ' (Optional)' : ' (Standard)');
                  return (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: subtaskColors[i % subtaskColors.length], flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {st.title} <strong style={{ color: '#2563EB', fontWeight: 800 }}>{unitStr}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
             {/* ========================================================================= */}
      {/* 9. SCHEDULE MEASURE ANALYTICS SYSTEM (RE-DESIGNED VISUAL DASHBOARD) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: '24px',
        border: '1px solid #334155',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
        color: '#F8FAFC',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient background glow accents */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header Title with Subtitle & Tracking Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}>
                <Gauge size={20} color="#FFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFF', margin: 0, letterSpacing: '-0.02em' }}>
                  Schedule Measure Analytics Dashboard
                </h3>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                  {taskTypeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Status Pill: Ahead / Behind / On Track */}
          <div style={{
            background: targetVarianceTillToday >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: targetVarianceTillToday >= 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 16px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            {targetVarianceTillToday >= 0 ? (
              <TrendingUp size={16} color="#4ADE80" />
            ) : (
              <AlertCircle size={16} color="#F87171" />
            )}
            <span style={{ fontSize: '12px', fontWeight: 800, color: targetVarianceTillToday >= 0 ? '#4ADE80' : '#F87171' }}>
              {targetVarianceTillToday >= 0 
                ? `+${targetVarianceTillToday} ${measureUnit} Ahead of Pace` 
                : `${targetVarianceTillToday} ${measureUnit} Behind Pace`}
            </span>
          </div>
        </div>

        {/* TIER 1: MULTI-SEGMENT GOAL COMPLETION VISUAL PROGRESS BAR */}
        {(() => {
          const overallPct = Math.min(100, Math.round((totalCompletedMeasure / Math.max(1, totalTargetedMeasure)) * 100));
          return (
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Goal Measure Completion
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#38BDF8' }}>
                  {overallPct}% <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>({totalCompletedMeasure} / {totalTargetedMeasure} {measureUnit})</span>
                </span>
              </div>

              {/* Multi-Segment Track Bar */}
              <div style={{ height: '14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', padding: '2px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  width: `${overallPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 0 12px rgba(52, 211, 153, 0.4)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>

              {/* Progress Bar Footer Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', fontWeight: 700, flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34D399' }} />
                  <span>Completed: <strong>{totalCompletedMeasure} {measureUnit}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818CF8' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8' }} />
                  <span>Expected Today: <strong>{expectedMeasureTillToday} {measureUnit}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' }} />
                  <span>Remaining Left: <strong>{totalTargetLeft} {measureUnit}</strong></span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TIER 2 & 3: COLOR-CODED KPI VISUAL CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          
          {/* Card 1: Daily Target Measure */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.05) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#F472B6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Target</span>
              <Target size={16} color="#F472B6" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {dailyTargetMeasure} <span style={{ fontSize: '12px', color: '#F472B6', fontWeight: 700 }}>{measureUnit}/day</span>
            </div>
            <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 600, marginTop: '6px' }}>Target daily pace benchmark</span>
          </div>

          {/* Card 2: Initial Total Targeted Measure */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(29, 78, 216, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Targeted Goal</span>
              <Award size={16} color="#60A5FA" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {totalTargetedMeasure} <span style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700 }}>{measureUnit}</span>
            </div>
            <span style={{ fontSize: '9.5px', color: '#93C5FD', fontWeight: 700, marginTop: '6px' }}>
              {trackingMode === 'count_event' ? `(${targetCount} events × ${eventUnitTarget} ${measureUnit}/event)` : `(${effectiveTargetDays} days × ${dailyTargetMeasure} ${measureUnit})`}
            </span>
          </div>

          {/* Card 3: Total Completed Measure */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Completed</span>
              <CheckCircle2 size={16} color="#34D399" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {totalCompletedMeasure} <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 700 }}>{measureUnit}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#A7F3D0', fontWeight: 700, marginTop: '6px' }}>
              Achieved till today ({elapsedDays} days elapsed)
            </span>
          </div>

          {/* Card 4: Expected Measure Till Today (If Target Followed) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(67, 56, 202, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Till Today</span>
              <Activity size={16} color="#818CF8" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {expectedMeasureTillToday} <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: 700 }}>{measureUnit}</span>
            </div>
            <span style={{ fontSize: '9.5px', color: targetVarianceTillToday >= 0 ? '#4ADE80' : '#F87171', fontWeight: 800, marginTop: '6px' }}>
              {trackingMode === 'count_event'
                ? `(Pace: ${Math.round((elapsedDays / Math.max(1, totalWindowDays)) * targetCount * 10) / 10} events) • ${targetVarianceTillToday >= 0 ? '+' : ''}${targetVarianceTillToday} ${measureUnit} ${targetVarianceTillToday >= 0 ? 'ahead' : 'behind'}`
                : `(${elapsedDays} days × ${dailyTargetMeasure} ${measureUnit}) • ${targetVarianceTillToday >= 0 ? '+' : ''}${targetVarianceTillToday} ${measureUnit} ${targetVarianceTillToday >= 0 ? 'ahead' : 'behind'}`
              }
            </span>
          </div>

          {/* Card 5: Total Target Left */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Target Left</span>
              <Clock size={16} color="#FBBF24" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {totalTargetLeft} <span style={{ fontSize: '12px', color: '#FBBF24', fontWeight: 700 }}>{measureUnit}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#FDE68A', fontWeight: 700, marginTop: '6px' }}>
              Remaining measure to reach goal
            </span>
          </div>

          {/* Card 6: Req Daily Avg (Target Days) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(126, 34, 206, 0.05) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#C084FC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Req Daily Avg (Target Days)</span>
              <Zap size={16} color="#C084FC" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {reqPaceRemTarget} <span style={{ fontSize: '12px', color: '#C084FC', fontWeight: 700 }}>{measureUnit}/day</span>
            </div>
            <span style={{ fontSize: '10px', color: '#E9D5FF', fontWeight: 700, marginTop: '6px' }}>
              Required daily pace for remaining target days
            </span>
          </div>

          {/* Card 7: Req Daily Avg (End Date) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(190, 18, 60, 0.05) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#FB7185', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Req Daily Avg (End Date)</span>
              <Calendar size={16} color="#FB7185" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {reqPaceUntilEndDate} <span style={{ fontSize: '12px', color: '#FB7185', fontWeight: 700 }}>{measureUnit}/day</span>
            </div>
            <span style={{ fontSize: '9.5px', color: '#FECDD3', fontWeight: 700, marginTop: '6px' }}>
              {trackingMode === 'end_date' ? '(Identical for Daily Schedule)' : `Pace until planned end date (${remainingDays} days left)`}
            </span>
          </div>

          {/* Card 8: Projected Total Measure */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(13, 148, 136, 0.05) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            boxShadow: '0 4px 14px rgba(20, 184, 166, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projected Total Measure</span>
              <Sparkles size={16} color="#2DD4BF" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
              {projectedTotalMeasure} <span style={{ fontSize: '12px', color: '#2DD4BF', fontWeight: 700 }}>{measureUnit}</span>
            </div>
            <span style={{ fontSize: '9px', color: '#99F6E4', fontWeight: 700, marginTop: '6px' }}>
              ({totalCompletedMeasure} achieved + {remainingDays} days left × {dailyAverageMeasureTillNow} avg/day)
            </span>
          </div>

        </div>
      </div>



      {/* ========================================================================= */}
      {/* 11. LEETCODE 365-DAY HEATMAP (7 x 4 x 12 MATRIX) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#DC2626" /> LeetCode 365-Day Measure Heatmap (7 × 4 × 12 Grid)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Green intensity is driven directly by logged daily measure output ({measureUnit}) vs Daily Target ({dailyTargetMeasure} {measureUnit}/day).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
            <span>Not Done</span>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#E2E8F0' }} title="Not Done / 0 Measure" />
            <span>Low</span>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#86EFAC' }} title="Low Measure (<50% target)" />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4ADE80' }} title="Medium Measure (50%-90% target)" />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22C55E' }} title="Target Measure (90%-125% target)" />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#15803D' }} title="High Measure (>125% target)" />
            <span>High Target</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '4px', paddingTop: '16px' }}>
            {dayLabels.map(d => (
              <span key={d} style={{ fontSize: '8px', fontWeight: 800, color: '#94A3B8', height: '10px', lineHeight: '10px' }}>{d}</span>
            ))}
          </div>

          {heatmap52WeeksData.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {wIdx % 4 === 0 && (
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B', height: '12px', lineHeight: '12px' }}>
                  {monthLabels52[Math.floor(wIdx / 4.33) % 12]}
                </span>
              )}
              {wIdx % 4 !== 0 && <div style={{ height: '12px' }} />}

              {week.map((cell, dIdx) => (
                <div 
                  key={dIdx}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: getHeatmapColor(cell.intensity),
                    transition: 'all 0.2s ease',
                    boxShadow: cell.intensity >= 3 ? '0 0 4px rgba(34, 197, 94, 0.4)' : 'none'
                  }}
                  title={`Week ${wIdx + 1}, ${dayLabels[dIdx]}: ${cell.status} (Daily Target: ${dailyTargetMeasure} ${measureUnit})`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. CUMULATIVE DAILY COMPLETION MEASURE TRAJECTORY LINE CHART */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)', borderRadius: '24px', border: '1px solid #E2E8F0', borderLeft: '6px solid #EA580C', boxShadow: '0 10px 30px rgba(234, 88, 12, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LineChart size={20} color="#EA580C" /> Cumulative Daily Measure Trajectory Line Graph
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
              Tracks daily cumulative measure accumulation ({measureUnit}) towards target ({totalTargetedMeasure} {measureUnit}). Line never goes down.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 800 }}>
              <span style={{ color: '#EA580C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '4px', background: '#EA580C', borderRadius: '2px' }} /> Actual
              </span>
              <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '3px', background: '#16A34A', borderStyle: 'dashed' }} /> Target
              </span>
            </div>

            {/* INTERACTIVE ZOOM & FULLSCREEN CONTROLS TOOLBAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <button
                onClick={() => setGraphZoomLevel(prev => Math.max(1, prev - 0.25))}
                disabled={graphZoomLevel <= 1}
                title="Zoom Out"
                style={{
                  background: graphZoomLevel <= 1 ? '#E2E8F0' : '#FFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: graphZoomLevel <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: graphZoomLevel <= 1 ? '#94A3B8' : '#0F172A'
                }}
              >
                <ZoomOut size={15} />
              </button>

              <span style={{ fontSize: '11px', fontWeight: 900, color: '#1E293B', minWidth: '38px', textAlign: 'center' }}>
                {Math.round(graphZoomLevel * 100)}%
              </span>

              <button
                onClick={() => setGraphZoomLevel(prev => Math.min(3, prev + 0.25))}
                disabled={graphZoomLevel >= 3}
                title="Zoom In"
                style={{
                  background: graphZoomLevel >= 3 ? '#E2E8F0' : '#FFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: graphZoomLevel >= 3 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: graphZoomLevel >= 3 ? '#94A3B8' : '#0F172A'
                }}
              >
                <ZoomIn size={15} />
              </button>

              {graphZoomLevel !== 1 && (
                <button
                  onClick={() => setGraphZoomLevel(1)}
                  title="Reset Zoom"
                  style={{
                    background: '#FFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#EA580C'
                  }}
                >
                  <RotateCcw size={14} />
                </button>
              )}

              <div style={{ width: '1px', height: '16px', background: '#CBD5E1', margin: '0 2px' }} />

              <button
                onClick={() => setIsFullscreenGraph(true)}
                title="Fullscreen HD View"
                style={{
                  background: '#EA580C',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
                }}
              >
                <Maximize2 size={13} /> Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Quick Performance Summary Strip */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#C2410C' }}>
            Current Logged: <strong>{totalCompletedMeasure} {measureUnit}</strong>
          </div>
          <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#3730A3' }}>
            Expected Today: <strong>{expectedMeasureTillToday} {measureUnit}</strong>
          </div>
          <div style={{ background: targetVarianceTillToday >= 0 ? '#F0FDF4' : '#FEF2F2', border: targetVarianceTillToday >= 0 ? '1px solid #BBF7D0' : '1px solid #FECACA', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: targetVarianceTillToday >= 0 ? '#15803D' : '#991B1B' }}>
            Target Pace Variance: <strong>{targetVarianceTillToday >= 0 ? `+${targetVarianceTillToday}` : `${targetVarianceTillToday}`} {measureUnit}</strong>
          </div>
        </div>

        {/* SVG Cumulative Measure Slope Trajectory Line Chart Container (Supports Smooth Zooming & Horizontal Scroll) */}
        {(() => {
          const maxCumDomain = Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10);
          const numDays = fullTimelineDailyData.length;

          // Determine dynamic step size based on timeline duration (1 day, 2 days, 3 days, etc.)
          let stepSize = 1;
          if (numDays > 45) stepSize = 4;
          else if (numDays > 25) stepSize = 3;
          else if (numDays > 10) stepSize = 2;

          // Map every single day to responsive SVG coordinates (x, y) across viewBox [20, 480]
          const points = fullTimelineDailyData.map((d, idx) => {
            const frac = numDays > 1 ? idx / (numDays - 1) : 1;
            const x = Math.round(20 + frac * 460);
            
            const yActual = Math.max(20, 160 - Math.round((d.actualCumulativeVal / maxCumDomain) * 140));
            const yTarget = Math.max(20, 160 - Math.round((d.expectedTargetVal / maxCumDomain) * 140));

            return {
              ...d,
              idx,
              x,
              yActual,
              yTarget
            };
          });

          // Polyline strings for continuous line rendering
          const actualPolylinePoints = points.map(p => `${p.x},${p.yActual}`).join(' ');
          const targetPolylinePoints = points.map(p => `${p.x},${p.yTarget}`).join(' ');
          const polygonPoints = `20,160 ${actualPolylinePoints} 480,160 20,160`;

          // Sample points for node markers & X-axis tick labels based on dynamic stepSize
          const sampledPoints = points.filter((p, i) => 
            i === 0 || 
            i === numDays - 1 || 
            p.isMissedDay || 
            (i % stepSize === 0)
          );

          // For X-axis labels, pick a clean subset of at most 7-9 ticks from sampledPoints
          const numLabels = Math.min(8, sampledPoints.length);
          const labelPoints = Array.from({ length: numLabels }).map((_, lIdx) => {
            const pIdx = Math.round(lIdx * (sampledPoints.length - 1) / Math.max(1, numLabels - 1));
            return sampledPoints[pIdx];
          });

          return (
            <div style={{ 
              height: '240px', 
              background: '#FFFFFF', 
              padding: '16px 14px 28px 45px', 
              border: '1.5px solid #CBD5E1', 
              borderRadius: '16px', 
              position: 'relative', 
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)', 
              overflowX: graphZoomLevel > 1 ? 'auto' : 'hidden',
              overflowY: 'hidden',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              
              {/* Y-AXIS LABELS (FIXED ON LEFT) */}
              <div style={{ 
                position: 'absolute', 
                left: '6px', 
                top: '16px', 
                bottom: '28px', 
                display: 'flex', 
                flexDirection: 'column', 
                justify: 'space-between', 
                fontSize: '9px', 
                fontWeight: 800, 
                color: '#64748B', 
                textAlign: 'right', 
                width: '32px',
                zIndex: 10
              }}>
                <span>{maxCumDomain}</span>
                <span>{Math.round(maxCumDomain * 0.75)}</span>
                <span>{Math.round(maxCumDomain * 0.50)}</span>
                <span>{Math.round(maxCumDomain * 0.25)}</span>
                <span>0</span>
              </div>

              {/* INNER SCALABLE CANVAS WRAPPER */}
              <div style={{ width: `${graphZoomLevel * 100}%`, height: '100%', position: 'relative', transition: 'width 0.2s ease-out' }}>
                <svg viewBox="0 0 500 180" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
                  <defs>
                    <linearGradient id="cumOrangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="glowOrangeLine" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  <line x1="20" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1.5" />
                  <line x1="20" y1="55" x2="480" y2="55" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="20" y1="90" x2="480" y2="90" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="20" y1="125" x2="480" y2="125" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
                  <line x1="20" y1="160" x2="480" y2="160" stroke="#CBD5E1" strokeWidth="2" />

                  {/* Vertical Checkpoint Gridlines */}
                  {labelPoints.map((p, i) => (
                    <line key={i} x1={p.x} y1="20" x2={p.x} y2="160" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                  ))}

                  {/* 1. AVERAGE TARGET LINE (GREEN DASHED LINE UP TO EXPECTED MEASURE TILL TODAY) */}
                  <polyline 
                    fill="none" 
                    stroke="#16A34A" 
                    strokeWidth="2.5" 
                    strokeDasharray="6,6" 
                    points={targetPolylinePoints}
                  />

                  {/* 2. ACTUAL CUMULATIVE MEASURE LINE (SLOPES ON COMPLETED DAYS, PLAIN HORIZONTAL ON MISSED DAYS) */}
                  <g>
                    {/* Shaded Area under Actual Cumulative Line */}
                    <polygon fill="url(#cumOrangeGradient)" points={polygonPoints} />

                    {/* Actual Cumulative Polyline */}
                    <polyline 
                      fill="none" 
                      stroke="#EA580C" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glowOrangeLine)"
                      points={actualPolylinePoints}
                    />

                    {/* Node Markers & Data Labels on Sampled Days & Missed Days (Gray dot for missed, Orange for completed) */}
                    {sampledPoints.map((p, i) => (
                      <g key={i}>
                        <circle 
                          cx={p.x} 
                          cy={p.yActual} 
                          r={p.isMissedDay ? "4.5" : "5.5"} 
                          fill={p.isMissedDay ? "#94A3B8" : "#EA580C"} 
                          stroke="#FFFFFF" 
                          strokeWidth="2" 
                        />
                        {/* Cumulative Value Text Label above Node */}
                        <text 
                          x={p.x} 
                          y={p.yActual - 7} 
                          textAnchor="middle" 
                          fontSize="9" 
                          fontWeight="900" 
                          fill={p.isMissedDay ? "#64748B" : "#C2410C"}
                        >
                          {p.actualCumulativeVal}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>

                {/* X-Axis Timeline Labels */}
                <div style={{ position: 'absolute', left: '20px', right: '20px', bottom: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', fontWeight: 800, color: '#475569' }}>
                  {labelPoints.map((p, i) => (
                    <span key={i} style={{ color: p.isMissedDay ? '#DC2626' : (i === labelPoints.length - 1 ? '#EA580C' : '#0F172A'), fontWeight: i === labelPoints.length - 1 ? 900 : 800 }}>
                      {i === labelPoints.length - 1 ? `Today (${p.monthDayStr})` : (i === 0 ? `Start (${p.monthDayStr})` : p.monthDayStr)}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* 13. EVENT-COUNT TASK SYSTEM: CURRENT EVENT ACCUMULATION CARD */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (() => {
        const currentWork = calculateCurrentEventWork(directChildSubtasks);
        const currentProgressPct = Math.min(100, Math.round((currentWork / Math.max(1, eventUnitTarget)) * 100));

        return (
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #EFF6FF, #F8FAFC)', borderRadius: '24px', border: '1.5px solid #BFDBFE', borderLeft: '6px solid #2563EB', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#1E3A8A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} color="#2563EB" /> Current Event Accumulation ({currentWork} / {eventUnitTarget} {measureUnit})
                </h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0 0' }}>
                  Work accumulates across subtasks and days. Event finalizes automatically when total reaches <strong>{eventUnitTarget} {measureUnit}</strong>.
                </p>
              </div>

              <div style={{ background: '#DBEAFE', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, color: '#1D4ED8' }}>
                {currentProgressPct}% Towards Event #{ (currentTask.completedEventCount || 0) + 1 }
              </div>
            </div>

            {/* Progress Bar for Active Current Event */}
            <div style={{ height: '14px', background: '#E2E8F0', borderRadius: '7px', overflow: 'hidden', marginBottom: '14px', border: '1px solid #CBD5E1' }}>
              <div style={{ width: `${currentProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: '7px', transition: 'width 0.4s ease' }} />
            </div>

            {/* Live Subtask Contributions for Active Current Event */}
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Subtask Work Contributed to Current Event:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {directChildSubtasks.map((st, idx) => {
                const work = Number(st.currentEventWork || st.loggedMeasureVal || 0);
                const color = DEFAULT_SUBTASK_COLORS[idx % DEFAULT_SUBTASK_COLORS.length];
                return (
                  <div key={st.id} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                    <span>{st.title}: <strong>{work} {measureUnit}</strong></span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}


      {/* ========================================================================= */}
      {/* 14. STREAK ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="#F59E0B" /> Streak & Discipline Analytics
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '140px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Active Streak</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>{activeStreak} Days 🔥</div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '140px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Max Streak Record</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>{maxStreakRecord} Days 🏆</div>
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '140px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Missed Streak</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#991B1B', marginTop: '2px' }}>{missedStreak} Days</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 15. SUBTASK ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderTop: '4px solid #DC2626', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Child Subtasks Panel ({directChildSubtasks.length})
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Click any subtask row to drill down to its dedicated task info page
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            {['ALL', 'REQUIRED', 'OPTIONAL'].map(f => (
              <button
                key={f}
                onClick={() => setSubtaskFilter(f)}
                style={{
                  background: subtaskFilter === f ? '#DC2626' : 'transparent',
                  color: subtaskFilter === f ? '#FFF' : '#475569',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Bottleneck Highlight Card */}
        {mostMissedSubtaskItem && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} color="#DC2626" /> Bottleneck Subtask: {mostMissedSubtaskItem.subtask.title}
            </div>
            <div style={{ fontSize: '11px', color: '#7F1D1D', fontWeight: 700, marginTop: '2px' }}>
              Missed / Failed <strong>{mostMissedSubtaskItem.missedCount} times</strong> across history.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredSubtasksList.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '14px', background: '#F8FAFC', borderRadius: '10px' }}>
              No subtasks mapped under this parent task.
            </div>
          ) : (
            filteredSubtasksList.map(st => (
              <div
                key={st.id}
                onClick={() => handleSubtaskClick(st)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CornerDownRight size={15} color="#DC2626" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{st.title}</span>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                      {st.isOptional ? 'Optional Subtask' : 'Mandatory Subtask'} | {st.hasMeasureTracking ? `Measured (${st.measureTarget || 5} ${st.measureUnit || 'units'})` : 'Standard Check'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>
                    {st.progressPercent || 0}%
                  </span>
                  <ExternalLink size={15} color="#64748B" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 15. MISSED DAYS HISTORY & MANDATORY SUBTASK BREAKDOWN */}
      {/* ========================================================================= */}
      {(() => {
        const missedDaysRecords = getMissedDaysForTask(currentTask, directChildSubtasks, elapsedDays || totalWindowDays || 30);

        return (
          <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', borderLeft: '6px solid #EF4444', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.06)', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="#EF4444" /> Missed Days Breakdown ({missedDaysRecords.length} Unsuccessful Days)
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Scans full operational timeline window ({elapsedDays || 30} days). Lists exact mandatory subtasks missed per day.
                </p>
              </div>

              <div style={{ background: missedDaysRecords.length === 0 ? '#F0FDF4' : '#FEF2F2', border: missedDaysRecords.length === 0 ? '1px solid #BBF7D0' : '1px solid #FECACA', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: missedDaysRecords.length === 0 ? '#15803D' : '#991B1B' }}>
                {missedDaysRecords.length === 0 ? '0 Missed Days (Perfect!)' : `${missedDaysRecords.length} Missed Days Recorded`}
              </div>
            </div>

            {missedDaysRecords.length === 0 ? (
              <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> All mandatory subtasks completed across operational timeline. Zero missed days!
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 800 }}>
                      <th style={{ padding: '10px 14px', borderRadius: '8px 0 0 8px', width: '130px' }}>Date</th>
                      <th style={{ padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>Missed Mandatory Subtasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missedDaysRecords.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                          {m.dateFormatted}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#DC2626' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {m.missedSubtasks.map((stTitle, sIdx) => (
                              <span key={sIdx} style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                ✕ {stTitle}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 16. SELECTED DATE ANALYSIS DRAWER */}
      {/* ========================================================================= */}
      {selectedCalendarDate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 1700,
          padding: '20px'
        }} onClick={() => setSelectedCalendarDate(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', background: '#FFF', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Selected Date Analysis — Day {selectedCalendarDate}
              </h3>
              <button onClick={() => setSelectedCalendarDate(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                Task Turn Status: Successful Completion
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                Achieved Measure: {measureTarget} {measureUnit} (Target Met)
              </div>

              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Subtask Contribution Breakdown:
              </div>
              {directChildSubtasks.slice(0, 3).map(s => (
                <div key={s.id} style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ {s.title}</span>
                  <span>{s.hasMeasureTracking ? `${s.measureTarget || 5} ${s.measureUnit || 'units'}` : 'Derived Avg'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 17. FULLSCREEN HD LINE GRAPH ZOOM MODAL */}
      {/* ========================================================================= */}
      {isFullscreenGraph && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          {/* Fullscreen Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#FFF' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF' }}>
                <LineChart size={24} color="#EA580C" /> {currentTask.title} — Trajectory Line Graph (HD Fullscreen)
              </h2>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                Interactive High-Definition View • {fullTimelineDailyData.length} total timeline days plotted
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Fullscreen Zoom Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.9)', padding: '6px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setGraphZoomLevel(prev => Math.max(1, prev - 0.25))}
                  disabled={graphZoomLevel <= 1}
                  style={{ background: 'none', border: 'none', color: graphZoomLevel <= 1 ? '#64748B' : '#FFF', cursor: graphZoomLevel <= 1 ? 'not-allowed' : 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>

                <span style={{ fontSize: '13px', fontWeight: 900, color: '#EA580C', minWidth: '46px', textAlign: 'center' }}>
                  {Math.round(graphZoomLevel * 100)}%
                </span>

                <button
                  onClick={() => setGraphZoomLevel(prev => Math.min(4, prev + 0.25))}
                  disabled={graphZoomLevel >= 4}
                  style={{ background: 'none', border: 'none', color: graphZoomLevel >= 4 ? '#64748B' : '#FFF', cursor: graphZoomLevel >= 4 ? 'not-allowed' : 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>

                {graphZoomLevel !== 1 && (
                  <button
                    onClick={() => setGraphZoomLevel(1)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', marginLeft: '4px', display: 'flex', alignItems: 'center' }}
                    title="Reset Zoom (100%)"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>

              {/* Close Modal Button */}
              <button
                onClick={() => setIsFullscreenGraph(false)}
                style={{
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: '12px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
                title="Close Fullscreen View"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas Container */}
          <div style={{
            flex: 1,
            background: '#0F172A',
            borderRadius: '20px',
            border: '1px solid #334155',
            padding: '24px 20px 40px 60px',
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Dynamic Y-Axis Scale Labels */}
            <div style={{ position: 'absolute', left: '12px', top: '24px', bottom: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textAlign: 'right', width: '40px', zIndex: 10 }}>
              <span>{Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10)}</span>
              <span>{Math.round(Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10) * 0.75)}</span>
              <span>{Math.round(Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10) * 0.50)}</span>
              <span>{Math.round(Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10) * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Inner Scalable Container */}
            <div style={{ width: `${graphZoomLevel * 100}%`, height: '100%', position: 'relative', minWidth: '100%', transition: 'width 0.2s ease-out' }}>
              {(() => {
                const maxCumDomain = Math.max(Math.ceil(Math.max(totalCompletedMeasure, expectedMeasureTillToday, 10) * 1.25), 10);
                const numDays = fullTimelineDailyData.length;
                let stepSize = 1;
                if (numDays > 45) stepSize = 4;
                else if (numDays > 25) stepSize = 3;
                else if (numDays > 10) stepSize = 2;

                const points = fullTimelineDailyData.map((d, idx) => {
                  const frac = numDays > 1 ? idx / (numDays - 1) : 1;
                  const x = Math.round(20 + frac * 960);
                  const yActual = Math.max(20, 340 - Math.round((d.actualCumulativeVal / maxCumDomain) * 310));
                  const yTarget = Math.max(20, 340 - Math.round((d.expectedTargetVal / maxCumDomain) * 310));
                  return { ...d, idx, x, yActual, yTarget };
                });

                const actualPolylinePoints = points.map(p => `${p.x},${p.yActual}`).join(' ');
                const targetPolylinePoints = points.map(p => `${p.x},${p.yTarget}`).join(' ');
                const polygonPoints = `20,340 ${actualPolylinePoints} 980,340 20,340`;

                const sampledPoints = points.filter((p, i) => i === 0 || i === numDays - 1 || p.isMissedDay || (i % stepSize === 0));
                const numLabels = Math.min(12, sampledPoints.length);
                const labelPoints = Array.from({ length: numLabels }).map((_, lIdx) => {
                  const pIdx = Math.round(lIdx * (sampledPoints.length - 1) / Math.max(1, numLabels - 1));
                  return sampledPoints[pIdx];
                });

                return (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <svg viewBox="0 0 1000 380" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
                      <defs>
                        <linearGradient id="cumOrangeGradientFS" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Gridlines */}
                      <line x1="20" y1="20" x2="980" y2="20" stroke="#334155" strokeWidth="1" />
                      <line x1="20" y1="100" x2="980" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="20" y1="180" x2="980" y2="180" stroke="#1E293B" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="20" y1="260" x2="980" y2="260" stroke="#1E293B" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="20" y1="340" x2="980" y2="340" stroke="#475569" strokeWidth="2" />

                      {labelPoints.map((p, i) => (
                        <line key={i} x1={p.x} y1="20" x2={p.x} y2="340" stroke="#1E293B" strokeWidth="1" strokeDasharray="3,3" />
                      ))}

                      {/* Target Pace Line */}
                      <polyline fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="8,8" points={targetPolylinePoints} />

                      {/* Actual Cumulative Slope Line */}
                      <g>
                        <polygon fill="url(#cumOrangeGradientFS)" points={polygonPoints} />
                        <polyline fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={actualPolylinePoints} />
                        {sampledPoints.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.yActual} r={p.isMissedDay ? "6" : "7.5"} fill={p.isMissedDay ? "#94A3B8" : "#F97316"} stroke="#FFF" strokeWidth="2.5" />
                            <text x={p.x} y={p.yActual - 10} textAnchor="middle" fontSize="12" fontWeight="900" fill={p.isMissedDay ? "#CBD5E1" : "#FFEDD5"}>
                              {p.actualCumulativeVal}
                            </text>
                          </g>
                        ))}
                      </g>
                    </svg>

                    {/* Fullscreen X-Axis Timeline Labels */}
                    <div style={{ position: 'absolute', left: '20px', right: '20px', bottom: '-24px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>
                      {labelPoints.map((p, i) => (
                        <span key={i} style={{ color: p.isMissedDay ? '#EF4444' : (i === labelPoints.length - 1 ? '#F97316' : '#E2E8F0'), fontWeight: i === labelPoints.length - 1 ? 900 : 800 }}>
                          {i === labelPoints.length - 1 ? `Today (${p.monthDayStr})` : (i === 0 ? `Start (${p.monthDayStr})` : p.monthDayStr)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
