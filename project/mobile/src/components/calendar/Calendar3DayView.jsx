import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, AlertCircle, ChevronRight, Layers } from 'lucide-react';

export default function Calendar3DayView({ dateMap, rangeDates, onSelectDate, onSelectTask, onRescheduleTask }) {
  if (!rangeDates || rangeDates.length === 0) return null;

  // Pick 3 dates from range (first 3 or selected anchor)
  const threeDates = rangeDates.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="#2563EB" /> 3-Day Comparative Workload View
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Swipe / Inspect Side-by-Side</span>
      </div>

      {/* 3 Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {threeDates.map(dateStr => {
          const dayData = dateMap[dateStr] || {};
          const {
            dateObj,
            dayOfWeek,
            tasks = [],
            habits = [],
            deadlines = [],
            plannedWorkloadMinutes = 0,
            availableCapacityMinutes = 480,
            capacityPercent = 0,
            isOverloaded = false,
            workloadLevel = {}
          } = dayData;

          const formattedTitle = dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : dateStr;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                borderRadius: '18px',
                border: '1px solid #CBD5E1',
                borderBottom: '4px solid #94A3B8',
                borderTop: isOverloaded ? '5px solid #DC2626' : '5px solid #2563EB',
                padding: '16px',
                boxShadow: '0 8px 18px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '400px'
              }}
            >
              {/* Column Date Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{dayOfWeek}</span>
                  <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>{formattedTitle}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: isOverloaded ? '#DC2626' : '#2563EB' }}>
                    {plannedWorkloadMinutes}m ({capacityPercent}%)
                  </span>
                  <span style={{ fontSize: '9px', display: 'block', color: '#64748B', fontWeight: 700 }}>
                    {isOverloaded ? '⚠️ Overloaded' : 'Cap: 480m'}
                  </span>
                </div>
              </div>

              {/* Deadline alert if any */}
              {deadlines.length > 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                  🎯 Deadline Today ({deadlines.length})
                </div>
              )}

              {/* Tasks List for this date */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Scheduled ({tasks.length})
                </span>

                {tasks.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#F1F5F9', borderRadius: '10px', fontSize: '11px', color: '#94A3B8' }}>
                    No tasks scheduled
                  </div>
                ) : (
                  tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onSelectTask && onSelectTask(t); }}
                      style={{
                        background: t.isCompleted ? '#F0FDF4' : '#FFF',
                        border: t.isCompleted ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                        borderLeft: t.isCompleted ? '4px solid #16A34A' : '4px solid #2563EB',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: t.isCompleted ? '#15803D' : '#0F172A' }}>{t.title}</div>
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{t.category} • {t.estimatedMinutes}m</div>
                      </div>
                      {t.isCompleted ? <CheckCircle2 size={16} color="#16A34A" /> : <Circle size={16} color="#CBD5E1" />}
                    </div>
                  ))
                )}
              </div>

              {/* Habits footer */}
              {habits.length > 0 && (
                <div style={{ paddingTop: '8px', borderTop: '1px dashed #E2E8F0', fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🔥 Habits: {habits.filter(h => h.isCompleted).length}/{habits.length} Done</span>
                  <ChevronRight size={14} color="#DC2626" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
