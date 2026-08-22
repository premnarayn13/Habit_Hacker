import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  Users, 
  Paperclip, 
  Target, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Archive, 
  Trash2, 
  CornerDownRight,
  Bell,
  Upload,
  Download,
  Flame,
  Check,
  X,
  TrendingUp,
  Activity,
  Award,
  Layers,
  Zap,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronRight,
  Search,
  Filter
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
  const [subtaskSearchQuery, setSubtaskSearchQuery] = useState('');
  const [subtaskFilter, setSubtaskFilter] = useState('ALL'); // 'ALL', 'REQUIRED', 'OPTIONAL'
  const [breadcrumbStack, setBreadcrumbStack] = useState([task]);

  if (!task) return null;

  const currentTask = breadcrumbStack[breadcrumbStack.length - 1] || task;

  const calculateSpanDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (isNaN(diffTime)) return 0;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalWindowDays = calculateSpanDays(currentTask.plannedStart, currentTask.plannedEnd);
  
  // Elapsed days calculation
  const startDateObj = new Date(currentTask.plannedStart || Date.now());
  const nowObj = new Date();
  const diffTimeElapsed = nowObj - startDateObj;
  const elapsedDays = Math.max(1, Math.floor(diffTimeElapsed / (1000 * 60 * 60 * 24)) + 1);
  const remainingDays = Math.max(0, totalWindowDays - elapsedDays);

  const targetCount = currentTask.targetCount || 50;
  const currentCount = currentTask.currentCount || 0;
  const isDone = currentTask.progressPercent >= 100;

  // Optional Subtask Rule evaluation:
  // Mandatory subtasks are those with isOptional !== true
  const mandatorySubtasks = childSubtasks.filter(s => !s.isOptional);
  const optionalSubtasks = childSubtasks.filter(s => s.isOptional);

  const allMandatoryDone = mandatorySubtasks.length === 0 || mandatorySubtasks.every(s => s.progressPercent >= 100);
  const isParentEvaluatedFullyComplete = isDone || allMandatoryDone;

  // Grace Days for count_days mode: (totalWindowDays - targetCount)
  const graceDaysAllowed = Math.max(0, totalWindowDays - targetCount);
  const missedDaysCount = Math.max(0, elapsedDays - currentCount);
  const graceDaysRemaining = Math.max(0, graceDaysAllowed - missedDaysCount);

  // LeetCode-style activity matrix grid data (past 60 days mock activity intensity)
  const activityMatrixDays = Array.from({ length: 60 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - idx));
    const count = (idx % 7 === 0 || idx % 11 === 0) ? 0 : (idx % 3 === 0 ? 3 : (idx % 5 === 0 ? 5 : 1));
    return {
      date: d.toISOString().split('T')[0],
      count
    };
  });

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
          <button className="btn-secondary" onClick={() => onArchiveTask(currentTask.id)} style={{ color: '#D97706' }}>
            <Archive size={15} /> {currentTask.isArchived ? 'Unarchive' : 'Archive'}
          </button>
          <button className="btn-primary" onClick={() => onDeleteTask(currentTask.id)} style={{ background: '#DC2626' }}>
            <Trash2 size={15} /> Delete
          </button>
        </div>

      </div>

      {/* Main Task Hero Details & Optional Subtask Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderLeft: currentTask.parentTaskId ? '8px solid #D97706' : '8px solid #DC2626', background: currentTask.parentTaskId ? '#FFFDF5' : '#FFFFFF' }}>
        
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {currentTask.parentTaskId ? (
            <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 900 }}>
              GOLD CHILD SUBTASK
            </span>
          ) : (
            <span style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 900 }}>
              STANDALONE PARENT TASK
            </span>
          )}

          <span className={`badge badge-${(currentTask.priority || 'HIGH').toLowerCase()}`}>{currentTask.priority} Priority</span>
          {currentTask.isOptional && <span className="badge badge-optional">Optional Task</span>}

          <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            Category: {currentTask.category || 'Education'}
          </span>

          <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            Section: {currentTask.section || 'General'}
          </span>
        </div>

        {/* Title & Evaluation Banner */}
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
                ? 'Parent Evaluated as 100% Fully Completed (Mandatory criteria met)'
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

      {/* HIGH-IMPACT ANALYTICS & VISUAL SUITE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        
        {/* B. Progress Gauges & Time Metrics */}
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
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
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
              <div style={{ width: `${Math.min(100, Math.round((elapsedDays / totalWindowDays) * 100))}%`, background: '#2563EB', height: '100%' }} title="Elapsed Days" />
            </div>
          </div>

          {/* Efficiency Ratio & Streak Counter Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#FFFDF5', border: '1px solid #FDE68A', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> STREAK COUNTER
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
                7 Days 🔥
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Longest: 14 Days</div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> EFFICIENCY RATIO
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
                {Math.round((currentCount / Math.max(1, elapsedDays)) * 100)}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Logs per active day</div>
            </div>
          </div>

        </div>

        {/* C. Dynamic Mode-Specific Charts */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#D97706" /> Mode Analytics: {currentTask.trackingMode || 'end_date'}
          </h3>

          {currentTask.trackingMode === 'count_days' ? (
            <>
              {/* Grace Days Remaining Gauge */}
              <div style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>ALLOWED GRACE / REST DAYS</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: graceDaysRemaining > 0 ? '#15803D' : '#DC2626', marginTop: '4px' }}>
                  {graceDaysRemaining} Grace Days Remaining
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Total Allowed Window: {totalWindowDays} Days | Target: {targetCount} Days | Allowed Rest: {graceDaysAllowed} Days
                </div>
              </div>

              {/* Trajectory Burn-Down Indicator */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>EXPECTED VS ACTUAL BURN-DOWN TRAJECTORY</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', fontWeight: 700 }}>
                  <span>Target Days Remaining: {Math.max(0, targetCount - currentCount)}</span>
                  <span>Days Left in Window: {remainingDays}</span>
                </div>
                <div style={{ marginTop: '10px', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((currentCount / targetCount) * 100))}%`, background: '#DC2626', height: '100%' }} />
                </div>
              </div>
            </>
          ) : currentTask.trackingMode === 'count_event' ? (
            <>
              {/* Event Velocity & Peak Activity Highlight */}
              <div style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>PEAK DAILY VOLUME & VELOCITY</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>
                  5 Units / Day (Peak Day 🔥)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Velocity Projection: Projected Completion in {Math.ceil(Math.max(0, targetCount - currentCount) / 2)} Days
                </div>
              </div>

              {/* Volume Distribution */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>DAILY EVENT VOLUME LOGS</div>
                <div style={{ display: 'flex', itemsAlign: 'flex-end', gap: '8px', height: '60px', borderBottom: '1px solid #CBD5E1', paddingBottom: '4px' }}>
                  {[1, 3, 5, 2, 4, 1, 3].map((v, i) => (
                    <div key={i} style={{ flex: 1, background: v === 5 ? '#DC2626' : '#2563EB', height: `${(v / 5) * 100}%`, borderRadius: '4px 4px 0 0' }} title={`${v} units logged`} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '14px', textAlign: 'center', color: '#64748B' }}>
              Standard end_date schedule mode. Tracks daily completion until {currentTask.plannedEnd}.
            </div>
          )}

        </div>

      </div>

      {/* A. LEETCODE-STYLE ACTIVITY MATRIX & CALENDAR VIEW */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="#DC2626" /> LeetCode-Style Activity Matrix (Past 60 Days Logging Intensity)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px', background: '#0F172A', padding: '20px', borderRadius: '16px' }}>
          {activityMatrixDays.map((item, idx) => {
            let bg = '#1E293B'; // 0 logs
            if (item.count === 1) bg = '#166534'; // 1 log
            if (item.count === 3) bg = '#15803D'; // 3 logs
            if (item.count === 5) bg = '#DC2626'; // 5+ logs peak
            return (
              <div 
                key={idx} 
                style={{
                  height: '24px',
                  background: bg,
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer'
                }}
                title={`${item.date}: ${item.count} activity logs`}
              />
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
          <span>Less</span>
          <span style={{ width: '12px', height: '12px', background: '#1E293B', borderRadius: '2px' }} />
          <span style={{ width: '12px', height: '12px', background: '#166534', borderRadius: '2px' }} />
          <span style={{ width: '12px', height: '12px', background: '#15803D', borderRadius: '2px' }} />
          <span style={{ width: '12px', height: '12px', background: '#DC2626', borderRadius: '2px' }} />
          <span>Peak</span>
        </div>
      </div>

      {/* SUBTASK MANAGEMENT DIRECTORY (SEARCH, FILTER, REORDER & RECURSIVE DOUBLE CLICK) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#D97706" /> Subtask Directory & Management ({childSubtasks.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Double click any subtask below to recursively navigate into its dedicated Task Info Page (`/tasks/[subtask_id]`).
            </p>
          </div>

          {/* Subtask Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: 'All Subtasks', val: 'ALL' },
              { label: 'Mandatory Required', val: 'REQUIRED' },
              { label: 'Optional', val: 'OPTIONAL' }
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setSubtaskFilter(f.val)}
                style={{
                  background: subtaskFilter === f.val ? '#D97706' : '#F8FAFC',
                  color: subtaskFilter === f.val ? '#FFF' : '#475569',
                  border: '1px solid #CBD5E1',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subtask Search Bar */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input 
            type="text"
            placeholder="Search subtasks..."
            value={subtaskSearchQuery}
            onChange={(e) => setSubtaskSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', height: '38px' }}
          />
        </div>

        {/* Subtasks List */}
        {filteredSubtasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13px', fontStyle: 'italic', background: '#F8FAFC', borderRadius: '12px' }}>
            No subtasks match the criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredSubtasks.map(sub => (
              <div
                key={sub.id}
                onDoubleClick={() => handleSubtaskClick(sub)}
                style={{
                  background: '#FFFDF5',
                  border: '1px solid #FDE68A',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Double click to open subtask info page"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CornerDownRight size={16} color="#D97706" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{sub.title}</span>
                      {sub.isOptional ? (
                        <span className="badge badge-optional">Optional Subtask</span>
                      ) : (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>Mandatory</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      📅 Start: {sub.plannedStart} | End: {sub.plannedEnd} | {sub.estimatedMinutes}m
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#D97706' }}>{sub.progressPercent}%</span>
                  <ChevronRight size={18} color="#D97706" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
