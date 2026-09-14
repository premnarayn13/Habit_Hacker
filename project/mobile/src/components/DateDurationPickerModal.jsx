import React, { useState } from 'react';
import { X, Calendar, Clock, RotateCcw, Globe, Check, Sun, Moon, ArrowRight } from 'lucide-react';

export default function DateDurationPickerModal({ isOpen, onClose, onSelectSchedule }) {
  const [activeTab, setActiveTab] = useState('DATE');
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatRule, setRepeatRule] = useState('None');
  const [isRepeatSheetOpen, setIsRepeatSheetOpen] = useState(false);

  if (!isOpen) return null;

  const repeatOptions = [
    { label: 'None', val: 'None' },
    { label: 'Daily', val: 'Daily' },
    { label: 'Weekly (Mon)', val: 'Weekly (Mon)' },
    { label: 'Monthly (The 20th day)', val: 'Monthly' },
    { label: 'Yearly (on 20 Aug)', val: 'Yearly' },
    { label: 'Every Weekday (Mon - Fri)', val: 'Every Weekday (Mon - Fri)' },
    { label: 'Custom...', val: 'Custom' }
  ];

  const handleConfirm = () => {
    onSelectSchedule({
      date: selectedDate,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      isAllDay,
      repeatRule
    });
    onClose();
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Drag Handle */}
        <div className="sheet-drag-handle" />

        {/* Sheet Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => setActiveTab('DATE')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'DATE' ? '3px solid #DC2626' : 'none',
                color: activeTab === 'DATE' ? '#DC2626' : '#64748B',
                fontWeight: 800,
                fontSize: '16px',
                paddingBottom: '6px',
                cursor: 'pointer'
              }}
            >
              Date
            </button>

            <button 
              onClick={() => setActiveTab('DURATION')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'DURATION' ? '3px solid #DC2626' : 'none',
                color: activeTab === 'DURATION' ? '#DC2626' : '#64748B',
                fontWeight: 800,
                fontSize: '16px',
                paddingBottom: '6px',
                cursor: 'pointer'
              }}
            >
              Duration
            </button>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick Shortcut Buttons (Image copy 11.png) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Today', icon: Calendar, sub: '20 Aug', dateVal: '2026-08-20' },
            { label: 'Tomorrow', icon: Sun, sub: '21 Aug', dateVal: '2026-08-21' },
            { label: 'Next Mon', icon: ArrowRight, sub: '24 Aug', dateVal: '2026-08-24' },
            { label: 'Evening', icon: Moon, sub: '7:00 PM', dateVal: '2026-08-20' }
          ].map((sc, i) => {
            const Icon = sc.icon;
            const isSelected = selectedDate === sc.dateVal;
            return (
              <button 
                key={i}
                onClick={() => setSelectedDate(sc.dateVal)}
                style={{
                  background: isSelected ? 'rgba(220, 38, 38, 0.08)' : '#F8FAFC',
                  border: isSelected ? '1px solid #DC2626' : '1px solid #CBD5E1',
                  color: isSelected ? '#DC2626' : '#0F172A',
                  borderRadius: '12px',
                  padding: '10px 6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Icon size={16} color={isSelected ? '#DC2626' : '#475569'} />
                <div>{sc.label}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>{sc.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Main Inputs */}
        {activeTab === 'DATE' ? (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>SELECT DATE</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>End Time</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* All Day Toggle & Recurrence Row */}
        <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>All day schedule</span>
            <input 
              type="checkbox" 
              checked={isAllDay} 
              onChange={(e) => setIsAllDay(e.target.checked)} 
            />
          </div>

          <div 
            onClick={() => setIsRepeatSheetOpen(true)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#0F172A', fontWeight: 700, cursor: 'pointer', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} color="#DC2626" /> Repeat Recurrence
            </span>
            <span style={{ color: '#DC2626' }}>{repeatRule} ›</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleConfirm}
          className="btn-primary"
          style={{ width: '100%', height: '46px', fontSize: '15px' }}
        >
          Confirm Schedule & Time
        </button>

        {/* NESTED REPEAT RECURRENCE DROP-UP SHEET (Image copy 10.png) */}
        {isRepeatSheetOpen && (
          <div className="bottom-sheet-overlay" style={{ zIndex: 1600 }} onClick={() => setIsRepeatSheetOpen(false)}>
            <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-drag-handle" />
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Repeat Recurrence</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {repeatOptions.map((opt, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setRepeatRule(opt.val);
                      setIsRepeatSheetOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: repeatRule === opt.val ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                      color: repeatRule === opt.val ? '#DC2626' : '#0F172A',
                      fontWeight: repeatRule === opt.val ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <span>{opt.label}</span>
                    {repeatRule === opt.val && <Check size={18} color="#DC2626" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
