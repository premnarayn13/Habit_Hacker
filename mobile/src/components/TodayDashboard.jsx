import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Calendar,
  Layers,
  Activity,
  Zap
} from 'lucide-react';

export default function TodayDashboard({ 
  capacityData, 
  tasks, 
  habits, 
  disciplineScore, 
  onToggleTask, 
  onHabitCheckIn, 
  onUpdateTaskProgress,
  onOpenQuickAdd 
}) {
  const isOverloaded = capacityData?.isOverloaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* CAPACITY OVERLOAD WARNING BANNER */}
      {isOverloaded && (
        <div className="capacity-overload-alert">
          <AlertTriangle size={22} color="#DC2626" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Daily Workload Overloaded Warning!</div>
            <div>{capacityData.warningMessage}</div>
          </div>
          <button className="btn-primary" onClick={onOpenQuickAdd} style={{ padding: '6px 14px', fontSize: '12px' }}>
            Reschedule Tasks
          </button>
        </div>
      )}

      {/* TODAY SCORECARD STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Discipline Scorecard */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(220, 38, 38, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={28} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>DISCIPLINE SCORE</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>
              {disciplineScore.disciplineScore} <span style={{ fontSize: '14px', color: '#DC2626' }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>Grade: {disciplineScore.grade}</div>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(217, 119, 6, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={28} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>REQUIRED TASKS</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>{disciplineScore.taskCompletionRate}%</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>12 of 14 completed</div>
          </div>
        </div>

        {/* Habit Streak Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(220, 38, 38, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={28} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>CURRENT STREAK</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#DC2626' }}>12 Days</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Best: 24 days</div>
          </div>
        </div>

        {/* Focus Hours Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(217, 119, 6, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={28} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>FOCUS TIME</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#D97706' }}>2h 45m</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>3 Pomodoro sessions</div>
          </div>
        </div>

      </div>

      {/* DAILY CAPACITY WORKLOAD GAUGE */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Daily Workload vs Available Capacity</h3>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              Planned: {capacityData.plannedHours}h | Available Capacity: {capacityData.availableHours}h ({capacityData.availableCapacityMinutes} mins)
            </p>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: isOverloaded ? '#DC2626' : '#DC2626' }}>
            {capacityData.workloadPercentage}% Capacity
          </span>
        </div>

        <div className="capacity-bar-container">
          <div 
            className="capacity-bar-fill"
            style={{ 
              width: `${Math.min(100, capacityData.workloadPercentage)}%`,
              background: isOverloaded ? 'linear-gradient(90deg, #DC2626, #B91C1C)' : 'linear-gradient(90deg, #DC2626, #D97706)'
            }}
          />
        </div>
      </div>

      {/* TODAY TASKS & HABITS REACTIVE SECTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Today Tasks Section */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#DC2626" /> Today Scheduled Tasks ({tasks.length})
            </h3>
            <button className="btn-primary" onClick={onOpenQuickAdd} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map(task => {
              const isDone = task.progressPercent === 100;
              return (
                <div 
                  key={task.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      {isDone ? <CheckCircle2 size={20} color="#DC2626" /> : <Circle size={20} color="#94A3B8" />}
                    </button>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: isDone ? '#64748B' : '#0F172A', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        📁 {task.category} | Est: {task.estimatedMinutes}m
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today Habits Section */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#DC2626" /> Daily Habit Tracker
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Tap to Check In</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {habits.map(habit => {
              const isCheckedIn = habit.actualValue >= habit.targetValue;
              return (
                <div 
                  key={habit.id}
                  onClick={() => onHabitCheckIn(habit.id)}
                  style={{
                    background: isCheckedIn ? 'rgba(220, 38, 38, 0.08)' : '#F8FAFC',
                    border: isCheckedIn ? '1px solid #DC2626' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{habit.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Target: {habit.targetValue} {habit.unit} | Streak: {habit.streakDays} Days
                    </div>
                  </div>

                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCheckedIn ? '#DC2626' : '#CBD5E1',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {isCheckedIn ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
