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
  const targetCount = currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || 110;
  const currentCount = currentTask.currentCount || currentTask.currentDayCount || currentTask.currentEventCount || 72;
  const remainingTargetCount = Math.max(0, targetCount - currentCount);

  // Type 1 Event Count Specific Metrics
  const successfulDaysWithAtLeastOneEvent = 11; // 11 days out of 15 elapsed days had events
  const missedDaysWithZeroEvents = Math.max(0, elapsedDays - successfulDaysWithAtLeastOneEvent); // 4 days with 0 events
  const requiredEventsPerRemainingDay = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0; // e.g. 38 / 15 = 2.5 events/day
  const currentAverageEventsPerDay = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0; // 72 / 15 = 4.8 events/day

  // Archive History Logs Data
  const archiveCount = currentTask.archiveCount || (currentTask.isArchived ? 1 : 0);
  const pausedDays = currentTask.pausedDays || 0;
  const activeOperationalDays = Math.max(0, elapsedDays - pausedDays);

  const archivePeriodsLog = [
    { periodId: 1, from: '2026-08-02', to: '2026-08-05', duration: 4, status: 'Completed Pause' },
    { periodId: 2, from: '2026-08-12', to: '2026-08-14', duration: 3, status: 'Completed Pause' }
  ].slice(0, archiveCount);

  // Feasibility Check Engine
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
  const directChildSubtasks = (childSubtasks.length > 0 ? childSubtasks : allTasks.filter(t => t.parentTaskId === currentTask.id));

  // Subtask Missed Failures & Bottleneck Highlight
  const subtaskFailureStats = directChildSubtasks.map(s => ({
    subtask: s,
    missedCount: s.missedDaysCount || Math.floor(Math.random() * 4)
  })).sort((a, b) => b.missedCount - a.missedCount);

  const mostMissedSubtaskItem = subtaskFailureStats.length > 0 ? subtaskFailureStats[0] : null;

  // Subtask Contribution Palette
  const subtaskColors = ['#4338CA', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];
  const measureUnit = currentTask.measureUnit || 'Problems';
  const measureTarget = currentTask.measureTarget || 4;

  // Discrete Event Histogram Data (Touching Side-by-Side Event Bars per Day)
  const dailyEventHistogramData = [
    { dayLabel: 'Aug 10', eventCount: 3, events: [{ id: 1, color: '#2563EB' }, { id: 2, color: '#3B82F6' }, { id: 3, color: '#60A5FA' }] },
    { dayLabel: 'Aug 11', eventCount: 5, events: [{ id: 1, color: '#16A34A' }, { id: 2, color: '#22C55E' }, { id: 3, color: '#4ADE80' }, { id: 4, color: '#86EFAC' }, { id: 5, color: '#BBF7D0' }] },
    { dayLabel: 'Aug 12', eventCount: 0, events: [] }, // Missed zero-event day
    { dayLabel: 'Aug 13', eventCount: 4, events: [{ id: 1, color: '#D97706' }, { id: 2, color: '#F59E0B' }, { id: 3, color: '#FBBF24' }, { id: 4, color: '#FDE68A' }] },
    { dayLabel: 'Aug 14', eventCount: 2, events: [{ id: 1, color: '#DC2626' }, { id: 2, color: '#EF4444' }] },
    { dayLabel: 'Aug 15', eventCount: 6, events: [{ id: 1, color: '#8B5CF6' }, { id: 2, color: '#A855F7' }, { id: 3, color: '#C084FC' }, { id: 4, color: '#E9D5FF' }, { id: 5, color: '#EC4899' }, { id: 6, color: '#F472B6' }] },
    { dayLabel: 'Aug 16', eventCount: 0, events: [] }  // Missed zero-event day
  ];

  // Subtask Daily Measures Data
  const sampleDailyMeasures = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

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

    const avgMeasured = measuredVals.length > 0 ? Math.round(measuredVals.reduce((a, b) => a + b, 0) / measuredVals.length) : 3;

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

  // LeetCode 365-Day Activity Grid Matrix
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

  // Monthly Calendar Grid
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
      {/* 1. TASK HEADER & ACTION BAR PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '18px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Back Button & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '8px 16px', fontSize: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1' }}
          >
            <ArrowLeft size={14} /> ← Back to Tasks Preserving Filters
          </button>

          {breadcrumbStack.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              <ChevronRight size={14} color="#94A3B8" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                style={{
                  background: idx === breadcrumbStack.length - 1 ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                  color: idx === breadcrumbStack.length - 1 ? '#DC2626' : '#475569',
                  border: idx === breadcrumbStack.length - 1 ? '1px solid #DC2626' : 'none',
                  padding: '5px 12px',
                  borderRadius: '8px',
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

        {/* Task Actions ONLY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => onArchiveTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: currentTask.isArchived ? '#DC2626' : '#475569', borderColor: currentTask.isArchived ? '#DC2626' : '#CBD5E1', padding: '8px 16px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Archive size={14} color="#DC2626" /> {currentTask.isArchived ? 'Unarchive Task' : 'Archive Task'}
          </button>

          <button 
            onClick={() => onEditTask(currentTask)}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={14} color="#0F172A" /> Edit Task
          </button>

          <button 
            onClick={() => onDeleteTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px 16px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} color="#DC2626" /> Delete Task
          </button>
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
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Full Description</span>
          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
            {currentTask.description || 'No detailed description provided for this task.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPECIAL SECTION FOR TYPE 1 (EVENT COUNT) DATES, SUCCESSFUL & MISSED DAYS */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#2563EB" /> Type 1 Event Count Operational Schedule & Event-Day Breakdown
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Start → End Date Window</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || 'Aug 10'} → {currentTask.plannedEnd || 'Sep 09'} ({totalWindowDays} Days)</span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Days Elapsed / Remaining</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>{elapsedDays} Elapsed / {remainingDays} Remaining</span>
            </div>

            <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Successful Event Days (≥1 Event)</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#15803D' }}>{successfulDaysWithAtLeastOneEvent} Days Completed ✓</span>
            </div>

            <div style={{ background: '#FEF2F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', display: 'block' }}>Missed Out Days (0 Events Done)</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#991B1B' }}>{missedDaysWithZeroEvents} Missed Days ✖</span>
            </div>

            <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BFDBFE', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Required Future Events Per Day</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E3A8A' }}>
                {requiredEventsPerRemainingDay} {measureUnit}/day required ({remainingTargetCount} events remaining / {remainingDays} days remaining)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUMULATIVE EVENT PROGRESS WORM CHART (EXACT MATCHING IMAGE 3 CRICKET CHART) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LineChart size={18} color="#2563EB" /> Cumulative Event Progress Worm Chart (Image 3 Cricket Reference Model)
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                Progressing from 0 → {targetCount} target events over available schedule days with milestone red dots.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontWeight: 800 }}>
              <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', background: '#2563EB' }} /> Target Trajectory
              </span>
              <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', background: '#16A34A' }} /> Actual Worm Line
              </span>
              <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} /> Event Milestone
              </span>
            </div>
          </div>

          {/* Cricket Worm SVG Chart with Grid Background (Image 3 Model) */}
          <div style={{ height: '220px', background: '#FFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #CBD5E1', position: 'relative', display: 'flex' }}>
            
            {/* Y-Axis Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingRight: '12px', fontSize: '10px', fontWeight: 800, color: '#475569', borderRight: '2px solid #94A3B8' }}>
              <span>110</span>
              <span>85</span>
              <span>60</span>
              <span>35</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Main Graph Canvas with Dashed Grid Lines */}
            <div style={{ flex: 1, position: 'relative', marginLeft: '10px' }}>
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Background Grid Lines */}
                <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#E2E8F0" strokeDasharray="4,4" />
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#E2E8F0" strokeDasharray="4,4" />
                <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#E2E8F0" strokeDasharray="4,4" />
                <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#E2E8F0" strokeDasharray="4,4" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#E2E8F0" strokeDasharray="4,4" />
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#CBD5E1" strokeWidth="2" />

                {/* Target Trajectory Line (Blue) */}
                <polyline fill="none" stroke="#2563EB" strokeWidth="2.5" points="0,180 70,140 140,110 210,75 280,45 350,15 420,0" />

                {/* Actual Worm Line (Green) */}
                <polyline fill="none" stroke="#16A34A" strokeWidth="3" points="0,180 40,165 80,145 120,120 160,95 200,65 240,40" />

                {/* Event Milestone Red Dots (Image 3 Cricket Model) */}
                <circle cx="40" cy="165" r="4.5" fill="#DC2626" />
                <circle cx="80" cy="145" r="4.5" fill="#DC2626" />
                <circle cx="120" cy="120" r="4.5" fill="#DC2626" />
                <circle cx="160" cy="95" r="4.5" fill="#DC2626" />
                <circle cx="200" cy="65" r="4.5" fill="#DC2626" />
                <circle cx="240" cy="40" r="4.5" fill="#DC2626" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: '#64748B', marginTop: '6px', paddingLeft: '35px' }}>
            <span>Day 1</span>
            <span>Day 5</span>
            <span>Day 10</span>
            <span>Day 15 (Today)</span>
            <span>Day 20</span>
            <span>Day 25</span>
            <span>Day 30 (Deadline)</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SPECIAL EVENT COUNT HISTOGRAM (SIDE-BY-SIDE TOUCHING BARS PER DAY) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#2563EB" /> Event Count Daily Histogram (Side-by-Side Event Grouping)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Shows discrete events completed per day. Days with 0 events show a clear gap (missed event day).
            </p>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '18px', padding: '16px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            {dailyEventHistogramData.map((d, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                
                {d.eventCount > 0 ? (
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#2563EB' }}>{d.eventCount} Events</span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626' }}>0 (Missed)</span>
                )}

                {/* Side-by-Side Touching Event Bars for Multiple Events on the Same Day */}
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '110px' }}>
                  {d.eventCount === 0 ? (
                    <div style={{ width: '20px', height: '4px', background: '#FCA5A5', borderRadius: '2px' }} />
                  ) : (
                    d.events.map(ev => (
                      <div 
                        key={ev.id}
                        style={{
                          width: '10px',
                          height: `${Math.min(100, (ev.id / 6) * 100)}%`,
                          minHeight: '20px',
                          background: ev.color,
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.3s ease'
                        }}
                        title={`Event #${ev.id} on ${d.dayLabel}`}
                      />
                    ))
                  )}
                </div>

                <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>{d.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALENDAR VIEWS PANEL (IMAGE 2 & 3 REFERENCES) */}
      {/* ========================================================================= */}
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

        {/* MONTHLY CALENDAR VIEW (EXACT REFERENCE TO IMAGE 2) */}
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
      {/* 4. LEETCODE 365-DAY HEATMAP */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#DC2626" /> LeetCode 365-Day Heatmap (7 × 4 × 12 Grid)
            </h3>
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

    </div>
  );
}
