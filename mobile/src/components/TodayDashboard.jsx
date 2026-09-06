import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Calendar,
  Layers,
  Activity,
  Zap,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  Filter,
  Search,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Undo2,
  Edit3,
  Ruler,
  AlertCircle,
  HelpCircle,
  CalendarDays,
  Target,
  Trophy,
  Maximize2
} from 'lucide-react';
import { 
  isParentTaskWithChildren, 
  canManuallyCompleteTask, 
  calculateMeasurableAverage, 
  calculateSubtaskContribution, 
  calculateParentDailyMeasure, 
  calculateParentCompletionStatus 
} from '../lib/taskHierarchyEngine';
import TodayMeasureEditModal from './TodayMeasureEditModal';

export default function TodayDashboard({ 
  capacityData, 
  tasks = [], 
  habits = [], 
  disciplineScore = { disciplineScore: 85, grade: 'A', taskCompletionRate: 70 }, 
  onToggleTask, 
  onHabitCheckIn, 
  onUpdateTaskProgress,
  onOpenQuickAdd,
  onNavigateToTaskDedicated
}) {
  // Date State Switcher (0 = Today, -1 = Yesterday, +1 = Tomorrow, etc.)
  const [dateOffset, setDateOffset] = useState(0);

  // Filters State
  const [taskTypeFilter, setTaskTypeFilter] = useState('ALL'); // 'ALL', 'end_date', 'count_days', 'count_event'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'Academics', 'Coding', 'Fitness', etc.
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable UI States
  const [expandedParents, setExpandedParents] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // Measure Edit Modal State
  const [measureModalTask, setMeasureModalTask] = useState(null);

  // Early Completion Confirmation Modal State
  const [earlyCompleteTask, setEarlyCompleteTask] = useState(null);

  // Calculate Selected Date Object
  const selectedDateObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d;
  }, [dateOffset]);

  const selectedDateStr = selectedDateObj.toISOString().split('T')[0];
  const dateDisplayFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Separate Parent Tasks from Child Subtasks
  const parentTasks = useMemo(() => {
    return tasks.filter(t => !t.parentTaskId);
  }, [tasks]);

  const subtasksMap = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.parentTaskId) {
        if (!map[t.parentTaskId]) map[t.parentTaskId] = [];
        map[t.parentTaskId].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Recurrence Frequency Label Resolver
  const getFrequencyLabel = (t) => {
    if (t.recurrencePattern) return t.recurrencePattern;
    if (t.trackingMode === 'end_date') return 'Daily (Start-End Date)';
    if (t.trackingMode === 'count_days') return 'Every 2 days';
    if (t.trackingMode === 'count_event') return 'Event Count Schedule';
    return 'Daily';
  };

  // Determine Applicable Tasks for Selected Date
  const applicableTasks = useMemo(() => {
    return parentTasks.filter(p => {
      // Check category filter
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      // Check task type filter
      if (taskTypeFilter !== 'ALL' && p.trackingMode !== taskTypeFilter) return false;
      // Check search query
      if (searchQuery.trim() && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [parentTasks, categoryFilter, taskTypeFilter, searchQuery]);

  // Compute Daily Statistics
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let pendingSubtasksCount = 0;
    let totalMeasuresVal = 0;

    applicableTasks.forEach(p => {
      const children = subtasksMap[p.id] || [];
      const parentStatus = calculateParentCompletionStatus(p, children);

      if (parentStatus.isCompleted) {
        completedCount++;
      } else {
        pendingCount++;
      }

      if (children.length > 0) {
        children.forEach(st => {
          if (!st.isDoneToday && !st.isOptional) {
            pendingSubtasksCount++;
          }
          if (st.isDoneToday) {
            totalMeasuresVal += Number(st.loggedMeasureVal || st.measureTarget || 0);
          }
        });
      } else {
        if (p.isDoneToday) {
          totalMeasuresVal += Number(p.loggedMeasureVal || p.measureTarget || 0);
        }
      }
    });

    const totalCount = applicableTasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      pendingCount,
      pendingSubtasksCount,
      completionRate,
      totalMeasuresVal
    };
  }, [applicableTasks, subtasksMap]);

  // Find Next Up Action Task (Highest Priority Pending Task/Subtask)
  const nextUpItem = useMemo(() => {
    for (const p of applicableTasks) {
      const children = subtasksMap[p.id] || [];
      const parentStatus = calculateParentCompletionStatus(p, children);

      if (!parentStatus.isCompleted) {
        if (children.length > 0) {
          const pendingMandatory = children.find(st => !st.isDoneToday && !st.isOptional);
          if (pendingMandatory) {
            return { item: pendingMandatory, parent: p, type: 'SUBTASK' };
          }
        }
        return { item: p, parent: null, type: 'PARENT' };
      }
    }
    return null;
  }, [applicableTasks, subtasksMap]);

  // Task Type Breakdown Counts
  const typeBreakdown = useMemo(() => {
    let endDateCount = 0, endDateDone = 0;
    let dayCountCount = 0, dayCountDone = 0;
    let eventCountCount = 0, eventCountDone = 0;

    parentTasks.forEach(p => {
      const children = subtasksMap[p.id] || [];
      const parentStatus = calculateParentCompletionStatus(p, children);

      if (p.trackingMode === 'end_date') {
        endDateCount++;
        if (parentStatus.isCompleted) endDateDone++;
      } else if (p.trackingMode === 'count_days') {
        dayCountCount++;
        if (parentStatus.isCompleted) dayCountDone++;
      } else if (p.trackingMode === 'count_event') {
        eventCountCount++;
        if (parentStatus.isCompleted) eventCountDone++;
      }
    });

    return {
      endDate: { total: endDateCount, done: endDateDone, pending: endDateCount - endDateDone },
      dayCount: { total: dayCountCount, done: dayCountDone, pending: dayCountCount - dayCountDone },
      eventCount: { total: eventCountCount, done: eventCountDone, pending: eventCountCount - eventCountDone }
    };
  }, [parentTasks, subtasksMap]);

  // Dynamic Categories List
  const categoriesList = useMemo(() => {
    const set = new Set();
    parentTasks.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [parentTasks]);

  // Expand/Collapse Toggle Helpers
  const toggleParentExpand = (id) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategoryExpand = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Complete Early Trigger Handler
  const handleConfirmEarlyComplete = () => {
    if (!earlyCompleteTask) return;
    onToggleTask(earlyCompleteTask.id);
    setEarlyCompleteTask(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '70px', background: '#F8FAFC' }}>
      
      {/* ========================================================================= */}
      {/* 1. TODAY HEADER & DATE NAVIGATOR */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Today
            </h1>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
              {dateDisplayFormatted}
            </div>
          </div>

          {/* Date Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '4px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <button 
                onClick={() => setDateOffset(prev => prev - 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ‹ Previous
              </button>

              <button 
                onClick={() => setDateOffset(0)}
                style={{ background: dateOffset === 0 ? '#EA580C' : '#FFF', color: dateOffset === 0 ? '#FFF' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', margin: '0 4px' }}
              >
                Today
              </button>

              <button 
                onClick={() => setDateOffset(prev => prev + 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Next ›
              </button>
            </div>

            {dateOffset !== 0 && (
              <button
                onClick={() => setDateOffset(0)}
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={13} /> Back to Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DAILY OVERVIEW SCORECARD (5 COMPACT STAT CARDS) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        
        {/* Card 1: Total Tasks */}
        <div style={{ background: '#FFF', padding: '14px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Tasks</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>{stats.totalCount}</span>
        </div>

        {/* Card 2: Completed */}
        <div style={{ background: '#F0FDF4', padding: '14px 16px', borderRadius: '16px', border: '1px solid #BBF7D0', boxShadow: '0 2px 8px rgba(22,163,74,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Completed</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#15803D', marginTop: '2px', display: 'block' }}>{stats.completedCount}</span>
        </div>

        {/* Card 3: Pending */}
        <div style={{ background: '#FEF3C7', padding: '14px 16px', borderRadius: '16px', border: '1px solid #FDE68A', boxShadow: '0 2px 8px rgba(217,119,6,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Pending</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#D97706', marginTop: '2px', display: 'block' }}>{stats.pendingCount}</span>
        </div>

        {/* Card 4: Pending Subtasks */}
        <div style={{ background: '#FEF2F2', padding: '14px 16px', borderRadius: '16px', border: '1px solid #FECACA', boxShadow: '0 2px 8px rgba(220,38,38,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', display: 'block' }}>Pending Subtasks</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#991B1B', marginTop: '2px', display: 'block' }}>{stats.pendingSubtasksCount}</span>
        </div>

        {/* Card 5: Completion Rate */}
        <div style={{ background: '#EFF6FF', padding: '14px 16px', borderRadius: '16px', border: '1px solid #BFDBFE', boxShadow: '0 2px 8px rgba(37,99,235,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Completion Rate</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#2563EB', marginTop: '2px', display: 'block' }}>{stats.completionRate}%</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S OVERALL PROGRESS & LOGGED MEASURE OUTPUT */}
      {/* Dynamic progress bar tracking task completion % and total daily measure output */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>Today's Progress</span>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#EA580C' }}>
            {stats.completedCount} / {stats.totalCount} Tasks Completed ({stats.completionRate}%)
          </span>
        </div>

        {/* Progress Bar Track */}
        <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
          <div style={{ width: `${stats.completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EA580C)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
        </div>

        {/* Separate Measures Total Row */}
        {stats.totalMeasuresVal > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EC4899' }}>
              <Ruler size={16} /> Today's Total Logged Measure Output:
            </span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#EC4899' }}>
              {stats.totalMeasuresVal} units
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. NEXT UP HERO ACTION BANNER (PRIORITY URGENCY CARDS) */}
      {/* High-visibility top priority task card with 1-tap completion & measure input */}
      {/* ========================================================================= */}
      {nextUpItem && (
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #FFF7ED, #FFFFFF)', borderRadius: '20px', border: '1.5px solid #FFEDD5', borderLeft: '6px solid #EA580C', boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} color="#EA580C" /> Next Up Priority Action
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                {nextUpItem.item.title}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 600 }}>
                {nextUpItem.type === 'SUBTASK' ? `Parent Task: ${nextUpItem.parent.title}` : `Category: ${nextUpItem.item.category}`}
              </p>
            </div>

            <button
              onClick={() => onToggleTask(nextUpItem.item.id)}
              style={{
                padding: '10px 20px',
                background: '#EA580C',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
              }}
            >
              <Check size={16} /> Complete Now
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TASK TYPE BREAKDOWN & FILTER ROW */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#2563EB" /> Tasks by Type Breakdown
        </h3>

        {/* Task Type Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          <div 
            onClick={() => setTaskTypeFilter(taskTypeFilter === 'end_date' ? 'ALL' : 'end_date')}
            style={{ padding: '12px 14px', borderRadius: '12px', background: taskTypeFilter === 'end_date' ? '#EFF6FF' : '#F8FAFC', border: taskTypeFilter === 'end_date' ? '1.5px solid #2563EB' : '1px solid #E2E8F0', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', display: 'block' }}>Start Date → End Date</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.endDate.total} tasks</span>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.endDate.done} completed • {typeBreakdown.endDate.pending} pending</span>
          </div>

          <div 
            onClick={() => setTaskTypeFilter(taskTypeFilter === 'count_days' ? 'ALL' : 'count_days')}
            style={{ padding: '12px 14px', borderRadius: '12px', background: taskTypeFilter === 'count_days' ? '#F0FDF4' : '#F8FAFC', border: taskTypeFilter === 'count_days' ? '1.5px solid #16A34A' : '1px solid #E2E8F0', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', display: 'block' }}>Day Count Tasks</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.dayCount.total} tasks</span>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.dayCount.done} completed • {typeBreakdown.dayCount.pending} pending</span>
          </div>

          <div 
            onClick={() => setTaskTypeFilter(taskTypeFilter === 'count_event' ? 'ALL' : 'count_event')}
            style={{ padding: '12px 14px', borderRadius: '12px', background: taskTypeFilter === 'count_event' ? '#FAF5FF' : '#F8FAFC', border: taskTypeFilter === 'count_event' ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#7E22CE', display: 'block' }}>Event Count Tasks</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.eventCount.total} tasks</span>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.eventCount.done} events completed today</span>
          </div>
        </div>

        {/* Task Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'end_date', label: 'Date Range' },
            { id: 'count_days', label: 'Day Count' },
            { id: 'count_event', label: 'Event Count' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTaskTypeFilter(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                border: taskTypeFilter === t.id ? 'none' : '1px solid #CBD5E1',
                background: taskTypeFilter === t.id ? '#EA580C' : '#F1F5F9',
                color: taskTypeFilter === t.id ? '#FFF' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MATRIX FILTERS (STATUS & CATEGORY) */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '4px', background: '#FFF', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          {['ALL', 'PENDING', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                background: statusFilter === st ? '#0F172A' : 'transparent',
                color: statusFilter === st ? '#FFF' : '#64748B',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {['ALL', ...categoriesList].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800,
                border: categoryFilter === cat ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                background: categoryFilter === cat ? '#EFF6FF' : '#FFF',
                color: categoryFilter === cat ? '#2563EB' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. PENDING TODAY MAIN TASK LIST (SECTION 10, 11, 12, 13, 14, 15, 37, 38) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#EA580C" /> Pending Today
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '4px 10px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
            {stats.pendingCount} Pending Tasks
          </span>
        </div>

        {/* Pending Task Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applicableTasks.filter(p => {
            const children = subtasksMap[p.id] || [];
            const parentStatus = calculateParentCompletionStatus(p, children);
            if (statusFilter === 'COMPLETED') return parentStatus.isCompleted;
            if (statusFilter === 'PENDING') return !parentStatus.isCompleted;
            return !parentStatus.isCompleted; // Default show pending in Pending section
          }).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', color: '#64748B', fontWeight: 700, fontSize: '13px' }}>
              🎉 No pending tasks found! All applicable tasks completed for this filter.
            </div>
          ) : (
            applicableTasks.filter(p => {
              const children = subtasksMap[p.id] || [];
              const parentStatus = calculateParentCompletionStatus(p, children);
              if (statusFilter === 'COMPLETED') return parentStatus.isCompleted;
              if (statusFilter === 'PENDING') return !parentStatus.isCompleted;
              return !parentStatus.isCompleted;
            }).map(parent => {
              const children = subtasksMap[parent.id] || [];
              const isExpanded = !!expandedParents[parent.id];
              const parentStatus = calculateParentCompletionStatus(parent, children);
              const isCompletable = canManuallyCompleteTask(parent, children);
              const freqLabel = getFrequencyLabel(parent);

              const mandatoryChildren = children.filter(c => !c.isOptional);
              const completedMandatory = mandatoryChildren.filter(c => c.isDoneToday).length;

              return (
                <div 
                  key={parent.id} 
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Task Card Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                      {/* Checkbox for Standalone or Manually Completable Parent */}
                      {isCompletable ? (
                        <button
                          onClick={() => onToggleTask(parent.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                        >
                          <Circle size={22} color="#CBD5E1" />
                        </button>
                      ) : (
                        <div style={{ marginTop: '2px' }} title="Parent auto-completes when mandatory subtasks finish">
                          <LockIcon size={20} color="#94A3B8" />
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{parent.title}</span>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                            {parent.category || 'General'}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#7E22CE', background: '#FAF5FF', padding: '2px 8px', borderRadius: '6px' }}>
                            {freqLabel}
                          </span>
                        </div>

                        {/* Subtask Progress Counter */}
                        {children.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>
                            {completedMandatory} / {mandatoryChildren.length} mandatory subtasks completed
                            {mandatoryChildren.length - completedMandatory > 0 && (
                              <span style={{ color: '#DC2626', marginLeft: '6px', fontWeight: 800 }}>
                                ({mandatoryChildren.length - completedMandatory} remaining)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => onNavigateToTaskDedicated && onNavigateToTaskDedicated(parent)}
                      style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                    >
                      View
                    </button>
                  </div>

                  {/* Subtask Completion Progress Bar */}
                  {children.length > 0 && (
                    <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((completedMandatory / Math.max(1, mandatoryChildren.length)) * 100)}%`, height: '100%', background: '#2563EB', borderRadius: '4px' }} />
                    </div>
                  )}

                  {/* Expand/Collapse Hierarchy Toggle */}
                  {children.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleParentExpand(parent.id)}
                        style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: '11px', fontWeight: 800, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {isExpanded ? 'Hide Subtasks' : `Show Subtasks (${children.length})`}
                      </button>

                      {/* Expandable Subtasks List */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid #BFDBFE' }}>
                          {children.map(st => (
                            <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => onToggleTask(st.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  {st.isDoneToday ? <CheckCircle2 size={18} color="#16A34A" /> : <Circle size={18} color="#CBD5E1" />}
                                </button>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: st.isDoneToday ? '#16A34A' : '#0F172A', textDecoration: st.isDoneToday ? 'line-through' : 'none' }}>
                                  {st.title} {st.isOptional && <span style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic' }}>(Optional)</span>}
                                </span>
                              </div>

                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
                                {st.hasMeasureTracking ? `${st.measureTarget || 0} ${st.measureUnit || ''}` : 'Standard'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. PENDING SUBTASKS DEDICATED SECTION (SECTION 16) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CornerDownRight size={18} color="#DC2626" /> Pending Mandatory Subtasks
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {applicableTasks.filter(p => {
            const children = subtasksMap[p.id] || [];
            return children.some(c => !c.isDoneToday && !c.isOptional);
          }).length === 0 ? (
            <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '12px', fontWeight: 800 }}>
              ✓ All mandatory subtasks completed across all tasks today!
            </div>
          ) : (
            applicableTasks.filter(p => {
              const children = subtasksMap[p.id] || [];
              return children.some(c => !c.isDoneToday && !c.isOptional);
            }).map(p => {
              const children = subtasksMap[p.id] || [];
              const pendingSubtasks = children.filter(c => !c.isDoneToday && !c.isOptional);

              return (
                <div key={p.id} style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 16px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#991B1B', marginBottom: '8px' }}>
                    {p.title} ({children.filter(c => c.isDoneToday).length} / {children.length} subtasks completed)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pendingSubtasks.map(st => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => onToggleTask(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Circle size={18} color="#DC2626" />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#7F1D1D' }}>{st.title}</span>
                        </div>
                        <button
                          onClick={() => onToggleTask(st.id)}
                          style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                        >
                          Complete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. COMPLETED TODAY SECTION (SECTION 18, 19, 20) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#16A34A" /> Completed Today
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {applicableTasks.filter(p => {
            const children = subtasksMap[p.id] || [];
            const parentStatus = calculateParentCompletionStatus(p, children);
            return parentStatus.isCompleted;
          }).length === 0 ? (
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 700, fontStyle: 'italic' }}>
              No tasks completed yet today.
            </div>
          ) : (
            applicableTasks.filter(p => {
              const children = subtasksMap[p.id] || [];
              const parentStatus = calculateParentCompletionStatus(p, children);
              return parentStatus.isCompleted;
            }).map(parent => (
              <div key={parent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px 16px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => onToggleTask(parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <CheckCircle2 size={22} color="#16A34A" />
                  </button>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#15803D', textDecoration: 'line-through' }}>{parent.title}</span>
                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                      Completed • {parent.hasMeasureTracking ? `Measure: ${parent.loggedMeasureVal || parent.measureTarget || 0} ${parent.measureUnit || ''}` : 'Standard Task'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {parent.hasMeasureTracking && (
                    <button
                      onClick={() => setMeasureModalTask(parent)}
                      style={{ background: '#FFF', border: '1px solid #BBF7D0', color: '#16A34A', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={12} /> Edit Measure
                    </button>
                  )}
                  <button
                    onClick={() => onToggleTask(parent.id)}
                    style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#64748B', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Undo2 size={12} /> Undo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. COMING UP & EARLY COMPLETION SECTION (SECTION 7, 8, 9) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={18} color="#8B5CF6" /> Coming Up & Early Completion
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {parentTasks.slice(0, 2).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAF5FF', border: '1px solid #E9D5FF', padding: '12px 16px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#6B21A8' }}>{t.title}</span>
                <span style={{ fontSize: '10px', color: '#7E22CE', display: 'block', fontWeight: 700 }}>
                  Scheduled: Tomorrow • Frequency: {getFrequencyLabel(t)}
                </span>
              </div>

              <button
                onClick={() => setEarlyCompleteTask(t)}
                style={{ background: '#8B5CF6', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}
              >
                Complete Early
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. TASKS BY CATEGORY ACCORDION (SECTION 24, 25) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="#F59E0B" /> Tasks by Category
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoriesList.map(cat => {
            const catTasks = parentTasks.filter(p => p.category === cat);
            const catDone = catTasks.filter(p => calculateParentCompletionStatus(p, subtasksMap[p.id] || []).isCompleted).length;
            const catPct = Math.round((catDone / Math.max(1, catTasks.length)) * 100);
            const isCatExpanded = !!expandedCategories[cat];

            return (
              <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px' }}>
                <div onClick={() => toggleCategoryExpand(cat)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{cat}</span>
                    <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '8px', fontWeight: 700 }}>
                      {catTasks.length} tasks • {catDone} completed
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#2563EB' }}>{catPct}%</span>
                    {isCatExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {isCatExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #CBD5E1' }}>
                    {catTasks.map(t => (
                      <div key={t.id} style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {t.title}</span>
                        <span style={{ color: t.isDoneToday ? '#16A34A' : '#D97706' }}>
                          {t.isDoneToday ? '✓ Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. MOTIVATIONAL FOOTER & STREAK INFO (SECTION 33, 34) */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: stats.completionRate === 100 ? '#F0FDF4' : '#FFF7ED', borderRadius: '16px', border: stats.completionRate === 100 ? '1px solid #BBF7D0' : '1px solid #FFEDD5', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 900, color: stats.completionRate === 100 ? '#15803D' : '#C2410C' }}>
          {stats.completionRate === 100 
            ? '🎉 Everything completed for today! Great job!' 
            : `Great work — you've completed ${stats.completionRate}% of today's tasks. ${stats.pendingCount} remaining. Finish strong!`}
        </div>
      </div>

      {/* Measure Edit Modal */}
      <TodayMeasureEditModal 
        isOpen={!!measureModalTask}
        task={measureModalTask}
        onClose={() => setMeasureModalTask(null)}
        onSaveMeasure={(taskId, val) => {
          if (onUpdateTaskProgress) onUpdateTaskProgress(taskId, val);
        }}
      />

      {/* Complete Early Confirmation Modal */}
      {earlyCompleteTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '20px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Complete Early Confirmation</h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
              Complete <strong>{earlyCompleteTask.title}</strong> today in advance? Original schedule rules will remain intact.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setEarlyCompleteTask(null)} style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmEarlyComplete} style={{ padding: '8px 16px', background: '#8B5CF6', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 900, color: '#FFF', cursor: 'pointer' }}>Confirm Early Completion</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Lock Icon Helper Component for Auto-Completing Parent Tasks
function LockIcon({ size = 18, color = "#94A3B8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
