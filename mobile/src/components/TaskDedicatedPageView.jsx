import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Clock, 
  Layers, 
  Edit3, 
  Trash2, 
  Archive, 
  Award, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Filter,
  Search,
  CheckSquare,
  CornerDownRight,
  Folder,
  Ruler,
  BarChart3
} from 'lucide-react';

export default function TaskDedicatedPageView({ 
  task, 
  childSubtasks = [], 
  onBack, 
  onEditTask,
  onToggleTask,
  onArchiveTask,
  onDeleteTask,
  onNavigateToSubtask
}) {
  const [breadcrumbStack, setBreadcrumbStack] = useState([task]);
  const [subtaskFilter, setSubtaskFilter] = useState('ALL'); // 'ALL', 'REQUIRED', 'OPTIONAL'
  const [subtaskSearchQuery, setSubtaskSearchQuery] = useState('');

  const currentTask = breadcrumbStack[breadcrumbStack.length - 1] || task;

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 50;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 50;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalWindowDays = calculateSpanDays(currentTask.plannedStart, currentTask.plannedEnd);
  
  const todayDate = new Date();
  const startDate = new Date(currentTask.plannedStart || Date.now());
  const elapsedDays = Math.max(0, Math.min(totalWindowDays, Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1));
  const remainingDays = Math.max(0, totalWindowDays - elapsedDays);

  const targetCount = currentTask.targetCount || currentTask.targetDayCount || currentTask.targetEventCount || totalWindowDays || 50;
  const currentCount = currentTask.currentCount || currentTask.currentDayCount || currentTask.currentEventCount || 0;

  // Optional Subtask Rules: If parent task has child subtasks, evaluate mandatory vs optional
  const requiredSubtasks = childSubtasks.filter(s => !s.isOptional);
  const optionalSubtasks = childSubtasks.filter(s => s.isOptional);

  const areRequiredSubtasksComplete = requiredSubtasks.length > 0
    ? requiredSubtasks.every(s => s.progressPercent >= 100 || s.status === 'COMPLETED' || s.isDoneToday)
    : true;

  const isParentEvaluatedFullyComplete = (currentTask.progressPercent >= 100 || currentTask.isDoneToday) && areRequiredSubtasksComplete;

  // Filter child subtasks
  let filteredSubtasks = childSubtasks;
  if (subtaskFilter === 'REQUIRED') filteredSubtasks = filteredSubtasks.filter(s => !s.isOptional);
  if (subtaskFilter === 'OPTIONAL') filteredSubtasks = filteredSubtasks.filter(s => s.isOptional);
  if (subtaskSearchQuery.trim()) {
    filteredSubtasks = filteredSubtasks.filter(s => s.title.toLowerCase().includes(subtaskSearchQuery.toLowerCase()));
  }

  const handleSubtaskClick = (subtaskItem) => {
    setBreadcrumbStack(prev => [...prev, subtaskItem]);
    if (onNavigateToSubtask) {
      onNavigateToSubtask(subtaskItem);
    }
  };

  const handleBreadcrumbClick = (index) => {
    setBreadcrumbStack(prev => prev.slice(0, index + 1));
  };

  // Mock / Real Daily Quantitative Performance Logs (e.g. 10 rounds, 12 rounds, 8 rounds)
  const measureUnit = currentTask.measureUnit || 'units';
  const measureTarget = currentTask.measureTarget || 10;
  
  // Sample daily performance points for chart visualization
  const sampleDailyMeasures = [
    { day: 'Day 1', val: Math.round(measureTarget * 0.8) },
    { day: 'Day 2', val: Math.round(measureTarget * 1.0) },
    { day: 'Day 3', val: Math.round(measureTarget * 0.7) },
    { day: 'Day 4', val: Math.round(measureTarget * 1.2) },
    { day: 'Day 5', val: Math.round(measureTarget * 0.9) },
    { day: 'Day 6', val: Math.round(measureTarget * 1.1) },
    { day: 'Today', val: currentTask.isDoneToday ? (currentTask.lastMeasuredValue || measureTarget) : 0 }
  ];

  const maxMeasureVal = Math.max(...sampleDailyMeasures.map(d => d.val), measureTarget, 1);
  const totalMeasuredSum = sampleDailyMeasures.reduce((sum, d) => sum + d.val, 0);
  const avgMeasuredVal = (totalMeasuredSum / sampleDailyMeasures.filter(d => d.val > 0).length || 1).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '40px' }}>
      
      {/* Top Header & Recursive Breadcrumbs Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '6px 12px' }}
          >
            <ArrowLeft size={16} /> Directory
          </button>

          {breadcrumbStack.map((item, idx) => (
            <React.Fragment key={item.id || idx}>
              <ChevronRight size={14} color="#94A3B8" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                style={{
                  background: idx === breadcrumbStack.length - 1 ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                  color: idx === breadcrumbStack.length - 1 ? '#DC2626' : '#475569',
                  border: idx === breadcrumbStack.length - 1 ? '1px solid #DC2626' : 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {item.title}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Task Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => onEditTask(currentTask)}>
            <Edit3 size={15} /> Edit Task
          </button>
          <button className="btn-secondary" style={{ color: '#D97706', borderColor: '#FDE68A' }} onClick={() => onArchiveTask(currentTask.id)}>
            <Archive size={15} /> Archive
          </button>
          <button className="btn-secondary" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} onClick={() => onDeleteTask(currentTask.id)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* FULL TASK DETAILS PANEL */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Title, Category & Priority Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Folder size={13} color="#64748B" /> {currentTask.category || 'General'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '8px' }}>
            Section: {currentTask.section || 'General'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} color="#DC2626" fill="#DC2626" /> Priority: {currentTask.priority || 'HIGH'}
          </span>
          {currentTask.isOptional && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#CA8A04', background: '#FEF9C3', border: '1px solid #FDE047', padding: '4px 10px', borderRadius: '8px' }}>
              ⚡ Optional Entity
            </span>
          )}
          {currentTask.hasMeasureTracking && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Ruler size={14} /> Measures in: {measureUnit}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', lineHeight: '1.2' }}>
              {currentTask.title}
            </h1>
            {currentTask.tags && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {currentTask.tags.split(',').map((tg, i) => (
                  <span key={i} style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: 'rgba(37, 99, 235, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                    #{tg.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Optional Subtask Rule Indicator */}
          {childSubtasks.length > 0 && (
            <div style={{
              background: isParentEvaluatedFullyComplete ? '#DCFCE7' : '#FEF3C7',
              border: isParentEvaluatedFullyComplete ? '1px solid #86EFAC' : '1px solid #FDE68A',
              color: isParentEvaluatedFullyComplete ? '#15803D' : '#B45309',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Award size={18} />
              {isParentEvaluatedFullyComplete 
                ? 'Parent Evaluated as 100% Fully Completed'
                : 'Pending Mandatory Subtasks Completion'}
            </div>
          )}
        </div>

        {/* Full Task Description */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px', borderRadius: '14px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '6px' }}>FULL DESCRIPTION & SETUP NOTES</div>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {currentTask.description || 'No detailed setup notes provided.'}
          </p>
        </div>

        {/* Setup Parameters Bar */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#F1F5F9', padding: '14px 18px', borderRadius: '12px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>
          <span>📅 Planned Window: {currentTask.plannedStart} → {currentTask.plannedEnd} ({totalWindowDays} Days)</span>
          <span>⏱️ Estimated Time: {currentTask.estimatedMinutes || 45} Mins</span>
          <span>🔔 Reminder: {currentTask.reminderTime || '09:00 AM'}</span>
          <span>👤 Collaborator: {currentTask.collab || 'None'}</span>
          {currentTask.attachmentName && <span>📎 Attachment: {currentTask.attachmentName}</span>}
        </div>

      </div>

      {/* DAILY QUANTITATIVE PERFORMANCE MEASURE ANALYTICS BAR CHART (IF ENABLED) */}
      {currentTask.hasMeasureTracking && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#2563EB" /> Daily Quantitative Measure Performance ({measureUnit})
            </h3>

            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 800, color: '#475569' }}>
              <span>Total Logged: <strong style={{ color: '#2563EB' }}>{totalMeasuredSum} {measureUnit}</strong></span>
              <span>Daily Avg: <strong style={{ color: '#16A34A' }}>{avgMeasuredVal} {measureUnit}/day</strong></span>
              <span>Target: <strong style={{ color: '#DC2626' }}>{measureTarget} {measureUnit}</strong></span>
            </div>
          </div>

          {/* Daily Measure Bar Graph */}
          <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '10px', paddingBottom: '10px', borderBottom: '2px solid #E2E8F0' }}>
              {sampleDailyMeasures.map((pt, idx) => {
                const barHeight = Math.round((pt.val / maxMeasureVal) * 100);
                const isTargetMet = pt.val >= measureTarget;

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: pt.val > 0 ? (isTargetMet ? '#16A34A' : '#2563EB') : '#94A3B8', marginBottom: '4px' }}>
                      {pt.val > 0 ? pt.val : '-'}
                    </div>

                    <div style={{
                      width: '80%',
                      maxWidth: '32px',
                      height: `${barHeight || 4}%`,
                      background: isTargetMet ? 'linear-gradient(180deg, #22C55E, #15803D)' : (pt.val > 0 ? 'linear-gradient(180deg, #3B82F6, #1D4ED8)' : '#E2E8F0'),
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                      boxShadow: pt.val > 0 ? '0 4px 10px rgba(37, 99, 235, 0.2)' : 'none'
                    }} title={`${pt.day}: ${pt.val} ${measureUnit}`} />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {sampleDailyMeasures.map((pt, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
                  {pt.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HIGH-IMPACT ANALYTICS & VISUAL SUITE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        
        {/* Progress Gauges & Time Metrics */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#DC2626" /> Progress Gauges & Time Metrics
          </h3>

          {/* Circular Progress Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `conic-gradient(#DC2626 ${currentTask.progressPercent || 0}%, #E2E8F0 0)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF', fontSize: '16px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentTask.progressPercent || 0}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>Overall Completion</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Mode: <strong style={{ color: '#DC2626' }}>{currentTask.trackingMode || 'end_date'}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Current Progress: {currentCount} / {targetCount} Target Logged
              </div>
            </div>
          </div>

          {/* Dual-Layer Time Span Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
              <span>Elapsed Days: {elapsedDays} / {totalWindowDays} Days</span>
              <span>{remainingDays} Days Remaining</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.min(100, Math.round((elapsedDays/totalWindowDays)*100))}%`, height: '100%', background: '#DC2626' }} />
            </div>
          </div>
        </div>

        {/* LeetCode Activity Matrix Heatmap */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#2563EB" /> 7-Day Activity Matrix
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>{day}</span>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: idx === 6 && (currentTask.isDoneToday || currentTask.progressPercent >= 100) ? '#22C55E' : (idx < 5 ? '#22C55E' : '#CBD5E1'),
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }} title={`${day}: Activity Logged`} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SUBTASK MANAGEMENT SECTION */}
      {childSubtasks.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#DC2626" /> Child Subtask Performance Hub ({childSubtasks.length})
            </h3>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'REQUIRED', 'OPTIONAL'].map(f => (
                <button
                  key={f}
                  onClick={() => setSubtaskFilter(f)}
                  style={{
                    background: subtaskFilter === f ? '#DC2626' : '#F1F5F9',
                    color: subtaskFilter === f ? '#FFF' : '#475569',
                    border: '1px solid #CBD5E1',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Subtask Search Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input 
              type="text"
              placeholder="Filter child subtasks..."
              value={subtaskSearchQuery}
              onChange={(e) => setSubtaskSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', height: '38px', borderRadius: '8px', fontSize: '12px' }}
            />
          </div>

          {/* Subtasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredSubtasks.map(sub => {
              const isSubDone = sub.progressPercent >= 100 || sub.status === 'COMPLETED' || sub.isDoneToday;

              return (
                <div 
                  key={sub.id}
                  onClick={() => handleSubtaskClick(sub)}
                  style={{
                    background: sub.isOptional ? '#FFFDF5' : '#FFF',
                    border: sub.isOptional ? '1px solid #FDE68A' : '1px solid #CBD5E1',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to recursively view subtask detail dashboard"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSubDone ? (
                      <CheckCircle2 size={20} color="#16A34A" />
                    ) : (
                      <Circle size={20} color="#94A3B8" />
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CornerDownRight size={14} color="#D97706" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {sub.title}
                        </span>

                        {sub.isOptional ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#CA8A04', background: '#FEF9C3', padding: '2px 6px', borderRadius: '4px' }}>
                            Optional Subtask
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                            Mandatory Criteria
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626' }}>
                      {sub.progressPercent || 0}%
                    </span>
                    <ChevronRight size={16} color="#64748B" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

// Push commit iteration 3

// Push commit iteration 20
