import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Paperclip, 
  Tag, 
  Layers, 
  Hash, 
  MessageSquare,
  BarChart2,
  Grid
} from 'lucide-react';

export default function TaskDetailModal({ item, subtasks, isOpen, onClose, onEditItem, onLogSkipReason, onOpenDatePicker }) {
  const [skipReason, setSkipReason] = useState(item?.skipReason || '');
  const [skipLogged, setSkipLogged] = useState(false);

  if (!isOpen || !item) return null;

  const itemSubtasks = subtasks ? subtasks.filter(s => s.parentTaskId === item.id) : [];

  const handleSaveSkipReason = () => {
    if (!skipReason) return;
    onLogSkipReason(item.id, skipReason);
    setSkipLogged(true);
    setTimeout(() => setSkipLogged(false), 2500);
  };

  const taskHistoryDays = Array.from({ length: 14 }).map((_, idx) => {
    const dayNum = 19 - idx;
    const isDone = idx === 0 || idx === 2 || idx === 3 || idx === 5 || idx === 6 || idx === 8;
    const isMissed = idx === 1 || idx === 4;
    return {
      date: `Aug ${dayNum}`,
      status: isDone ? 'done' : isMissed ? 'missed' : 'pending'
    };
  });

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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge badge-${item.priority ? item.priority.toLowerCase() : 'medium'}`}>{item.priority || 'MEDIUM'}</span>
              {item.isOptional && <span className="badge badge-optional">Optional</span>}
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>📁 {item.category || 'General'}</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>{item.title}</h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => onOpenDatePicker(item)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#DC2626' }}
            >
              <Calendar size={14} /> Date / Duration Drop-Up
            </button>

            <button 
              onClick={() => onEditItem(item)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Edit3 size={14} /> Edit Task
            </button>
            
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Task Metadata Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PLANNED DATES</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
              📅 {item.plannedStart || '2026-08-21'} → {item.plannedEnd || '2026-08-21'}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>FINAL DEADLINE</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginTop: '2px' }}>
              ⚠️ {item.deadline || '2026-08-28'}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TIME & DURATION</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
              ⏱️ Est: {item.estimatedMinutes || 60}m | Act: {item.actualMinutes || 0}m
            </div>
          </div>
        </div>

        {/* TASK-SPECIFIC CALENDAR & HEATMAP MATRIX */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px', borderRadius: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Grid size={16} color="#DC2626" /> Task-Specific History Heatmap & Calendar
            </h4>
            <span style={{ fontSize: '11px', color: '#64748B' }}>14 Days Activity Matrix</span>
          </div>

          <div className="task-heatmap-grid">
            {taskHistoryDays.map((d, i) => (
              <div 
                key={i} 
                className={`task-heatmap-cell ${d.status}`}
                title={`${d.date}: ${d.status.toUpperCase()}`}
              >
                {d.date.replace('Aug ', '')}
              </div>
            ))}
          </div>
        </div>

        {/* REASON LOGGER */}
        <div style={{ background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#D97706', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} color="#D97706" /> Log Skip Reason (If Uncompleted / Skipped)
          </h4>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              style={{ flex: 1, background: '#FFF' }}
            >
              <option value="">Select reason for not completing...</option>
              <option value="Lack of Time / Overplanned">Lack of Time / Overplanned</option>
              <option value="Felt Unwell / Low Energy">Felt Unwell / Low Energy</option>
              <option value="External Blocker / Interruption">External Blocker / Interruption</option>
              <option value="Rescheduled to Later Date">Rescheduled to Later Date</option>
              <option value="Task no longer required">Task no longer required</option>
            </select>

            <button 
              onClick={handleSaveSkipReason}
              style={{ background: '#D97706', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              {skipLogged ? 'Logged!' : 'Save Reason'}
            </button>
          </div>
        </div>

        {/* Subtasks List */}
        {itemSubtasks.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Child Subtasks ({itemSubtasks.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {itemSubtasks.map(s => (
                <div key={s.id} style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{s.title}</span>
                  {s.isOptional && <span className="badge badge-optional">Optional</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
