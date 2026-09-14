import React from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Flame, AlertCircle, BookOpen, Bell, Ruler, Plus, ArrowRight } from 'lucide-react';

export default function CalendarDailyDetailPanel({ dateData, onClose, onSelectTask, onToggleTask, onRescheduleTask }) {
  if (!dateData) return null;

  const {
    date,
    dateObj,
    dayOfWeek,
    tasks = [],
    habits = [],
    deadlines = [],
    plannedWorkloadMinutes = 0,
    availableCapacityMinutes = 480,
    capacityPercent = 0,
    isOverloaded = false,
    workloadLevel = {},
    diaryInfo = {},
    todoInfo = {}
  } = dateData;

  const formattedTitle = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : date;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      display: 'flex',
      justify: 'flex-end',
      alignItems: 'stretch'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        boxShadow: '-8px 0 25px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'flex-start',
          background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Daily Inspection & Intelligence
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
              {formattedTitle}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Panel Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Workload & Capacity Card */}
          <div style={{
            background: workloadLevel.color || '#F8FAFC',
            borderRadius: '14px',
            padding: '16px',
            border: isOverloaded ? '2px solid #DC2626' : `1px solid ${workloadLevel.border || '#CBD5E1'}`,
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Daily Capacity Meter</span>
              <div style={{ fontSize: '18px', fontWeight: 900, color: isOverloaded ? '#DC2626' : '#0F172A', marginTop: '2px' }}>
                {plannedWorkloadMinutes} / {availableCapacityMinutes} min ({capacityPercent}%)
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: isOverloaded ? '#DC2626' : '#16A34A', background: '#FFF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              {isOverloaded ? '⚠️ Overloaded' : 'Optimal Pace'}
            </span>
          </div>

          {/* Hard Deadlines Section */}
          {deadlines.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: '8px' }}>
                🎯 Hard Deadlines ({deadlines.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deadlines.map((dl, idx) => (
                  <div key={idx} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{dl.task.title}</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: dl.statusObj?.color || '#DC2626', background: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>
                      {dl.statusObj?.label || 'Deadline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Tasks List */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
              Scheduled Tasks ({tasks.length})
            </div>
            {tasks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
                No tasks scheduled for this day.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask && onSelectTask(t)}
                    style={{
                      background: t.isCompleted ? '#F0FDF4' : '#F8FAFC',
                      border: t.isCompleted ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                      borderLeft: t.isCompleted ? '5px solid #16A34A' : '5px solid #2563EB',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: t.isCompleted ? '#15803D' : '#0F172A' }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>📁 {t.category || 'General'} | ⏱️ {t.estimatedMinutes}m</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={(e) => { e.stopPropagation(); onToggleTask && onToggleTask(t.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {t.isCompleted ? <CheckCircle2 size={20} color="#16A34A" /> : <Circle size={20} color="#CBD5E1" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onRescheduleTask && onRescheduleTask(t); }} style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#2563EB', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                        Move
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Habits */}
          {habits.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginBottom: '8px' }}>
                🔥 Habits Activity ({habits.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {habits.map(h => (
                  <div key={h.id} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{h.name}</span>
                    {h.isCompleted ? <CheckCircle2 size={18} color="#16A34A" /> : <Circle size={18} color="#CBD5E1" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Diary & Todo Indicators */}
          {(diaryInfo?.hasEntry || todoInfo?.count > 0) && (
            <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '14px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                🔒 Personal Device-Local Records
              </span>
              <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 700 }}>
                {diaryInfo?.hasEntry && <div>📖 Journal Entry Written on this Date</div>}
                {todoInfo?.count > 0 && <div>🔔 {todoInfo.count} Personal Reminders Due</div>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
