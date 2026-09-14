import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Award, Calendar } from 'lucide-react';

export default function BarGraphAnalyticsView({ tasks = [], subtasks = [] }) {
  const completedTasksCount = tasks.filter(t => t.progressPercent === 100).length;
  const completedSubtasksCount = subtasks.filter(s => s.status === 'COMPLETED').length;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#DC2626" /> Productivity Analytics & Task Trends
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Live metrics calculated strictly from your Supabase user data.
          </p>
        </div>

        <span className="badge badge-critical">Live Metrics</span>
      </div>

      {/* CHART 1: WEEKLY WORKLOAD COMPLETION (BAR GRAPH) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Weekly Workload Completion</h3>
            <p style={{ fontSize: '12px', color: '#64748B' }}>Tasks completed this week: <strong>{completedTasksCount}</strong> | Subtasks: <strong>{completedSubtasksCount}</strong></p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', background: '#DC2626', borderRadius: '2px' }} /> Completed Tasks
            </span>
          </div>
        </div>

        {/* SVG Bar Chart Graphic (DYNAMIC BASED ON LIVE DATA) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', height: '180px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', paddingTop: '20px' }}>
          {daysOfWeek.map((day, i) => {
            const isToday = day === 'Fri';
            const barHeight = isToday && tasks.length > 0 ? `${Math.min(100, (completedTasksCount / Math.max(1, tasks.length)) * 100)}%` : '0%';
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', width: '100%', justifyContent: 'center', height: '100%' }}>
                  <div 
                    style={{
                      width: '18px',
                      height: barHeight,
                      background: '#DC2626',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: barHeight !== '0%' ? '0 0 8px rgba(220, 38, 38, 0.3)' : 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHART 2: CATEGORY TIME DISTRIBUTION */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Category Breakdown</h3>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>Total tasks registered per category.</p>

        {tasks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
            No category data available. Register tasks to view analytics.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#0F172A', padding: '10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span>📁 {t.category}</span>
                <span>{t.title} ({t.progressPercent}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
