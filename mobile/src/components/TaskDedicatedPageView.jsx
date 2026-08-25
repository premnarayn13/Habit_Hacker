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
  Trophy
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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // Day Inspector Drawer
  const [subtaskFilter, setSubtaskFilter] = useState('ALL'); // 'ALL', 'REQUIRED', 'OPTIONAL'
  const [subtaskSearchQuery, setSubtaskSearchQuery] = useState('');

  const currentTask = breadcrumbStack[breadcrumbStack.length - 1] || task;
  const isSubtask = !!currentTask.parentTaskId;

  // Calculate total window duration days
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

  const trackingMode = currentTask.trackingMode || (currentTask.plannedEnd ? 'end_date' : 'count_days');
  const targetCount = currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || totalWindowDays || 30;
  const currentCount = currentTask.currentCount || currentTask.currentDayCount || currentTask.currentEventCount || 0;
  const remainingTargetCount = Math.max(0, targetCount - currentCount);

  // Archive Logs & Paused Days
  const archiveCount = currentTask.archiveCount || (currentTask.isArchived ? 1 : 0);
  const pausedDays = currentTask.pausedDays || 0;
  const activeOperationalDays = Math.max(0, elapsedDays - pausedDays);

  // Feasibility Check Engine (Mode C: count_days)
  const isFeasible = trackingMode === 'count_days' ? (remainingDays >= remainingTargetCount) : true;
  const graceDaysRemaining = Math.max(0, remainingDays - remainingTargetCount);

  // Daily Pace Engine
  const requiredDailyPace = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0;
  const currentDailyPace = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0;
  const paceDifference = (parseFloat(currentDailyPace) - parseFloat(requiredDailyPace)).toFixed(1);

  // Child Subtask Analytics & Most Missed Subtask Highlight
  const directChildSubtasks = (childSubtasks.length > 0 ? childSubtasks : allTasks.filter(t => t.parentTaskId === currentTask.id));

  const subtaskFailureStats = directChildSubtasks.map(s => ({
    subtask: s,
    missedCount: s.missedDaysCount || Math.floor(Math.random() * 4)
  })).sort((a, b) => b.missedCount - a.missedCount);

  const mostMissedSubtaskItem = subtaskFailureStats.length > 0 ? subtaskFailureStats[0] : null;

  // Measure Unit and Performance Logging Data
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 10;

  const completionPercent = Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100));
  const missedDaysCount = Math.max(0, elapsedDays - currentCount);
  const missRatePercent = elapsedDays > 0 ? Math.round((missedDaysCount / elapsedDays) * 100) : 0;

  // Color Palette for Subtasks (Grouped by Subtask Contribution)
  const subtaskColors = ['#4338CA', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];

  // Calculate Daily Performance Bar Chart Data with UNMEASURED SUBTASK AVERAGE LOGIC
  const sampleDailyMeasures = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    // 1. Calculate values for measured subtasks first
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

    // 2. Compute average of measured subtasks
    const avgMeasured = measuredVals.length > 0 ? Math.round(measuredVals.reduce((a, b) => a + b, 0) / measuredVals.length) : 3;

    // 3. Assign average value to unmeasured subtasks
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

  // NEW GRAPH 1: Grouped Pair Bar Chart (Image 3 Reference: Target vs Actual Monthly Comparison)
  const monthlyComparisonData = [
    { month: 'Jun', target: 30, actual: 28 },
    { month: 'Jul', target: 35, actual: 32 },
    { month: 'Aug', target: 40, actual: 42 },
    { month: 'Sep', target: 45, actual: 38 }
  ];

  // NEW GRAPH 2: Time of Day Log Distribution (Morning, Afternoon, Evening)
  const timeOfDayDistribution = [
    { period: 'Morning (6 AM - 12 PM)', count: 18, icon: Sun, color: '#F59E0B' },
    { period: 'Afternoon (12 PM - 6 PM)', count: 10, icon: Sunset, color: '#3B82F6' },
    { period: 'Evening (6 PM - 12 AM)', count: 14, icon: Moon, color: '#8B5CF6' }
  ];
  const totalTimeLogs = timeOfDayDistribution.reduce((a, b) => a + b.count, 0);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '60px' }}>
      
      {/* 1. TOP NAVIGATION & RECURSIVE BREADCRUMBS */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Back to Tasks preserving filter state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, padding: '6px 12px', fontSize: '12px' }}
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

        {/* Action Buttons ONLY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => onArchiveTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: currentTask.isArchived ? '#DC2626' : '#475569', borderColor: currentTask.isArchived ? '#DC2626' : '#CBD5E1', padding: '6px 12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Archive size={14} color="#DC2626" /> {currentTask.isArchived ? 'Unarchive Task' : 'Archive Task'}
          </button>

          <button 
            onClick={() => onEditTask(currentTask)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Edit3 size={14} color="#0F172A" /> Edit Metadata
          </button>

          <button 
            onClick={() => onDeleteTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '6px 12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
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
        boxShadow: isFeasible ? '0 6px 20px rgba(22, 163, 74, 0.12)' : '0 8px 24px rgba(220, 38, 38, 0.15)'
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
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: '5px solid #2563EB', background: '#EFF6FF' }}>
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

      {/* 2. CATEGORIZED EXECUTIVE METADATA PANELS */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        
        {/* Title & Core Header Badges */}
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              {currentTask.title}
            </h2>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={11} color="#64748B" /> Category: {currentTask.category || 'General'}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={11} color="#DC2626" /> Priority: {(currentTask.priority || 'HIGH').toUpperCase()}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Target size={11} color="#2563EB" /> Tracking Mode: {trackingMode}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.isOptional ? '#D97706' : '#16A34A', background: currentTask.isOptional ? '#FEF3C7' : '#DCFCE7', border: currentTask.isOptional ? '1px solid #FDE68A' : '1px solid #BBF7D0', padding: '3px 8px', borderRadius: '6px' }}>
              {currentTask.isOptional ? 'Optional Task [Outline]' : 'Mandatory Discipline [Solid]'}
            </span>
          </div>

          {/* Full Description */}
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Full Markdown Task Description</span>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {currentTask.description || 'No description provided for this task.'}
            </p>
          </div>
        </div>

        {/* 20+ Property Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #64748B' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Start Date</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #DC2626' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>End Date Deadline</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>{currentTask.plannedEnd || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Total Window Duration</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{totalWindowDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #16A34A' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Active Operational</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#16A34A' }}>{activeOperationalDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #D97706' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Archive History Log</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Archived {archiveCount}x | Paused {pausedDays}d</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #8B5CF6' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Target Requirement</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{targetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Completed Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>{currentCount} Completed</span>
            <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercent}%`, height: '100%', background: '#2563EB' }} />
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #D97706' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Remaining Target</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#D97706' }}>{remainingTargetCount} Left</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #EC4899' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Measure Unit</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.hasMeasureTracking ? `${measureTarget} ${measureUnit}/day` : 'Standard Check'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #6366F1' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Repetition Frequency</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{currentTask.recurrencePattern || 'Daily'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #3B82F6' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Reminder Notification</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.reminderTime ? '#2563EB' : '#64748B' }}>
              {currentTask.reminderTime ? `Active at ${currentTask.reminderTime}` : 'Disabled'}
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: isFeasible ? '4px solid #16A34A' : '4px solid #DC2626' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Grace Days Gauge</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: isFeasible ? '#16A34A' : '#DC2626' }}>
              {graceDaysRemaining} Rest Days Left
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: '4px solid #8B5CF6' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Required Daily Pace</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{requiredDailyPace} {measureUnit}/day</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', borderLeft: parseFloat(paceDifference) >= 0 ? '4px solid #16A34A' : '4px solid #DC2626' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Current Daily Pace</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: parseFloat(paceDifference) >= 0 ? '#16A34A' : '#DC2626' }}>
              {currentDailyPace} {measureUnit}/d ({parseFloat(paceDifference) >= 0 ? `+${paceDifference}` : paceDifference})
            </span>
          </div>

        </div>
      </div>

      {/* 3. STACKED SUBTASK CONTRIBUTION COLUMN CHART (IMAGE 2 REFERENCE) */}
      {(trackingMode === 'end_date' || trackingMode === 'count_days') && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: 0, textAlign: 'center' }}>
                Subtask Contribution per Day - Grouped Breakdown
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', textAlign: 'center' }}>
                Unmeasured subtasks are computed using the daily average of measurable subtasks ({measureUnit}).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Chart Area with Vertical Y-Axis Scale */}
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

            {/* Right Legend Box */}
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

      {/* NEW GRAPH 1: MONTHLY COMPARISON GROUPED BAR CHART (EXACT REFERENCE TO IMAGE 3) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B', margin: '0 0 4px 0', textAlign: 'center' }}>
          Monthly Target vs Actual Performance Comparison
        </h3>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 16px 0', textAlign: 'center' }}>
          Paired bar chart comparing planned monthly output targets against actual completed units.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '220px', padding: '10px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
            <span>50</span>
            <span>40</span>
            <span>30</span>
            <span>20</span>
            <span>10</span>
            <span>0</span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', borderBottom: '2px solid #E2E8F0', paddingBottom: '4px' }}>
            {monthlyComparisonData.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '160px' }}>
                  
                  {/* Target Bar (Yellow) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#D97706', marginBottom: '2px' }}>{m.target}</span>
                    <div style={{ width: '22px', height: `${(m.target / 50) * 100}%`, background: '#F59E0B', borderRadius: '4px 4px 0 0' }} />
                  </div>

                  {/* Actual Bar (Green) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#16A34A', marginBottom: '2px' }}>{m.actual}</span>
                    <div style={{ width: '22px', height: `${(m.actual / 50) * 100}%`, background: '#10B981', borderRadius: '4px 4px 0 0' }} />
                  </div>

                </div>

                <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                  {m.month}
                </span>
              </div>
            ))}
          </div>

          {/* Pair Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', fontWeight: 800 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706' }}>
              <div style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '3px' }} />
              <span>Target Units</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A' }}>
              <div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '3px' }} />
              <span>Actual Logged</span>
            </div>
          </div>

        </div>
      </div>

      {/* NEW GRAPH 2: TIME OF DAY LOG DISTRIBUTION & STREAK MILESTONES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        
        {/* Time of Day Distribution */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={16} color="#8B5CF6" /> Time-of-Day Logging Habits
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeOfDayDistribution.map((t, idx) => {
              const Icon = t.icon;
              const pct = Math.round((t.count / totalTimeLogs) * 100);

              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={14} color={t.color} /> {t.period}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: t.color }}>{pct}% ({t.count} logs)</span>
                  </div>

                  <div style={{ height: '6px', width: '100%', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: t.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak & Consistency Milestones */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} color="#F59E0B" /> Streak & Discipline Milestones
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Current Active Streak</span>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>
                7 Days 🔥
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Longest Record Streak</span>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>
                14 Days 🏆
              </div>
            </div>

          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>Overall Discipline Score: <strong>88% Consistency</strong></span>
          </div>
        </div>

      </div>

      {/* 4. PICTORIAL ANALYTICS SUITE */}

      {/* A. LEETCODE-STYLE 7x52 ACTIVITY MATRIX (HEATMAP) */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="#DC2626" /> LeetCode 365-Day Activity Matrix (7 Rows × 52 Weeks Grid)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Darker green boxes = high daily measure; lighter green = low measure; slate = rest/missed days.
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

        {/* 52-Week Heatmap Grid */}
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
                  title={`Week ${wIdx + 1}, ${dayLabels[dIdx]}: ${intensity} units logged`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* B. INTERACTIVE MULTI-VIEW CALENDAR (WEEK / MONTH / YEAR) WITH DAY INSPECTOR DRAWER */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarDays size={16} color="#DC2626" /> Multi-View Calendar & Day Inspector
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Click any date to inspect subtask execution, measured performance, and missed logs.
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

        {/* Grid Days */}
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

      {/* C. TRAJECTORY BURN-UP LINE PLOT */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} color="#2563EB" /> Trajectory Velocity Burn-Up Line Chart
        </h3>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 14px 0' }}>
          Cumulative logged progress line vs ideal velocity target baseline reaching end date destination.
        </p>

        <div style={{ height: '160px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="blueGradientPlotFull2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area fill under actual line */}
            <polygon fill="url(#blueGradientPlotFull2)" points="0,130 70,110 140,80 210,40 280,20 280,140 0,140" />
            {/* Ideal Velocity Line */}
            <polyline 
              fill="none" 
              stroke="#CBD5E1" 
              strokeWidth="2.5" 
              strokeDasharray="5,5" 
              points="0,130 70,100 140,75 210,50 280,25 350,5" 
            />
            {/* Actual Cumulative Progress Line */}
            <polyline 
              fill="none" 
              stroke="#2563EB" 
              strokeWidth="3.5" 
              points="0,130 70,110 140,80 210,40 280,20" 
            />
          </svg>
        </div>
      </div>

      {/* CHILD SUBTASKS SEPARATE ELEMENT SECTION */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #DC2626' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Child Subtasks Panel ({directChildSubtasks.length})
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
              Click any subtask row to drill down to its dedicated analytics view
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
                  padding: '3px 8px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

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

      {/* DAY INSPECTOR DRAWER / MODAL SHEET */}
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
            style={{ width: '100%', maxWidth: '400px', padding: '20px', borderRadius: '16px', background: '#FFF' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Day {selectedCalendarDate} Execution Details
              </h3>
              <button onClick={() => setSelectedCalendarDate(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                Task Turn Status: Completed
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                Measure Logged: {measureTarget} {measureUnit}
              </div>

              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Completed Subtasks:
              </div>
              {directChildSubtasks.slice(0, 2).map(s => (
                <div key={s.id} style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '5px 8px', borderRadius: '6px' }}>
                  ✓ {s.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
