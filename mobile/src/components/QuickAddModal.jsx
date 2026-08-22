import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  Trash2, 
  AlertCircle, 
  RotateCcw, 
  Target, 
  Shield, 
  Archive,
  Users,
  Paperclip,
  FolderPlus,
  CornerDownRight,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Upload
} from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose, onAddTask, existingTasks = [], preselectedParentTaskId = '' }) {
  const existingCategories = ['Education', 'Career', 'Coding', 'Health', 'Personal', 'Fitness', 'Shopping', 'Learning', 'Work'];

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureDateStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const initialTaskState = {
    title: '',
    description: '',
    collab: '',
    category: 'Education',
    section: 'General',
    tags: '',
    priority: 'HIGH',
    isOptional: false,
    estimatedMinutes: 60,
    reminderTime: '09:00',
    startDate: getTodayStr(),
    endDate: getFutureDateStr(49),
    trackingMode: 'end_date',
    targetCount: 45,
    repeatRule: 'DAILY',
    parentTaskId: preselectedParentTaskId || '',
    attachmentName: ''
  };

  const [taskData, setTaskData] = useState(initialTaskState);
  const [categoryInput, setCategoryInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        ...initialTaskState,
        startDate: getTodayStr(),
        endDate: getFutureDateStr(49),
        parentTaskId: preselectedParentTaskId || ''
      });
      setCategoryInput('');
    }
  }, [isOpen, preselectedParentTaskId]);

  if (!isOpen) return null;

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 0;
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
    if (file) {
      setTaskData(prev => ({ ...prev, attachmentName: file.name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim() || validationError) return;

    const finalCategory = categoryInput.trim() || taskData.category;

    onAddTask({
      ...taskData,
      category: finalCategory,
      plannedStart: taskData.startDate,
      plannedEnd: taskData.endDate,
      targetDayCount: taskData.trackingMode === 'count_days' ? parseInt(taskData.targetCount) || 1 : null,
      targetEventCount: taskData.trackingMode === 'count_event' ? parseInt(taskData.targetCount) || 1 : null
    });
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

        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
          {taskData.parentTaskId ? 'Create Full Child Subtask Entity' : 'Create New Task Card'}
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          {taskData.parentTaskId 
            ? 'Child subtasks are full-fledged task entities with dates, tracking goals, reminders, and attachments.' 
            : 'Configure dates, tracking goals, reminders, file upload attachment, and collaborators.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* TASK NAME */}
          <div>
            <label style={{ fontSize: '12px', color: '#DC2626', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
              {taskData.parentTaskId ? 'SUBTASK NAME (REQUIRED)' : 'TASK NAME (REQUIRED)'}
            </label>
            <input 
              type="text" 
              placeholder={taskData.parentTaskId ? "e.g. Build Data Flow Diagram" : "e.g. Read 10 Pages of Machine Learning Book"}
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', height: '44px' }}
              required
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

          {/* COLLABORATOR */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Users size={14} color="#DC2626" /> COLLABORATORS / COLLAB (OPTIONAL)
            </label>
            <input 
              type="text" 
              placeholder="e.g. prem@example.com, team@habithacker.com"
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

            {/* START & END DATE INPUTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Start Date</label>
                <input 
                  type="date" 
                  value={taskData.startDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', height: '40px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>End Date</label>
                <input 
                  type="date" 
                  value={taskData.endDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', height: '40px' }}
                  required
                />
              </div>
            </div>

            {/* GLOBAL REAL-TIME DURATION SPAN BANNER */}
            <div style={{
              background: totalSpanDays > 0 ? 'rgba(37, 99, 235, 0.08)' : 'rgba(220, 38, 38, 0.08)',
              border: totalSpanDays > 0 ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
              color: totalSpanDays > 0 ? '#1D4ED8' : '#DC2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Total Window Duration:
              </span>
              <span>{totalSpanDays > 0 ? `${totalSpanDays} Days` : 'Invalid Date Range'}</span>
            </div>

            {/* MODE-SPECIFIC FIELDS & VALIDATIONS */}

            {/* Mode 1: End Date-Based Task */}
            {taskData.trackingMode === 'end_date' && (
              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  RECURRENCE OPTIONS
                </label>
                <select 
                  value={taskData.repeatRule}
                  onChange={(e) => setTaskData(prev => ({ ...prev, repeatRule: e.target.value }))}
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="DAILY">Daily (Default)</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="EVERY_MONDAY">Every Monday</option>
                  <option value="EVERY_TUESDAY">Every Tuesday</option>
                  <option value="EVERY_2_DAYS">Custom (Every 2 Days)</option>
                </select>
              </div>
            )}

            {/* Mode 2: Count of Days Task */}
            {taskData.trackingMode === 'count_days' && (
              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                  Target Successful Days Count (e.g., 45 days out of {totalSpanDays > 0 ? totalSpanDays : '--'} window days)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={taskData.targetCount}
                  onChange={(e) => setTaskData(prev => ({ ...prev, targetCount: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', height: '40px' }}
                  required
                />
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Note: Recurrence settings are hidden as tracking decrements on each successful day check-in.
                </p>
              </div>
            )}

            {/* Mode 3: Event Count Task */}
            {taskData.trackingMode === 'count_event' && (
              <div>
                <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                  Total Target Event Quantity / Repetitions (e.g., 50 Total Repetitions)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={taskData.targetCount}
                  onChange={(e) => setTaskData(prev => ({ ...prev, targetCount: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', height: '40px' }}
                  required
                />
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Note: Log anytime (e.g. 2x today, 0x tomorrow, 3x next day).
                </p>
              </div>
            )}

            {/* RED INLINE VALIDATION ERROR BOX */}
            {validationError && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{validationError}</span>
              </div>
            )}

          </div>

          {/* CATEGORY & PRIORITY */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                CATEGORY / SECTION (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Education, Fitness"
                value={categoryInput || taskData.category}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  setTaskData(prev => ({ ...prev, category: e.target.value }));
                }}
                style={{ width: '100%', height: '40px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                PRIORITY (Optional)
              </label>
              <select 
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
                style={{ width: '100%', height: '40px' }}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* PARENT TASK LINKING & FILE UPLOAD */}
          <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CornerDownRight size={14} color="#DC2626" /> PARENT TASK LINKING (OPTIONAL)
              </label>
              <select
                value={taskData.parentTaskId}
                onChange={(e) => setTaskData(prev => ({ ...prev, parentTaskId: e.target.value }))}
                style={{ width: '100%', marginTop: '4px', height: '40px', background: '#FFF' }}
              >
                <option value="">-- Standalone Task Card --</option>
                {existingTasks.map(t => (
                  <option key={t.id} value={t.id}>Child Subtask of: {t.title}</option>
                ))}
              </select>
            </div>

            {/* FILE UPLOAD INPUT */}
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Upload size={14} color="#DC2626" /> FILE UPLOAD ATTACHMENT (OPTIONAL)
              </label>
              <input 
                type="file" 
                onChange={handleFileUpload}
                style={{ width: '100%', background: '#FFF', padding: '6px' }}
              />
              {taskData.attachmentName && (
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Paperclip size={13} /> Attached File: {taskData.attachmentName}
                </div>
              )}
            </div>
          </div>

          {/* Form Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!!validationError}
              style={{ opacity: validationError ? 0.5 : 1, cursor: validationError ? 'not-allowed' : 'pointer' }}
            >
              <Plus size={16} /> {taskData.parentTaskId ? 'Create Child Subtask' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
