import React from 'react';
import { Calendar as CalendarIcon, Flame, Activity, CheckCircle2 } from 'lucide-react';

export default function CalendarYearView({ dateMap, onSelectDate }) {
  const currentYear = new Date().getFullYear();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="#DC2626" /> {currentYear} Annual Productivity & Heatmap Activity Map
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>12-Month Workload Density Matrix</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {MONTHS.map((monthName, mIdx) => {
          const firstDay = new Date(currentYear, mIdx, 1);
          const daysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();

          return (
            <div
              key={monthName}
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                borderRadius: '16px',
                border: '1px solid #CBD5E1',
                borderBottom: '3px solid #94A3B8',
                padding: '14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>
                {monthName} {currentYear}
              </h4>

              {/* Day Grid Cells for Month */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayData = dateMap[dateStr] || {};
                  const { workloadLevel = { color: '#F1F5F9' }, tasks = [] } = dayData;
                  const completed = tasks.filter(t => t.isCompleted).length;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => onSelectDate && onSelectDate(dateStr)}
                      style={{
                        height: '18px',
                        background: workloadLevel.color || '#F1F5F9',
                        borderRadius: '4px',
                        border: tasks.length > 0 ? '1px solid rgba(0,0,0,0.15)' : '1px solid #E2E8F0',
                        cursor: 'pointer'
                      }}
                      title={`${dateStr}: ${tasks.length} tasks (${completed} completed)`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
