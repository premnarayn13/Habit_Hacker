import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Layers, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Archive, 
  Trash2, 
  CornerDownRight,
  ArrowUpDown,
  Search,
  Unlink,
  Edit3,
  Undo2,
  Folder,
  X,
  Zap,
  Activity,
  Ruler
} from 'lucide-react';

export default function TaskSubtaskView({ 
  tasks, 
  subtasks, 
  onToggleTask, 
  onUndoTask,
  onLogEventCount,
  onToggleSubtask, 
  onUpdateSubtaskCount,
  onAddSubtask,
  onOpenTaskDetail,
  onOpenQuickAdd,
  onOpenQuickAddForSubtask,
  onArchiveTask,
  onDeleteTask,
  onMapTaskParent,
  onUnmapSubtask,
  onOpenDedicatedTaskPage,
  onEditTask
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeSection, setActiveSection] = useState('ALL');
  const [activeTag, setActiveTag] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PARENTS_ONLY', 'SUBTASKS_ONLY'
  const [sortBy, setSortBy] = useState('START_DATE_ASC');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Selected task state (defaults to null - floating action dock appears ONLY when a task is selected!)
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Measure Modal Popup State for Daily Performance Measure Input
  const [measureModalTask, setMeasureModalTask] = useState(null);
  const [measureInputValue, setMeasureInputValue] = useState('');

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 50;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 50;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const activeParentTasks = tasks.filter(t => !t.isArchived);

  let displayedTasks = activeParentTasks;

  // Filter Type: Parents vs Subtasks
  if (filterType === 'PARENTS_ONLY') {
    displayedTasks = displayedTasks.filter(t => !t.parentTaskId);
  } else if (filterType === 'SUBTASKS_ONLY') {
    displayedTasks = displayedTasks.filter(t => t.parentTaskId);
  }

  // Dynamic User Categories ONLY
  const userCreatedCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));
  const categoriesList = ['ALL', ...userCreatedCategories];

  // Category Filter
  if (activeCategory !== 'ALL') {
    displayedTasks = displayedTasks.filter(t => (t.category || '').toLowerCase() === activeCategory.toLowerCase());
  }

  // Section Filter
  if (activeSection !== 'ALL') {
    displayedTasks = displayedTasks.filter(t => (t.section || '').toLowerCase() === activeSection.toLowerCase());
  }

  // Tags Filter
  if (activeTag !== 'ALL') {
    displayedTasks = displayedTasks.filter(t => (t.tags || '').toLowerCase().includes(activeTag.toLowerCase()));
  }

  // Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedTasks = displayedTasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.tags || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q)
    );
  }

  // Sorting Engine
  displayedTasks.sort((a, b) => {
    const spanA = calculateSpanDays(a.plannedStart, a.plannedEnd);
    const spanB = calculateSpanDays(b.plannedStart, b.plannedEnd);

    if (sortBy === 'START_DATE_ASC') return (a.plannedStart || '').localeCompare(b.plannedStart || '');
    if (sortBy === 'START_DATE_DESC') return (b.plannedStart || '').localeCompare(a.plannedStart || '');
    if (sortBy === 'END_DATE_ASC') return (a.plannedEnd || '').localeCompare(b.plannedEnd || '');
    if (sortBy === 'END_DATE_DESC') return (b.plannedEnd || '').localeCompare(a.plannedEnd || '');
    if (sortBy === 'DURATION_ASC') return spanA - spanB;
    if (sortBy === 'DURATION_DESC') return spanB - spanA;
    if (sortBy === 'PRIORITY') {
      const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    }
    return a.title.localeCompare(b.title);
  });

  // Selected Task Object (ONLY populated if user explicitly clicked a card)
  const selectedTaskObj = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;

  // LIGHTNING BOLT VISUAL PRIORITY INDICATOR
  const renderPriorityVisual = (priority) => {
    const p = (priority || 'HIGH').toUpperCase();
    const color = (p === 'CRITICAL' || p === 'HIGH') ? '#DC2626' : (p === 'MEDIUM' ? '#F59E0B' : '#16A34A');
    const labelText = `${p} Priority`;

    return (
      <div 
        title={labelText} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '3px 5px',
          borderRadius: '6px',
          background: `${color}15`,
          border: `1px solid ${color}40`,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        <Zap size={14} color={color} fill={color} />
      </div>
    );
  };

  const handleTaskCardClick = (taskId) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    } else {
      setSelectedTaskId(taskId);
    }
  };

  // Intercept Task Completion for Measure Tracking
  const handleCheckmarkClick = (e, task) => {
    e.stopPropagation();
    const isDone = task.isDoneToday || task.progressPercent >= 100;
    
    if (!isDone && task.hasMeasureTracking) {
      // Prompt for daily performance measure input
      setMeasureModalTask(task);
      setMeasureInputValue(task.measureTarget || '');
    } else {
      onToggleTask(task.id);
    }
  };

  const handleSaveMeasureAndComplete = () => {
    if (measureModalTask) {
      const val = parseFloat(measureInputValue) || 0;
      onToggleTask(measureModalTask.id, val);
      setMeasureModalTask(null);
      setMeasureInputValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: selectedTaskObj ? '90px' : '20px' }}>
      
      {/* FILTER & CONTROL TOOLBAR (SINGLE COMPACT ROW WITH ZERO HORIZONTAL SCROLL) */}
      <div className="glass-panel" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* SINGLE ADAPTIVE HORIZONTAL ROW FOR FILTERS & SORT */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'nowrap', width: '100%' }}>
          
          {/* Type Filter Dropdown (Replaces All, Parents, Subtasks pill buttons) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 800, color: '#DC2626' }}
            >
              <option value="ALL">All</option>
              <option value="PARENTS_ONLY">Parents</option>
              <option value="SUBTASKS_ONLY">Subtasks</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>Category:</span>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 700, color: '#0F172A', maxWidth: '85px' }}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <ArrowUpDown size={12} color="#64748B" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>Sort:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 700, maxWidth: '105px' }}
            >
              <option value="START_DATE_ASC">Start Date (Earliest)</option>
              <option value="START_DATE_DESC">Start Date (Latest)</option>
              <option value="END_DATE_ASC">End Date (Earliest)</option>
              <option value="END_DATE_DESC">End Date (Furthest)</option>
              <option value="DURATION_ASC">Duration (Shortest)</option>
              <option value="DURATION_DESC">Duration (Longest)</option>
              <option value="PRIORITY">Priority Order</option>
            </select>
          </div>

        </div>

        {/* SEARCH BAR POSITIONED BELOW FILTERS */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text"
            placeholder="Search tasks by title, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', height: '36px', borderRadius: '8px', fontSize: '12px' }}
          />
        </div>

      </div>

      {/* TASK DIRECTORY CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
            <Layers size={36} color="#DC2626" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              No Active Tasks Scheduled
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Click + Add Task to create a new task.
            </div>
          </div>
        ) : (
          displayedTasks.map(task => {
            const isExpanded = expandedTasks[task.id];
            const childTasks = tasks.filter(t => t.parentTaskId === task.id);
            const isSubtaskEntity = !!task.parentTaskId;
            const parentTaskObj = isSubtaskEntity ? tasks.find(pt => pt.id === task.parentTaskId) : null;
            const isTaskDone = task.isDoneToday || task.progressPercent >= 100;
            const isSelected = selectedTaskId === task.id;

            // Optional Stripes Background Visual Pattern
            const cardBgStyle = task.isOptional 
              ? 'repeating-linear-gradient(45deg, #FFFDF5, #FFFDF5 10px, #FFFBEB 10px, #FFFBEB 20px)'
              : (isSubtaskEntity ? '#FFFDF5' : '#FFFFFF');

            // Format progress ratio according to task's ACTUAL day/event target count attribute!
            const targetMax = task.targetCount || task.targetDayCount || task.targetEventCount || calculateSpanDays(task.plannedStart, task.plannedEnd) || 50;
            const currentDone = task.currentCount || task.currentDayCount || task.currentEventCount || (isTaskDone ? targetMax : 0);
            const countRatioStr = `(${currentDone}/${targetMax})`;
            const calculatedProgPercent = Math.round((currentDone / targetMax) * 100);

            // Subtask completion stats for expanded dropdown section
            const subtaskCompletedCount = childTasks.filter(c => c.isDoneToday || c.progressPercent >= 100).length;
            const subtaskTotalCount = childTasks.length;
            const subtaskRatioStr = `${subtaskCompletedCount}:${subtaskTotalCount} Completed`;
            const subtaskProgPercent = subtaskTotalCount > 0 ? Math.round((subtaskCompletedCount / subtaskTotalCount) * 100) : 0;

            // DYNAMIC REAL-TIME 5-TILE HEATMAP LOG
            const heatmapTiles = [
              { label: '-4', isComplete: false },
              { label: '-3', isComplete: false },
              { label: '-2', isComplete: false },
              { label: '-1', isComplete: false },
              { label: 'Today', isComplete: isTaskDone }
            ];

            return (
              <div 
                key={task.id} 
                className="glass-panel" 
                onClick={() => handleTaskCardClick(task.id)}
                onDoubleClick={(e) => { e.stopPropagation(); onOpenDedicatedTaskPage(task); }}
                style={{ 
                  padding: '14px 16px', 
                  borderLeft: isSubtaskEntity ? '6px solid #D97706' : '6px solid #DC2626',
                  background: cardBgStyle,
                  borderRadius: '14px',
                  boxShadow: isSelected ? '0 0 0 3px #DC2626, 0 8px 24px rgba(220, 38, 38, 0.15)' : '0 4px 16px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title="Click to select & show action dock at bottom. Double click for dedicated task info page."
              >
                
                {/* Main Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                    
                    {!isSubtaskEntity && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}
                        style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                      >
                        {isExpanded ? <ChevronDown size={18} color="#DC2626" /> : <ChevronRight size={18} color="#64748B" />}
                      </button>
                    )}

                    {/* Completion Checkmark */}
                    <button 
                      onClick={(e) => handleCheckmarkClick(e, task)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      title={isTaskDone ? "Mark Turn Incomplete" : "Mark Turn Complete"}
                    >
                      {isTaskDone ? (
                        <CheckCircle2 size={22} color={isSubtaskEntity ? '#D97706' : '#DC2626'} />
                      ) : (
                        <Circle size={22} color="#94A3B8" />
                      )}
                    </button>

                    {/* Task Title, Category Badge, Parent Reference & LIGHTNING BOLT PRIORITY */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        
                        <span style={{ fontSize: '15px', fontWeight: 800, color: isTaskDone ? '#475569' : '#0F172A', letterSpacing: '-0.01em' }}>
                          {task.title}
                        </span>

                        {/* Category Badge with comfortable spacing from title */}
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                          <Folder size={11} color="#64748B" /> {task.category || 'General'}
                        </span>

                        {/* Parent Reference Badge WITHOUT "Child of" */}
                        {parentTaskObj && (
                          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            ↳ {parentTaskObj.title}
                          </span>
                        )}

                        {/* LIGHTNING BOLT PRIORITY INDICATOR */}
                        {renderPriorityVisual(task.priority)}

                        {/* Measure Badge Indicator if task has measure tracking */}
                        {task.hasMeasureTracking && (
                          <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 800, background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }} title={`Tracks daily measure in ${task.measureUnit || 'units'}`}>
                            <Ruler size={11} /> {task.measureUnit || 'measure'}
                          </span>
                        )}
                      </div>

                      {/* Quick Event Log Button if Event Count Task */}
                      {task.trackingMode === 'count_event' && (
                        <div style={{ marginTop: '6px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); onLogEventCount(task.id); }}
                            style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            +1 Log Event
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* DYNAMIC REAL-TIME 5-TILE HEATMAP */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginRight: '2px' }}>7-DAY:</span>
                    {heatmapTiles.map((tile, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          background: tile.isComplete ? '#22C55E' : '#CBD5E1',
                          boxShadow: tile.isComplete ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={tile.label === 'Today' ? (tile.isComplete ? 'Today: Completed' : 'Today: Unscheduled') : `Past Day ${tile.label}`}
                      />
                    ))}
                  </div>

                  {/* RIGHT SIDE INDEPENDENT DAY-COUNT PERCENTAGE & RATIO */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 900, color: isSubtaskEntity ? '#D97706' : '#DC2626' }}>
                      {calculatedProgPercent}%
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>
                      {countRatioStr}
                    </span>
                  </div>

                </div>

                {/* Subtasks Accordion Dropdown Section */}
                {!isSubtaskEntity && isExpanded && (
                  <div style={{ marginTop: '12px', marginLeft: '20px', paddingLeft: '12px', borderLeft: '2px solid rgba(220, 38, 38, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    
                    {/* ACCORDION HEADER: CLEAN SUBTASK STATS (REMOVED CHILD SUBTASK ENTITIES TEXT) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {subtaskTotalCount > 0 && (
                          <span style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} color="#D97706" /> {subtaskRatioStr} ({subtaskProgPercent}%)
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => onOpenQuickAddForSubtask(task.id)}
                        style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} /> Add Child Subtask
                      </button>
                    </div>

                    {childTasks.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                        No child subtasks mapped yet. Click card to select & map.
                      </div>
                    ) : (
                      childTasks.map(child => {
                        const childTarget = child.targetCount || child.targetDayCount || child.targetEventCount || 50;
                        const childDone = child.currentCount || (child.isDoneToday || child.progressPercent >= 100 ? childTarget : 0);
                        const childProg = Math.round((childDone / childTarget) * 100);

                        return (
                          <div 
                            key={child.id}
                            style={{
                              background: '#FFFDF5',
                              border: '1px solid #FDE68A',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button 
                                onClick={(e) => handleCheckmarkClick(e, child)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                {child.progressPercent >= 100 || child.isDoneToday ? (
                                  <CheckCircle2 size={18} color="#D97706" />
                                ) : (
                                  <Circle size={18} color="#94A3B8" />
                                )}
                              </button>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <CornerDownRight size={13} color="#D97706" />
                                  <span style={{ 
                                    fontSize: '13px', 
                                    fontWeight: 800, 
                                    color: child.progressPercent >= 100 || child.isDoneToday ? '#475569' : '#0F172A'
                                  }}>
                                    {child.title}
                                  </span>
                                  {renderPriorityVisual(child.priority)}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706' }}>
                                {childProg}% ({childDone}/{childTarget})
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* FIXED COMPACT 4-ACTION BOTTOM DOCK (STAYS 100% INSIDE SCREEN BOUNDS - ZERO HORIZONTAL SCROLL) */}
      {selectedTaskObj && (
        <div style={{
          position: 'fixed',
          bottom: '64px',
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1300,
          background: '#FFFFFF',
          borderTop: '2px solid #DC2626',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.08)',
          padding: '8px 8px',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justify: 'space-around',
          gap: '4px',
          flexWrap: 'nowrap',
          boxSizing: 'border-box',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* 1. Archive */}
          <button 
            onClick={() => { onArchiveTask(selectedTaskObj.id); setSelectedTaskId(null); }}
            title="Archive Selected Task"
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '5px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Archive size={13} color="#DC2626" /> Archive
          </button>

          {/* 2. Undo */}
          <button 
            onClick={() => onUndoTask(selectedTaskObj.id)}
            title="Undo Today's Completion"
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '5px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Undo2 size={13} color="#DC2626" /> Undo
          </button>

          {/* 3. Map to... (Compact Width to prevent pushing Unmap) */}
          <select
            value=""
            onChange={(e) => onMapTaskParent(selectedTaskObj.id, e.target.value)}
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '5px 4px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              height: '29px',
              width: '84px',
              maxWidth: '84px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textOverflow: 'ellipsis'
            }}
          >
            <option value="">Map to...</option>
            {tasks.filter(t => t.id !== selectedTaskObj.id && !t.parentTaskId).map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* 4. Unmap */}
          <button 
            onClick={() => onUnmapSubtask(selectedTaskObj.id)}
            disabled={!selectedTaskObj.parentTaskId}
            title="Unmap Subtask"
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '5px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              opacity: selectedTaskObj.parentTaskId ? 1 : 0.5,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Unlink size={13} color="#DC2626" /> Unmap
          </button>
        </div>
      )}

      {/* DAILY PERFORMANCE MEASURE POPUP MODAL CARD */}
      {measureModalTask && (
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
          justifyContent: 'center',
          zIndex: 1500,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', borderRadius: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <button 
              onClick={() => setMeasureModalTask(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ruler size={20} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Log Daily Measure</h3>
                <p style={{ fontSize: '12px', color: '#64748B' }}>{measureModalTask.title}</p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Enter today's measure ({measureModalTask.measureUnit || 'units'}):
              </label>
              <input 
                type="number"
                step="any"
                autoFocus
                placeholder={`e.g., ${measureModalTask.measureTarget || 10} ${measureModalTask.measureUnit || 'units'}`}
                value={measureInputValue}
                onChange={(e) => setMeasureInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveMeasureAndComplete(); }}
                style={{ width: '100%', height: '42px', borderRadius: '10px', paddingLeft: '14px', fontSize: '14px', border: '1.5px solid #2563EB', fontWeight: 700 }}
              />
              {measureModalTask.measureTarget > 0 && (
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                  Target: {measureModalTask.measureTarget} {measureModalTask.measureUnit || 'units'} / day
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleSaveMeasureAndComplete}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Save & Complete Turn
              </button>

              <button 
                onClick={() => { onToggleTask(measureModalTask.id); setMeasureModalTask(null); }}
                className="btn-secondary"
                style={{ padding: '10px', fontSize: '13px' }}
              >
                Skip Input
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Push commit iteration 4

// Push commit iteration 8

// Push commit iteration 9

// Push commit iteration 10
