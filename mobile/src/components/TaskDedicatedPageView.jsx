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
  MoreVertical
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
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date(2026, 7, 1)); // August 2026
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
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 10;

  // Daily Measure & Subtask Contribution Data with DERIVED AVERAGE FOR NON-MEASURABLE SUBTASKS
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

  // Calendar Days Generation (Matching User Image 2 & Image 3 Reference Designs)
  const renderMonthlyCalendarGrid = () => {
    // 35 Calendar Cells for October 2022 Reference Model
    const cells = [];
    const prevMonthDays = [26, 27, 28, 29, 30]; // Oct muted days
    
    // Muted Previous Month Days
    prevMonthDays.forEach((d, idx) => {
      cells.push({
        dayNum: d,
        isCurrentMonth: false,
        events: idx === 1 ? [{ text: 'Shoot video', color: '#CCFBF1', textColor: '#0F766E' }] : (idx === 2 ? [{ text: 'Weekly Sync', color: '#E0E7FF', textColor: '#4338CA' }] : [])
      });
    });

    // Current Month Days (1 to 31)
    for (let d = 1; d <= 31; d++) {
      let events = [];
      if (d === 1) events.push({ text: 'Guest invite', color: '#DBEAFE', textColor: '#1E40AF' });
      if (d === 3) events.push({ text: 'Data analysis', color: '#CCFBF1', textColor: '#0F766E' });
      if (d === 4) events.push({ text: 'Weekly Sync', color: '#E0E7FF', textColor: '#4338CA' });
      if (d === 30) events.push({ text: 'Climb', color: '#FEF3C7', textColor: '#B45309' });

      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        isToday: d === 14, // Blue circle highlight on 14th (Image 2)
        events
      });
    }

    return cells;
  };

  const monthlyGridCells = renderMonthlyCalendarGrid();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '70px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TASK HEADER & ACTION BAR PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Back Button & Breadcrumbs */}
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

        {/* Action Triggers ONLY: Edit, Delete, Archive, Unarchive */}
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

      {/* FEASIBILITY BANNER */}
      <div style={{
        background: isFeasible ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
        border: isFeasible ? '2px solid #16A34A' : '2px solid #DC2626',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isFeasible ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isFeasible ? <ShieldCheck size={22} color="#FFF" /> : <AlertTriangle size={22} color="#FFF" />}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 900, color: isFeasible ? '#14532D' : '#991B1B', margin: '0 0 2px 0' }}>
            {isFeasible ? 'Goal Achievable & On Schedule' : 'CRITICAL: Goal Unachievable on Current Schedule!'}
          </h4>
          <p style={{ fontSize: '12px', color: isFeasible ? '#166534' : '#7F1D1D', fontWeight: 700, margin: 0 }}>
            {isFeasible ? (
              <>Schedule Buffer: <strong>{graceDaysRemaining} grace rest days</strong> remaining in window before deadline risk.</>
            ) : (
              <>Goal Unachievable! You need <strong>{remainingTargetCount} more successful days</strong>, but only <strong>{remainingDays} calendar days remain</strong> in your schedule window.</>
            )}
          </p>
        </div>
      </div>

      {/* PARENT TASK SECTION */}
      {parentTask && (
        <div style={{ padding: '16px 20px', background: '#EFF6FF', borderRadius: '14px', borderLeft: '5px solid #2563EB', border: '1px solid #BFDBFE' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent Task Link</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1E40AF', margin: 0 }}>{parentTask.title}</h3>
              <p style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 700, margin: '2px 0 0 0' }}>Category: {parentTask.category || 'General'} | Mode: {parentTask.trackingMode || 'end_date'}</p>
            </div>
            <button 
              onClick={() => onNavigateToSubtask && onNavigateToSubtask(parentTask)}
              className="btn-secondary" 
              style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', borderColor: '#BFDBFE', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Open Parent Task <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TASK DESCRIPTION & FLOATING METADATA CHIPS (NO BORING BOXES) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          
          {/* Header Floating Pill Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              {currentTask.title}
            </h2>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={11} color="#64748B" /> {currentTask.category || 'General'}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={11} color="#DC2626" /> {(currentTask.priority || 'HIGH').toUpperCase()}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Target size={11} color="#2563EB" /> {taskTypeLabel}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.isOptional ? '#D97706' : '#16A34A', background: currentTask.isOptional ? '#FEF3C7' : '#DCFCE7', border: currentTask.isOptional ? '1px solid #FDE68A' : '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '20px' }}>
              {currentTask.isOptional ? 'Optional Task' : 'Mandatory Discipline'}
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Full Markdown Task Description</span>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {currentTask.description || 'No detailed description provided for this task.'}
            </p>
          </div>
        </div>

        {/* Dynamic Horizontal Floating Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', padding: '10px 16px', borderRadius: '25px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#64748B" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Start → End Window</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || 'N/A'} → {currentTask.plannedEnd || 'N/A'} ({totalWindowDays} Days Total Window)</span>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', padding: '10px 16px', borderRadius: '25px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="#2563EB" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#1E40AF', display: 'block', textTransform: 'uppercase' }}>Active Operational vs Paused</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#1E3A8A' }}>{activeOperationalDays} Active Days ({pausedDays} Paused Days Across {archiveCount} Archives)</span>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', padding: '10px 16px', borderRadius: '25px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={14} color="#16A34A" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#14532D', display: 'block', textTransform: 'uppercase' }}>Progress Ratio Score</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#15803D' }}>{currentCount} Accomplished / {targetCount} Target ({completionPercent}%)</span>
            </div>
          </div>

          {trackingMode === 'count_event' && (
            <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', padding: '10px 16px', borderRadius: '25px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={14} color="#DC2626" />
              <div>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#991B1B', display: 'block', textTransform: 'uppercase' }}>Daily Event Pace Needed</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#7F1D1D' }}>{requiredEventsPerRemainingDay} {measureUnit}/day over remaining {remainingDays} days (Current Avg: {currentAverageEventsPerDay}/d)</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROFESSIONAL CALENDAR (MATCHING IMAGE 2 & IMAGE 3 REFERENCE DESIGNS) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        
        {/* Calendar Header with Navigation (Image 2 Model) */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        </div>

        {/* WEEKLY CALENDAR VIEW (EXACT REFERENCE TO IMAGE 3) */}
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

                {/* Event Pill Badges inside Calendar Day Cells (Image 2 Model) */}
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
      {/* 4. ARCHIVE HISTORY TABLE PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
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
      {/* 5. SUBTASK CONTRIBUTION STACKED BAR CHART (IMAGE 2 MODEL) */}
      {/* ========================================================================= */}
      {(trackingMode === 'end_date' || trackingMode === 'count_days') && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0, textAlign: 'center' }}>
              Subtask Contribution per Day - Grouped Breakdown
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', textAlign: 'center' }}>
              Non-measurable subtasks are derived from the daily average of measurable subtasks ({measureUnit}).
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
      )}

      {/* ========================================================================= */}
      {/* 6. LEETCODE 365-DAY HEATMAP (7 x 4 x 12) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="#DC2626" /> LeetCode 365-Day Heatmap (7 × 4 × 12 Grid)
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
      {/* 7. EVENT CUMULATIVE PROGRESS LINE GRAPH PANEL (TYPE 1 ONLY — STRICT CONDITIONAL RENDER) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LineChart size={16} color="#2563EB" /> Cumulative Event Progress Destination Line Graph (Type 1 Event Tasks Only)
          </h3>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 14px 0' }}>
            Cumulative completed events progressing from 0 → {targetCount} target events over available schedule days.
          </p>

          <div style={{ height: '160px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="eventLineGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon fill="url(#eventLineGradient2)" points="0,130 70,110 140,80 210,40 280,20 280,140 0,140" />
              <polyline fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" points="0,130 70,100 140,75 210,50 280,25 350,5" />
              <polyline fill="none" stroke="#2563EB" strokeWidth="3.5" points="0,130 70,110 140,80 210,40 280,20" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CHILD SUBTASKS PANEL */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', borderTop: '4px solid #DC2626', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
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

        {/* Bottleneck Highlight */}
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

      {/* SELECTED DATE ANALYSIS DRAWER */}
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
            style={{ width: '100%', maxWidth: '420px', padding: '22px', borderRadius: '16px', background: '#FFF', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
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

    </div>
  );
}
