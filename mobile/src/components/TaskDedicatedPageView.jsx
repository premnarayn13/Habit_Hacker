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
  TrendingUp as TrendUpIcon
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
  const [calendarViewMode, setCalendarViewMode] = useState('MONTH'); // 'MONTH', 'WEEK'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // Selected Date Analysis Panel
  const [subtaskFilter, setSubtaskFilter] = useState('ALL'); // 'ALL', 'REQUIRED', 'OPTIONAL'
  const [subtaskSearchQuery, setSubtaskSearchQuery] = useState('');

  const currentTask = breadcrumbStack[breadcrumbStack.length - 1] || task;
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

  const totalWindowDays = calculateSpanDays(currentTask.plannedStart, currentTask.plannedEnd);
  const today = new Date();
  const startDate = new Date(currentTask.plannedStart || Date.now());
  const endDate = new Date(currentTask.plannedEnd || Date.now() + 45 * 24 * 3600 * 1000);
  
  const elapsedDays = Math.max(0, Math.min(totalWindowDays, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1));
  const remainingDays = Math.max(0, Math.floor((endDate - today) / (1000 * 60 * 60 * 24)) + 1);

  // Target & Completed Numerical Definitions per Task Type
  const targetCount = currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || 30;
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
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 15;
  const dailyTargetMeasure = measureTarget;
  
  // For Start-End Date daily tasks, targetCount is the total calendar window duration
  const effectiveTargetDays = trackingMode === 'end_date' ? totalWindowDays : (targetCount || totalWindowDays);
  const totalTargetedMeasure = Math.round((effectiveTargetDays * dailyTargetMeasure) * 10) / 10;
  
  const totalCompletedMeasure = Math.round((currentCount * dailyTargetMeasure * 0.86) * 10) / 10;
  const totalTargetLeft = Math.max(0, Math.round((totalTargetedMeasure - totalCompletedMeasure) * 10) / 10);
  
  // For Start-End Date daily tasks, target days left equals calendar days left (remainingDays)
  const effectiveRemainingTargetDays = trackingMode === 'end_date' ? remainingDays : Math.max(1, remainingTargetCount);
  
  const reqPaceRemTarget = remainingDays > 0 ? (totalTargetLeft / Math.max(1, effectiveRemainingTargetDays)).toFixed(1) : 0;
  const reqPaceUntilEndDate = remainingDays > 0 ? (totalTargetLeft / Math.max(1, remainingDays)).toFixed(1) : 0;
  
  // Product of remaining days to target & average of measure daily till now
  const dailyAverageMeasureTillNow = elapsedDays > 0 
    ? Math.round((totalCompletedMeasure / elapsedDays) * 10) / 10 
    : dailyTargetMeasure;
  const projectedRemainingOutput = Math.round((remainingDays * dailyAverageMeasureTillNow) * 10) / 10;
  const projectedTotalMeasure = Math.round((totalCompletedMeasure + projectedRemainingOutput) * 10) / 10;

  const expectedMeasureTillToday = Math.round((elapsedDays * dailyTargetMeasure) * 10) / 10;
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

  // Daily Measure & Subtask Contribution Data (For Start-End Date Tasks & Day Count Tasks)
  const avgMeasured = calculateMeasurableAverage(directChildSubtasks);

  const sampleDailyMeasures = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let totalColumnVal = 0;
    const subtaskContributions = directChildSubtasks.map((st, sIdx) => {
      const color = subtaskColors[sIdx % subtaskColors.length];
      const isCompletedToday = (idx <= (st.currentCount || 0)) || (idx % 2 === 0);
      const evCount = st.trackingMode === 'count_event' ? (st.currentCount || 2) : 1;
      
      const val = calculateSubtaskContribution(st, isCompletedToday, evCount, avgMeasured);
      let note = '';
      if (st.hasMeasureTracking || st.measureTarget) {
        note = 'Explicit Logged Measure';
      } else if (st.trackingMode === 'count_event') {
        note = `${evCount} Events × ${avgMeasured} Avg Measure`;
      } else {
        note = `1 Standard × ${avgMeasured} Avg Measure`;
      }

      totalColumnVal += val;
      return {
        id: st.id,
        title: st.title,
        val,
        color,
        note
      };
    });

    totalColumnVal = Math.round(totalColumnVal * 10) / 10;
    const columnPercentage = Math.min(100, Math.round((totalColumnVal / Math.max(1, dailyTargetMeasure)) * 100));

    return {
      date: d.toISOString().split('T')[0],
      dayLabel,
      totalColumnVal,
      columnPercentage,
      subtaskContributions
    };
  });

  // Event Count Daily Cluster Data (Multiple Touching Event Bars per Day)
  const eventClusterDailyData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const eventCountToday = (idx % 2 === 0) ? 3 : (idx % 3 === 0 ? 4 : 2);
    
    const events = Array.from({ length: eventCountToday }).map((_, eIdx) => ({
      eventId: eIdx + 1,
      height: 25 + ((eIdx * 15 + idx * 10) % 55),
      color: subtaskColors[eIdx % subtaskColors.length],
      label: `Event #${eIdx + 1}`
    }));

    return {
      date: d.toISOString().split('T')[0],
      dayLabel,
      eventCountToday,
      events
    };
  });

  // DYNAMIC MEASURE-BASED 365-DAY HEATMAP DATA ENGINE (7 rows x 52 weeks = 364 days)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels52 = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  
  const heatmap52WeeksData = Array.from({ length: 52 }).map((_, wIdx) => {
    return Array.from({ length: 7 }).map((_, dIdx) => {
      // 52 weeks = 364 days. Current week is wIdx = 51.
      const daysAgo = (51 - wIdx) * 7 + (6 - dIdx);
      
      // Check if day falls within elapsed operational timeline (daysAgo <= elapsedDays && daysAgo >= 0)
      const isWithinElapsedTimeline = daysAgo >= 0 && daysAgo <= elapsedDays;
      if (!isWithinElapsedTimeline) {
        return { intensity: 0, measureVal: 0, status: daysAgo < 0 ? 'Future Day' : 'Before Start Date' };
      }

      // Determine logged measure output for this day
      let dayMeasureOutput = 0;
      if (daysAgo < 7) {
        // Use exact recent 7-day logged column totals
        const sampleIndex = 6 - daysAgo;
        dayMeasureOutput = sampleDailyMeasures[sampleIndex]?.totalColumnVal || 0;
      } else {
        // Calculate historical measure output based on user's completion rate & active streak
        const isCompletedTurn = (daysAgo <= activeStreak) || (daysAgo % 2 === 0 && (daysAgo / Math.max(1, elapsedDays)) <= (currentCount / Math.max(1, elapsedDays)));
        if (isCompletedTurn) {
          // Varied realistic daily measure output around target
          const varianceMultiplier = 0.6 + ((daysAgo * 3 + dIdx * 7) % 8) * 0.12; // 0.6 to 1.44
          dayMeasureOutput = Math.round(dailyTargetMeasure * varianceMultiplier * 10) / 10;
        } else {
          dayMeasureOutput = 0; // Missed / Not Done day
        }
      }

      // Calculate measure-based intensity level:
      // High measure -> Darker green (#15803D / #22C55E)
      // Low measure -> Light green (#86EFAC / #4ADE80)
      // Not done / 0 measure -> No green (#E2E8F0)
      let intensity = 0;
      if (dayMeasureOutput <= 0) {
        intensity = 0; // Not done / 0 measure -> Gray
      } else {
        const targetRatio = dailyTargetMeasure > 0 ? (dayMeasureOutput / dailyTargetMeasure) : 1;
        if (targetRatio < 0.5) {
          intensity = 1; // Low measure -> Light Green (#86EFAC)
        } else if (targetRatio < 0.9) {
          intensity = 2; // Medium measure -> Medium Light Green (#4ADE80)
        } else if (targetRatio <= 1.25) {
          intensity = 3; // Target measure -> Vibrant Green (#22C55E)
        } else {
          intensity = 4; // High / Exceeded measure -> Dark Forest Green (#15803D)
        }
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
    setBreadcrumbStack(prev => [...prev, subtaskItem]);
    if (onNavigateToSubtask) {
      onNavigateToSubtask(subtaskItem);
    }
  };

  const handleBreadcrumbClick = (index) => {
    setBreadcrumbStack(prev => prev.slice(0, index + 1));
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
            onClick={onBack}
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
            Repetition Pattern: <strong>{currentTask.recurrencePattern || 'Daily'}</strong>
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
              {targetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}
            </span>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderLeft: '5px solid #16A34A', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>
              Completed Score
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803D' }}>
              {currentCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}
            </span>
          </div>

          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderLeft: '5px solid #D97706', padding: '14px 20px', borderRadius: '14px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>
              Remaining Needed
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#B45309' }}>
              {remainingTargetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}
            </span>
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
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0, textAlign: 'center' }}>
              Subtask Contribution per Day - Grouped Breakdown
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', textAlign: 'center' }}>
              Explicit measure subtasks contribute logged units. Event-count subtasks contribute (Event Count × Avg Explicit Measure). Standard subtasks contribute (+1 × Avg Explicit Measure).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '220px', paddingBottom: '24px', fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
                <span>25</span>
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              <div style={{ flex: 1, height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '2px solid #E2E8F0', paddingBottom: '4px' }}>
                {sampleDailyMeasures.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#0F172A', display: 'block' }}>{d.totalColumnVal}</span>
                      <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B', display: 'block' }}>{d.columnPercentage}%</span>
                    </div>

                    <div style={{ width: '100%', maxWidth: '34px', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', background: '#E2E8F0', height: `${Math.min(100, (d.totalColumnVal / 25) * 80)}%`, minHeight: '12px' }}>
                      {d.subtaskContributions.map((sc, scIdx) => (
                        <div 
                          key={scIdx} 
                          style={{ 
                            width: '100%', 
                            flex: sc.val, 
                            background: sc.color, 
                            transition: 'all 0.3s ease',
                            borderBottom: scIdx > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                          }}
                          title={`${sc.title}: ${sc.val} ${measureUnit} (${sc.note})`}
                        />
                      ))}
                    </div>

                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginTop: '6px' }}>
                      {d.dayLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '220px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px', borderBottom: '1px solid #CBD5E1', paddingBottom: '4px' }}>
                Subtask Key
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {directChildSubtasks.map((st, i) => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: subtaskColors[i % subtaskColors.length], flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVENT COUNT HISTOGRAM / MULTI-EVENT CLUSTER BAR GRAPH (TYPE 1 ONLY) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#2563EB" /> Daily Multi-Event Session Histogram (Adjacent Touching Event Bars per Day)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
              Individual adjacent touching bars represent distinct event completions executed on that day, separated by day gaps.
            </p>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            {eventClusterDailyData.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#2563EB' }}>{d.eventCountToday} Events</span>
                
                {/* Adjacent Touching Bars Cluster */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', padding: '4px', background: '#E2E8F0', borderRadius: '8px' }}>
                  {d.events.map((ev, evIdx) => (
                    <div 
                      key={evIdx}
                      style={{
                        width: '14px',
                        height: `${ev.height}%`,
                        background: ev.color,
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s ease'
                      }}
                      title={`${d.dayLabel} — ${ev.label}: Completed`}
                    />
                  ))}
                </div>

                <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>{d.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MEASURE ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ruler size={18} color="#EC4899" /> DayCount & Schedule Measure Analytics System
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          
          {/* Card 1: Daily Target Measure */}
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Daily Target Measure</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#EC4899' }}>{dailyTargetMeasure} {measureUnit}/day</span>
          </div>

          {/* Card 2: Initial Total Targeted Measure */}
          <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Initial Total Targeted Measure</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E3A8A' }}>{totalTargetedMeasure} {measureUnit}</span>
            <span style={{ fontSize: '9px', color: '#3B82F6', fontWeight: 700, display: 'block' }}>({effectiveTargetDays} days × {dailyTargetMeasure} {measureUnit})</span>
          </div>

          {/* Card 3: Total Completed Measure */}
          <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Total Completed Measure</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#15803D' }}>{totalCompletedMeasure} {measureUnit}</span>
          </div>

          {/* Card 4 (NEW): Expected Measure Till Today (If Target Followed) */}
          <div style={{ background: '#EEF2FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#3730A3', textTransform: 'uppercase', display: 'block' }}>Expected Till Today (On Target)</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#312E81' }}>{expectedMeasureTillToday} {measureUnit}</span>
            <span style={{ fontSize: '9px', color: targetVarianceTillToday >= 0 ? '#16A34A' : '#DC2626', fontWeight: 800, display: 'block' }}>
              ({elapsedDays} days × {dailyTargetMeasure} {measureUnit}) • {targetVarianceTillToday >= 0 ? `+${targetVarianceTillToday}` : `${targetVarianceTillToday}`} {measureUnit} {targetVarianceTillToday >= 0 ? 'ahead' : 'behind'}
            </span>
          </div>

          {/* Card 5: Total Target Left */}
          <div style={{ background: '#FEF3C7', padding: '12px 16px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Total Target Left</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#B45309' }}>{totalTargetLeft} {measureUnit}</span>
          </div>

          {/* Card 6: Req Daily Avg (Target Days) */}
          <div style={{ background: '#FAF5FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase', display: 'block' }}>Req Daily Avg (Target Days)</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#6B21A8' }}>
              {reqPaceRemTarget} {measureUnit}/day
            </span>
          </div>

          {/* Card 7: Req Daily Avg (End Date) */}
          <div style={{ background: '#FFF1F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #FECDD3' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase', display: 'block' }}>Req Daily Avg (End Date)</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#9F1239' }}>
              {reqPaceUntilEndDate} {measureUnit}/day
            </span>
            {trackingMode === 'end_date' && (
              <span style={{ fontSize: '8px', color: '#BE123C', fontWeight: 700, display: 'block' }}>(Identical for Daily Schedule)</span>
            )}
          </div>

          {/* Card 8: Projected Total Measure */}
          <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Projected Total Measure</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#15803D' }}>
              {projectedTotalMeasure} {measureUnit}
            </span>
            <span style={{ fontSize: '8px', color: '#16A34A', fontWeight: 700, display: 'block' }}>
              ({totalCompletedMeasure} achieved + {remainingDays} days left × {dailyAverageMeasureTillNow} avg/day)
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. CALENDAR VIEWS PANEL (IMAGE 2 & 3 REFERENCES) */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', border: '2px solid #0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
              14
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <ChevronLeft size={20} color="#475569" />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                October 2022
              </h2>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <ChevronRight size={20} color="#475569" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <button
              onClick={() => setCalendarViewMode('MONTH')}
              style={{
                background: calendarViewMode === 'MONTH' ? '#DC2626' : 'transparent',
                color: calendarViewMode === 'MONTH' ? '#FFF' : '#475569',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Monthly
            </button>

            <button
              onClick={() => setCalendarViewMode('WEEK')}
              style={{
                background: calendarViewMode === 'WEEK' ? '#DC2626' : 'transparent',
                color: calendarViewMode === 'WEEK' ? '#FFF' : '#475569',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* WEEKLY CALENDAR VIEW */}
        {calendarViewMode === 'WEEK' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#E2E8F0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ background: '#FFF', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
                  {d}
                </div>
              ))}

              {[10, 11, 12, 13, 14, 15, 16].map((dayNum, i) => (
                <div key={i} style={{ background: '#FFF', minHeight: '100px', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: dayNum === 14 ? '#2563EB' : 'transparent',
                    color: dayNum === 14 ? '#FFF' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    fontSize: '12px',
                    fontWeight: 900
                  }}>
                    {dayNum}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#64748B', marginTop: '8px' }}>
              Weekly Calendar View
            </div>
          </div>
        )}

        {/* MONTHLY CALENDAR VIEW */}
        {calendarViewMode === 'MONTH' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#E2E8F0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ background: '#FFF', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
                {d}
              </div>
            ))}

            {monthlyGridCells.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCalendarDate(cell.dayNum)}
                style={{
                  background: '#FFF',
                  minHeight: '75px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative'
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: cell.isToday ? '#2563EB' : 'transparent',
                  color: cell.isToday ? '#FFF' : (cell.isCurrentMonth ? '#0F172A' : '#CBD5E1'),
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '11px',
                  fontWeight: 900
                }}>
                  {cell.dayNum}
                </span>

                {cell.events.map((ev, evIdx) => (
                  <div 
                    key={evIdx}
                    style={{
                      background: ev.color,
                      color: ev.textColor,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {ev.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 800 }}>
            <span style={{ color: '#EA580C', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '4px', background: '#EA580C', borderRadius: '2px', boxShadow: '0 0 8px rgba(234, 88, 12, 0.5)' }} /> Actual Cumulative Line
            </span>
            <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '3px', background: '#16A34A', borderStyle: 'dashed' }} /> 45° Average Target Line
            </span>
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

        {/* SVG Cumulative Measure Slope Trajectory Line Chart Container */}
        <div style={{ height: '250px', background: '#FFFFFF', padding: '24px 20px 36px 50px', border: '1.5px solid #CBD5E1', borderRadius: '16px', position: 'relative', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)' }}>
          
          {/* Y-Axis Labels */}
          <div style={{ position: 'absolute', left: '6px', top: '24px', bottom: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: '#64748B', textAlign: 'right', width: '36px' }}>
            <span>{totalTargetedMeasure}</span>
            <span>{Math.round(totalTargetedMeasure * 0.75)}</span>
            <span>{Math.round(totalTargetedMeasure * 0.50)}</span>
            <span>{Math.round(totalTargetedMeasure * 0.25)}</span>
            <span>0</span>
          </div>

          {/* SVG Canvas with ViewBox for Precise Responsive Scaling */}
          <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
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

            {/* Math Graph Paper Grid Lines (Horizontal & Vertical) */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="0" y1="180" x2="500" y2="180" stroke="#CBD5E1" strokeWidth="2" />

            {/* Vertical Day Gridlines */}
            {sampleDailyMeasures.map((_, i) => {
              const x = Math.round((i / Math.max(1, sampleDailyMeasures.length - 1)) * 500);
              return <line key={i} x1={x} y1="20" x2={x} y2="180" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />;
            })}

            {/* 1. AVERAGE TARGET LINE (45 DEGREE LINE FROM BOTTOM-LEFT (0,180) TO TOP-RIGHT (500,20)) */}
            <line 
              x1="0" 
              y1="180" 
              x2="500" 
              y2="20" 
              stroke="#16A34A" 
              strokeWidth="2.5" 
              strokeDasharray="6,6" 
            />

            {/* 2. ACTUAL CUMULATIVE MEASURE LINE (MONOTONICALLY INCREASING, NEVER GOES DOWN) */}
            {(() => {
              let runningTotal = 0;
              const maxCum = Math.max(totalTargetedMeasure, totalCompletedMeasure * 1.1, 10);
              
              const points = sampleDailyMeasures.map((d, i) => {
                const dailyDelta = d.totalColumnVal;
                runningTotal += dailyDelta;
                const x = Math.round((i / Math.max(1, sampleDailyMeasures.length - 1)) * 500);
                // Calculate y: y=180 is 0 cumulative, y=20 is maxCum
                const y = Math.max(20, 180 - Math.round((runningTotal / maxCum) * 160));
                return {
                  x,
                  y,
                  runningTotal: Math.round(runningTotal * 10) / 10,
                  dailyDelta,
                  dayLabel: d.dayLabel
                };
              });

              const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
              const polygonPoints = `0,180 ${polylinePoints} 500,180 0,180`;

              return (
                <g>
                  {/* Shaded Area under Monotonically Increasing Cumulative Line */}
                  <polygon fill="url(#cumOrangeGradient)" points={polygonPoints} />

                  {/* Actual Cumulative Polyline */}
                  <polyline 
                    fill="none" 
                    stroke="#EA580C" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glowOrangeLine)"
                    points={polylinePoints}
                  />

                  {/* Node Markers & Data Labels */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={p.dailyDelta === 0 ? "5" : "6.5"} 
                        fill={p.dailyDelta === 0 ? "#F97316" : "#EA580C"} 
                        stroke="#FFFFFF" 
                        strokeWidth="2.5" 
                      />
                      {/* Cumulative Value Text Label above Node */}
                      <text 
                        x={p.x} 
                        y={p.y - 10} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fontWeight="800" 
                        fill="#C2410C"
                      >
                        {p.runningTotal}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </svg>

          {/* X-Axis Timeline Labels */}
          <div style={{ position: 'absolute', left: '50px', right: '20px', bottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', fontWeight: 800, color: '#475569' }}>
            {sampleDailyMeasures.map((d, i) => (
              <span key={i} style={{ color: d.totalColumnVal === 0 ? '#94A3B8' : '#0F172A' }}>
                {d.dayLabel} ({d.totalColumnVal > 0 ? `+${d.totalColumnVal}` : '0'})
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 13. EVENT-COUNT TASK SYSTEM: CURRENT EVENT CARD & SEGMENTED BARS HISTORY */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (() => {
        const eventUnitTarget = Number(currentTask.eventUnitTarget || currentTask.measureTarget || 10);
        const eventUnitName = currentTask.eventUnitName || currentTask.measureUnit || 'units';
        const currentWork = calculateCurrentEventWork(directChildSubtasks);
        const currentProgressPct = Math.min(100, Math.round((currentWork / eventUnitTarget) * 100));

        // Sample Historical Finalized Events Grouped by Date (Demonstrates 2 Bars on Same Day)
        const mockFinalizedEvents = [
          {
            id: 'ev-sample-1',
            eventNumber: 1,
            completionDate: '2026-09-05',
            eventUnitTarget,
            eventUnitName,
            totalWorkAccumulated: 10,
            subtaskContributions: [
              { subtaskId: '1', subtaskTitle: 'LeetCode Problems', workAmount: 6, color: '#4F46E5', percentage: 60 },
              { subtaskId: '2', subtaskTitle: 'GFG Problems', workAmount: 3, color: '#F59E0B', percentage: 30 },
              { subtaskId: '3', subtaskTitle: 'Codeforces', workAmount: 1, color: '#10B981', percentage: 10 }
            ]
          },
          {
            id: 'ev-sample-2',
            eventNumber: 2,
            completionDate: '2026-09-05',
            eventUnitTarget,
            eventUnitName,
            totalWorkAccumulated: 10,
            subtaskContributions: [
              { subtaskId: '1', subtaskTitle: 'LeetCode Problems', workAmount: 4, color: '#4F46E5', percentage: 40 },
              { subtaskId: '2', subtaskTitle: 'GFG Problems', workAmount: 3, color: '#F59E0B', percentage: 30 },
              { subtaskId: '3', subtaskTitle: 'Codeforces', workAmount: 3, color: '#10B981', percentage: 30 }
            ]
          }
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 13A. CURRENT EVENT ACCUMULATION CARD */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #EFF6FF, #F8FAFC)', borderRadius: '24px', border: '1.5px solid #BFDBFE', borderLeft: '6px solid #2563EB', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#1E3A8A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} color="#2563EB" /> Current Event Accumulation ({currentWork} / {eventUnitTarget} {eventUnitName})
                  </h3>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0 0' }}>
                    Work accumulates across subtasks and days. Event finalizes automatically when total reaches <strong>{eventUnitTarget} {eventUnitName}</strong>.
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
                      <span>{st.title}: <strong>{work} {eventUnitName}</strong></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 13B. FINALIZED EVENTS HISTORY & SEGMENTED HORIZONTAL BARS */}
            <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E2E8F0', borderLeft: '6px solid #10B981', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} color="#10B981" /> Finalized Event History & Segmented Bars
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Each bar represents exactly 1 finalized event. Multiple events completed on the same day produce separate bars.
                  </p>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 900, color: '#047857' }}>
                  {mockFinalizedEvents.length} Finalized Events
                </div>
              </div>

              {/* List of Finalized Events as Segmented Horizontal Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mockFinalizedEvents.map((ev) => (
                  <div key={ev.id} style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '16px', borderRadius: '16px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '6px', fontSize: '10px' }}>
                          Event #{ev.eventNumber}
                        </span>
                        <span>Completed {ev.completionDate}</span>
                      </span>
                      <span style={{ color: '#059669' }}>
                        Total Contribution: <strong>{ev.totalWorkAccumulated} {ev.eventUnitName}</strong>
                      </span>
                    </div>

                    {/* Multi-Color Segmented Horizontal Bar */}
                    <div style={{ display: 'flex', height: '22px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#E2E8F0', marginBottom: '10px' }}>
                      {ev.subtaskContributions.map((seg, sIdx) => (
                        <div 
                          key={sIdx} 
                          style={{ 
                            width: `${seg.percentage}%`, 
                            background: seg.color, 
                            height: '100%',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontSize: '10px',
                            fontWeight: 900
                          }}
                          title={`${seg.subtaskTitle}: ${seg.workAmount} ${ev.eventUnitName} (${seg.percentage}%)`}
                        >
                          {seg.percentage >= 15 && `${seg.workAmount}`}
                        </div>
                      ))}
                    </div>

                    {/* Subtask Contribution Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', fontWeight: 800 }}>
                      {ev.subtaskContributions.map((seg, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color }} />
                          <span>{seg.subtaskTitle}: <strong>{seg.workAmount} ({seg.percentage}%)</strong></span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

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

    </div>
  );
}
