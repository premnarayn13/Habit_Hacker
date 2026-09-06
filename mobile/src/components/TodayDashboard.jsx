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
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'Academics', 'Coding', 'Fitness', etc.
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable UI States
  const [expandedParents, setExpandedParents] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // Measure Edit / Completion Prompt Modal State
  const [measureModalTask, setMeasureModalTask] = useState(null);

  // Early Completion Confirmation Modal State
  const [earlyCompleteTask, setEarlyCompleteTask] = useState(null);

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
  const filteredParentTasks = useMemo(() => {
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

    filteredParentTasks.forEach(p => {
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

    const totalCount = filteredParentTasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      pendingCount,
      pendingSubtasksCount,
      completionRate,
      totalMeasuresVal
    };
  }, [filteredParentTasks, subtasksMap]);

  // Distinct Lists for Sections
  const pendingParentTasks = useMemo(() => {
    return filteredParentTasks.filter(p => {
      const children = subtasksMap[p.id] || [];
      const parentStatus = calculateParentCompletionStatus(p, children);
      return !parentStatus.isCompleted;
    });
  }, [filteredParentTasks, subtasksMap]);

  const completedParentTasks = useMemo(() => {
    return filteredParentTasks.filter(p => {
      const children = subtasksMap[p.id] || [];
      const parentStatus = calculateParentCompletionStatus(p, children);
      return parentStatus.isCompleted;
    });
  }, [filteredParentTasks, subtasksMap]);

  // Find Next Up Action Task (Highest Priority Pending Task/Subtask)
  const nextUpItem = useMemo(() => {
    for (const p of pendingParentTasks) {
      const children = subtasksMap[p.id] || [];
      if (children.length > 0) {
        const pendingMandatory = children.find(st => !st.isDoneToday && !st.isOptional);
        if (pendingMandatory) {
          return { item: pendingMandatory, parent: p, type: 'SUBTASK' };
        }
      }
      return { item: p, parent: null, type: 'PARENT' };
    }
    return null;
  }, [pendingParentTasks, subtasksMap]);

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
      eventCount: { total: eventCountCount, done: eventCountDone, pending: eventCountDone - eventCountDone }
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

  // Complete Pending Task Trigger (Checks if Measure Modal is needed)
  const handleInitiateTaskCompletion = (task) => {
    const isMeasureTask = task.hasMeasureTracking || (task.measureTarget && Number(task.measureTarget) > 0) || task.trackingMode === 'measure';
    if (isMeasureTask && !task.isDoneToday) {
      setMeasureModalTask(task);
    } else {
      onToggleTask(task.id);
    }
  };

  // Save Measure Value Handler
  const handleSaveMeasureValue = (taskId, value) => {
    if (onUpdateTaskProgress) {
      onUpdateTaskProgress(taskId, 100);
    }
    onToggleTask(taskId, value);
  };

  // Complete Early Trigger Handler
  const handleConfirmEarlyComplete = () => {
    if (!earlyCompleteTask) return;
    handleInitiateTaskCompletion(earlyCompleteTask);
    setEarlyCompleteTask(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '70px', background: '#F8FAFC' }}>
      
      {/* Global Style Tag to Hide Native Scrollbars & Prevent Collisions */}
      <style>{`
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* TODAY HEADER & DATE NAVIGATOR */}
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
      {/* TOP SUMMARY SCORECARD (CLEAN ACCURATE COUNTS) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        
        {/* Card 1: Total Tasks Today */}
        <div style={{ background: '#FFF', padding: '14px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Tasks Today</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>{stats.totalCount}</span>
        </div>

        {/* Card 2: Completed Tasks */}
        <div style={{ background: '#F0FDF4', padding: '14px 16px', borderRadius: '16px', border: '1px solid #BBF7D0', boxShadow: '0 2px 8px rgba(22,163,74,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Completed Tasks</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#15803D', marginTop: '2px', display: 'block' }}>{stats.completedCount}</span>
        </div>

        {/* Card 3: Pending Tasks */}
        <div style={{ background: '#FEF3C7', padding: '14px 16px', borderRadius: '16px', border: '1px solid #FDE68A', boxShadow: '0 2px 8px rgba(217,119,6,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Pending Tasks</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#D97706', marginTop: '2px', display: 'block' }}>{stats.pendingCount}</span>
        </div>

        {/* Card 4: Completion Rate */}
        <div style={{ background: '#EFF6FF', padding: '14px 16px', borderRadius: '16px', border: '1px solid #BFDBFE', boxShadow: '0 2px 8px rgba(37,99,235,0.04)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Completion Rate</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#2563EB', marginTop: '2px', display: 'block' }}>{stats.completionRate}%</span>
        </div>

      </div>

      {/* SEARCH AND CATEGORY FILTER CHIPS */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <Search size={16} color="#64748B" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search tasks for today..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#0F172A', outline: 'none', width: '100%', fontWeight: 600 }}
          />
        </div>

        {/* Category Chips Bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
            <Filter size={12} style={{ marginRight: '4px' }} /> Category:
          </span>
          {['ALL', ...categoriesList].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                border: categoryFilter === cat ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
                background: categoryFilter === cat ? '#FFF7ED' : '#FFF',
                color: categoryFilter === cat ? '#EA580C' : '#475569',
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
      {/* 1. ALL SCHEDULED TASKS FOR TODAY (OVERVIEW LIST WITH MARKS) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} color="#2563EB" /> 1. All Tasks Scheduled for Today
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
            {filteredParentTasks.length} Tasks Total
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredParentTasks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '14px', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
              No tasks found for today matching your filter.
            </div>
          ) : (
            filteredParentTasks.map(task => {
              const children = subtasksMap[task.id] || [];
              const status = calculateParentCompletionStatus(task, children);

              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: status.isCompleted ? '#F0FDF4' : '#F8FAFC', border: status.isCompleted ? '1px solid #BBF7D0' : '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {status.isCompleted ? (
                      <CheckCircle2 size={20} color="#16A34A" />
                    ) : (
                      <Circle size={20} color="#D97706" />
                    )}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', textDecoration: status.isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                          {task.category || 'General'}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                          {getFrequencyLabel(task)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {status.isCompleted ? (
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                        ✓ Completed
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#D97706', background: '#FEF3C7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PENDING TASKS LIST (SIMPLIFIED & ACTIONABLE WITH MEASURE MODAL) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#EA580C" /> 2. Pending Tasks
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '4px 10px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
            {pendingParentTasks.length} Pending
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingParentTasks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: '13px', fontWeight: 800 }}>
              🎉 All tasks are completed for today! Great job!
            </div>
          ) : (
            pendingParentTasks.map(task => {
              const children = subtasksMap[task.id] || [];
              const isCompletable = canManuallyCompleteTask(task, children);
              const isMeasureTask = task.hasMeasureTracking || (task.measureTarget && Number(task.measureTarget) > 0) || task.trackingMode === 'measure';

              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '14px 16px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C' }} />
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                        {task.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#EA580C', background: '#FFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FFEDD5' }}>
                          {task.category || 'General'}
                        </span>
                        {isMeasureTask && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#EC4899', background: '#FDF2F8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FBCFE8' }}>
                            <Ruler size={10} style={{ display: 'inline', marginRight: '2px' }} /> Target: {task.measureTarget || 0} {task.measureUnit || 'units'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCompletable ? (
                      <button
                        onClick={() => handleInitiateTaskCompletion(task)}
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          color: '#FFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.2)'
                        }}
                      >
                        <Check size={14} /> Complete
                      </button>
                    ) : (
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '6px 10px', borderRadius: '8px' }}>
                        <LockIcon size={12} /> Pending Subtasks
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
      {/* 3. CATEGORY-WISE TASKS & SUBTASKS LIST */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#7E22CE" /> 3. Tasks & Subtasks by Category
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categoriesList.map(cat => {
            const catTasks = parentTasks.filter(p => p.category === cat);
            const catDone = catTasks.filter(p => calculateParentCompletionStatus(p, subtasksMap[p.id] || []).isCompleted).length;
            const catPct = Math.round((catDone / Math.max(1, catTasks.length)) * 100);

            return (
              <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{cat}</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#7E22CE', background: '#FAF5FF', padding: '2px 8px', borderRadius: '6px' }}>
                      {catTasks.length} Tasks
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#16A34A' }}>
                    {catDone}/{catTasks.length} Done ({catPct}%)
                  </span>
                </div>

                {/* List of Tasks & Subtasks under Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                  {catTasks.map(task => {
                    const children = subtasksMap[task.id] || [];
                    const status = calculateParentCompletionStatus(task, children);

                    return (
                      <div key={task.id} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textDecoration: status.isCompleted ? 'line-through' : 'none' }}>
                            {task.title}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: status.isCompleted ? '#16A34A' : '#D97706' }}>
                            {status.isCompleted ? '✓ Done' : 'Pending'}
                          </span>
                        </div>

                        {/* List Child Subtasks */}
                        {children.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', paddingLeft: '10px', borderLeft: '2px solid #E2E8F0' }}>
                            {children.map(st => (
                              <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#475569' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button onClick={() => onToggleTask(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {st.isDoneToday ? <CheckCircle2 size={14} color="#16A34A" /> : <Circle size={14} color="#CBD5E1" />}
                                  </button>
                                  <span style={{ textDecoration: st.isDoneToday ? 'line-through' : 'none', fontWeight: 600 }}>
                                    {st.title}
                                  </span>
                                </div>
                                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>
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
      {/* 4. COMPLETED TASKS TODAY SECTION */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#16A34A" /> 4. Completed Today
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {completedParentTasks.length === 0 ? (
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 700, fontStyle: 'italic' }}>
              No tasks completed yet today.
            </div>
          ) : (
            completedParentTasks.map(parent => (
              <div key={parent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px 16px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => onToggleTask(parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <CheckCircle2 size={22} color="#16A34A" />
                  </button>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#15803D', textDecoration: 'line-through' }}>{parent.title}</span>
                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                      Completed • {parent.hasMeasureTracking ? `Logged: ${parent.loggedMeasureVal || parent.measureTarget || 0} ${parent.measureUnit || ''}` : 'Standard Task'}
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
      {/* 5. DAILY ANALYTICS & BREAKDOWN SECTION */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#EA580C" /> 5. Daily Performance & Output Analytics
        </h3>

        {/* Overall Completion Bar */}
        <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>Overall Completion Bar</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#EA580C' }}>{stats.completionRate}%</span>
          </div>
          <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EA580C)', borderRadius: '6px' }} />
          </div>

          {stats.totalMeasuresVal > 0 && (
            <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 800, color: '#EC4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ruler size={14} /> Total Logged Measure Output Today: {stats.totalMeasuresVal} units
            </div>
          )}
        </div>

        {/* Task Type Breakdown Grid */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>Task Type Breakdown</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', display: 'block' }}>Date Range</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.endDate.total} tasks</span>
              <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.endDate.done} done</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803D', display: 'block' }}>Day Count</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.dayCount.total} tasks</span>
              <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.dayCount.done} done</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#7E22CE', display: 'block' }}>Event Count</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.eventCount.total} tasks</span>
              <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.eventCount.done} done</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOTIVATIONAL SUMMARY FOOTER */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #FFF7ED, #EFF6FF)', borderRadius: '24px', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#EA580C" /> Daily Discipline Summary
          </span>
          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
            {stats.completionRate === 100 ? '🔥 Perfect Day! 100% Workload Completed!' : `Keep going! You have completed ${stats.completedCount} of ${stats.totalCount} tasks.`}
          </h4>
        </div>

        <button 
          onClick={onOpenQuickAdd}
          style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Quick Add Task
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
