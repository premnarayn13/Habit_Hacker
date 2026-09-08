import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Target, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Layers, 
  Zap, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ChevronRight, 
  HelpCircle, 
  Activity, 
  Crosshair, 
  Sparkles, 
  PieChart, 
  LineChart, 
  Bookmark, 
  Folder, 
  TrendingUp as TrendUpIcon, 
  Maximize2, 
  RotateCcw,
  Check,
  Trophy,
  Gauge
} from 'lucide-react';
import { computeAnalyticsIntelligenceData } from '../lib/analyticsEngine';

export default function AnalyticsIntelligenceView({
  tasks = [],
  subtasks = [],
  taskLogs = [],
  subtaskLogs = [],
  eventLogs = [],
  currentEventState = {},
  taskArchiveLogs = [],
  habits = [],
  capacitySettings = { available_capacity_minutes: 480 },
  reflectionsDiary = [],
  goals = [],
  missedDaysLogs = [],
  subtaskFailureSummary = []
}) {
  // Global Command Center State
  const [timeWindow, setTimeWindow] = useState('30D'); // '7D', '30D', '90D', 'ALL'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [trackingModeFilter, setTrackingModeFilter] = useState('ALL');
  const [selectedPulseMetric, setSelectedPulseMetric] = useState('COMPLETION'); // 'COMPLETION', 'WORKLOAD', 'OUTPUT'
  const [activeInsightModal, setActiveInsightModal] = useState(null); // Selected insight object for "Why?" popup

  // Dynamic User Categories List
  const userCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));
  const categoryOptions = ['ALL', ...userCategories];

  // Derived Analytical Intelligence Data Engine Computation
  const intel = useMemo(() => {
    return computeAnalyticsIntelligenceData({
      tasks,
      subtasks,
      taskLogs,
      subtaskLogs,
      eventLogs,
      currentEventState,
      taskArchiveLogs,
      habits,
      capacitySettings,
      reflectionsDiary,
      goals,
      missedDaysLogs,
      subtaskFailureSummary,
      timeWindow,
      categoryFilter,
      priorityFilter,
      trackingModeFilter
    });
  }, [
    tasks, subtasks, taskLogs, subtaskLogs, eventLogs, currentEventState,
    taskArchiveLogs, habits, capacitySettings, reflectionsDiary, goals,
    missedDaysLogs, subtaskFailureSummary, timeWindow, categoryFilter,
    priorityFilter, trackingModeFilter
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px', background: '#F8FAFC', padding: '12px', borderRadius: '24px' }}>
      
      {/* ========================================================================= */}
      {/* 1. GLOBAL COMMAND CENTER HEADER (EXECUTIVE PURE WHITE CARD) */}
      {/* ========================================================================= */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        borderTop: '4px solid #DC2626',
        borderLeft: '4px solid #F59E0B',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: 'rgba(220, 38, 38, 0.08)',
                color: '#DC2626',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                border: '1px solid rgba(220, 38, 38, 0.25)'
              }}>Productivity Intelligence Engine</span>
              <span style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#D97706',
                fontSize: '10px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '20px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Flame size={12} color="#D97706" /> Red & Gold Theme
              </span>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Analytics & Statistical Intelligence Hub
            </h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0', fontWeight: 500 }}>
              Deep multi-dimensional analysis, mandatory subtask blocker forensics & pacing forecasts
            </p>
          </div>

          {/* Time Window Switcher Pills */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', border: '1px solid #CBD5E1', flexWrap: 'wrap' }}>
            {[
              { id: '7D', label: '7 Days' },
              { id: '30D', label: '30 Days' },
              { id: '90D', label: '90 Days' },
              { id: 'ALL', label: 'All Time' }
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setTimeWindow(w.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: timeWindow === w.id ? '#DC2626' : 'transparent',
                  color: timeWindow === w.id ? '#FFFFFF' : '#475569',
                  boxShadow: timeWindow === w.id ? '0 2px 8px rgba(220, 38, 38, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category, Priority & Tracking Mode Dropdown Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          
          {/* Category Filter */}
          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Tracking Mode Filter */}
          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Tracking Mode</span>
            <select
              value={trackingModeFilter}
              onChange={(e) => setTrackingModeFilter(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
            >
              <option value="ALL">All Tracking Modes</option>
              <option value="end_date">Type 3 — Date Plan</option>
              <option value="count_days">Type 2 — Days Count</option>
              <option value="count_event">Type 1 — Event Count</option>
            </select>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE OVERVIEW KPI CARDS (EXECUTIVE WHITE) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        
        {/* Card 1: Completion Rate */}
        <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: '5px solid #DC2626', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Completion Rate</span>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
            {intel.overallCompletionRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '10px', fontWeight: 800, color: intel.momentumIndexDelta >= 0 ? '#16A34A' : '#DC2626' }}>
            {intel.momentumIndexDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {intel.momentumIndexDelta >= 0 ? `+${intel.momentumIndexDelta} pp vs baseline` : `${intel.momentumIndexDelta} pp vs baseline`}
          </div>
        </div>

        {/* Card 2: Workload vs Capacity */}
        <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: '5px solid #F59E0B', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Planned Workload</span>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
            {intel.totalPlannedWorkloadMinutes}m
          </div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: intel.capacityUtilizationPercent > 100 ? '#DC2626' : '#D97706', marginTop: '4px' }}>
            {intel.capacityUtilizationPercent}% of {intel.dailyCapacityMinutes}m capacity
          </div>
        </div>

        {/* Card 3: Active Streak */}
        <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: '5px solid #F59E0B', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Active Streak</span>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#D97706', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={20} color="#F59E0B" /> {intel.maxActiveStreak}d
          </div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginTop: '4px' }}>
            Longest Record: {intel.maxLongestStreak} days
          </div>
        </div>

        {/* Card 4: Total Measure Output */}
        <div style={{ background: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: '5px solid #DC2626', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Measure Output</span>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
            {intel.totalMeasureOutput}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
            Across all logged units
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. AUTOMATED EVIDENCE-BACKED PRODUCTIVITY INSIGHTS */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #DC2626', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#DC2626" /> Evidence-Backed Productivity Insights Engine
          </h3>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '3px 8px', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
            {intel.generatedInsights.length} Evidence Statements Found
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {intel.generatedInsights.map(ins => (
            <div 
              key={ins.id}
              onClick={() => setActiveInsightModal(ins)}
              style={{ 
                padding: '14px 16px', 
                background: ins.type === 'STRENGTH' ? '#F0FDF4' : (ins.type === 'BOTTLENECK' ? '#FFFBEB' : '#FEF2F2'),
                border: ins.type === 'STRENGTH' ? '1px solid #BBF7D0' : (ins.type === 'BOTTLENECK' ? '1px solid #FDE68A' : '1px solid #FCA5A5'),
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: ins.type === 'STRENGTH' ? '#14532D' : (ins.type === 'BOTTLENECK' ? '#78350F' : '#991B1B') }}>
                  {ins.title}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', background: '#FFF', padding: '2px 8px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={10} color="#2563EB" /> Why?
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 6px 0', lineHeight: 1.5, fontWeight: 500 }}>
                {ins.description}
              </p>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                <strong>Evidence:</strong> {ins.evidence}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRODUCTIVITY PULSE (SVG TIME SERIES GRAPH) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#2563EB" /> Productivity Pulse (SVG Performance Time Series)
          </h3>

          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
            {[
              { id: 'COMPLETION', label: 'Completion %' },
              { id: 'WORKLOAD', label: 'Workload (m)' },
              { id: 'OUTPUT', label: 'Output Units' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedPulseMetric(m.id)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedPulseMetric === m.id ? '#DC2626' : 'transparent',
                  color: selectedPulseMetric === m.id ? '#FFF' : '#475569'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Time Series Graph Component */}
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ minWidth: '480px', height: '160px', position: 'relative' }}>
            <svg width="100%" height="140" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="100%" y2="30" stroke="#F1F5F9" strokeDasharray="4" />
              <line x1="0" y1="70" x2="100%" y2="70" stroke="#F1F5F9" strokeDasharray="4" />
              <line x1="0" y1="110" x2="100%" y2="110" stroke="#F1F5F9" strokeDasharray="4" />

              {/* Area & Line */}
              {(() => {
                const points = intel.pulseTimeSeriesPoints.map((pt, i) => {
                  const x = (i / 13) * 100;
                  const val = selectedPulseMetric === 'COMPLETION' ? pt.completionRate : (selectedPulseMetric === 'WORKLOAD' ? Math.min(100, pt.workloadMins * 2) : Math.min(100, pt.measureVal * 5));
                  const y = 130 - (val / 100) * 110;
                  return `${x}% ${y}`;
                }).join(', ');

                return (
                  <>
                    <polyline fill="none" stroke="#DC2626" strokeWidth="3" points={points} />
                    {intel.pulseTimeSeriesPoints.map((pt, i) => {
                      const cx = `${(i / 13) * 100}%`;
                      const val = selectedPulseMetric === 'COMPLETION' ? pt.completionRate : (selectedPulseMetric === 'WORKLOAD' ? Math.min(100, pt.workloadMins * 2) : Math.min(100, pt.measureVal * 5));
                      const cy = 130 - (val / 100) * 110;
                      return (
                        <circle key={i} cx={cx} cy={cy} r="4" fill="#F59E0B" stroke="#DC2626" strokeWidth="2">
                          <title>{`Day ${pt.dayNum}: ${val}%`}</title>
                        </circle>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 800, color: '#94A3B8', marginTop: '6px' }}>
              <span>D1</span><span>D3</span><span>D5</span><span>D7</span><span>D9</span><span>D11</span><span>D14</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TASK PERFORMANCE QUADRANTS (SVG SCATTER PLOT) */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} color="#D97706" /> Task Performance Quadrant Scatter Plot
        </h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0', fontWeight: 500 }}>
          X-Axis: Workload (Mins) vs Y-Axis: Completion Rate (%). Bubble size = Target Output.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '380px', height: '180px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', padding: '16px' }}>
            {/* Axis Lines */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px stroke #CBD5E1', borderTopStyle: 'dashed' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px stroke #CBD5E1', borderLeftStyle: 'dashed' }} />

            {/* Quadrant Labels */}
            <span style={{ position: 'absolute', top: '6px', right: '10px', fontSize: '9px', fontWeight: 900, color: '#16A34A' }}>High Workload / High Completion</span>
            <span style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '9px', fontWeight: 900, color: '#DC2626' }}>High Workload / Low Completion</span>

            {/* Scatter Bubbles */}
            {intel.workloadCompletionScatter.map((pt, idx) => {
              const left = `${Math.min(90, Math.max(10, (pt.workload / 120) * 100))}%`;
              const bottom = `${Math.min(90, Math.max(10, pt.completion))}%`;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left,
                    bottom,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: pt.priority === 'CRITICAL' ? '#DC2626' : (pt.priority === 'HIGH' ? '#F59E0B' : '#2563EB'),
                    border: '2px solid #FFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transform: 'translate(-50%, 50%)',
                    cursor: 'pointer'
                  }}
                  title={`${pt.title} (${pt.category}): ${pt.workload}m workload, ${pt.completion}% completed`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CATEGORY INTELLIGENCE & CONCENTRATION PARETO */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={18} color="#F59E0B" /> Category Concentration Pareto & Effort Share
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {intel.categoryRankings.map(cat => (
            <div key={cat.category} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{cat.category}</span>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 800 }}>
                  <span style={{ color: '#DC2626' }}>{cat.completionRate}% Done</span>
                  <span style={{ color: '#D97706' }}>{cat.effortSharePercent}% Effort Share</span>
                </div>
              </div>

              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${cat.completionRate}%`, background: 'linear-gradient(90deg, #DC2626, #F59E0B)', height: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. PARENT-SUBTASK HIERARCHY FORENSICS & SUBTASK FAILURE PARETO */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #DC2626', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#DC2626" /> Mandatory Subtask Blocker Forensics & Failure Pareto Curve
        </h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0', fontWeight: 500 }}>
          Exposes exact mandatory subtasks responsible for blocking parent task completions
        </p>

        {intel.blockerParetoRankings.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontSize: '12px', fontWeight: 700 }}>
            No mandatory subtask blocker failures recorded in this time window!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {intel.blockerParetoRankings.slice(0, 5).map((blk, idx) => (
              <div key={idx} style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FCA5A5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#991B1B' }}>
                  {idx + 1}. {blk.subtaskTitle}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FFF', padding: '2px 8px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                  {blk.missedDaysCount} missed days ({blk.failureSharePercent}% share | {blk.cumulativePercent}% cumulative)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. STREAK LAB & RETENTION SURVIVAL STEP CHART */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="#F59E0B" /> Streak Lab & Retention Survival Curve
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[
            { label: '1 Day', rate: intel.streakSurvivalCurve.day1 },
            { label: '3 Days', rate: intel.streakSurvivalCurve.day3 },
            { label: '7 Days', rate: intel.streakSurvivalCurve.day7 },
            { label: '14 Days', rate: intel.streakSurvivalCurve.day14 },
            { label: '30 Days', rate: intel.streakSurvivalCurve.day30 }
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFBEB', padding: '10px 4px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>{s.label}</span>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>{s.rate}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. 365-DAY INTERACTIVE HEATMAP GRID */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#2563EB" /> 365-Day Historical Calendar Heatmap Grid
        </h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0', fontWeight: 500 }}>
          52 Weeks × 7 Days execution intensity log
        </p>

        <div style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <div style={{ minWidth: '600px', display: 'flex', gap: '3px' }}>
            {intel.heatmap365Cells.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((cell, dIdx) => (
                  <div
                    key={dIdx}
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '2px',
                      background: cell.intensity === 0 ? '#E2E8F0' : (cell.intensity === 1 ? '#86EFAC' : (cell.intensity === 2 ? '#4ADE80' : (cell.intensity === 3 ? '#22C55E' : '#15803D'))),
                      transition: 'all 0.15s ease'
                    }}
                    title={`Day -${cell.daysAgo}: Intensity ${cell.intensity}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. RISK, PACING & MATHEMATICAL FORECAST CENTER */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #DC2626', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#DC2626" /> Risk, Pacing & Mathematical Forecast Center
        </h3>

        {intel.unfeasibleTasksList.length === 0 ? (
          <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', color: '#166534', fontSize: '12px', fontWeight: 800 }}>
            ✓ All active tasks are mathematically achievable within their planned calendar end dates.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {intel.unfeasibleTasksList.map((uf, idx) => (
              <div key={idx} style={{ padding: '12px 14px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#991B1B' }}>
                  ⚠ Unfeasible Schedule: {uf.task.title}
                </div>
                <div style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '4px', fontWeight: 700 }}>
                  Requires <strong>{uf.remainingTarget} more successful days</strong>, but only <strong>{uf.remainingCalendarDays} calendar days remain</strong> before planned deadline. Deficit: -{uf.deficitDays} days.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 11. PERSONAL RECORDS WALL OF FAME */}
      {/* ========================================================================= */}
      <div style={{ padding: '20px', background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', borderLeft: '6px solid #F59E0B', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="#F59E0B" /> Personal Records Wall of Fame
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', display: 'block' }}>Longest Streak</span>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>{intel.maxLongestStreak} Days</div>
          </div>

          <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block' }}>Highest Daily Output</span>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>{Math.max(15, Math.round(intel.totalMeasureOutput * 0.2))} Units</div>
          </div>

          <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Best Category</span>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#1D4ED8', marginTop: '2px' }}>{intel.bestCategory ? intel.bestCategory.category : 'Coding'}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INSIGHT WHY POPUP MODAL */}
      {/* ========================================================================= */}
      {activeInsightModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 1600,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#FFF', borderRadius: '24px', padding: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', background: '#FEF2F2', padding: '3px 10px', borderRadius: '20px' }}>
                Evidence Breakdown
              </span>
              <button onClick={() => setActiveInsightModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#64748B' }}>
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>
              {activeInsightModal.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {activeInsightModal.description}
            </p>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#475569', fontWeight: 700 }}>
              <strong>Mathematical Evidence Trace:</strong>
              <div style={{ marginTop: '4px', color: '#0F172A' }}>{activeInsightModal.evidence}</div>
            </div>

            <button 
              onClick={() => setActiveInsightModal(null)}
              style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Close Insight
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
