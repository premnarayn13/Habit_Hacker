import React, { useState } from 'react';
import { collaborationService } from '../lib/collaborationService';
import { 
  X, 
  Layers, 
  Plus, 
  Calendar, 
  Clock, 
  Paperclip, 
  Users, 
  Tag, 
  Folder, 
  FolderPlus, 
  Target,
  FileText,
  AlertCircle,
  Bell,
  Ruler
} from 'lucide-react';

export default function QuickAddModal({ 
  isOpen, 
  onClose, 
  onAddTask,
  existingTasks = [],
  preselectedParentTaskId = '',
  currentUser = null
}) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    collab: '',
    priority: 'HIGH',
    isOptional: false,
    hasMeasureTracking: false,
    measureUnit: 'rounds',
    measureTarget: 10,
    category: 'General',
    section: 'General',
    estimatedMinutes: 30,
    reminderTime: '09:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-10',
    trackingMode: 'end_date', // 'end_date', 'count_days', 'count_event'
    targetCount: 50,
    repeatRule: 'DAILY',
    customIntervalDays: 2,
    parentTaskId: preselectedParentTaskId || '',
    attachmentName: '',
    tags: ''
  });

  const [categoryInput, setCategoryInput] = useState('');

  if (!isOpen) return null;

  const defaultCategoriesList = ['General', 'Personal', 'Fitness', 'Mindfulness', 'Productivity', 'Shopping', 'Hobbies'];
  const userCreatedCategories = Array.from(new Set([...defaultCategoriesList, ...existingTasks.map(t => t.category).filter(Boolean)]))
    .filter(cat => !['Coding', 'Health', 'Work', 'Learning', 'Academics'].includes(cat));

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 50;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 50;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalSpanDays = calculateSpanDays(taskData.startDate, taskData.endDate);

  let validationError = '';
  if (totalSpanDays <= 0) {
    validationError = 'End Date must be greater than or equal to Start Date.';
  } else if (taskData.trackingMode === 'count_days') {
    const target = parseInt(taskData.targetCount) || 1;
    if (totalSpanDays < target) {
      validationError = `Selected window (${totalSpanDays} days) cannot be smaller than target count (${target} days).`;
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
      : (file.size / 1024).toFixed(1) + ' KB';

    const reader = new FileReader();
    reader.onload = (event) => {
      setTaskData(prev => ({ 
        ...prev, 
        attachmentName: file.name,
        attachmentUrl: event.target.result,
        attachmentSize: sizeFormatted,
        attachmentType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim() || validationError) return;

    const finalCategory = categoryInput.trim() || taskData.category;
    const createdTaskId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'task-' + Date.now();

    const senderEmail = currentUser?.email || 'user@habithacker.app';
    const senderName = currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'User';

    const createdTask = {
      id: createdTaskId,
      ...taskData,
      category: finalCategory,
      plannedStart: taskData.startDate,
      plannedEnd: taskData.endDate,
      targetDayCount: taskData.trackingMode === 'count_days' ? parseInt(taskData.targetCount) || 1 : null,
      targetEventCount: taskData.trackingMode === 'count_event' ? parseInt(taskData.targetCount) || 1 : null
    };

    onAddTask(createdTask);

    // If collaborator email provided, dispatch collaboration invitation request
    if (taskData.collab && taskData.collab.trim()) {
      collaborationService.sendTaskInvite({
        taskId: createdTaskId,
        taskTitle: taskData.title.trim(),
        category: finalCategory,
        priority: taskData.priority || 'HIGH',
        senderEmail,
        senderName,
        receiverEmail: taskData.collab.trim()
      });
    }

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Layers size={22} color="#DC2626" /> Create New Habit / Subhabit
        </h2>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>
          Configure habit parameters, priority, recurrence schedule, category, tracking mode, and attachments.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TITLE INPUT */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>HABIT TITLE *</label>
            <input 
              type="text" 
              placeholder="e.g. Learning Java, Read 20 pages, Morning Jogging..."
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              required
              style={{ width: '100%', height: '44px', fontWeight: 700 }}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DESCRIPTION (OPTIONAL)</label>
            <textarea 
              placeholder="Enter task notes or background details..."
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
            />
          </div>

          {/* PRIORITY & RECURRENCE SCHEDULE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* PRIORITY SELECTOR */}
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>PRIORITY LEVEL</label>
              <select 
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
                style={{ width: '100%', height: '42px', fontWeight: 800 }}
              >
                <option value="URGENT">🔥 Urgent (Critical Priority)</option>
                <option value="HIGH">🔴 High Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="LOW">🔵 Low Priority</option>
              </select>
            </div>

            {/* RECURRENCE FREQUENCY SELECTOR */}
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>RECURRENCE FREQUENCY</label>
              <select 
                value={taskData.repeatRule}
                onChange={(e) => setTaskData(prev => ({ ...prev, repeatRule: e.target.value }))}
                style={{ width: '100%', height: '42px', fontWeight: 700 }}
              >
                <option value="DAILY">📅 Daily (Every Single Day)</option>
                <option value="EVERY_2_DAYS">⚡ Every 2 Days</option>
                <option value="EVERY_3_DAYS">⚡ Every 3 Days</option>
                <option value="INTERVAL">🔢 Custom Days Interval...</option>
                <option value="WEEKLY">📆 Weekly (Once a week)</option>
                <option value="MONTHLY">🗓️ Monthly (Once a month)</option>
                <option value="NONE">❌ One-Time Only (No Recurrence)</option>
              </select>
            </div>
          </div>

          {/* CUSTOM INTERVAL INPUT IF REPEAT RULE IS INTERVAL */}
          {taskData.repeatRule === 'INTERVAL' && (
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <label style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                REPEAT EVERY N DAYS (e.g. Every 4 days, Every 5 days)
              </label>
              <input 
                type="number"
                min="1"
                max="90"
                value={taskData.customIntervalDays}
                onChange={(e) => setTaskData(prev => ({ ...prev, customIntervalDays: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%', height: '40px', fontWeight: 800 }}
              />
            </div>
          )}

          {/* ATTACHMENT FILE UPLOAD FIELD */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Paperclip size={14} color="#DC2626" /> FILE ATTACHMENT (OPTIONAL)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', padding: '8px 14px' }}>
                <Paperclip size={14} /> Choose File...
                <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <span style={{ fontSize: '12px', color: taskData.attachmentName ? '#0F172A' : '#94A3B8', fontWeight: taskData.attachmentName ? 700 : 400 }}>
                {taskData.attachmentName ? `📎 Attached: ${taskData.attachmentName}` : 'No file attached'}
              </span>
              {taskData.attachmentName && (
                <button 
                  type="button" 
                  onClick={() => setTaskData(prev => ({ ...prev, attachmentName: '' }))}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '11px', fontWeight: 800 }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* COLLABORATOR */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Users size={14} color="#DC2626" /> COLLABORATORS / COLLAB (OPTIONAL)
            </label>
            <input 
              type="text" 
              placeholder="Enter teammate email e.g. test@gmail.com, partner@app.com"
              value={taskData.collab}
              onChange={(e) => setTaskData(prev => ({ ...prev, collab: e.target.value }))}
              style={{ width: '100%', height: '42px' }}
            />
          </div>

          {/* DURATION & REMINDER TIME */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Clock size={14} color="#DC2626" /> ESTIMATED DURATION (MINS)
              </label>
              <input 
                type="number" 
                min="5"
                step="5"
                value={taskData.estimatedMinutes}
                onChange={(e) => setTaskData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Bell size={14} color="#D97706" /> REMINDER TIME
              </label>
              <input 
                type="time" 
                value={taskData.reminderTime}
                onChange={(e) => setTaskData(prev => ({ ...prev, reminderTime: e.target.value }))}
                style={{ width: '100%', height: '42px' }}
              />
            </div>
          </div>

          {/* IS OPTIONAL TASK CHECKBOX */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              <input 
                type="checkbox"
                checked={taskData.isOptional}
                onChange={(e) => setTaskData(prev => ({ ...prev, isOptional: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              Mark Task as Optional (Does not penalize discipline completion score)
            </label>
          </div>

          {/* DAILY QUANTITATIVE PERFORMANCE MEASURE TRACKING TOGGLE */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              <input 
                type="checkbox"
                checked={taskData.hasMeasureTracking}
                onChange={(e) => setTaskData(prev => ({ ...prev, hasMeasureTracking: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <Ruler size={16} color="#2563EB" />
              Enable Daily Measure Tracking (e.g. Jogging Rounds, Pages Read, Mins)
            </label>

            {taskData.hasMeasureTracking && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px', background: '#FFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Measure Unit</label>
                  <input 
                    type="text" 
                    placeholder="e.g. rounds, pages, km, liters..." 
                    value={taskData.measureUnit}
                    onChange={(e) => setTaskData(prev => ({ ...prev, measureUnit: e.target.value }))}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', fontSize: '12px', paddingLeft: '10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Daily Target Measure</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10" 
                    value={taskData.measureTarget}
                    onChange={(e) => setTaskData(prev => ({ ...prev, measureTarget: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', fontSize: '12px', paddingLeft: '10px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* TASK TRACKING MODE SELECTOR PANEL */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} /> TASK TYPE & TRACKING MODE
            </div>

            {/* Mode Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'End Date Schedule', val: 'end_date', desc: 'Recurrence Schedule' },
                { label: 'Count of Days', val: 'count_days', desc: 'Target Days Window' },
                { label: 'Event Repetitions', val: 'count_event', desc: 'Target Quantity' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setTaskData(prev => ({ ...prev, trackingMode: m.val }))}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '12px',
                    border: taskData.trackingMode === m.val ? '2px solid #DC2626' : '1px solid #CBD5E1',
                    background: taskData.trackingMode === m.val ? 'rgba(220, 38, 38, 0.08)' : '#FFF',
                    color: taskData.trackingMode === m.val ? '#DC2626' : '#475569',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800 }}>{m.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* START DATE & END DATE PICKER */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Calendar size={13} color="#DC2626" /> START DATE
                </label>
                <input 
                  type="date" 
                  value={taskData.startDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Calendar size={13} color="#DC2626" /> END DATE
                </label>
                <input 
                  type="date" 
                  value={taskData.endDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>
            </div>

            {/* DYNAMIC WINDOW SPAN SUMMARY */}
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, background: '#FFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              Total Window: <span style={{ color: '#DC2626', fontWeight: 800 }}>{totalSpanDays} Days</span> ({taskData.startDate} to {taskData.endDate})
            </div>

            {/* DYNAMIC PARAMETER INPUT DEPENDING ON TRACKING MODE */}
            {taskData.trackingMode === 'count_days' && (
              <div>
                <label style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  TARGET NUMBER OF DAYS TO COMPLETE (within {totalSpanDays} days window)
                </label>
                <input 
                  type="number"
                  min="1"
                  max={totalSpanDays}
                  value={taskData.targetCount}
                  onChange={(e) => setTaskData(prev => ({ ...prev, targetCount: Math.min(totalSpanDays, parseInt(e.target.value) || 1) }))}
                  style={{ width: '100%', height: '40px', fontWeight: 800 }}
                />
              </div>
            )}

            {taskData.trackingMode === 'count_event' && (
              <div>
                <label style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  TARGET NUMBER OF REPETITIONS / EVENTS (e.g. 110 events)
                </label>
                <input 
                  type="number"
                  min="1"
                  value={taskData.targetCount}
                  onChange={(e) => setTaskData(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', height: '40px', fontWeight: 800 }}
                />
              </div>
            )}

            {/* Validation warning notice */}
            {validationError && (
              <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px' }}>
                <AlertCircle size={16} /> {validationError}
              </div>
            )}

          </div>

          {/* CATEGORY & SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Folder size={14} color="#DC2626" /> CATEGORY
              </label>
              
              {/* Existing Categories Dropdown + Custom Text Entry */}
              <select 
                value={taskData.category}
                onChange={(e) => {
                  if (e.target.value === 'NEW_CUSTOM') {
                    setTaskData(prev => ({ ...prev, category: '' }));
                  } else {
                    setTaskData(prev => ({ ...prev, category: e.target.value }));
                    setCategoryInput('');
                  }
                }}
                style={{ width: '100%', height: '42px', marginBottom: taskData.category === '' ? '6px' : 0 }}
              >
                {userCreatedCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="NEW_CUSTOM">+ Create Custom Category...</option>
              </select>

              {(taskData.category === '' || taskData.category === 'NEW_CUSTOM') && (
                <input 
                  type="text" 
                  placeholder="Enter new category name..."
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  style={{ width: '100%', height: '38px', fontSize: '12px', marginTop: '6px' }}
                />
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <FolderPlus size={14} color="#D97706" /> SECTION (OPTIONAL)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Backend, Frontend, Workouts"
                value={taskData.section}
                onChange={(e) => setTaskData(prev => ({ ...prev, section: e.target.value }))}
                style={{ width: '100%', height: '42px' }}
              />
            </div>
          </div>

          {/* PARENT HABIT MAPPING */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Layers size={14} color="#DC2626" /> PARENT HABIT MAPPING (OPTIONAL)
            </label>
            <select 
              value={taskData.parentTaskId}
              onChange={(e) => setTaskData(prev => ({ ...prev, parentTaskId: e.target.value }))}
              style={{ width: '100%', height: '42px' }}
            >
              <option value="">None (Independent Solo Habit)</option>
              {existingTasks.filter(t => !t.parentTaskId).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* SUBMIT ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!taskData.title.trim() || !!validationError}
            >
              <Plus size={16} /> Create Habit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// Push commit iteration 2

// Push commit iteration 19
