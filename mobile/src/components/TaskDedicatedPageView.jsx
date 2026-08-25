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
  Crosshair
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

  // Type 1 Event Count Specific Calculations
  const requiredEventsPerRemainingDay = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0;
  const currentAverageEventsPerDay = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0;

  // Event Count Daily History & Multi-Event Cluster Data
  const dailyEventHistory = [
    { dayNum: 1, date: '2026-08-10', eventCount: 4, isSuccessful: true, events: [{ id: 'e1', title: 'DP 1', color: '#2563EB' }, { id: 'e2', title: 'DP 2', color: '#3B82F6' }, { id: 'e3', title: 'Graph 1', color: '#60A5FA' }, { id: 'e4', title: 'Pointers 1', color: '#93C5FD' }] },
    { dayNum: 2, date: '2026-08-11', eventCount: 6, isSuccessful: true, events: [{ id: 'e5', title: 'DP 3', color: '#2563EB' }, { id: 'e6', title: 'DP 4', color: '#3B82F6' }, { id: 'e7', title: 'Graph 2', color: '#60A5FA' }, { id: 'e8', title: 'Pointers 2', color: '#93C5FD' }, { id: 'e9', title: 'DP 5', color: '#1D4ED8' }, { id: 'e10', title: 'Sliding 1', color: '#1E40AF' }] },
    { dayNum: 3, date: '2026-08-12', eventCount: 0, isSuccessful: false, events: [] }, // Missed day
    { dayNum: 4, date: '2026-08-13', eventCount: 5, isSuccessful: true, events: [{ id: 'e11', title: 'DP 6', color: '#2563EB' }, { id: 'e12', title: 'Graph 3', color: '#3B82F6' }, { id: 'e13', title: 'Pointers 3', color: '#60A5FA' }, { id: 'e14', title: 'DP 7', color: '#93C5FD' }, { id: 'e15', title: 'Sliding 2', color: '#1D4ED8' }] },
    { dayNum: 5, date: '2026-08-14', eventCount: 3, isSuccessful: true, events: [{ id: 'e16', title: 'DP 8', color: '#2563EB' }, { id: 'e17', title: 'Graph 4', color: '#3B82F6' }, { id: 'e18', title: 'Pointers 4', color: '#60A5FA' }] },
    { dayNum: 6, date: '2026-08-15', eventCount: 0, isSuccessful: false, events: [] }, // Missed day
    { dayNum: 7, date: '2026-08-16', eventCount: 7, isSuccessful: true, events: [{ id: 'e19', title: 'DP 9', color: '#2563EB' }, { id: 'e20', title: 'DP 10', color: '#3B82F6' }, { id: 'e21', title: 'Graph 5', color: '#60A5FA' }, { id: 'e22', title: 'Pointers 5', color: '#93C5FD' }, { id: 'e23', title: 'Sliding 3', color: '#1D4ED8' }, { id: 'e24', title: 'DP 11', color: '#1E40AF' }, { id: 'e25', title: 'Graph 6', color: '#1D4ED8' }] }
  ];

  const successfulDaysCount = dailyEventHistory.filter(d => d.eventCount > 0).length;
  const missedEventsDaysCount = dailyEventHistory.filter(d => d.eventCount === 0).length;

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
        
        {/* Back Button & Recursive Subtask Drill-Down Breadcrumb Trail */}
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

        {/* Task Actions ONLY: Edit, Delete, Archive, Unarchive */}
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
      {/* 3. TASK CLASSIFICATION & METADATA PANEL (HANGING BALLOON CHIPS STYLE) */}
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

          <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0', padding: '10px 18px', borderRadius: '25px', boxShadow: '0 4px 10px rgba(22,163,74,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={16} color="#16A34A" />
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#14532D', textTransform: 'uppercase', display: 'block' }}>Discipline</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: currentTask.isOptional ? '#D97706' : '#16A34A' }}>{currentTask.isOptional ? 'Optional' : 'Mandatory'}</span>
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
      {/* 4. DATE & SCHEDULE INFORMATION (EXPANSIVE METRICS BREAKDOWN) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#8B5CF6" /> Date & Schedule Information Panel
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Start Date</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || '2026-08-10'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>End Date Deadline</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>{currentTask.plannedEnd || '2026-09-09'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Window Days</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{totalWindowDays} Days</span>
          </div>

          <div style={{ background: '#EFF6FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', display: 'block' }}>Days Elapsed</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#1E40AF' }}>{elapsedDays} Days</span>
          </div>

          <div style={{ background: '#FEF3C7', padding: '12px 16px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Days Remaining</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#B45309' }}>{remainingDays} Days</span>
          </div>

          {trackingMode === 'count_event' && (
            <>
              <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Successful Days (≥1 Event)</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#15803D' }}>{successfulDaysCount} Days</span>
              </div>

              <div style={{ background: '#FEF2F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', display: 'block' }}>Missed Days (0 Events)</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#991B1B' }}>{missedEventsDaysCount} Days</span>
              </div>

              <div style={{ background: '#F5F3FF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #DDD6FE', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', display: 'block' }}>Avg Events Needed Per Remaining Day</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#6D28D9' }}>{requiredEventsPerRemainingDay} {measureUnit}/day ({remainingTargetCount} events ÷ {remainingDays} days left)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. EVENT HISTOGRAM (MULTIPLE EVENT BAR CLUSTERS PER DAY - TYPE 1 ONLY) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #2563EB', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#2563EB" /> Event Cluster Histogram (Multiple Side-by-Side Event Bars per Day)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
              Side-by-side touching bars represent individual events completed on that specific day; gaps represent zero-event missed days.
            </p>
          </div>

          <div style={{ height: '180px', background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-end', gap: '16px', overflowX: 'auto' }}>
            {dailyEventHistory.map((d) => (
              <div key={d.dayNum} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', flexShrink: 0, minWidth: '45px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: d.isSuccessful ? '#2563EB' : '#DC2626', marginBottom: '4px' }}>
                  {d.eventCount > 0 ? `${d.eventCount} ev` : '0 ev'}
                </span>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '70%', paddingBottom: '2px', borderBottom: d.isSuccessful ? '2px solid #2563EB' : '2px solid #DC2626', width: '100%', justifyContent: 'center' }}>
                  {d.eventCount === 0 ? (
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', fontStyle: 'italic', marginBottom: '6px' }}>Missed</div>
                  ) : (
                    d.events.map((evItem) => (
                      <div 
                        key={evItem.id}
                        style={{
                          width: '8px',
                          height: `${Math.min(100, 30 + d.eventCount * 10)}%`,
                          background: evItem.color,
                          borderRadius: '3px 3px 0 0',
                          transition: 'all 0.3s ease'
                        }}
                        title={`${d.date}: ${evItem.title}`}
                      />
                    ))
                  )}
                </div>

                <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginTop: '6px' }}>Day {d.dayNum}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EVENT CUMULATIVE PROGRESS CRICKET WORM LINE GRAPH (MATCHING USER REFERENCE IMAGE) */}
      {/* ========================================================================= */}
      {trackingMode === 'count_event' && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #16A34A', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LineChart size={18} color="#16A34A" /> Cumulative Event Progress Cricket Worm Chart (Runs/Events vs Overs/Days)
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                Green curve = Ideal Required Trajectory ($0 \to 110$) | Blue curve = Actual Cumulative Events with Red Milestone Dots
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 800 }}>
              <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', background: '#16A34A' }} /> Ideal Pace
              </span>
              <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', background: '#2563EB' }} /> Actual Events
              </span>
              <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} /> Milestone Dot
              </span>
            </div>
          </div>

          {/* Cricket Worm SVG Chart matching User's Uploaded Image Reference */}
          <div style={{ height: '220px', background: '#FFF', border: '1px solid #CBD5E1', padding: '16px', borderRadius: '12px', position: 'relative' }}>
            
            {/* Y-Axis Label */}
            <div style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '10px', fontWeight: 900, color: '#475569' }}>
              Cumulative Events (0 to 110)
            </div>

            {/* Gridlines & SVG Canvas */}
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Background Gridlines */}
              <line x1="40" y1="20" x2="100%" y2="20" stroke="#E2E8F0" strokeDasharray="4,4" />
              <line x1="40" y1="60" x2="100%" y2="60" stroke="#E2E8F0" strokeDasharray="4,4" />
              <line x1="40" y1="100" x2="100%" y2="100" stroke="#E2E8F0" strokeDasharray="4,4" />
              <line x1="40" y1="140" x2="100%" y2="140" stroke="#E2E8F0" strokeDasharray="4,4" />

              {/* Y-Axis Scale Numbers */}
              <text x="30" y="24" fontSize="10" fontWeight="800" fill="#64748B" textAnchor="end">110</text>
              <text x="30" y="64" fontSize="10" fontWeight="800" fill="#64748B" textAnchor="end">75</text>
              <text x="30" y="104" fontSize="10" fontWeight="800" fill="#64748B" textAnchor="end">40</text>
              <text x="30" y="144" fontSize="10" fontWeight="800" fill="#64748B" textAnchor="end">0</text>

              {/* Green Line: Ideal Required Trajectory */}
              <polyline 
                fill="none" 
                stroke="#16A34A" 
                strokeWidth="2.5" 
                points="40,140 100,120 180,90 260,60 340,40 420,20" 
              />

              {/* Blue Line: Actual Achieved Cumulative Events Curve */}
              <polyline 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="3.0" 
                points="40,140 80,128 120,110 160,110 200,95 240,85 280,85 320,65" 
              />

              {/* Red Dot Event Milestone Markers (Image Reference Model) */}
              <circle cx="80" cy="128" r="5" fill="#DC2626" />
              <circle cx="120" cy="110" r="5" fill="#DC2626" />
              <circle cx="200" cy="95" r="5" fill="#DC2626" />
              <circle cx="240" cy="85" r="5" fill="#DC2626" />
              <circle cx="320" cy="65" r="5" fill="#DC2626" />

            </svg>

            {/* X-Axis Label */}
            <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 900, color: '#475569', marginTop: '6px' }}>
              Schedule Window Days (0 to 30 Days)
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ARCHIVE HISTORY TABLE PANEL */}
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
      {/* 8. SUBTASK CONTRIBUTION BAR CHART (IMAGE 2 MODEL) */}
      {/* ========================================================================= */}
      {(trackingMode === 'end_date' || trackingMode === 'count_days') && (
        <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
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
      {/* 9. CALENDAR VIEWS PANEL (IMAGE 2 & 3 REFERENCES) */}
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
      {/* 10. LEETCODE 365-DAY HEATMAP (7 x 4 x 12 MATRIX) */}
      {/* ========================================================================= */}
      <div style={{ padding: '24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#DC2626" /> LeetCode 365-Day Heatmap (7 × 4 × 12 Grid)
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
      {/* 11. SUBTASK ANALYTICS PANEL */}
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
