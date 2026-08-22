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
  Users,
  Search,
  Flame,
  Unlink,
  Edit3,
  Undo2,
  Zap,
  Star,
  Leaf,
  ShieldAlert,
  Folder
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
  const [showArchivedVault, setShowArchivedVault] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  // Currently selected task for static top control bar (set by click)
  const [selectedTaskId, setSelectedTaskId] = useState(null);

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
  const archivedParentTasks = tasks.filter(t => t.isArchived);

  let displayedTasks = showArchivedVault ? archivedParentTasks : activeParentTasks;

  // Filter Type: Parents vs Subtasks
  if (filterType === 'PARENTS_ONLY') {
    displayedTasks = displayedTasks.filter(t => !t.parentTaskId);
  } else if (filterType === 'SUBTASKS_ONLY') {
    displayedTasks = displayedTasks.filter(t => t.parentTaskId);
  }

  // Dynamic User Categories ONLY (Computed directly from user created tasks!)
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

  const selectedTaskObj = tasks.find(t => t.id === selectedTaskId) || displayedTasks[0] || null;

  // Refined visual priority renderer
  const renderPriorityVisual = (priority) => {
    const p = (priority || 'HIGH').toUpperCase();
    if (p === 'CRITICAL') {
      return (
        <span style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🔴🔥 Critical
        </span>
      );
    }
    if (p === 'HIGH') {
      return (
        <span style={{ background: '#FFEDD5', color: '#EA580C', border: '1px solid #FDBA74', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🟠⚡ High
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span style={{ background: '#FEF9C3', color: '#CA8A04', border: '1px solid #FDE047', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🟡⭐ Med
        </span>
      );
    }
    return (
      <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        🟢🍃 Low
      </span>
    );
  };

  const handleTaskCardClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Top Header Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="#DC2626" /> Task Management Hub
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Click any task card to target. Double click for dedicated task info page.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowArchivedVault(prev => !prev)}
            style={{ color: showArchivedVault ? '#DC2626' : '#475569', borderColor: showArchivedVault ? '#DC2626' : '#CBD5E1' }}
          >
            <Archive size={16} /> {showArchivedVault ? `Active Tasks (${activeParentTasks.length})` : `Archived Vault (${archivedParentTasks.length})`}
          </button>

          <button className="btn-primary" onClick={onOpenQuickAdd}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* FILTER & ACTION TOOLBAR (NORMAL INLINE ACTIONS WITHOUT SURROUNDING BOX) */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* UPPER ROW: Type Pills, Category Dropdown, Sort Dropdown & Normal Inline Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Type Filter Pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: 'All Cards', val: 'ALL' },
                { label: 'Parent Tasks', val: 'PARENTS_ONLY' },
                { label: 'Subtasks', val: 'SUBTASKS_ONLY' }
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilterType(f.val)}
                  style={{
                    background: filterType === f.val ? '#DC2626' : '#F8FAFC',
                    color: filterType === f.val ? '#FFF' : '#475569',
                    border: '1px solid #CBD5E1',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Category:</span>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                style={{ padding: '5px 8px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 700, color: '#0F172A' }}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} color="#64748B" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '5px 8px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 700 }}
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

          {/* NORMAL INLINE ACTION BUTTONS (NO SURROUNDING BOX!) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* 1. Edit */}
            <button 
              onClick={() => selectedTaskObj && onEditTask(selectedTaskObj)}
              disabled={!selectedTaskObj}
              title="Edit Selected Task"
              style={{ background: '#FFF', color: '#475569', border: '1px solid #CBD5E1', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Edit3 size={13} /> Edit
            </button>

            {/* 2. Delete */}
            <button 
              onClick={() => selectedTaskObj && onDeleteTask(selectedTaskObj.id)}
              disabled={!selectedTaskObj}
              title="Delete Selected Task"
              style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} /> Delete
            </button>

            {/* 3. Archive */}
            <button 
              onClick={() => selectedTaskObj && onArchiveTask(selectedTaskObj.id)}
              disabled={!selectedTaskObj}
              title="Archive Selected Task"
              style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Archive size={14} /> Archive
            </button>

            {/* 4. Undo */}
            <button 
              onClick={() => selectedTaskObj && onUndoTask(selectedTaskObj.id)}
              disabled={!selectedTaskObj}
              title="Undo Today's Completion"
              style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Undo2 size={13} /> Undo
            </button>

            {/* 5. Map to... */}
            <select
              value=""
              onChange={(e) => selectedTaskObj && onMapTaskParent(selectedTaskObj.id, e.target.value)}
              disabled={!selectedTaskObj}
              style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '8px', background: '#FFF', border: '1px solid #CBD5E1', fontWeight: 700, color: '#475569' }}
            >
              <option value="">Map to...</option>
              {tasks.filter(t => selectedTaskObj && t.id !== selectedTaskObj.id && !t.parentTaskId).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {/* 6. Unmap */}
            <button 
              onClick={() => selectedTaskObj && onUnmapSubtask(selectedTaskObj.id)}
              disabled={!selectedTaskObj || !selectedTaskObj.parentTaskId}
              title="Unmap Subtask"
              style={{ background: '#FFFDF5', color: '#D97706', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: selectedTaskObj?.parentTaskId ? 1 : 0.5 }}
            >
              <Unlink size={13} /> Unmap
            </button>
          </div>

        </div>

        {/* SEARCH BAR POSITIONED BELOW THE UPPER FILTER & ACTION ROW */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input 
            type="text"
            placeholder="Search tasks by title, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px', height: '42px', borderRadius: '10px' }}
          />
        </div>

      </div>

      {/* TASK DIRECTORY CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {displayedTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
            <Archive size={36} color="#DC2626" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              {showArchivedVault ? 'No Archived Tasks Found' : 'No Active Tasks Scheduled'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {showArchivedVault ? 'Tasks paused during exams will appear in this vault.' : 'Click + Add Task to create a new task.'}
            </div>
          </div>
        ) : (
          displayedTasks.map(task => {
            const isExpanded = expandedTasks[task.id];
            const childTasks = tasks.filter(t => t.parentTaskId === task.id);
            const isSubtaskEntity = !!task.parentTaskId;
            const parentTaskObj = isSubtaskEntity ? tasks.find(pt => pt.id === task.parentTaskId) : null;
            const isTaskDone = task.isDoneToday || task.progressPercent >= 100;
            const isSelected = selectedTaskObj?.id === task.id;

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
                  padding: '18px 22px', 
                  borderLeft: isSubtaskEntity ? '6px solid #D97706' : '6px solid #DC2626',
                  background: cardBgStyle,
                  borderRadius: '16px',
                  boxShadow: isSelected ? '0 0 0 3px #2563EB, 0 8px 24px rgba(37, 99, 235, 0.15)' : '0 4px 16px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title="Click to select for top bar actions. Double click for dedicated task info page."
              >
                
                {/* Main Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                    
                    {!isSubtaskEntity && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}
                        style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                      >
                        {isExpanded ? <ChevronDown size={20} color="#DC2626" /> : <ChevronRight size={20} color="#64748B" />}
                      </button>
                    )}

                    {/* Completion Checkmark */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title={isTaskDone ? "Mark Turn Incomplete" : "Mark Turn Complete"}
                    >
                      {isTaskDone ? (
                        <CheckCircle2 size={24} color={isSubtaskEntity ? '#D97706' : '#DC2626'} />
                      ) : (
                        <Circle size={24} color="#94A3B8" />
                      )}
                    </button>

                    {/* Task Title (NO STRIKETHROUGH & NO "DONE FOR TODAY" BADGE!), Category Badge & Parent Reference without "Child of" */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        
                        <span style={{ fontSize: '16px', fontWeight: 800, color: isTaskDone ? '#475569' : '#0F172A', letterSpacing: '-0.01em' }}>
                          {task.title}
                        </span>

                        {/* Category Badge */}
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Folder size={11} color="#64748B" /> {task.category || 'General'}
                        </span>

                        {/* Parent Reference Badge WITHOUT the words "Child of" */}
                        {parentTaskObj && (
                          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px' }}>
                            ↳ {parentTaskObj.title}
                          </span>
                        )}

                        {/* VISUAL PRIORITY BADGE */}
                        {renderPriorityVisual(task.priority)}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginRight: '4px' }}>7-DAY:</span>
                    {heatmapTiles.map((tile, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '4px',
                          background: tile.isComplete ? '#22C55E' : '#CBD5E1',
                          boxShadow: tile.isComplete ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={tile.label === 'Today' ? (tile.isComplete ? 'Today: Completed' : 'Today: Unscheduled') : `Past Day ${tile.label}`}
                      />
                    ))}
                  </div>

                  {/* RIGHT SIDE INDEPENDENT DAY-COUNT PERCENTAGE & RATIO (e.g. 2% (1/45)) */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: isSubtaskEntity ? '#D97706' : '#DC2626' }}>
                      {calculatedProgPercent}%
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B' }}>
                      {countRatioStr}
                    </span>
                  </div>

                </div>

                {/* Subtasks Accordion Dropdown Section (Renders Subtask Completion Ratio & % Here!) */}
                {!isSubtaskEntity && isExpanded && (
                  <div style={{ marginTop: '14px', marginLeft: '32px', paddingLeft: '16px', borderLeft: '2px solid rgba(220, 38, 38, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                    
                    {/* ACCORDION HEADER: CHILD SUBTASK ENTITIES (1) - 1:1 Completed (100%) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.05em' }}>
                          CHILD SUBTASK ENTITIES ({childTasks.length})
                        </span>
                        
                        {subtaskTotalCount > 0 && (
                          <span style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                        No child subtasks mapped yet. Select "Map to..." on top bar or click + Add Child Subtask.
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
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button 
                                onClick={() => onToggleTask(child.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                              >
                                {child.progressPercent >= 100 || child.isDoneToday ? (
                                  <CheckCircle2 size={20} color="#D97706" />
                                ) : (
                                  <Circle size={20} color="#94A3B8" />
                                )}
                              </button>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CornerDownRight size={14} color="#D97706" />
                                  <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 800, 
                                    color: child.progressPercent >= 100 || child.isDoneToday ? '#475569' : '#0F172A'
                                  }}>
                                    {child.title}
                                  </span>
                                  {renderPriorityVisual(child.priority)}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#D97706' }}>
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

    </div>
  );
}
