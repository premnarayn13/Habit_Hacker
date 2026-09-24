import React from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, Circle, Flame, AlertCircle, Layers, BookOpen, Bell, Ruler, ShieldCheck } from 'lucide-react';

export default function CalendarDayView({ dateData, onSelectTask, onToggleTask, onRescheduleTask }) {
  if (!dateData) return null;

  const {
    date,
    dateObj,
    tasks = [],
    habits = [],
    deadlines = [],
    plannedWorkloadMinutes,
    availableCapacityMinutes,
    capacityPercent,
    isOverloaded,
    workloadLevel,
    diaryInfo,
    todoInfo
  } = dateData;

  const formattedDate = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : date;

  // 24-Hour Timeline Grid slots (8:00 AM to 10:00 PM)
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Day Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '20px 24px',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: isOverloaded ? '6px solid #DC2626' : '6px solid #16A34A',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Day View Schedule Breakdown
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
            {formattedDate}
          </h2>
        </div>

        {/* Capacity & Workload Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: workloadLevel.color, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${workloadLevel.border}` }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block' }}>Daily Workload</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: isOverloaded ? '#DC2626' : '#0F172A' }}>
              {plannedWorkloadMinutes} / {availableCapacityMinutes} min ({capacityPercent}%)
            </span>
          </div>

          {/* Local Privacy Metadata Indicators */}
          {(diaryInfo?.hasEntry || todoInfo?.count > 0) && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {diaryInfo?.hasEntry && (
                <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={13} /> Local Journal Present
                </span>
              )}
              {todoInfo?.count > 0 && (
                <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #7DD3FC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bell size={13} /> {todoInfo.count} Reminders
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deadlines Alert Banner */}
      {deadlines.length > 0 && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderLeft: '6px solid #DC2626', borderRadius: '14px', padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <AlertCircle size={16} /> Hard Deadlines Falling on this Date ({deadlines.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {deadlines.map((dl, idx) => (
              <div key={idx} style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{dl.task.title}</span>
                <span style={{ fontSize: '11px', color: dl.statusObj?.color || '#DC2626', fontWeight: 800, background: '#FFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  {dl.statusObj?.label || 'Deadline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 24-Hour Chronological Timeline */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #CBD5E1', borderBottom: '4px solid #94A3B8', padding: '20px', boxShadow: '0 8px 18px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#2563EB" /> Chronological Timeline & Scheduled Tasks ({tasks.length})
        </h3>

        {tasks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
            <CalendarIcon size={32} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>No tasks scheduled for this day</p>
            <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Click "Reschedule" or add new tasks to populate your daily timeline.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {HOURS.map(hour => {
              const hourLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
              // Match tasks for this hour or group unassigned tasks in morning/afternoon slots
              const hourTasks = tasks.filter((t, idx) => (idx % HOURS.length) === (hour - 8));

              return (
                <div key={hour} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ width: '70px', fontSize: '11px', fontWeight: 800, color: '#64748B', paddingTop: '4px' }}>
                    {hourLabel}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hourTasks.length === 0 ? (
                      <div style={{ height: '24px', borderLeft: '2px dashed #E2E8F0', paddingLeft: '8px', fontSize: '11px', color: '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                        Free Time Slot
                      </div>
                    ) : (
                      hourTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask && onSelectTask(t)}
                          style={{
                            backgroundColor: t.isCompleted ? '#F0FDF4' : '#F8FAFC',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            border: t.isCompleted ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                            borderLeft: t.isCompleted ? '5px solid #16A34A' : '5px solid #2563EB',
                            cursor: 'pointer',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: t.isCompleted ? '#15803D' : '#0F172A' }}>
                              {t.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{t.category || 'General'}</span>
                              <span>{t.estimatedMinutes} mins</span>
                              {t.trackingMode && <span>Mode: {t.trackingMode}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: t.isCompleted ? '#16A34A' : '#D97706', background: '#FFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                              {t.isCompleted ? 'Completed' : 'Scheduled'}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); onRescheduleTask && onRescheduleTask(t); }}
                              style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#2563EB', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Habits Section */}
      {habits.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #CBD5E1', borderBottom: '4px solid #94A3B8', borderLeft: '6px solid #DC2626', padding: '20px', boxShadow: '0 8px 18px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="#DC2626" /> Daily Habits Activity ({habits.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {habits.map(h => (
              <div key={h.id} style={{ background: h.isCompleted ? '#F0FDF4' : '#FFF7ED', border: h.isCompleted ? '1px solid #86EFAC' : '1px solid #FED7AA', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{h.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Target: {h.targetValue || 1} {h.unit || 'time'}</div>
                </div>
                {h.isCompleted ? <CheckCircle2 size={20} color="#16A34A" /> : <Circle size={20} color="#CBD5E1" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
