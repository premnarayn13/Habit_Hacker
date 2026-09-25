import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Clock, Bell, Paperclip, Upload, Users, Layers, Calendar, Target, AlertTriangle } from 'lucide-react';

export default function TaskEditModal({ item, isOpen, onClose, onSaveTask, existingTasks = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'HIGH',
    trackingMode: 'end_date',
    hasMeasureTracking: false,
    measureTarget: 0,
    measureUnit: 'units',
    eventUnitName: 'units',
    eventUnitTarget: 10,
    targetCount: 50,
    repeatRule: 'DAILY',
    customIntervalDays: 2,
    collab: '',
    isOptional: false,
    estimatedMinutes: 60,
    reminderTime: '09:00',
    plannedStart: '2026-08-21',
    plannedEnd: '2026-08-28',
    deadline: '2026-08-28',
    progressPercent: 0,
    attachmentName: '',
    parentTaskId: ''
  });

  useEffect(() => {
    if (item) {
      const mode = item.trackingMode || (item.hasMeasureTracking ? 'count_days' : 'end_date');
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'General',
        priority: item.priority || 'HIGH',
        trackingMode: mode,
        hasMeasureTracking: mode === 'count_days',
        measureTarget: item.measureTarget || 0,
        measureUnit: item.measureUnit || 'units',
        eventUnitName: item.eventUnitName || item.measureUnit || 'units',
        eventUnitTarget: item.eventUnitTarget || item.measureTarget || 10,
        targetCount: item.targetCount || item.targetDayCount || item.targetEventCount || 50,
        repeatRule: item.repeatRule || 'DAILY',
        customIntervalDays: item.customIntervalDays || 2,
        collab: item.collab || '',
        isOptional: !!item.isOptional,
        estimatedMinutes: item.estimatedMinutes || 60,
        reminderTime: item.reminderTime || '09:00',
        plannedStart: item.plannedStart || item.startDate || new Date().toISOString().split('T')[0],
        plannedEnd: item.plannedEnd || item.endDate || new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0],
        deadline: item.deadline || item.plannedEnd || '',
        progressPercent: item.progressPercent || 0,
        attachmentName: item.attachmentName || '',
        parentTaskId: item.parentTaskId || item.parentId || ''
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 50;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 50;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalSpanDays = calculateSpanDays(formData.plannedStart, formData.plannedEnd);

  const parentTask = existingTasks.find(t => t.id === formData.parentTaskId);
  const isParentStandardType1 = parentTask && (parentTask.trackingMode === 'end_date' && !parentTask.hasMeasureTracking);

  let validationError = '';
  if (totalSpanDays <= 0) {
    validationError = 'End Date must be greater than or equal to Start Date.';
  } else if (isParentStandardType1 && (formData.trackingMode !== 'end_date' || formData.hasMeasureTracking)) {
    validationError = 'Parent habit is a Standard (non-measure) habit. Subhabits under a Standard habit must also be Standard habits.';
  } else if (formData.trackingMode === 'count_days') {
    const target = parseInt(formData.targetCount) || 1;
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
      setFormData(prev => ({ 
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
    if (validationError) return;

    const isMeasurable = formData.trackingMode === 'count_days';
    const isEventCount = formData.trackingMode === 'count_event';

    const updatedData = {
      ...formData,
      hasMeasureTracking: isMeasurable,
      measureTarget: isMeasurable ? Number(formData.measureTarget || 0) : 0,
      measureUnit: isMeasurable ? (formData.measureUnit || 'units') : (isEventCount ? (formData.eventUnitName || 'units') : ''),
      plannedStart: formData.plannedStart,
      plannedEnd: formData.plannedEnd,
      deadline: formData.plannedEnd,
      targetCount: isMeasurable || isEventCount ? (parseInt(formData.targetCount) || 50) : totalSpanDays,
      targetDayCount: isMeasurable ? (parseInt(formData.targetCount) || totalSpanDays) : null,
      targetEventCount: isEventCount ? (parseInt(formData.targetCount) || 10) : null,
      repeatRule: formData.trackingMode === 'end_date' ? formData.repeatRule : 'DAILY'
    };

    onSaveTask(item.id, updatedData);
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
      zIndex: 1400,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '26px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>Edit Habit Details</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Modify title, priority, date window, habit type, recurrence schedule, or collaborators.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TITLE */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>TITLE *</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', fontWeight: 700 }}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          {/* 1. PRIORITY LEVEL */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>PRIORITY LEVEL</label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              style={{ width: '100%', height: '42px', fontWeight: 800 }}
            >
              <option value="URGENT">Urgent (Critical Priority)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* 2. START DATE & END DATE (IMMEDIATELY AFTER PRIORITY) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Calendar size={13} color="#DC2626" /> START DATE
              </label>
              <input 
                type="date" 
                value={formData.plannedStart}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedStart: e.target.value }))}
                style={{ width: '100%', height: '40px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Calendar size={13} color="#DC2626" /> END DATE
              </label>
              <input 
                type="date" 
                value={formData.plannedEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedEnd: e.target.value }))}
                style={{ width: '100%', height: '40px' }}
                required
              />
            </div>
          </div>

          {/* 3. TOTAL WINDOW SIZE (DISPLAYED SEPARATELY UNDER START & END DATE) */}
          <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Total Window Span:</span>
            <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '13px' }}>
              {totalSpanDays} Days <span style={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>({formData.plannedStart} to {formData.plannedEnd})</span>
            </span>
          </div>

          {/* PARENT TYPE RESTRICTION NOTICE IF PARENT IS TYPE-1 */}
          {isParentStandardType1 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="#D97706" />
              Standard Parent Habit: Subhabits under a Standard habit must also be Standard habits (measure tracking cannot roll into a non-measure parent).
            </div>
          )}

          {/* 4. HABIT TYPE & TRACKING MODE SELECTOR */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} /> HABIT TYPE
            </div>

            {/* 3 Habit Type Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { 
                  label: 'Type 1: Standard Habit', 
                  val: 'end_date', 
                  desc: 'Scheduled / Frequency Driven',
                  disabled: false 
                },
                { 
                  label: 'Type 2: Measurable Habit', 
                  val: 'count_days', 
                  desc: 'Quantitative Daily / Target Measure',
                  disabled: Boolean(isParentStandardType1) 
                },
                { 
                  label: 'Type 3: Event Count Habit', 
                  val: 'count_event', 
                  desc: 'Cycle / Repetitions Across Days',
                  disabled: Boolean(isParentStandardType1) 
                }
              ].map((m) => {
                const isSelected = formData.trackingMode === m.val;
                return (
                  <button
                    key={m.val}
                    type="button"
                    disabled={m.disabled}
                    onClick={() => {
                      if (m.disabled) return;
                      setFormData(prev => ({ 
                        ...prev, 
                        trackingMode: m.val,
                        hasMeasureTracking: m.val === 'count_days'
                      }));
                    }}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #DC2626' : '1px solid #CBD5E1',
                      background: m.disabled ? '#F1F5F9' : (isSelected ? 'rgba(220, 38, 38, 0.08)' : '#FFF'),
                      color: m.disabled ? '#94A3B8' : (isSelected ? '#DC2626' : '#475569'),
                      textAlign: 'center',
                      cursor: m.disabled ? 'not-allowed' : 'pointer',
                      opacity: m.disabled ? 0.6 : 1
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>{m.label}</div>
                    <div style={{ fontSize: '9px', color: '#64748B', marginTop: '2px' }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* SUB-SECTION A: FREQUENCY (ONLY FOR TYPE-1 ALONE!) */}
            {formData.trackingMode === 'end_date' && (
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  RECURRENCE FREQUENCY (SCHEDULE)
                </label>
                <select 
                  value={formData.repeatRule}
                  onChange={(e) => setFormData(prev => ({ ...prev, repeatRule: e.target.value }))}
                  style={{ width: '100%', height: '40px', fontWeight: 700 }}
                >
                  <option value="DAILY">Daily (Every Single Day)</option>
                  <option value="EVERY_2_DAYS">Every 2 Days</option>
                  <option value="EVERY_3_DAYS">Every 3 Days</option>
                  <option value="INTERVAL">Custom Days Interval...</option>
                  <option value="WEEKLY">Weekly (Once a week)</option>
                  <option value="MONTHLY">Monthly (Once a month)</option>
                  <option value="NONE">One-Time Only (No Recurrence)</option>
                </select>

                {formData.repeatRule === 'INTERVAL' && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#0F172A', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      Repeat Every N Days (e.g. 4 days, 5 days)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="90"
                      value={formData.customIntervalDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, customIntervalDays: parseInt(e.target.value) || 1 }))}
                      style={{ width: '100%', height: '38px', fontWeight: 800 }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* SUB-SECTION B: TYPE-2 MEASURABLE INPUTS */}
            {formData.trackingMode === 'count_days' && (
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                  MEASURABLE QUANTITATIVE TARGET
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      DAILY TARGET MEASURE
                    </label>
                    <input 
                      type="number"
                      step="any"
                      min="0.1"
                      value={formData.measureTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, measureTarget: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', height: '38px', fontWeight: 800 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      MEASURE UNIT (e.g. km, pages, mins)
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. km, pages, reps"
                      value={formData.measureUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, measureUnit: e.target.value }))}
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    TARGET NUMBER OF DAYS TO COMPLETE (Within Window)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max={totalSpanDays}
                    value={formData.targetCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                    style={{ width: '100%', height: '38px', fontWeight: 800 }}
                  />
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                    Days required out of {totalSpanDays} days window. Frequency is not used for measurable habits.
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION C: TYPE-3 EVENT COUNT INPUTS */}
            {formData.trackingMode === 'count_event' && (
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                  EVENT REPETITIONS & CYCLE TARGET
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      TOTAL EVENT REPETITIONS
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={formData.targetCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                      style={{ width: '100%', height: '38px', fontWeight: 800 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      EVENT UNIT NAME
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. workouts, sessions, cycles"
                      value={formData.eventUnitName}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventUnitName: e.target.value }))}
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    TARGET MEASURE PER EVENT
                  </label>
                  <input 
                    type="number"
                    step="any"
                    min="1"
                    value={formData.eventUnitTarget || formData.measureTarget || 10}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventUnitTarget: parseFloat(e.target.value) || 10, measureTarget: parseFloat(e.target.value) || 10 }))}
                    style={{ width: '100%', height: '38px', fontWeight: 800 }}
                  />
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                    Works across days. Completing mandatory child tasks completes 1 event count and resets cycle measure back to zero.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* COLLABORATOR */}
          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Users size={14} color="#DC2626" /> COLLABORATORS / COLLAB EMAIL
            </label>
            <input 
              type="text" 
              placeholder="e.g. test@gmail.com"
              value={formData.collab}
              onChange={(e) => setFormData(prev => ({ ...prev, collab: e.target.value }))}
              style={{ width: '100%', height: '42px' }}
            />
          </div>

          {/* DURATION & REMINDER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Clock size={14} color="#DC2626" /> DURATION (MINS)
              </label>
              <input 
                type="number" 
                min="5"
                step="5"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Bell size={14} color="#D97706" /> REMINDER TIME
              </label>
              <input 
                type="time" 
                value={formData.reminderTime}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* FILE UPLOAD ATTACHMENT */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '12px' }}>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Upload size={14} color="#DC2626" /> FILE ATTACHMENT
            </label>
            <input 
              type="file" 
              onChange={handleFileUpload}
              style={{ width: '100%', background: '#FFF', padding: '6px' }}
            />
            {formData.attachmentName && (
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Paperclip size={13} /> Attached File: {formData.attachmentName}
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, attachmentName: '' }))}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '11px', fontWeight: 800, marginLeft: 'auto' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* IS OPTIONAL CHECKBOX */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            <input 
              type="checkbox"
              checked={formData.isOptional}
              onChange={(e) => setFormData(prev => ({ ...prev, isOptional: e.target.checked }))}
              style={{ width: '18px', height: '18px' }}
            />
            Mark as Optional Task (No discipline completion penalty)
          </label>

          {/* VALIDATION ERROR BANNER */}
          {validationError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
              {validationError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={Boolean(validationError)}>
              <Save size={16} /> Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}


