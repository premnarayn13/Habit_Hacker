import React, { useState } from 'react';
import { Grid, Flame, ChevronDown, Calendar, Layers, Activity } from 'lucide-react';

export default function HeatmapsHubView({ heatmapData, onSelectDay }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [timespan, setTimespan] = useState('3_MONTHS'); // 4_WEEKS, 3_MONTHS, 1_YEAR
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  // Column count based on timespan toggle
  const getGridColumns = () => {
    if (timespan === '4_WEEKS') return 28;
    if (timespan === '3_MONTHS') return 60;
    return 100; // 1 Year
  };

  const dayCells = Array.from({ length: getGridColumns() }).map((_, idx) => {
    const intensity = (idx % 5 === 0) ? 4 : (idx % 3 === 0) ? 3 : (idx % 2 === 0) ? 1 : 0;
    return {
      dayIndex: idx,
      date: `2026-08-${(idx % 30) + 1}`,
      intensity,
      completedTasksCount: intensity * 2,
      disciplineScore: Math.min(100, intensity * 25)
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Grid size={22} color="#DC2626" /> Consistency & Activity Heatmap Matrix
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Expandable activity heatmaps across 4-5 weeks, 3 months, or 1 full year. Click any tile for historical day details.
          </p>
        </div>

        {/* Dropdown to Expand Heatmap to 3 Months or 1 Year */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={timespan}
            onChange={(e) => setTimespan(e.target.value)}
            style={{ background: '#FFF', fontWeight: 700, color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.4)' }}
          >
            <option value="4_WEEKS">Compact (4-5 Weeks)</option>
            <option value="3_MONTHS">Expand 3 Months View</option>
            <option value="1_YEAR">Expand 1 Year View</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'MAIN_TASKS', 'SUBTASKS', 'HABITS', 'DISCIPLINE_SCORE'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#DC2626' : '#FFFFFF',
              color: activeTab === tab ? '#FFF' : '#475569',
              border: '1px solid #CBD5E1',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Heatmap Grid Panel */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
            HEATMAP ACTIVITY MATRIX ({timespan.replace('_', ' ')})
          </span>
          
          {/* Intensity Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
            <span>Less</span>
            <div style={{ width: '12px', height: '12px', background: '#E2E8F0', borderRadius: '3px' }} />
            <div style={{ width: '12px', height: '12px', background: 'rgba(5, 150, 105, 0.25)', borderRadius: '3px' }} />
            <div style={{ width: '12px', height: '12px', background: 'rgba(5, 150, 105, 0.5)', borderRadius: '3px' }} />
            <div style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '3px' }} />
            <span>More</span>
          </div>
        </div>

        {/* Dynamic Grid Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${timespan === '4_WEEKS' ? 14 : timespan === '3_MONTHS' ? 30 : 52}, 1fr)`,
          gap: '6px'
        }}>
          {dayCells.map(cell => (
            <div 
              key={cell.dayIndex}
              onClick={() => setSelectedDayDetails(cell)}
              className={`heatmap-cell heatmap-level-${cell.intensity}`}
              title={`${cell.date}: ${cell.completedTasksCount} activities completed (${cell.disciplineScore}% score)`}
            />
          ))}
        </div>
      </div>

      {/* Historical Day Snapshot Drawer */}
      {selectedDayDetails && (
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-medium">Day Snapshot</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                Activity Summary for {selectedDayDetails.date}
              </h3>
            </div>

            <button 
              onClick={() => setSelectedDayDetails(null)}
              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Close ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '14px' }}>
            <div style={{ background: '#FFF', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Activities Done</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>{selectedDayDetails.completedTasksCount} Completed</div>
            </div>

            <div style={{ background: '#FFF', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Discipline Score</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#DC2626' }}>{selectedDayDetails.disciplineScore} / 100</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
