import React, { useState, useEffect } from 'react';
import { X, Ruler, Save } from 'lucide-react';

export default function TodayMeasureEditModal({ isOpen, task, onClose, onSaveMeasure }) {
  const [measureVal, setMeasureVal] = useState('');

  useEffect(() => {
    if (task) {
      setMeasureVal(task.loggedMeasureVal !== undefined ? task.loggedMeasureVal : (task.measureTarget || 0));
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(measureVal);
    if (isNaN(num) || num < 0) return;
    onSaveMeasure(task.id, num);
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
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#EC489915', padding: '8px', borderRadius: '12px' }}>
              <Ruler size={20} color="#EC4899" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Edit Logged Measure
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                {task.title}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Completed Measure ({task.measureUnit || 'units'})
            </label>
            <input 
              type="number"
              step="any"
              min="0"
              value={measureVal}
              onChange={(e) => setMeasureVal(e.target.value)}
              placeholder="e.g. 8"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '16px',
                fontWeight: 800,
                color: '#0F172A',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              autoFocus
            />
            <span style={{ fontSize: '10px', color: '#64748B', marginTop: '6px', display: 'block', fontWeight: 600 }}>
              Target benchmark: {task.measureTarget || 0} {task.measureUnit || 'units'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: '#FFF',
                color: '#475569',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#EA580C',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}
            >
              <Save size={14} /> Save Measure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
