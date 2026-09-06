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

  // Multi-Filter States
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING', 'PARTIAL'
  const [taskTypeFilter, setTaskTypeFilter] = useState('ALL'); // 'ALL', 'end_date', 'count_days', 'count_event'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM', 'LOW'
  const [structureFilter, setStructureFilter] = useState('ALL'); // 'ALL', 'PARENTS', 'HAS_SUBTASKS', 'STANDALONE'
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

  // Determine Applicable Tasks for Selected Date with Multi-Filtering
  const filteredParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      // 1. Status Filter
      if (statusFilter === 'COMPLETED' && !statusObj.isCompleted) return false;
      if (statusFilter === 'PENDING' && statusObj.isCompleted) return false;
      if (statusFilter === 'PARTIAL' && !statusObj.isPartiallyCompleted) return false;

      // 2. Category Filter
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

      // 3. Task Type Filter
      if (taskTypeFilter !== 'ALL' && p.trackingMode !== taskTypeFilter) return false;

      // 4. Priority Filter
      if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) return false;

      // 5. Structure Filter
      if (structureFilter === 'HAS_SUBTASKS' && children.length === 0) return false;
      if (structureFilter === 'STANDALONE' && children.length > 0) return false;

      // 6. Search Query Filter
      if (searchQuery.trim() && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [parentTasks, subtasksMap, statusFilter, categoryFilter, taskTypeFilter, priorityFilter, structureFilter, searchQuery]);

  // Compute Daily Statistics (Unfiltered for Top Scorecard Accuracy)
  const stats = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let pendingSubtasksCount = 0;
    let totalMeasuresVal = 0;

    parentTasks.forEach(p => {
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);

      if (statusObj.isCompleted) {
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
      totalMeasuresVal
    };
  }, [parentTasks, subtasksMap]);

  // Distinct Lists for Sections
  const pendingParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);
      return !statusObj.isCompleted;
    });
  }, [parentTasks, subtasksMap]);

  const completedParentTasks = useMemo(() => {
    return parentTasks.filter(p => {
      const children = subtasksMap[p.id] || [];
      const statusObj = calculateParentCompletionStatus(p, children);
      return statusObj.isCompleted;
    });
  }, [parentTasks, subtasksMap]);

  // Dynamic Categories List
  const categoriesList = useMemo(() => {
    const set = new Set();
    parentTasks.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [parentTasks]);

  // Expand/Collapse Toggle Helper
  const toggleParentExpand = (id) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
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
      {/* TODAY HEADER & DATE NAVIGATOR */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Today
            </h1>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
              {dateDisplayFormatted}
            </div>
          </div>

          {/* Date Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <button 
                onClick={() => setDateOffset(prev => prev - 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
              >
                ‹ Prev
              </button>

              <button 
                onClick={() => setDateOffset(0)}
                style={{ background: dateOffset === 0 ? '#EA580C' : '#FFF', color: dateOffset === 0 ? '#FFF' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer', margin: '0 3px' }}
              >
                Today
              </button>

              <button 
                onClick={() => setDateOffset(prev => prev + 1)}
                style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
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
      {/* TOP SUMMARY SCORECARD (ACCURATE DAILY COUNTS) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        
        {/* Card 1: Total Tasks */}
        <div style={{ background: '#FFF', padding: '12px 14px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Tasks</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '2px', display: 'block' }}>{stats.totalCount}</span>
        </div>

        {/* Card 2: Completed Tasks */}
        <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: '14px', border: '1px solid #BBF7D0', boxShadow: '0 2px 6px rgba(22,163,74,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', display: 'block' }}>Completed</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803D', marginTop: '2px', display: 'block' }}>{stats.completedCount}</span>
        </div>

        {/* Card 3: Pending Tasks */}
        <div style={{ background: '#FEF3C7', padding: '12px 14px', borderRadius: '14px', border: '1px solid #FDE68A', boxShadow: '0 2px 6px rgba(217,119,6,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Pending</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#D97706', marginTop: '2px', display: 'block' }}>{stats.pendingCount}</span>
        </div>

        {/* Card 4: Completion Rate */}
        <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '14px', border: '1px solid #BFDBFE', boxShadow: '0 2px 6px rgba(37,99,235,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Completion Rate</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#2563EB', marginTop: '2px', display: 'block' }}>{stats.completionRate}%</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MULTI-FILTER BAR (STATUS, TYPE, PRIORITY, STRUCTURE, CATEGORY, SEARCH) */}
      {/* ========================================================================= */}
      <div style={{ padding: '14px 16px', background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <Search size={15} color="#64748B" style={{ marginRight: '6px' }} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#0F172A', outline: 'none', width: '100%', fontWeight: 600 }}
          />
        </div>

        {/* Filter Rows */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', marginRight: '2px' }}>
              <Filter size={11} style={{ marginRight: '3px' }} /> Status:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PARTIAL', label: 'Partially Done' },
              { id: 'COMPLETED', label: 'Completed' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 800,
                  border: statusFilter === f.id ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  background: statusFilter === f.id ? '#EFF6FF' : '#FFF',
                  color: statusFilter === f.id ? '#2563EB' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filters: Priority & Structure & Categories */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {/* Priority */}
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', marginRight: '2px' }}>
            Priority:
          </span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
                border: priorityFilter === p ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                background: priorityFilter === p ? '#FFF7ED' : '#F8FAFC',
                color: priorityFilter === p ? '#EA580C' : '#64748B',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}

          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', margin: '0 4px' }}>|</span>

          {/* Categories */}
          {['ALL', ...categoriesList].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
                border: categoryFilter === cat ? '1.5px solid #7E22CE' : '1px solid #E2E8F0',
                background: categoryFilter === cat ? '#FAF5FF' : '#F8FAFC',
                color: categoryFilter === cat ? '#7E22CE' : '#64748B',
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
      {/* 1. ALL SCHEDULED TASKS FOR TODAY (WITH IN-LINE SUBTASKS DROPDOWN) */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
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
              const children = subtasksMap[task.id] || [];
              const statusObj = calculateParentCompletionStatus(task, children);
              const isExpanded = !!expandedParents[task.id];

              return (
                <div 
                  key={task.id} 
                  style={{ 
                    background: statusObj.isCompleted ? '#F0FDF4' : '#F8FAFC', 
                    border: statusObj.isCompleted ? '1px solid #BBF7D0' : '1px solid #E2E8F0', 
                    padding: '12px 14px', 
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* Parent Task Main Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {/* Checkbox */}
                      {children.length === 0 ? (
                        <button
                          onClick={() => handleInitiateTaskCompletion(task)}
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
                          onClick={() => toggleParentExpand(task.id)}
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
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', textDecoration: statusObj.isCompleted ? 'line-through' : 'none' }}>
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
                          onClick={() => toggleParentExpand(task.id)}
                          style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '3px 6px', fontSize: '10px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* IN-LINE SUBTASKS DROPDOWN (Click to mark subtasks complete directly) */}
                  {children.length > 0 && isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', paddingLeft: '10px', borderLeft: '2px solid #BFDBFE' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>Subtasks (Click to complete):</span>
                      {children.map(st => (
                        <div 
                          key={st.id} 
                          onClick={() => onToggleTask(st.id)}
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
                            <span style={{ fontSize: '11px', fontWeight: 800, color: st.isDoneToday ? '#16A34A' : '#0F172A', textDecoration: st.isDoneToday ? 'line-through' : 'none' }}>
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
              const children = subtasksMap[task.id] || [];
              const isCompletable = canManuallyCompleteTask(task, children);
              const isMeasureTask = task.hasMeasureTracking || (task.measureTarget && Number(task.measureTarget) > 0) || task.trackingMode === 'measure';

              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '12px 14px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C' }} />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
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
                        onClick={() => handleInitiateTaskCompletion(task)}
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
      {/* 3. CATEGORY-WISE TASKS & SUBTASKS LIST */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={17} color="#7E22CE" /> 3. Tasks & Subtasks by Category
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoriesList.map(cat => {
            const catTasks = parentTasks.filter(p => p.category === cat);
            const catDone = catTasks.filter(p => calculateParentCompletionStatus(p, subtasksMap[p.id] || []).isCompleted).length;
            const catPct = Math.round((catDone / Math.max(1, catTasks.length)) * 100);

            return (
              <div key={cat} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{cat}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#7E22CE', background: '#FAF5FF', padding: '1px 6px', borderRadius: '4px' }}>
                      {catTasks.length} Tasks
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: catPct === 100 ? '#16A34A' : '#2563EB' }}>
                    {catDone}/{catTasks.length} Done ({catPct}%)
                  </span>
                </div>

                {/* List of Tasks & Subtasks under Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px dashed #CBD5E1' }}>
                  {catTasks.map(task => {
                    const children = subtasksMap[task.id] || [];
                    const statusObj = calculateParentCompletionStatus(task, children);

                    return (
                      <div key={task.id} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textDecoration: statusObj.isCompleted ? 'line-through' : 'none' }}>
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
                              <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#475569' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button onClick={() => onToggleTask(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {st.isDoneToday ? <CheckCircle2 size={13} color="#16A34A" /> : <Circle size={13} color="#CBD5E1" />}
                                  </button>
                                  <span style={{ textDecoration: st.isDoneToday ? 'line-through' : 'none', fontWeight: 600 }}>
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
      {/* 4. COMPLETED TASKS TODAY SECTION */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={17} color="#16A34A" /> 4. Completed Today
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {completedParentTasks.length === 0 ? (
            <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 700, fontStyle: 'italic' }}>
              No tasks completed yet today.
            </div>
          ) : (
            completedParentTasks.map(parent => (
              <div key={parent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => onToggleTask(parent.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <CheckCircle2 size={20} color="#16A34A" />
                  </button>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#15803D', textDecoration: 'line-through' }}>{parent.title}</span>
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
                    onClick={() => onToggleTask(parent.id)}
                    style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#64748B', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Undo2 size={11} /> Undo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DAILY PERFORMANCE & OUTPUT ANALYTICS */}
      {/* ========================================================================= */}
      <div style={{ padding: '16px 20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={17} color="#EA580C" /> 5. Daily Performance & Output Analytics
        </h3>

        {/* Overall Completion Bar */}
        <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>Overall Completion Bar</span>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#EA580C' }}>{stats.completionRate}%</span>
          </div>
          <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EA580C)', borderRadius: '4px' }} />
          </div>

          {stats.totalMeasuresVal > 0 && (
            <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 800, color: '#EC4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ruler size={13} /> Total Logged Measure Output Today: {stats.totalMeasuresVal} units
            </div>
          )}
        </div>

        {/* Task Type Breakdown Grid */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Task Type Breakdown</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#1E40AF', display: 'block' }}>Date Range</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.endDate.total} tasks</span>
              <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.endDate.done} done</span>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#15803D', display: 'block' }}>Day Count</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.dayCount.total} tasks</span>
              <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.dayCount.done} done</span>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#7E22CE', display: 'block' }}>Event Count</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>{typeBreakdown.eventCount.total} tasks</span>
              <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: 600 }}>{typeBreakdown.eventCount.done} done</span>
            </div>
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
