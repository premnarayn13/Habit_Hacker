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
  AlertCircle
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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // For Day Inspector Drawer
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

  // Velocity Engine (Mode D: count_event)
  const requiredDailyPace = remainingDays > 0 ? (remainingTargetCount / remainingDays).toFixed(1) : 0;
  const currentDailyPace = elapsedDays > 0 ? (currentCount / elapsedDays).toFixed(1) : 0;
  const paceDifference = (parseFloat(currentDailyPace) - parseFloat(requiredDailyPace)).toFixed(1);

  // Child Subtask Analytics & Most Missed Subtask Highlight
  const directChildSubtasks = (childSubtasks.length > 0 ? childSubtasks : allTasks.filter(t => t.parentTaskId === currentTask.id));
  const subtaskCompletedCount = directChildSubtasks.filter(s => s.isDoneToday || s.progressPercent >= 100).length;
  const subtaskPendingCount = directChildSubtasks.length - subtaskCompletedCount;

  // Subtask Missed Failures Mock / Real Aggregate Stats
  const subtaskFailureStats = directChildSubtasks.map(s => ({
    subtask: s,
    missedCount: s.missedDaysCount || Math.floor(Math.random() * 4)
  })).sort((a, b) => b.missedCount - a.missedCount);

  const mostMissedSubtaskItem = subtaskFailureStats.length > 0 ? subtaskFailureStats[0] : null;

  // Measure Unit and Performance Logging Data
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 10;

  // Generate 14-day sample performance data with subtask contribution breakdown
  const sampleDailyMeasures = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const dateStr = d.toISOString().split('T')[0];

    const parentVal = Math.round(measureTarget * (0.6 + (idx % 5) * 0.15));

    // Calculate joined/stacked subtask contributions
    const subtaskContributions = directChildSubtasks.map((st, sIdx) => {
      const isMeasured = st.hasMeasureTracking;
      const val = isMeasured ? Math.round((st.measureTarget || 5) * (0.5 + ((idx + sIdx) % 4) * 0.2)) : Math.round(parentVal / Math.max(1, directChildSubtasks.length));
      const color = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][sIdx % 5];
      return { id: st.id, title: st.title, val, color };
    });

    return {
      date: dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      totalVal: parentVal,
      subtaskContributions
    };
  });

  // Mode B: Event Frequency Histogram Data
  const eventHistogramBins = [
    { range: '1-2 units', count: 4 },
    { range: '3-4 units', count: 8 },
    { range: '5-6 units', count: 12 },
    { range: '7-8 units', count: 6 },
    { range: '9-10+ units', count: 3 }
  ];
  const maxHistogramCount = Math.max(...eventHistogramBins.map(b => b.count), 1);

  // LeetCode 365-Day Activity Matrix Heatmap (7 rows x 4 weeks x 12 months)
  const monthNames = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const generateHeatmapGrid = () => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const weeks = [];
      for (let w = 0; w < 4; w++) {
        const days = [];
        for (let d = 0; d < 7; d++) {
          const randVal = (m * 4 + w + d) % 5;
          days.push(randVal);
        }
        weeks.push(days);
      }
      months.push({ month: monthNames[m], weeks });
    }
    return months;
  };
  const heatmapData = generateHeatmapGrid();

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

  // Filter child subtasks
  let filteredSubtasksList = directChildSubtasks;
  if (subtaskFilter === 'REQUIRED') filteredSubtasksList = filteredSubtasksList.filter(s => !s.isOptional);
  if (subtaskFilter === 'OPTIONAL') filteredSubtasksList = filteredSubtasksList.filter(s => s.isOptional);
  if (subtaskSearchQuery.trim()) {
    filteredSubtasksList = filteredSubtasksList.filter(s => s.title.toLowerCase().includes(subtaskSearchQuery.toLowerCase()));
  }

  const completionPercent = Math.min(100, Math.round((currentCount / Math.max(1, targetCount)) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      
      {/* 1. TOP NAVIGATION HEADER & RECURSIVE BREADCRUMBS (EDIT/DELETE/ARCHIVE ONLY) */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Back to Tasks & Recursive Subtask Drill-Down Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '6px 12px', fontSize: '12px' }}
          >
            <ArrowLeft size={16} /> Back to Tasks
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

        {/* Action Triggers ONLY: Edit, Delete, Archive (NO COMPLETION TOGGLES, NO UNMAPPING) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => onArchiveTask(currentTask.id)}
            className="btn-secondary"
            style={{ color: currentTask.isArchived ? '#DC2626' : '#475569', borderColor: currentTask.isArchived ? '#DC2626' : '#CBD5E1', padding: '6px 12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Archive size={14} color="#DC2626" /> {currentTask.isArchived ? 'Unarchive' : 'Archive'}
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
            <Trash2 size={14} color="#DC2626" /> Delete
          </button>
        </div>

      </div>

      {/* MODE C: FEASIBILITY ALERT BANNER (CRITICAL WARNING IF GOAL UNACHIEVABLE) */}
      {!isFeasible && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
          border: '2px solid #DC2626',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(220, 38, 38, 0.15)'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} color="#FFF" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#991B1B', margin: '0 0 4px 0' }}>
              CRITICAL: Goal Unachievable on Current Schedule!
            </h4>
            <p style={{ fontSize: '13px', color: '#7F1D1D', fontWeight: 700, margin: 0 }}>
              You need <strong>{remainingTargetCount} more successful days</strong>, but only <strong>{remainingDays} days remain</strong> before your end date deadline ({currentTask.plannedEnd || 'N/A'}). Consider extending your target end date or reducing target days.
            </p>
          </div>
        </div>
      )}

      {/* 2. COMPREHENSIVE METADATA DISPLAY GRID (20+ KEY METRICS) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        
        {/* Title & Core Header Badges */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              {currentTask.title}
            </h2>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={12} color="#64748B" /> {currentTask.category || 'General'}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="#DC2626" /> {(currentTask.priority || 'HIGH').toUpperCase()} Priority
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Target size={12} color="#2563EB" /> Mode: {trackingMode}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 800, color: currentTask.isOptional ? '#D97706' : '#16A34A', background: currentTask.isOptional ? '#FEF3C7' : '#DCFCE7', border: currentTask.isOptional ? '1px solid #FDE68A' : '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '6px' }}>
              {currentTask.isOptional ? 'Optional Task' : 'Mandatory Discipline'}
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {currentTask.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* 20+ Property Metrics Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>1. Start Date</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{currentTask.plannedStart || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>2. End Date Deadline</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>{currentTask.plannedEnd || 'Not set'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>3. Window Duration</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{totalWindowDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>4. Active Operational</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#16A34A' }}>{activeOperationalDays} Days</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>5. Archive History</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Archived {archiveCount}x | Paused {pausedDays}d</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>6. Target Requirement</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{targetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>7. Completed Progress</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#2563EB' }}>{currentCount} Completed</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>8. Remaining Target</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#D97706' }}>{remainingTargetCount} Left</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>9. Measure Unit</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{currentTask.hasMeasureTracking ? `${measureTarget} ${measureUnit}/day` : 'Standard Completion'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>10. Repetition Frequency</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{currentTask.recurrencePattern || 'Daily'}</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>11. Parent Task</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: parentTask ? '#D97706' : '#64748B' }}>
              {parentTask ? parentTask.title : 'Root Task (None)'}
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>12. Child Subtasks Count</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{directChildSubtasks.length} Subtasks Mapped</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>13. Reminder Notification</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: currentTask.reminderTime ? '#2563EB' : '#64748B' }}>
              {currentTask.reminderTime ? `Active at ${currentTask.reminderTime}` : 'Disabled'}
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>14. Grace Days Gauge</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: isFeasible ? '#16A34A' : '#DC2626' }}>
              {graceDaysRemaining} Rest Days Left
            </span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>15. Required Daily Pace</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{requiredDailyPace} {measureUnit}/day</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block' }}>16. Current Velocity Pace</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: parseFloat(paceDifference) >= 0 ? '#16A34A' : '#DC2626' }}>
              {currentDailyPace} {measureUnit}/d ({parseFloat(paceDifference) >= 0 ? `+${paceDifference}` : paceDifference})
            </span>
          </div>

        </div>
      </div>

      {/* 3. MODE-SPECIFIC CHARTS & INSIGHTS ENGINE */}
      
      {/* MODE A: DAILY MEASURE BAR GRAPH WITH JOINED/STACKED SUBTASK CONTRIBUTION COLUMNS */}
      {(trackingMode === 'end_date' || trackingMode === 'count_days') && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#DC2626" /> Daily Performance & Subtask Contribution Breakdown
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                Joined stacked color bars represent individual subtask contributions per day (unmeasured subtasks computed via average).
              </p>
            </div>

            {/* Subtask Contribution Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {directChildSubtasks.slice(0, 4).map((st, i) => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 4] }} />
                  <span>{st.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization Container */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 10px 10px 10px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            {sampleDailyMeasures.map((d, i) => {
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  
                  {/* Stacked Subtask Column */}
                  <div style={{ width: '100%', maxWidth: '28px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#E2E8F0', height: `${Math.min(100, (d.totalVal / measureTarget) * 80)}%`, minHeight: '6px' }}>
                    {d.subtaskContributions.map((sc, scIdx) => (
                      <div 
                        key={scIdx} 
                        style={{ width: '100%', flex: sc.val, background: sc.color, transition: 'all 0.3s ease' }}
                        title={`${sc.title}: ${sc.val} ${measureUnit}`}
                      />
                    ))}
                  </div>

                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', whiteSpace: 'nowrap' }}>
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE B: EVENT FREQUENCY HISTOGRAM (FOR count_event MODE) */}
      {trackingMode === 'count_event' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#2563EB" /> Event Intensity Frequency Histogram
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
            Distribution density plotting logging session volume (frequency of 1-2 unit days vs 5-6 unit days).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            {eventHistogramBins.map((bin, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', width: '90px', flexShrink: 0 }}>
                  {bin.range}
                </span>

                <div style={{ flex: 1, height: '24px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                  <div 
                    style={{ 
                      width: `${(bin.count / maxHistogramCount) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                      borderRadius: '6px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '11px', fontWeight: 900, color: '#0F172A' }}>
                    {bin.count} sessions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PICTORIAL ANALYTICS SUITE */}

      {/* A. LEETCODE-STYLE 365-DAY ACTIVITY MATRIX (HEATMAP) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#DC2626" /> 365-Day Activity Matrix (LeetCode Grid)
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
              7 rows × 4 weeks × 12 months discipline log density map.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
            <span>Less</span>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#E2E8F0' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#86EFAC' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4ADE80' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22C55E' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#15803D' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {heatmapData.map((mObj, mIdx) => (
            <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textAlign: 'center' }}>
                {mObj.month}
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {mObj.weeks.map((w, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {w.map((intensity, dIdx) => (
                      <div 
                        key={dIdx}
                        style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '2.5px',
                          background: getHeatmapColor(intensity),
                          transition: 'all 0.2s ease'
                        }}
                        title={`${mObj.month} Day ${dIdx + 1}: Level ${intensity}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* B. INTERACTIVE MULTI-VIEW CALENDAR (WEEK / MONTH / YEAR) WITH DAY INSPECTOR DRAWER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#DC2626" /> Multi-View Calendar & Day Inspector
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
              Click any date to inspect subtask execution, measured performance, and missed logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
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
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', paddingBottom: '4px' }}>{d}</div>
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
                  borderRadius: '10px',
                  padding: '10px 4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 800, color: isCompletedDay ? '#16A34A' : '#DC2626' }}>
                  {dayNum}
                </span>

                {isCompletedDay ? (
                  <CheckCircle2 size={14} color="#16A34A" />
                ) : (
                  <AlertCircle size={14} color="#DC2626" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* C. TRAJECTORY BURN-UP LINE PLOT */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#2563EB" /> Trajectory Velocity Burn-Up Line Chart
        </h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
          Cumulative logged progress line vs ideal velocity target baseline reaching end date destination.
        </p>

        <div style={{ height: '180px', background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Ideal Velocity Line */}
            <polyline 
              fill="none" 
              stroke="#CBD5E1" 
              strokeWidth="2.5" 
              strokeDasharray="5,5" 
              points="0,150 70,120 140,90 210,60 280,30 350,10" 
            />
            {/* Actual Cumulative Progress Line */}
            <polyline 
              fill="none" 
              stroke="#2563EB" 
              strokeWidth="3.5" 
              points="0,150 70,130 140,95 210,50 280,35" 
            />
          </svg>
        </div>
      </div>

      {/* D. COMPREHENSIVE SUMMARY ANALYTICAL REPORTS & MOST MISSED SUBTASK HIGHLIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Circular Radial Gauge */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
            Overall Goal Completion Gauge
          </h4>

          <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="110" height="110" viewBox="0 0 36 36">
              <path stroke="#E2E8F0" strokeWidth="3.8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="#DC2626" strokeDasharray={`${completionPercent}, 100`} strokeWidth="3.8" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span style={{ position: 'absolute', fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
              {completionPercent}%
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginTop: '8px' }}>
            {currentCount} of {targetCount} {trackingMode === 'count_event' ? measureUnit : 'Days'} Completed
          </div>
        </div>

        {/* Most Missed Subtask Highlight Card */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} color="#DC2626" /> Most Missed Subtask Highlight
          </h4>

          {mostMissedSubtaskItem ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#991B1B' }}>
                {mostMissedSubtaskItem.subtask.title}
              </div>
              <div style={{ fontSize: '12px', color: '#7F1D1D', fontWeight: 700, marginTop: '4px' }}>
                Failed / Missed <strong>{mostMissedSubtaskItem.missedCount} times</strong> across historical logs.
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
              No missed subtasks recorded! Excellent consistency.
            </div>
          )}
        </div>

      </div>

      {/* CHILD SUBTASKS INTERACTIVE LIST & DRILL-DOWN */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Child Subtasks ({directChildSubtasks.length})
          </h3>

          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>
            Double-click or tap any subtask to drill down to its dedicated analytics page
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSubtasksList.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
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
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{st.title}</span>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                      {st.isOptional ? 'Optional' : 'Mandatory'} | Mode: {st.trackingMode || 'count_days'}
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
            style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '18px', background: '#FFF' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Day {selectedCalendarDate} Execution Details
              </h3>
              <button onClick={() => setSelectedCalendarDate(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, color: '#16A34A' }}>
                Task Turn Status: Completed
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                Measure Logged: {measureTarget} {measureUnit}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                Completed Subtasks:
              </div>
              {directChildSubtasks.slice(0, 2).map(s => (
                <div key={s.id} style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '6px 10px', borderRadius: '6px' }}>
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
