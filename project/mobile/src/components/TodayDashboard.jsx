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
  Maximize2,
  PieChart,
  BarChart3,
  ShieldCheck,
  Timer,
  Lock as LockIcon
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

// CUSTOM MANUALLY CODED REACT DROPDOWN COMPONENT (NO DEFAULT BROWSER SELECT)
function CustomDropdown({ label, value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '110px' }}>
      <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '3px' }}>
        {Icon && <Icon size={10} color="#2563EB" />} {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          padding: '6px 10px',
          borderRadius: '10px',
          border: '1.5px solid #CBD5E1',
          background: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 800,
          color: '#0F172A',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : label}
        </span>
        <ChevronDown size={14} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            zIndex: 999,
            overflow: 'hidden',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontWeight: value === opt.value ? 900 : 700,
                  color: value === opt.value ? '#2563EB' : '#1E293B',
                  background: value === opt.value ? '#EFF6FF' : '#FFF',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F5F9'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

  // Multi-Filter States (NO VARIETY FILTER)
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING', 'PARTIAL'
  const [taskTypeFilter, setTaskTypeFilter] = useState('ALL'); // 'ALL', 'end_date', 'count_days', 'count_event'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM', 'LOW'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'Academics', 'Coding', 'Fitness', etc.
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable UI States
  const [expandedParents, setExpandedParents] = useState({});

  // Measure Edit / Completion Prompt Modal State
  const [measureModalTask, setMeasureModalTask] = useState(null);

  // Calculate Selected Date Object
  const selectedDateObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d;
  }, [dateOffset]);

  const dateDisplayFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Separate Parent Tasks from Child Subtasks safely
  const parentTasks = useMemo(() => {
    return (tasks || []).filter(t => t && !t.parentTaskId);
  }, [tasks]);

  const subtasksMap = useMemo(() => {
    const map = {};
    (tasks || []).forEach(t => {
      if (t && t.parentTaskId) {
        if (!map[t.parentTaskId]) map[t.parentTaskId] = [];
        map[t.parentTaskId].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Recurrence Frequency Label Resolver
  const getFrequencyLabel = (t) => {
    if (!t) return 'Daily';
    if (t.recurrencePattern) return t.recurrencePattern;
    if (t.trackingMode === 'end_date') return 'Start-End Date';
    if (t.trackingMode === 'count_days') return 'Day Count';
    if (t.trackingMode === 'count_event') return 'Event Count';
    return 'Daily';
  };

  // Determine Applicable Tasks for Selected Date with Custom Multi-Filtering (No Variety Filter)
  const filteredParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      if (!p) return false;
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      // 1. Status Filter
      if (statusFilter === 'COMPLETED' && !statusObj.isCompleted) return false;
      if (statusFilter === 'PENDING' && statusObj.isCompleted) return false;
      if (statusFilter === 'PARTIAL' && !statusObj.isPartiallyCompleted) return false;

      // 2. Category Filter
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

      // 3. Task Type Filter (Type-1, Type-2, Type-3)
      if (taskTypeFilter !== 'ALL' && p.trackingMode !== taskTypeFilter) return false;

      // 4. Priority Filter
      if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) return false;

      // 5. Search Query Filter
      if (searchQuery.trim() && p.title && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [parentTasks, subtasksMap, statusFilter, categoryFilter, taskTypeFilter, priorityFilter, searchQuery]);

  // Compute Daily Statistics (Unfiltered for Top Scorecard Accuracy)
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let pendingSubtasksCount = 0;
    let totalMeasuresVal = 0;
    let completedMandatorySubtasks = 0;
    let totalMandatorySubtasks = 0;
    let totalEstimatedMinutes = 0;

    parentTasks.forEach(p => {
      if (!p) return;
      totalEstimatedMinutes += Number(p.estimatedMinutes || 30);
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      if (statusObj.isCompleted) {
        completedCount++;
      } else {
        pendingCount++;
      }

      if (children.length > 0) {
        children.forEach(st => {
          if (st && !st.isOptional) {
            totalMandatorySubtasks++;
            if (st.isDoneToday || st.progressPercent >= 100) {
              completedMandatorySubtasks++;
            } else {
              pendingSubtasksCount++;
            }
          }
          if (st && st.isDoneToday) {
            totalMeasuresVal += Number(st.loggedMeasureVal || st.measureTarget || 0);
          }
        });
      } else {
        if (p.isDoneToday || p.progressPercent >= 100) {
          totalMeasuresVal += Number(p.loggedMeasureVal || p.measureTarget || 0);
        }
      }
    });

    const totalCount = parentTasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      pendingCount,
      pendingSubtasksCount,
      completionRate,
      totalMeasuresVal,
      completedMandatorySubtasks,
      totalMandatorySubtasks,
      totalEstimatedMinutes
    };
  }, [parentTasks, subtasksMap]);

  // Compute Task Type Breakdown (Type-1, Type-2, Type-3)
  const typeBreakdown = useMemo(() => {
    let endDateCount = 0, endDateDone = 0;
    let dayCountCount = 0, dayCountDone = 0;
    let eventCountCount = 0, eventCountDone = 0;

    parentTasks.forEach(p => {
      if (!p) return;
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      if (p.trackingMode === 'end_date' || !p.trackingMode) {
        endDateCount++;
        if (statusObj.isCompleted) endDateDone++;
      } else if (p.trackingMode === 'count_days') {
        dayCountCount++;
        if (statusObj.isCompleted) dayCountDone++;
      } else if (p.trackingMode === 'count_event') {
        eventCountCount++;
        if (statusObj.isCompleted) eventCountDone++;
      }
    });

    return {
      endDate: { total: endDateCount, done: endDateDone, pending: endDateCount - endDateDone },
      dayCount: { total: dayCountCount, done: dayCountDone, pending: dayCountCount - dayCountDone },
      eventCount: { total: eventCountCount, done: eventCountDone, pending: eventCountCount - eventCountDone }
    };
  }, [parentTasks, subtasksMap]);

  // Priority Completion Breakdown
  const priorityBreakdown = useMemo(() => {
    let highTotal = 0, highDone = 0;
    let medTotal = 0, medDone = 0;
    let lowTotal = 0, lowDone = 0;

    parentTasks.forEach(p => {
      if (!p) return;
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      if (p.priority === 'HIGH') {
        highTotal++;
        if (statusObj.isCompleted) highDone++;
      } else if (p.priority === 'LOW') {
        lowTotal++;
        if (statusObj.isCompleted) lowDone++;
      } else {
        medTotal++;
        if (statusObj.isCompleted) medDone++;
      }
    });

    return {
      high: { total: highTotal, done: highDone },
      medium: { total: medTotal, done: medDone },
      low: { total: lowTotal, done: lowDone }
    };
  }, [parentTasks, subtasksMap]);

  // Distinct Lists for Sections
  const pendingParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      if (!p) return false;
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);
      return !statusObj.isCompleted;
    });
  }, [parentTasks, subtasksMap]);

  const completedParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      if (!p) return false;
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);
      return statusObj.isCompleted;
    });
  }, [parentTasks, subtasksMap]);

  // Dynamic Categories List
  const categoriesList = useMemo(() => {
    const set = new Set();
    parentTasks.forEach(p => {
      if (p && p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [parentTasks]);

  // Options for Custom Dropdowns
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending Tasks' },
    { value: 'PARTIAL', label: 'Partially Done' },
    { value: 'COMPLETED', label: 'Completed Tasks' }
  ];

  const priorityOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'LOW', label: 'Low Priority' }
  ];

  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: 'All Categories' },
    ...categoriesList.map(cat => ({ value: cat, label: cat }))
  ], [categoriesList]);

  const taskTypeOptions = [
    { value: 'ALL', label: 'All Task Types' },
    { value: 'end_date', label: 'Start-End Date' },
    { value: 'count_days', label: 'Day Count' },
    { value: 'count_event', label: 'Event Count' }
  ];

  // Expand/Collapse Toggle Helper
  const toggleParentExpand = (id) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Complete Pending Task Trigger (Checks if Measure Modal is needed)
  const handleInitiateTaskCompletion = (task) => {
    if (!task) return;
    const isMeasureTask = task.hasMeasureTracking || (task.measureTarget && Number(task.measureTarget) > 0) || task.trackingMode === 'measure';
    if (isMeasureTask && !task.isDoneToday) {
      setMeasureModalTask(task);
    } else {
      if (onToggleTask) onToggleTask(task.id);
    }
  };

  // Save Measure Value Handler
  const handleSaveMeasureValue = (taskId, value) => {
    if (onUpdateTaskProgress) {
      onUpdateTaskProgress(taskId, 100);
    }
    if (onToggleTask) {
      onToggleTask(taskId, value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '70px', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Global CSS Style to Remove Scrollbars & Eliminate Margin Collisions */}
      <style>{`
        html, body, #root {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          box-sizing: border-box !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* TODAY HEADER & DATE NAVIGATOR (3D UI ENHANCED) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #DC2626',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Today
            </h1>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
              {dateDisplayFormatted}
            </div>
          </div>

          {/* Date Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
              <button 
                onClick={() => setDateOffset(prev => prev - 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderBottom: '2px solid #94A3B8', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
              >
                ‹ Prev
              </button>

              <button 
                onClick={() => setDateOffset(0)}
                style={{ background: dateOffset === 0 ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : '#FFF', color: dateOffset === 0 ? '#FFF' : '#0F172A', border: dateOffset === 0 ? 'none' : '1px solid #CBD5E1', borderBottom: dateOffset === 0 ? '2px solid #991B1B' : '2px solid #94A3B8', borderRadius: '6px', padding: '5px 14px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', margin: '0 3px', boxShadow: dateOffset === 0 ? '0 2px 4px rgba(220, 38, 38, 0.2)' : 'none' }}
              >
                Today
              </button>

              <button 
                onClick={() => setDateOffset(prev => prev + 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderBottom: '2px solid #94A3B8', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
              >
                Next ›
              </button>
            </div>

            {dateOffset !== 0 && (
              <button
                onClick={() => setDateOffset(0)}
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '6px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SUMMARY SCORECARD (3D TACTILE SCORECARDS) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        
        {/* Card 1: Total Tasks */}
        <div style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          borderBottom: '3px solid #94A3B8',
          borderLeft: '5px solid #475569',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Tasks</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>{stats.totalCount}</span>
        </div>

        {/* Card 2: Completed Tasks */}
        <div style={{
          background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid #86EFAC',
          borderBottom: '3px solid #4ADE80',
          borderLeft: '5px solid #16A34A',
          boxShadow: '0 8px 16px rgba(22, 163, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Completed</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#15803D', marginTop: '2px', display: 'block' }}>{stats.completedCount}</span>
        </div>

        {/* Card 3: Pending Tasks */}
        <div style={{
          background: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid #FCD34D',
          borderBottom: '3px solid #FBBF24',
          borderLeft: '5px solid #D97706',
          boxShadow: '0 8px 16px rgba(217, 119, 6, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Pending</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#D97706', marginTop: '2px', display: 'block' }}>{stats.pendingCount}</span>
        </div>

        {/* Card 4: Completion Rate */}
        <div style={{
          background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid #93C5FD',
          borderBottom: '3px solid #60A5FA',
          borderLeft: '5px solid #2563EB',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Completion Rate</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#2563EB', marginTop: '2px', display: 'block' }}>{stats.completionRate}%</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CUSTOM MANUALLY CODED DROPDOWNS BAR (3D ENHANCED) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '16px 18px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #2563EB',
        boxShadow: '0 10px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)' }}>
          <Search size={16} color="#64748B" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search tasks by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#0F172A', outline: 'none', width: '100%', fontWeight: 600 }}
          />
        </div>

        {/* Custom Manually Coded Dropdowns Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          
          <CustomDropdown 
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
            icon={Filter}
          />

          <CustomDropdown 
            label="Priority"
            value={priorityFilter}
            options={priorityOptions}
            onChange={setPriorityFilter}
            icon={Flame}
          />

          <CustomDropdown 
            label="Category"
            value={categoryFilter}
            options={categoryOptions}
            onChange={setCategoryFilter}
            icon={Layers}
          />

          <CustomDropdown 
            label="Task Type"
            value={taskTypeFilter}
            options={taskTypeOptions}
            onChange={setTaskTypeFilter}
            icon={Activity}
          />

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. ALL SCHEDULED TASKS FOR TODAY (3D ENHANCED CONTAINER) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #2563EB',
        boxShadow: '0 12px 24px -4px rgba(37, 99, 235, 0.06), 0 4px 6px -2px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={17} color="#2563EB" /> 1. All Tasks Scheduled for Today
          </h2>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
            {filteredParentTasks.length} Tasks
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredParentTasks.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
              No tasks found matching current filters.
            </div>
          ) : (
            filteredParentTasks.map(task => {
              if (!task) return null;
              const children = subtasksMap[task.id] || [];
              const statusObj = calculateParentCompletionStatus(task, children);
              const isExpanded = !!expandedParents[task.id];

              return (
                <div 
                  key={task.id} 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(task);
                  }}
                  title="Double-click to open task info page"
                  style={{ 
                    background: statusObj.isCompleted ? '#F0FDF4' : '#F8FAFC', 
                    border: statusObj.isCompleted ? '1px solid #BBF7D0' : '1px solid #E2E8F0', 
                    padding: '12px 14px', 
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {/* Parent Task Header Row (NO line-through cut on text) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {/* Checkbox */}
                      {children.length === 0 ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleInitiateTaskCompletion(task); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {statusObj.isCompleted ? (
                            <CheckCircle2 size={20} color="#16A34A" />
                          ) : (
                            <Circle size={20} color="#CBD5E1" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleParentExpand(task.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {statusObj.isCompleted ? (
                            <CheckCircle2 size={20} color="#16A34A" />
                          ) : (
                            <Circle size={20} color="#D97706" />
                          )}
                        </button>
                      )}

                      <div>
                        {/* Text is clean, bold, un-cut */}
                        <span style={{ fontSize: '13px', fontWeight: 900, color: statusObj.isCompleted ? '#15803D' : '#0F172A', textDecoration: 'none' }}>
                          {task.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '1px 5px', borderRadius: '4px' }}>
                            {task.category || 'General'}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748B' }}>
                            {getFrequencyLabel(task)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {statusObj.isCompleted ? (
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                          ✓ Completed
                        </span>
                      ) : statusObj.isPartiallyCompleted ? (
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                          ⏳ {statusObj.completedMandatory}/{statusObj.totalMandatory} Done
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                          Pending
                        </span>
                      )}

                      {/* Dropdown Toggle Button for Subtasks */}
                      {children.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleParentExpand(task.id); }}
                          style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '3px 6px', fontSize: '10px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* IN-LINE SUBTASKS DROPDOWN (Double-click opens subtask info page) */}
                  {children.length > 0 && isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', paddingLeft: '10px', borderLeft: '2px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>Subtasks (Click to complete, double-click for info):</span>
                      {children.map(st => (
                        <div 
                          key={st.id} 
                          onClick={(e) => { e.stopPropagation(); if (onToggleTask) onToggleTask(st.id); }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(st);
                          }}
                          title="Double-click to open subtask info page"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justify: 'space-between', 
                            background: st.isDoneToday ? '#F0FDF4' : '#FFF', 
                            padding: '6px 10px', 
                            borderRadius: '8px', 
                            border: st.isDoneToday ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {st.isDoneToday ? <CheckCircle2 size={16} color="#16A34A" /> : <Circle size={16} color="#CBD5E1" />}
                            <span style={{ fontSize: '11px', fontWeight: 800, color: st.isDoneToday ? '#16A34A' : '#0F172A', textDecoration: 'none' }}>
                              {st.title} {st.isOptional && <span style={{ fontSize: '9px', color: '#94A3B8', fontStyle: 'italic' }}>(Optional)</span>}
                            </span>
                          </div>

                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748B' }}>
                            {st.hasMeasureTracking ? `${st.loggedMeasureVal || st.measureTarget || 0} ${st.measureUnit || ''}` : 'Standard'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PENDING TASKS LIST (SIMPLIFIED & DIRECT ACTION WITH MEASURE MODAL) */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={17} color="#EA580C" /> 2. Pending Tasks
          </h2>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '3px 8px', borderRadius: '8px', border: '1px solid #FFEDD5' }}>
            {pendingParentTasks.length} Pending
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingParentTasks.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '12px', fontWeight: 800 }}>
              🎉 All tasks are completed for today!
            </div>
          ) : (
            pendingParentTasks.map(task => {
              if (!task) return null;
              const children = subtasksMap[task.id] || [];
              const isCompletable = canManuallyCompleteTask(task, children);
              const isMeasureTask = task.hasMeasureTracking || (task.measureTarget && Number(task.measureTarget) > 0) || task.trackingMode === 'measure';

              return (
                <div 
                  key={task.id} 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(task);
                  }}
                  title="Double-click to open task info page"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C' }} />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', textDecoration: 'none' }}>
                        {task.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#EA580C', background: '#FFF', padding: '1px 5px', borderRadius: '4px', border: '1px solid #FFEDD5' }}>
                          {task.category || 'General'}
                        </span>
                        {isMeasureTask && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#EC4899', background: '#FDF2F8', padding: '1px 5px', borderRadius: '4px' }}>
                            <Ruler size={9} style={{ display: 'inline', marginRight: '2px' }} /> Target: {task.measureTarget || 0} {task.measureUnit || 'units'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCompletable ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInitiateTaskCompletion(task); }}
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={13} /> Complete
                      </button>
                    ) : (
                      <div style={{ fontSize: '9px', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px', background: '#F1F5F9', padding: '5px 8px', borderRadius: '6px' }}>
                        <LockIcon size={11} /> Complete Subtasks First
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY-WISE TASKS & SUBTASKS LIST (3D ENHANCED CONTAINER) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #7E22CE',
        boxShadow: '0 12px 24px -4px rgba(126, 34, 206, 0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={17} color="#7E22CE" /> 3. Tasks & Subtasks by Category
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoriesList.map(cat => {
            const catTasks = parentTasks.filter(p => p && p.category === cat);
            const catDone = catTasks.filter(p => calculateParentCompletionStatus(p, subtasksMap[p.id] || []).isCompleted).length;
            const catPct = Math.round((catDone / Math.max(1, catTasks.length)) * 100);

            return (
              <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderBottom: '3px solid #E2E8F0', borderRadius: '14px', padding: '12px 14px', boxShadow: '0 4px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{cat}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#7E22CE', background: '#FAF5FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #F3E8FF' }}>
                      {catTasks.length} Tasks
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: catPct === 100 ? '#16A34A' : '#2563EB' }}>
                    {catDone}/{catTasks.length} Done ({catPct}%)
                  </span>
                </div>

                {/* List of Tasks & Subtasks under Category (Text UN-CUT) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px dashed #CBD5E1' }}>
                  {catTasks.map(task => {
                    if (!task) return null;
                    const children = subtasksMap[task.id] || [];
                    const statusObj = calculateParentCompletionStatus(task, children);

                    return (
                      <div 
                        key={task.id} 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(task);
                        }}
                        title="Double-click to open task info page"
                        style={{ background: '#FFF', border: '1px solid #CBD5E1', borderBottom: '2px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: statusObj.isCompleted ? '#15803D' : '#0F172A', textDecoration: 'none' }}>
                            {task.title}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: statusObj.isCompleted ? '#16A34A' : '#D97706' }}>
                            {statusObj.isCompleted ? '✓ Done' : 'Pending'}
                          </span>
                        </div>

                        {/* List Child Subtasks */}
                        {children.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingLeft: '8px', borderLeft: '2px solid #E2E8F0' }}>
                            {children.map(st => (
                              <div 
                                key={st.id} 
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(st);
                                }}
                                title="Double-click to open subtask info page"
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#475569', cursor: 'pointer' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); if (onToggleTask) onToggleTask(st.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {st.isDoneToday ? <CheckCircle2 size={13} color="#16A34A" /> : <Circle size={13} color="#CBD5E1" />}
                                  </button>
                                  <span style={{ textDecoration: 'none', fontWeight: 600, color: st.isDoneToday ? '#16A34A' : '#0F172A' }}>
                                    {st.title} {st.isOptional && <span style={{ fontSize: '8px', color: '#94A3B8' }}>(Opt)</span>}
                                  </span>
                                </div>
                                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700 }}>
                                  {st.hasMeasureTracking ? `${st.loggedMeasureVal || st.measureTarget || 0} ${st.measureUnit || ''}` : 'Standard'}
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
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COMPLETED TASKS TODAY SECTION (3D ENHANCED CONTAINER) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 100%)',
        borderRadius: '20px',
        border: '1px solid #86EFAC',
        borderBottom: '4px solid #4ADE80',
        borderLeft: '6px solid #16A34A',
        boxShadow: '0 12px 24px -4px rgba(22, 163, 74, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={17} color="#16A34A" /> 4. Completed Today
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {completedParentTasks.length === 0 ? (
            <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 700, fontStyle: 'italic' }}>
              No tasks completed yet today.
            </div>
          ) : (
            completedParentTasks.map(parent => {
              if (!parent) return null;
              return (
                <div 
                  key={parent.id} 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToTaskDedicated) onNavigateToTaskDedicated(parent);
                  }}
                  title="Double-click to open task info page"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => onToggleTask && onToggleTask(parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <CheckCircle2 size={20} color="#16A34A" />
                    </button>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: '#15803D', textDecoration: 'none' }}>{parent.title}</span>
                      <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700 }}>
                        Completed • {parent.hasMeasureTracking ? `Logged: ${parent.loggedMeasureVal || parent.measureTarget || 0} ${parent.measureUnit || ''}` : 'Standard Task'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {parent.hasMeasureTracking && (
                      <button
                        onClick={() => setMeasureModalTask(parent)}
                        style={{ background: '#FFF', border: '1px solid #BBF7D0', color: '#16A34A', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Edit3 size={11} /> Edit Measure
                      </button>
                    )}
                    <button
                      onClick={() => onToggleTask && onToggleTask(parent.id)}
                      style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#64748B', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Undo2 size={11} /> Undo
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ENHANCED STATISTICAL PERFORMANCE & INSIGHTS (3D ENHANCED CONTAINER) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '22px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: '24px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #EA580C',
        boxShadow: '0 12px 24px -4px rgba(234, 88, 12, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#EA580C" /> Today's Statistical Performance Analytics
          </h3>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '4px 10px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
            {stats.completionRate >= 80 ? '🔥 High Output' : stats.completionRate >= 50 ? '⚡ Steady Output' : '🎯 Building Momentum'}
          </span>
        </div>

        {/* 1. Overall Completion Meter & Capacity Utilization */}
        <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #EFF6FF)', padding: '16px', borderRadius: '16px', border: '1px solid #FED7AA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>Workload Completion Meter</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#EA580C' }}>{stats.completionRate}%</span>
          </div>
          <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EA580C)', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', fontWeight: 800, color: '#475569' }}>
            <span>{stats.completedCount} Tasks Done</span>
            <span>{stats.pendingCount} Tasks Pending</span>
            {stats.totalMeasuresVal > 0 && (
              <span style={{ color: '#EC4899', fontWeight: 900 }}>
                <Ruler size={12} style={{ display: 'inline', marginRight: '2px' }} /> {stats.totalMeasuresVal} Units Logged
              </span>
            )}
          </div>
        </div>

        {/* 2. TASK TYPE SCHEDULE PERFORMANCE — STRICTLY ONE LINE (ALL 3 BOXES SIDE BY SIDE) */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>
            Task Type Schedule Performance
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            
            {/* Date Range Box */}
            <div style={{ padding: '8px 6px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#1E40AF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Date Range
              </span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                {typeBreakdown.endDate.done}/{typeBreakdown.endDate.total} Done
              </span>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 700, display: 'block' }}>
                {typeBreakdown.endDate.pending} pending
              </span>
            </div>

            {/* Day Count Box */}
            <div style={{ padding: '8px 6px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#15803D', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Day Count
              </span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                {typeBreakdown.dayCount.done}/{typeBreakdown.dayCount.total} Done
              </span>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 700, display: 'block' }}>
                {typeBreakdown.dayCount.pending} pending
              </span>
            </div>

            {/* Event Count Box */}
            <div style={{ padding: '8px 6px', borderRadius: '10px', background: '#FAF5FF', border: '1px solid #E9D5FF', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#7E22CE', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Event Count
              </span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                {typeBreakdown.eventCount.done}/{typeBreakdown.eventCount.total} Done
              </span>
              <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 700, display: 'block' }}>
                {typeBreakdown.eventCount.pending} pending
              </span>
            </div>

          </div>
        </div>

        {/* 3. Priority Completion Breakdown Cards */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>Priority Distribution & Execution</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {/* High */}
            <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', display: 'block' }}>High Priority</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#991B1B', marginTop: '2px', display: 'block' }}>
                {priorityBreakdown.high.done} / {priorityBreakdown.high.total}
              </span>
            </div>

            {/* Medium */}
            <div style={{ padding: '10px', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#EA580C', display: 'block' }}>Medium Priority</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#C2410C', marginTop: '2px', display: 'block' }}>
                {priorityBreakdown.medium.done} / {priorityBreakdown.medium.total}
              </span>
            </div>

            {/* Low */}
            <div style={{ padding: '10px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', display: 'block' }}>Low Priority</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#15803D', marginTop: '2px', display: 'block' }}>
                {priorityBreakdown.low.done} / {priorityBreakdown.low.total}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Additional Statistical Insights: Time Output & Mandatory Subtask Ratio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          
          {/* Workload Time Output */}
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Timer size={12} /> Workload Time
            </span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>
              ~{stats.totalEstimatedMinutes} mins
            </span>
            <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 700 }}>
              Capacity: {capacityData?.availableCapacityMinutes || 480} mins available
            </span>
          </div>

          {/* Mandatory Subtasks Mastery */}
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#7E22CE', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> Mandatory Subtasks
            </span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>
              {stats.completedMandatorySubtasks} / {stats.totalMandatorySubtasks} Done
            </span>
            <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 700 }}>
              {stats.totalMandatorySubtasks - stats.completedMandatorySubtasks} remaining
            </span>
          </div>

        </div>

        {/* 5. Category Progress Breakdown */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>Category Output Breakdown</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categoriesList.map(cat => {
              const catTasks = parentTasks.filter(p => p && p.category === cat);
              const catDone = catTasks.filter(p => calculateParentCompletionStatus(p, subtasksMap[p.id] || []).isCompleted).length;
              const catPct = Math.round((catDone / Math.max(1, catTasks.length)) * 100);

              return (
                <div key={cat} style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>{cat}</span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: catPct === 100 ? '#16A34A' : '#2563EB' }}>
                      {catDone}/{catTasks.length} ({catPct}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${catPct}%`, height: '100%', background: catPct === 100 ? '#16A34A' : '#2563EB', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Discipline Grade Scorecard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Daily Discipline Score</span>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
              Grade: <span style={{ color: '#EA580C' }}>{disciplineScore.grade || 'A'}</span> ({disciplineScore.disciplineScore || 85}/100)
            </div>
          </div>
          <div style={{ background: '#FFF7ED', padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFEDD5', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#EA580C', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={12} color="#EA580C" /> Daily Streak
            </span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#C2410C' }}>12 Days</span>
          </div>
        </div>

      </div>

      {/* MOTIVATIONAL SUMMARY FOOTER */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #FFF7ED, #EFF6FF)', borderRadius: '20px', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Sparkles size={13} color="#EA580C" /> Daily Discipline Summary
          </span>
          <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
            {stats.completionRate === 100 ? '🔥 Perfect Day! 100% Workload Completed!' : `Keep going! You have completed ${stats.completedCount} of ${stats.totalCount} tasks.`}
          </h4>
        </div>

        <button 
          onClick={onOpenQuickAdd}
          style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={15} /> Quick Add Task
        </button>
      </div>

      {/* MEASURE LOGGING & EDITING MODAL */}
      <TodayMeasureEditModal 
        isOpen={!!measureModalTask}
        task={measureModalTask}
        onClose={() => setMeasureModalTask(null)}
        onSaveMeasure={handleSaveMeasureValue}
      />

    </div>
  );
}
