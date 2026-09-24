import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, ArrowRight, Save } from 'lucide-react';

export default function CalendarRescheduleModal({ task, isOpen, onClose, onSaveReschedule }) {
  if (!isOpen || !task) return null;

  const [newStartDate, setNewStartDate] = useState(task.plannedStart || new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(task.plannedEnd || task.plannedStart || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStartDate) return;
    onSaveReschedule(task.id, newStartDate, newEndDate || newStartDate);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '2px solid #DC2626',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={20} color="#DC2626" /> Reschedule Task
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{task.title}</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{task.category || 'General'} | {task.estimatedMinutes || 30} mins</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>New Start Date</label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>New End Date</label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '16px', background: '#EFF6FF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
          ℹ️ Rescheduling updates the planned execution window. Hard deadlines and historical completion logs will remain intact.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', padding: '8px 14px' }}>
            Cancel
          </button>
          <button type="submit" style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
