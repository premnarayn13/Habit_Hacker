import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Clock, Bell, Paperclip, Upload, Users, Layers } from 'lucide-react';

export default function TaskEditModal({ item, isOpen, onClose, onSaveTask }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'HIGH',
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
    attachmentName: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'General',
        priority: item.priority || 'HIGH',
        repeatRule: item.repeatRule || 'DAILY',
        customIntervalDays: item.customIntervalDays || 2,
        collab: item.collab || '',
        isOptional: !!item.isOptional,
        estimatedMinutes: item.estimatedMinutes || 60,
        reminderTime: item.reminderTime || '09:00',
        plannedStart: item.plannedStart || '',
        plannedEnd: item.plannedEnd || '',
        deadline: item.deadline || '',
        progressPercent: item.progressPercent || 0,
        attachmentName: item.attachmentName || ''
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

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
    onSaveTask(item.id, formData);
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '26px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>Edit Task Details</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Modify title, priority, recurrence, duration, collaborators, or attachments.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
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

          <div>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          {/* PRIORITY & RECURRENCE SCHEDULE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>RECURRENCE FREQUENCY</label>
              <select 
                value={formData.repeatRule}
                onChange={(e) => setFormData(prev => ({ ...prev, repeatRule: e.target.value }))}
                style={{ width: '100%', height: '42px', fontWeight: 700 }}
              >
                <option value="DAILY">Daily (Every Single Day)</option>
                <option value="EVERY_2_DAYS">Every 2 Days</option>
                <option value="EVERY_3_DAYS">Every 3 Days</option>
                <option value="INTERVAL">Custom Days Interval...</option>
                <option value="WEEKLY">Weekly (Once a week)</option>
                <option value="MONTHLY">Monthly (Once a month)</option>
                <option value="NONE">One-Time Only (No Recurrence)</option>
              </select>
            </div>
          </div>

          {formData.repeatRule === 'INTERVAL' && (
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <label style={{ fontSize: '12px', color: '#0F172A', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                REPEAT EVERY N DAYS (e.g. Every 4 days, Every 5 days)
              </label>
              <input 
                type="number"
                min="1"
                max="90"
                value={formData.customIntervalDays}
                onChange={(e) => setFormData(prev => ({ ...prev, customIntervalDays: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%', height: '40px', fontWeight: 800 }}
              />
            </div>
          )}

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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Save Changes</button>
          </div>

        </form>

      </div>
    </div>
  );
}

