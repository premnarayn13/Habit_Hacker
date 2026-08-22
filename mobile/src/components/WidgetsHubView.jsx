import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar as CalendarIcon, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Grid, 
  Layers,
  Sparkles,
  Award,
  BarChart2,
  Utensils,
  Sun,
  Activity,
  Zap,
  Target
} from 'lucide-react';

export default function WidgetsHubView({ tasks = [], habits = [], onOpenQuickAdd }) {
  const [activePomoTime, setActivePomoTime] = useState('25:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const activeTasksCount = tasks.filter(t => t.progressPercent < 100).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Grid size={24} color="#DC2626" /> Executive Widgets & Dashboard Library
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Professional Red & White interface templates (Countdown, Pomo, Eisenhower Matrix, Habit Gauges & Focus Analytics).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={onOpenQuickAdd}>
            <Plus size={16} /> Quick Add Task
          </button>
        </div>
      </div>

      {/* TOP WIDGETS ROW: Quick Add, Countdown, Badge & Pomo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* 1. Quick Add Widget */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} color="#DC2626" /> Inbox Quick Add
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={onOpenQuickAdd}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer'
              }}
            >
              <Plus size={24} />
            </button>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>
            Quick Task Capture
          </div>
        </div>

        {/* 2. Target Milestone Countdown Widget */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', background: 'linear-gradient(135deg, #FFFFFF, #FFFBEB)', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: '13px', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#D97706" /> Target Milestone Countdown
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>--</div>
            <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700, marginTop: '2px' }}>Days Left</div>
          </div>
          <div style={{ fontSize: '11px', color: '#92400E', textAlign: 'center' }}>
            Target: Set Goal Milestone
          </div>
        </div>

        {/* 3. Badge Counter Widget */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Active Tasks Counter</div>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#FFF'
            }}>
              <CheckCircle2 size={28} />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: 'calc(50% - 32px)',
                background: '#D97706',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: 800,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFF'
              }}>{activeTasksCount}</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>{activeTasksCount} Tasks Remaining Today</div>
        </div>

        {/* 4. Pomodoro Focus Widget */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#DC2626" /> Focus Pomodoro
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#DC2626' }}>{activePomoTime}</div>
            <button 
              onClick={() => setIsTimerRunning(prev => !prev)}
              style={{
                background: isTimerRunning ? '#DC2626' : '#0F172A',
                color: '#FFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={14} fill="#FFF" /> {isTimerRunning ? 'Pause' : 'Start'}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>Today Focused: 0m</div>
        </div>

      </div>

      {/* SECOND WIDGETS ROW: Weekly Habits */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Weekly Habits Tracker</h3>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
            <span>M</span><span>T</span><span>W</span><span>T</span><span style={{ color: '#DC2626' }}>F</span><span>S</span><span>S</span>
          </div>
        </div>

        {habits.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
            No habits created yet. Go to Settings or Tasks to add habits.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habits.map((habit, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{habit.name}</span>
                <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 700 }}>Streak: {habit.streakDays}d</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
