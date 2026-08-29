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
  Ruler,
  ExternalLink
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
  onEditTask,
  onExtendTask
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeSection, setActiveSection] = useState('ALL');
  const [activeTag, setActiveTag] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PARENTS_ONLY', 'SUBTASKS_ONLY', 'COMPLETED'
  const [sortBy, setSortBy] = useState('START_DATE_ASC');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Selected task state (defaults to null - floating action dock appears ONLY when a task is selected!)
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Measure Modal Popup State for Daily Performance Measure Input
  const [measureModalTask, setMeasureModalTask] = useState(null);
  const [measureInputValue, setMeasureInputValue] = useState('');

  // Searchable Custom Select Dropdown Modal State ('TYPE', 'CATEGORY', 'SORT', or null)
  const [pickerModalMode, setPickerModalMode] = useState(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');

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

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: Is task overall finished (e.g. 30 days period over or 100% target count met)
  const isTaskOverallFinished = (t) => {
    if (!t || t.isArchived) return false;
    const isTargetMet = (t.progressPercent && t.progressPercent >= 100) || (t.targetCount && t.currentCount >= t.targetCount);
    const isPeriodOver = Boolean(t.plannedEnd && t.plannedEnd < todayStr);
    return isTargetMet || isPeriodOver;
  };

  // Filter Type: Parents vs Subtasks vs Completed
  if (filterType === 'PARENTS_ONLY') {
    displayedTasks = displayedTasks.filter(t => !t.parentTaskId && !isTaskOverallFinished(t));
  } else if (filterType === 'SUBTASKS_ONLY') {
    displayedTasks = displayedTasks.filter(t => t.parentTaskId && !isTaskOverallFinished(t));
  } else if (filterType === 'COMPLETED') {
    // Completed tasks: overall planned period over or 100% target achieved
    displayedTasks = tasks.filter(t => !t.isArchived && isTaskOverallFinished(t));
  } else if (filterType === 'ALL') {
    // All active ongoing tasks
    displayedTasks = displayedTasks.filter(t => !isTaskOverallFinished(t));
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

  // Options for Searchable Template Dropdown Select Modal
  const getTypeOptions = () => [
    { val: 'ALL', label: 'All Tasks' },
    { val: 'PARENTS_ONLY', label: 'Parents Only' },
    { val: 'SUBTASKS_ONLY', label: 'Subtasks Only' },
    { val: 'COMPLETED', label: 'Completed Tasks' }
  ];

  const getSortOptions = () => [
    { val: 'START_DATE_ASC', label: 'Start Date (Earliest)' },
    { val: 'START_DATE_DESC', label: 'Start Date (Latest)' },
    { val: 'END_DATE_ASC', label: 'End Date (Earliest)' },
    { val: 'END_DATE_DESC', label: 'End Date (Furthest)' },
    { val: 'DURATION_ASC', label: 'Duration (Shortest)' },
    { val: 'DURATION_DESC', label: 'Duration (Longest)' },
    { val: 'PRIORITY', label: 'Priority Order' }
  ];

  const getPickerOptions = () => {
    let opts = [];
    if (pickerModalMode === 'TYPE') opts = getTypeOptions();
    else if (pickerModalMode === 'CATEGORY') opts = categoriesList.map(c => ({ val: c, label: c }));
    else if (pickerModalMode === 'SORT') opts = getSortOptions();

    if (!pickerSearchQuery.trim()) return opts;
    const q = pickerSearchQuery.toLowerCase();
    return opts.filter(o => o.label.toLowerCase().includes(q));
  };

  const isPickerSelected = (val) => {
    if (pickerModalMode === 'TYPE') return filterType === val;
    if (pickerModalMode === 'CATEGORY') return activeCategory === val;
    if (pickerModalMode === 'SORT') return sortBy === val;
    return false;
  };

  const handleSelectPickerOption = (val) => {
    if (pickerModalMode === 'TYPE') setFilterType(val);
    if (pickerModalMode === 'CATEGORY') setActiveCategory(val);
    if (pickerModalMode === 'SORT') setSortBy(val);
  };

  const getSortLabel = () => {
    const found = getSortOptions().find(s => s.val === sortBy);
    return found ? found.label.split(' ')[0] : 'Sort';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: selectedTaskObj ? '90px' : '20px' }}>
      
      {/* FILTER & CONTROL TOOLBAR (COMPACT 100% ZERO-SCROLL BUTTON TRIGGERS FOR SEARCHABLE DROPDOWNS) */}
      <div className="glass-panel" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* SINGLE 100% ADAPTIVE HORIZONTAL ROW WITH SEARCHABLE DROPDOWN TRIGGERS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', flexWrap: 'nowrap', width: '100%' }}>
          
          {/* 1. Type Dropdown Trigger Button */}
          <button
            onClick={() => setPickerModalMode('TYPE')}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#DC2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Type: {filterType === 'ALL' ? 'All Tasks' : (filterType === 'PARENTS_ONLY' ? 'Parents Only' : (filterType === 'SUBTASKS_ONLY' ? 'Subtasks Only' : 'Completed Tasks'))}</span>
            <ChevronDown size={12} color="#DC2626" />
          </button>

          {/* 2. Category Dropdown Trigger Button */}
          <button
            onClick={() => setPickerModalMode('CATEGORY')}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Cat: {activeCategory}</span>
            <ChevronDown size={12} color="#64748B" />
          </button>

          {/* 3. Sort Dropdown Trigger Button */}
          <button
            onClick={() => setPickerModalMode('SORT')}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <ArrowUpDown size={11} color="#64748B" /> {getSortLabel()}
            </span>
            <ChevronDown size={12} color="#64748B" />
          </button>

        </div>

        {/* SEARCH BAR POSITIONED BELOW FILTERS */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input 
            type="text"
            placeholder="Search tasks by title, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '30px', height: '34px', borderRadius: '8px', fontSize: '11px' }}
          />
        </div>

      </div>

      {/* TASK DIRECTORY CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
            <Layers size={36} color="#DC2626" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              {filterType === 'COMPLETED' ? 'No Completed Tasks Found' : 'No Active Tasks Scheduled'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {filterType === 'COMPLETED'
                ? 'Tasks marked as completed or past their end date will appear here for review and deadline extension.'
                : 'Click + Add Task to create a new task.'}
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

            // Calculations for Task Row KPI Badges
            const spanDays = calculateSpanDays(task.plannedStart, task.plannedEnd);
            const targetCount = task.targetCount || task.targetDayCount || task.targetEventCount || spanDays || 50;
            const currentCount = task.currentCount || task.currentDayCount || task.currentEventCount || (isTaskDone ? targetCount : 0);
            const calculatedProgPercent = task.progressPercent || (targetCount > 0 ? Math.round((currentCount / targetCount) * 100) : 0);
            const countRatioStr = `${currentCount}:${targetCount}`;
            const cardBgStyle = isSelected 
              ? (isSubtaskEntity ? '#FFFBEB' : '#FEF2F2') 
              : (isTaskDone ? '#F8FAFC' : '#FFFFFF');

            // Subtask completion stats for expanded dropdown section
            const subtaskCompletedCount = childTasks.filter(c => c.isDoneToday || c.progressPercent >= 100).length;
            const subtaskTotalCount = childTasks.length;
            const subtaskRatioStr = `${subtaskCompletedCount}:${subtaskTotalCount} Completed`;
            const subtaskProgPercent = subtaskTotalCount > 0 ? Math.round((subtaskCompletedCount / subtaskTotalCount) * 100) : 0;

            // DYNAMIC REAL-TIME FULL 7-TILE HEATMAP LOG (-6, -5, -4, -3, -2, -1, Today)
            const heatmapTiles = [
              { label: '-6', isComplete: false },
              { label: '-5', isComplete: false },
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
                onDoubleClick={(e) => { e.stopPropagation(); if (onOpenDedicatedTaskPage) onOpenDedicatedTaskPage(task); }}
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
                title="Click to select & show action dock at bottom. Double click to open dedicated task page."
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

                    {/* Task Title, Category Badge & Attachment Pill */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        
                        <span style={{ fontSize: '15px', fontWeight: 800, color: isTaskDone ? '#475569' : '#0F172A', letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span>{task.emoji || '🎯'}</span>
                          <span>{task.title}</span>
                        </span>

                        {/* Category Badge */}
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Folder size={11} color="#64748B" /> {task.category || 'General'}
                        </span>

                        {/* Parent Reference Badge */}
                        {parentTaskObj && (
                          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            ↳ {parentTaskObj.title}
                          </span>
                        )}

                        {/* Attachment File Pill */}
                        {(task.attachmentName || task.attachmentUrl) && (
                          <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 800, background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            📎 {task.attachmentName || 'Attachment'}
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

                  {/* DYNAMIC REAL-TIME 7-TILE HEATMAP (7 DAYS FULL LOG) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#F8FAFC', padding: '4px 7px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', marginRight: '2px' }}>7-DAY:</span>
                    {heatmapTiles.map((tile, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '2.5px',
                          background: tile.isComplete ? '#22C55E' : '#CBD5E1',
                          boxShadow: tile.isComplete ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={tile.label === 'Today' ? (tile.isComplete ? 'Today: Completed' : 'Today: Unscheduled') : `Past Day ${tile.label}`}
                      />
                    ))}
                  </div>

                  {/* RIGHT SIDE INDEPENDENT DAY-COUNT PERCENTAGE & RATIO & 1-CLICK OPEN BUTTON */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: isSubtaskEntity ? '#D97706' : '#DC2626' }}>
                        {calculatedProgPercent}%
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginLeft: '4px' }}>
                        {countRatioStr}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); if (onOpenDedicatedTaskPage) onOpenDedicatedTaskPage(task); }}
                      title="Open Dedicated Task Analytics Page"
                      style={{
                        background: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <ExternalLink size={12} color="#2563EB" /> Open
                    </button>
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

      {/* FIXED 5-ACTION BOTTOM DOCK INCLUDING OPEN BUTTON (SLIGHTLY INCREASED SIZE, STAYS 100% INSIDE SCREEN BOUNDS - ZERO SCROLL) */}
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
          padding: '8px 6px',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '4px',
          flexWrap: 'nowrap',
          boxSizing: 'border-box',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* 1. Open Button */}
          <button 
            onClick={() => onOpenDedicatedTaskPage(selectedTaskObj)}
            title="Open Dedicated Task Page"
            style={{
              flex: 1,
              background: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #EF4444',
              padding: '6px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              height: '31px'
            }}
          >
            <ExternalLink size={13} color="#DC2626" /> Open
          </button>

          {/* 2. Extend Deadline Button */}
          <button 
            onClick={() => {
              const defaultNewEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
              const newDate = prompt('Enter new extended deadline (YYYY-MM-DD):', defaultNewEnd);
              if (newDate && onExtendTask) {
                onExtendTask(selectedTaskObj.id, newDate);
                setSelectedTaskId(null);
              }
            }}
            title="Extend Task Deadline & Reactivate"
            style={{
              flex: 1,
              background: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
              padding: '6px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              height: '31px'
            }}
          >
            <Calendar size={13} color="#B45309" /> Extend
          </button>

          {/* 2. Archive */}
          <button 
            onClick={() => { onArchiveTask(selectedTaskObj.id); setSelectedTaskId(null); }}
            title="Archive Selected Task"
            style={{
              flex: 1,
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '6px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              height: '31px'
            }}
          >
            <Archive size={13} color="#DC2626" /> Archive
          </button>

          {/* 3. Undo */}
          <button 
            onClick={() => onUndoTask(selectedTaskObj.id)}
            title="Undo Today's Completion"
            style={{
              flex: 1,
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '6px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              height: '31px'
            }}
          >
            <Undo2 size={13} color="#DC2626" /> Undo
          </button>

          {/* 4. Map to... */}
          <select
            value=""
            onChange={(e) => onMapTaskParent(selectedTaskObj.id, e.target.value)}
            style={{
              flex: 1.1,
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '6px 3px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              height: '31px',
              maxWidth: '82px',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
          >
            <option value="">Map to...</option>
            {tasks.filter(t => t.id !== selectedTaskObj.id && !t.parentTaskId).map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* 5. Unmap */}
          <button 
            onClick={() => onUnmapSubtask(selectedTaskObj.id)}
            disabled={!selectedTaskObj.parentTaskId}
            title="Unmap Subtask"
            style={{
              flex: 1,
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #EF4444',
              padding: '6px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '3px',
              opacity: selectedTaskObj.parentTaskId ? 1 : 0.5,
              whiteSpace: 'nowrap',
              height: '31px'
            }}
          >
            <Unlink size={13} color="#DC2626" /> Unmap
          </button>
        </div>
      )}

      {/* SEARCHABLE CUSTOM TEMPLATE DROPDOWN SELECT MODAL CARD */}
      {pickerModalMode && (
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
          zIndex: 1600,
          padding: '20px'
        }} onClick={() => { setPickerModalMode(null); setPickerSearchQuery(''); }}>
          
          <div 
            className="glass-panel" 
            onClick={(e) => e.stopPropagation()} 
            style={{ width: '100%', maxWidth: '380px', padding: '20px', borderRadius: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', background: '#FFF' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Select {pickerModalMode === 'TYPE' ? 'Task Type' : (pickerModalMode === 'CATEGORY' ? 'Category' : 'Sorting Order')}
              </h3>
              <button 
                onClick={() => { setPickerModalMode(null); setPickerSearchQuery(''); }}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Filter Box inside Dropdown Card */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input 
                type="text"
                autoFocus
                placeholder="Search options..."
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', height: '34px', borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
              />
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {getPickerOptions().map(opt => {
                const selected = isPickerSelected(opt.val);
                return (
                  <button
                    key={opt.val}
                    onClick={() => { handleSelectPickerOption(opt.val); setPickerModalMode(null); setPickerSearchQuery(''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: selected ? '#FEF2F2' : '#F8FAFC',
                      border: selected ? '1.5px solid #DC2626' : '1px solid #E2E8F0',
                      color: selected ? '#DC2626' : '#0F172A',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{opt.label}</span>
                    {selected && <CheckCircle2 size={16} color="#DC2626" />}
                  </button>
                );
              })}
            </div>
          </div>
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
          justify: 'center',
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
