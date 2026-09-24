import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Circle, AlertCircle, ChevronRight } from 'lucide-react';

export default function CalendarWeekView({ dateMap, rangeDates, onSelectDate, onSelectTask }) {
  if (!rangeDates || rangeDates.length === 0) return null;

  // Pick 7 dates (Monday-Sunday)
  const weekDates = rangeDates.slice(0, 7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="#2563EB" /> Monday–Sunday 7-Day Weekly Grid
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Weekly Workload & Capacity Pipeline</span>
      </div>

      {/* 7-Day Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {weekDates.map(dateStr => {
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

          const dayNumber = dateObj ? dateObj.getDate() : '';

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              style={{
                background: workloadLevel.color || '#FFF',
                borderRadius: '14px',
                border: isOverloaded ? '2px solid #DC2626' : `1px solid ${workloadLevel.border || '#CBD5E1'}`,
                borderBottom: '4px solid #94A3B8',
                padding: '12px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                minHeight: '260px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{dayOfWeek}</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>{dayNumber}</span>
                </div>

                {/* Capacity utilization meter */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 800, color: '#475569' }}>
                    <span>{plannedWorkloadMinutes}m</span>
                    <span>{capacityPercent}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                    <div style={{ width: `${Math.min(100, capacityPercent)}%`, height: '100%', background: isOverloaded ? '#DC2626' : '#2563EB' }} />
                  </div>
                </div>

                {/* Deadlines indicator */}
                {deadlines.length > 0 && (
                  <div style={{ background: '#DC2626', color: '#FFF', fontSize: '9px', fontWeight: 800, padding: '2px 4px', borderRadius: '4px', textAlign: 'center', marginBottom: '6px' }}>
                    Deadline ({deadlines.length})
                  </div>
                )}

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {tasks.slice(0, 3).map(t => (
                    <div
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onSelectTask && onSelectTask(t); }}
                      style={{
                        background: '#FFF',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: t.isCompleted ? '#15803D' : '#0F172A',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {t.isCompleted ? '✓ ' : ''}{t.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 800 }}>+{tasks.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Bottom stats summary */}
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#475569', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                {tasks.filter(t => t.isCompleted).length}/{tasks.length} Completed
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
