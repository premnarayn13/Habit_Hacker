import React from 'react';
import { Calendar as CalendarIcon, AlertCircle, BookOpen, Bell, Flame } from 'lucide-react';

export default function CalendarMonthView({ dateMap, currentDate, onSelectDate }) {
  const currentMonthDate = currentDate ? new Date(currentDate) : new Date();
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Month Bounds
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Grid Cells Construction
  const cells = [];
  
  // Previous month padding
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push({ isPadding: true, key: `prev-${i}` });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dateMap[dStr] || {
      date: dStr,
      tasks: [],
      habits: [],
      deadlines: [],
      plannedWorkloadMinutes: 0,
      capacityPercent: 0,
      workloadLevel: { color: '#FFF', border: '#CBD5E1' }
    };
    cells.push({ isPadding: false, dayNumber: day, dateStr: dStr, data: dayData, key: dStr });
  }

  // Next month padding to complete grid
  while (cells.length % 7 !== 0) {
    cells.push({ isPadding: true, key: `next-${cells.length}` });
  }

  const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={20} color="#DC2626" /> {monthName} Calendar Grid
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>5-Level Workload Heatmap Active</span>
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        padding: '16px',
        boxShadow: '0 8px 18px rgba(0,0,0,0.03)'
      }}>
        {/* Weekday Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px', textAlign: 'center' }}>
          {WEEKDAY_HEADERS.map(w => (
            <div key={w} style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', padding: '4px 0' }}>
              {w}
            </div>
          ))}
        </div>

        {/* 35/42 Cell Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {cells.map(cell => {
            if (cell.isPadding) {
              return <div key={cell.key} style={{ minHeight: '85px', background: '#F8FAFC', borderRadius: '10px', opacity: 0.4 }} />;
            }

            const { data, dayNumber, dateStr } = cell;
            const {
              tasks = [],
              habits = [],
              deadlines = [],
              plannedWorkloadMinutes = 0,
              capacityPercent = 0,
              isOverloaded = false,
              workloadLevel = {},
              diaryInfo = {},
              todoInfo = {}
            } = data;

            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const completedCount = tasks.filter(t => t.isCompleted).length;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate && onSelectDate(dateStr)}
                style={{
                  minHeight: '85px',
                  background: isToday ? '#FEF2F2' : (workloadLevel.color || '#FFF'),
                  borderRadius: '12px',
                  border: isToday ? '2px solid #DC2626' : (isOverloaded ? '2px solid #DC2626' : `1px solid ${workloadLevel.border || '#CBD5E1'}`),
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  position: 'relative',
                  transition: 'transform 0.1s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: isToday ? '#DC2626' : '#0F172A' }}>
                      {dayNumber}
                    </span>
                    {tasks.length > 0 && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: isOverloaded ? '#DC2626' : '#2563EB' }}>
                        {plannedWorkloadMinutes}m
                      </span>
                    )}
                  </div>

                  {/* Compact Badges */}
                  {deadlines.length > 0 && (
                    <div style={{ fontSize: '8px', fontWeight: 900, background: '#DC2626', color: '#FFF', padding: '1px 3px', borderRadius: '4px', marginBottom: '2px', textAlign: 'center' }}>
                      Deadline
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>
                      {completedCount}/{tasks.length} Done
                    </div>
                  )}
                </div>

                {/* Local Availability Icons */}
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginTop: '4px' }}>
                  {diaryInfo.hasEntry && <BookOpen size={10} color="#DC2626" title="Journal Entry Available" />}
                  {todoInfo.count > 0 && <Bell size={10} color="#0284C7" title="Todo Reminder Present" />}
                  {habits.length > 0 && <Flame size={10} color="#EA580C" title="Habit Activity" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
