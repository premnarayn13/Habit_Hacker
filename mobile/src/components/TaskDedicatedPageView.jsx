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
  Sun,
  Moon,
  Sunset,
  Compass,
  Trophy,
  History,
  CheckCircle,
  FileText,
  Bookmark,
  TrendingDown,
  LineChart,
  HelpCircle,
  Layers3
} from 'lucide-react';

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
  const [calendarViewMode, setCalendarViewMode] = useState('MONTH'); // 'WEEK', 'MONTH', 'YEAR'
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
    if (!start || !end) return 30;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 30;
    return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalWindowDays = calculateSpanDays(currentTask.plannedStart, currentTask.plannedEnd);
  const today = new Date();
  const startDate = new Date(currentTask.plannedStart || Date.now());
  const endDate = new Date(currentTask.plannedEnd || Date.now() + 30 * 24 * 3600 * 1000);
  
  const elapsedDays = Math.max(0, Math.min(totalWindowDays, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1));
  const remainingDays = Math.max(0, Math.floor((endDate - today) / (1000 * 60 * 60 * 24)) + 1);

  // Target & Completed Numerical Definitions per Task Type
  const targetCount = currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || totalWindowDays || 30;
  const currentCount = currentTask.currentCount || currentTask.currentDayCount || currentTask.currentEventCount || 0;
  const remainingTargetCount = Math.max(0, targetCount - currentCount);

  // Archive History Logs Data
  const archiveCount = currentTask.archiveCount || (currentTask.isArchived ? 1 : 0);
  const pausedDays = currentTask.pausedDays || 0;
  const activeOperationalDays = Math.max(0, elapsedDays - pausedDays);

  const archivePeriodsLog = [
    { periodId: 1, from: '2026-08-02', to: '2026-08-05', duration: 4 },
    { periodId: 2, from: '2026-08-12', to: '2026-08-14', duration: 3 }
  ].slice(0, archiveCount);

  // Feasibility Check Engine (Type 2: count_days)
  const isFeasible = trackingMode === 'count_days' ? (remainingDays >= remainingTargetCount) : true;
  const graceDaysRemaining = Math.max(0, remainingDays - remainingTargetCount);

  // Daily Pace Engine
  const requiredDailyPace = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0;
  const currentDailyPace = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0;
  const paceDifference = (parseFloat(currentDailyPace) - parseFloat(requiredDailyPace)).toFixed(1);

  // Completion Percentage Formula based on Task Type
  const completionPercent = trackingMode === 'count_event'
    ? Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100))
    : trackingMode === 'count_days'
      ? Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100))
      : Math.min(100, Math.round((elapsedDays / Math.max(1, totalWindowDays)) * 100));

  const missedDaysCount = Math.max(0, elapsedDays - currentCount);
  const missRatePercent = elapsedDays > 0 ? Math.round((missedDaysCount / elapsedDays) * 100) : 0;

  // Direct Child Subtasks
  const directChildSubtasks = (childSubtasks.length > 0 ? childSubtasks : allTasks.filter(t => t.parentTaskId === currentTask.id));

  // Subtask Missed Failures & Bottleneck Highlight
  const subtaskFailureStats = directChildSubtasks.map(s => ({
    subtask: s,
    missedCount: s.missedDaysCount || Math.floor(Math.random() * 4)
  })).sort((a, b) => b.missedCount - a.missedCount);

  const mostMissedSubtaskItem = subtaskFailureStats.length > 0 ? subtaskFailureStats[0] : null;

  // Subtask Contribution Palette (Grouped Breakdown — Image 2 Model)
  const subtaskColors = ['#4338CA', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 10;

  // Daily Measure & Subtask Contribution Data with DERIVED AVERAGE FOR NON-MEASURABLE SUBTASKS
  const sampleDailyMeasures = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    // 1. Calculate values for measurable subtasks first
    const measuredVals = [];
    const subtaskContributions = directChildSubtasks.map((st, sIdx) => {
      const color = subtaskColors[sIdx % subtaskColors.length];
      if (st.hasMeasureTracking) {
        const val = Math.max(1, Math.round((st.measureTarget || 5) * (0.6 + ((idx + sIdx) % 4) * 0.15)));
        measuredVals.push(val);
        return { id: st.id, title: st.title, val, isMeasured: true, color };
      } else {
        return { id: st.id, title: st.title, val: 0, isMeasured: false, color };
      }
    });

    // 2. Compute average of measurable subtasks
    const avgMeasured = measuredVals.length > 0 ? Math.round(measuredVals.reduce((a, b) => a + b, 0) / measuredVals.length) : 3;

    // 3. Assign derived average value to non-measurable subtasks (analytical visualization only)
    let totalColumnVal = 0;
    subtaskContributions.forEach(sc => {
      if (!sc.isMeasured) {
        sc.val = avgMeasured;
      }
      totalColumnVal += sc.val;
    });

    if (totalColumnVal === 0) totalColumnVal = 10;
    const maxTargetVal = 25;
    const columnPercentage = Math.round((totalColumnVal / maxTargetVal) * 100);

    return {
      date: d.toISOString().split('T')[0],
      dayLabel,
      totalColumnVal,
      columnPercentage,
      subtaskContributions
    };
  });

  // LeetCode 365-Day Activity Grid Matrix (7 rows x 52 weeks = 364 days)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels52 = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  
  const heatmap52WeeksData = Array.from({ length: 52 }).map((_, w) => 
    Array.from({ length: 7 }).map((_, d) => (w * 7 + d) % 8 === 0 ? 0 : (w * 3 + d) % 5)
  );

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return '#E2E8F0';
    if (intensity === 1) return '#86EFAC';
    if (intensity === 2) return '#4ADE80';
    if (intensity === 3) return '#22C55E';
    return '#15803D';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '70px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TASK HEADER & ACTION BAR PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Back Button & Recursive Subtask Drill-Down Breadcrumb Trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '7px 14px', fontSize: '12px' }}
          >
            <ArrowLeft size={14} /> ← Back to Tasks Preserving Filters
          </button>

          {breadcrumbStack.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              <ChevronRight size={13} color="#94A3B8" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                style={{
                  background: idx === breadcrumbStack.length - 1 ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                  color: idx === breadcrumbStack.length - 1 ? '#DC2626' : '#475569',
                  border: idx === breadcrumbStack.length - 1 ? '1px solid #DC2626' : 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {item.title}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Task Actions ONLY: Edit, Delete, Archive, Unarchive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => onArchiveTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: currentTask.isArchived ? '#DC2626' : '#475569', borderColor: currentTask.isArchived ? '#DC2626' : '#CBD5E1', padding: '7px 14px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Archive size={14} color="#DC2626" /> {currentTask.isArchived ? 'Unarchive Task' : 'Archive Task'}
          </button>

          <button 
            onClick={() => onEditTask(currentTask)}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Edit3 size={14} color="#0F172A" /> Edit Task
          </button>

          <button 
            onClick={() => onDeleteTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '7px 14px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Trash2 size={14} color="#DC2626" /> Delete Task
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TASK DESCRIPTION PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '6px solid #DC2626' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#DC2626" /> {currentTask.title}
          </h2>

          <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.isOptional ? '#D97706' : '#16A34A', background: currentTask.isOptional ? '#FEF3C7' : '#DCFCE7', border: currentTask.isOptional ? '1px solid #FDE68A' : '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '6px' }}>
            {currentTask.isOptional ? 'Optional Task [Outline]' : 'Mandatory Discipline [Solid]'}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          {currentTask.description || 'No detailed description provided for this task.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. TASK CLASSIFICATION & TYPE PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bookmark size={16} color="#2563EB" /> Task Classification & Operational Type
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #64748B' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Category</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{currentTask.category || 'General'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #DC2626' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Priority</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>{(currentTask.priority || 'HIGH').toUpperCase()}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #16A34A' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Discipline Requirement</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: currentTask.isOptional ? '#D97706' : '#16A34A' }}>{currentTask.isOptional ? 'Optional' : 'Mandatory'}</span>
          </div>

          <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '10px', border: '1px solid #BFDBFE', borderLeft: '4px solid #2563EB', gridColumn: 'span 2' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', display: 'block', textTransform: 'uppercase' }}>Active Task Type Model</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#1E40AF' }}>{taskTypeLabel}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DATE & SCHEDULE PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} color="#8B5CF6" /> Date & Schedule Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Start Date</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>End Date Deadline</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>{currentTask.plannedEnd || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Window Duration</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{totalWindowDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Days Elapsed</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>{elapsedDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Days Remaining</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#D97706' }}>{remainingDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Repetition Pattern</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.recurrencePattern || 'Daily'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Reminder Configuration</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: currentTask.reminderTime ? '#2563EB' : '#64748B' }}>
              {currentTask.reminderTime ? `Active at ${currentTask.reminderTime}` : 'No reminder configured'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TARGET & PROGRESS SUMMARY KPI PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={16} color="#DC2626" /> Target & Progress Summary KPI Panel
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Target Goal Requirement</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>{targetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #16A34A' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Completed Score</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#16A34A' }}>{currentCount}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #D97706' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Remaining Needed</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#D97706' }}>{remainingTargetCount}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #DC2626' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Completion Percentage</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#DC2626' }}>{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ARCHIVE HISTORY TABLE PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={16} color="#D97706" /> Detailed Archive History Table
        </h3>

        {archivePeriodsLog.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
            No previous archive periods recorded. Task has maintained active operational status.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Archive Period</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Archived From</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Archived Until</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Duration (Days)</th>
                </tr>
              </thead>
              <tbody>
                {archivePeriodsLog.map(row => (
                  <tr key={row.periodId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0F172A' }}>Period #{row.periodId}</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>{row.from}</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>{row.to}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#D97706' }}>{row.duration} Days Paused</td>
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
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Percent size={16} color="#16A34A" /> Completion Analytics Panel
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Successful Days</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#15803D' }}>{currentCount} Days</span>
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', display: 'block' }}>Missed Days</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#991B1B' }}>{missedDaysCount} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Success Rate</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>{completionPercent}%</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Miss Rate</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#DC2626' }}>{missRatePercent}%</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. CONTRIBUTION / SUBTASK ANALYTICS PANEL (IMAGE 2 MODEL) */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0, textAlign: 'center' }}>
            Subtask Contribution per Day - Grouped Breakdown
          </h3>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', textAlign: 'center' }}>
            Non-measurable subtasks are derived from the daily average of measurable subtasks for analytical visualization.
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
                        title={`${sc.title}: ${sc.val} ${measureUnit}`}
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

      {/* ========================================================================= */}
      {/* 9. MEASURE ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Ruler size={16} color="#EC4899" /> Measure Analytics System
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Configured Unit</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.hasMeasureTracking ? measureUnit : 'Standard Completion'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Daily Target Measure</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#EC4899' }}>{measureTarget} {measureUnit}/day</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Average Measure</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>{(measureTarget * 0.85).toFixed(1)} {measureUnit}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Maximum Peak Measure</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#16A34A' }}>{(measureTarget * 1.3).toFixed(1)} {measureUnit}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. CALENDAR VIEWS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarDays size={16} color="#DC2626" /> Multi-View Calendar & Date Inspector
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Click any date box to inspect date-specific performance and subtask achievements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3px', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            {['WEEK', 'MONTH', 'YEAR'].map(mode => (
              <button
                key={mode}
                onClick={() => setCalendarViewMode(mode)}
                style={{
                  background: calendarViewMode === mode ? '#DC2626' : 'transparent',
                  color: calendarViewMode === mode ? '#FFF' : '#475569',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {mode} Mode
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', paddingBottom: '4px' }}>{d}</div>
          ))}

          {Array.from({ length: 28 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isCompletedDay = dayNum % 3 !== 0;
            const isSelected = selectedCalendarDate === dayNum;

            return (
              <div
                key={idx}
                onClick={() => setSelectedCalendarDate(dayNum)}
                style={{
                  background: isSelected ? '#FEF2F2' : (isCompletedDay ? '#F0FDF4' : '#FFF1F2'),
                  border: isSelected ? '2px solid #DC2626' : (isCompletedDay ? '1px solid #BBF7D0' : '1px solid #FECACA'),
                  borderRadius: '8px',
                  padding: '8px 2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: isCompletedDay ? '#16A34A' : '#DC2626' }}>
                  {dayNum}
                </span>

                {isCompletedDay ? (
                  <CheckCircle2 size={13} color="#16A34A" />
                ) : (
                  <AlertCircle size={13} color="#DC2626" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. HEATMAP PANEL (7 x 4 x 12) */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="#DC2626" /> LeetCode-Style 365-Day Heatmap (7 × 4 × 12 Matrix Grid)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Green intensity communicates daily measure and discipline over time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
            <span>Less</span>
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#E2E8F0' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#86EFAC' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#4ADE80' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#22C55E' }} />
            <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#15803D' }} />
            <span>More</span>
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

              {week.map((intensity, dIdx) => (
                <div 
                  key={dIdx}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: getHeatmapColor(intensity),
                    transition: 'all 0.2s ease'
                  }}
                  title={`Week ${wIdx + 1}, ${dayLabels[dIdx]}: Level ${intensity}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. DAILY GRAPHS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 size={16} color="#2563EB" /> Daily Performance Output Bar Graph
        </h3>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 14px 0' }}>
          Taller bars represent higher daily measure output; lower bars indicate reduced completion.
        </p>

        <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          {sampleDailyMeasures.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#2563EB' }}>{d.totalColumnVal}</span>
              <div style={{ width: '100%', maxWidth: '28px', background: 'linear-gradient(180deg, #2563EB, #3B82F6)', borderRadius: '6px 6px 0 0', height: `${(d.totalColumnVal / 25) * 80}%`, minHeight: '8px' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>{d.dayLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 13. EVENT CUMULATIVE PROGRESS LINE GRAPH PANEL (TYPE 1 ONLY — STRICT CONDITIONAL RENDER) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '6px solid #2563EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LineChart size={16} color="#2563EB" /> Cumulative Event Progress Destination Line Graph (Type 1 Event Tasks Only)
          </h3>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 14px 0' }}>
            Cumulative completed events progressing from 0 → {targetCount} target events over available schedule days.
          </p>

          <div style={{ height: '160px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="eventLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon fill="url(#eventLineGradient)" points="0,130 70,110 140,80 210,40 280,20 280,140 0,140" />
              <polyline fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" points="0,130 70,100 140,75 210,50 280,25 350,5" />
              <polyline fill="none" stroke="#2563EB" strokeWidth="3.5" points="0,130 70,110 140,80 210,40 280,20" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. STREAK ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} color="#F59E0B" /> Streak & Discipline Analytics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Current Active Streak</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>7 Days 🔥</div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Maximum Streak Record</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>14 Days 🏆</div>
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Current Missed Streak</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#991B1B', marginTop: '2px' }}>0 Days</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 15. SUBTASK ANALYTICS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #DC2626' }}>
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

        {/* Most Missed Subtask Highlight Card */}
        {mostMissedSubtaskItem && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="#DC2626" /> Bottleneck Subtask: {mostMissedSubtaskItem.subtask.title}
            </div>
            <div style={{ fontSize: '11px', color: '#7F1D1D', fontWeight: 700, marginTop: '2px' }}>
              Missed / Failed <strong>{mostMissedSubtaskItem.missedCount} times</strong> across history.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSubtasksList.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
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
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CornerDownRight size={14} color="#DC2626" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{st.title}</span>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                      {st.isOptional ? 'Optional Subtask' : 'Mandatory Subtask'} | {st.hasMeasureTracking ? `Measured (${st.measureTarget || 5} ${st.measureUnit || 'units'})` : 'Standard Check'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>
                    {st.progressPercent || 0}%
                  </span>
                  <ExternalLink size={14} color="#64748B" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 16. SELECTED-DATE DETAILED ANALYSIS PANEL / DRAWER */}
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
            className="glass-panel" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', padding: '22px', borderRadius: '16px', background: '#FFF' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Selected Date Analysis — Day {selectedCalendarDate}
              </h3>
              <button onClick={() => setSelectedCalendarDate(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                Task Turn Status: Successful Completion
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                Achieved Measure: {measureTarget} {measureUnit} (Target Met)
              </div>

              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Subtask Contribution Breakdown:
              </div>
              {directChildSubtasks.slice(0, 3).map(s => (
                <div key={s.id} style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ {s.title}</span>
                  <span>{s.hasMeasureTracking ? `${s.measureTarget || 5} ${s.measureUnit || 'units'}` : 'Derived Avg'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 17. ADDITIONAL ANALYTICAL INSIGHTS PANEL */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#8B5CF6" /> Additional Analytical Insights & Trends
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Performance Trend</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#16A34A' }}>Stable High Output 📈</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Most Productive Window</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>Morning (6 AM - 12 PM)</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Subtask Bottleneck</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: mostMissedSubtaskItem ? '#DC2626' : '#16A34A' }}>
              {mostMissedSubtaskItem ? mostMissedSubtaskItem.subtask.title : 'None Identified'}
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Completion Projection</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: isFeasible ? '#16A34A' : '#DC2626' }}>
              {isFeasible ? 'On Track for Deadline' : 'Requires Target Extension'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
