import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Filter, 
  Flame, Layers, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import { getCalendarDataForRange, filterCalendarDataset, formatDateKey } from '../lib/calendarEngine';
import CalendarDayView from './calendar/CalendarDayView';
import Calendar3DayView from './calendar/Calendar3DayView';
import CalendarWeekView from './calendar/CalendarWeekView';
import CalendarMonthView from './calendar/CalendarMonthView';
import CalendarYearView from './calendar/CalendarYearView';
import CalendarDailyDetailPanel from './calendar/CalendarDailyDetailPanel';
import CalendarRescheduleModal from './calendar/CalendarRescheduleModal';
import { diaryDB } from '../lib/diaryDB';

export default function CalendarMainView({ 
  tasks = [], 
  subtasks = [], 
  habits = [], 
  logs = [], 
  capacityMinutes = 480,
  onToggleTask,
  onUpdateTaskProgress,
  onRescheduleTask
}) {
  const [currentDateStr, setCurrentDateStr] = useState(formatDateKey(new Date()));
  const [viewMode, setViewMode] = useState('MONTH'); // 'DAY', '3-DAY', 'WEEK', 'MONTH', 'YEAR'
  const [selectedInspectDate, setSelectedInspectDate] = useState(null);
  
  // Filter States
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [trackingModeFilter, setTrackingModeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reschedule Modal State
  const [rescheduleTaskTarget, setRescheduleTaskTarget] = useState(null);

  // Local Privacy Metadata (Diary & Reminders)
  const [diaryMetadata, setDiaryMetadata] = useState({});
  const [todoMetadata, setTodoMetadata] = useState({});

  useEffect(() => {
    loadLocalMetadata();
  }, []);

  const loadLocalMetadata = async () => {
    try {
      const allEntries = await diaryDB.entries.toArray();
      const dMeta = {};
      allEntries.forEach(ent => {
        if (ent.date) {
          if (!dMeta[ent.date]) dMeta[ent.date] = { hasEntry: true, count: 0 };
          dMeta[ent.date].count++;
        }
      });
      setDiaryMetadata(dMeta);

      const allTodos = await diaryDB.todos.toArray();
      const tMeta = {};
      allTodos.forEach(td => {
        if (td.dueDate || td.reminderDate) {
          const dKey = td.reminderDate || td.dueDate;
          if (!tMeta[dKey]) tMeta[dKey] = { count: 0 };
          tMeta[dKey].count++;
        }
      });
      setTodoMetadata(tMeta);
    } catch (e) {
      console.log('Error loading local diary/todo metadata:', e);
    }
  };

  // Date Range Calculation based on View Mode
  const dateRangeBounds = useMemo(() => {
    const anchor = new Date(currentDateStr);
    let start = new Date(anchor);
    let end = new Date(anchor);

    if (viewMode === 'DAY') {
      // 1 day
    } else if (viewMode === '3-DAY') {
      end.setDate(anchor.getDate() + 2);
    } else if (viewMode === 'WEEK') {
      const day = anchor.getDay();
      const diff = anchor.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      start = new Date(anchor.setDate(diff));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (viewMode === 'MONTH') {
      start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    } else if (viewMode === 'YEAR') {
      start = new Date(anchor.getFullYear(), 0, 1);
      end = new Date(anchor.getFullYear(), 11, 31);
    }

    return {
      startStr: formatDateKey(start),
      endStr: formatDateKey(end)
    };
  }, [currentDateStr, viewMode]);

  // Compute Unfiltered Calendar Dataset from Engine
  const rawCalendarData = useMemo(() => {
    return getCalendarDataForRange({
      startStr: dateRangeBounds.startStr,
      endStr: dateRangeBounds.endStr,
      tasks,
      subtasks,
      habits,
      logs,
      capacityMinutes,
      diaryMetadata,
      todoMetadata
    });
  }, [dateRangeBounds, tasks, subtasks, habits, logs, capacityMinutes, diaryMetadata, todoMetadata]);

  // Apply Filters
  const filteredDateMap = useMemo(() => {
    return filterCalendarDataset(rawCalendarData.dateMap, {
      priorityFilter,
      categoryFilter,
      trackingModeFilter,
      statusFilter,
      searchQuery
    });
  }, [rawCalendarData, priorityFilter, categoryFilter, trackingModeFilter, statusFilter, searchQuery]);

  // Date Navigation Handlers
  const handleNavigatePeriod = (direction) => {
    const d = new Date(currentDateStr);
    if (viewMode === 'DAY') d.setDate(d.getDate() + direction);
    else if (viewMode === '3-DAY') d.setDate(d.getDate() + (direction * 3));
    else if (viewMode === 'WEEK') d.setDate(d.getDate() + (direction * 7));
    else if (viewMode === 'MONTH') d.setMonth(d.getMonth() + direction);
    else if (viewMode === 'YEAR') d.setFullYear(d.getFullYear() + direction);

    setCurrentDateStr(formatDateKey(d));
  };

  const handleResetToday = () => {
    setCurrentDateStr(formatDateKey(new Date()));
  };

  // Categories list for dropdown
  const categoryOptions = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [tasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header & Controls Deck */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '20px 24px',
        borderRadius: '20px',
        border: '1px solid #CBD5E1',
        borderBottom: '4px solid #94A3B8',
        borderLeft: '6px solid #DC2626',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={26} color="#DC2626" /> Smart Calendar & Schedule Timeline
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Offline-first scheduling, historical log reconstruction, capacity awareness & deadline intelligence.
          </p>
        </div>

        {/* View Switcher Deck */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', border: '1px solid #CBD5E1', flexWrap: 'wrap' }}>
          {['DAY', '3-DAY', 'WEEK', 'MONTH', 'YEAR'].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                background: viewMode === m ? '#DC2626' : 'transparent',
                color: viewMode === m ? '#FFF' : '#475569',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Date Navigation & Filter Controls Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #CBD5E1',
        borderBottom: '3px solid #94A3B8',
        padding: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => handleNavigatePeriod(-1)}
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '12px', color: '#0F172A' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={handleResetToday}
              style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
            >
              Today
            </button>

            <button
              onClick={() => handleNavigatePeriod(1)}
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '12px', color: '#0F172A' }}
            >
              Next <ChevronRight size={16} />
            </button>

            {/* Date Picker Input */}
            <input
              type="date"
              value={currentDateStr}
              onChange={(e) => e.target.value && setCurrentDateStr(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', fontWeight: 700 }}
            />
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '360px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search tasks, subtasks, habits or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', fontWeight: 700 }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', fontWeight: 700 }}
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select
            value={trackingModeFilter}
            onChange={(e) => setTrackingModeFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', fontWeight: 700 }}
          >
            <option value="ALL">All Tracking Modes</option>
            <option value="end_date">End Date</option>
            <option value="count_days">Count Days</option>
            <option value="count_event">Count Event</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', fontWeight: 700 }}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed Only</option>
            <option value="PENDING">Pending Only</option>
          </select>

        </div>
      </div>

      {/* 3. Sub-View Container */}
      {viewMode === 'DAY' && (
        <CalendarDayView
          dateData={filteredDateMap[currentDateStr]}
          onSelectDate={(d) => setSelectedInspectDate(d)}
          onToggleTask={onToggleTask}
          onRescheduleTask={(t) => setRescheduleTaskTarget(t)}
        />
      )}

      {viewMode === '3-DAY' && (
        <Calendar3DayView
          dateMap={filteredDateMap}
          rangeDates={rawCalendarData.rangeDates}
          onSelectDate={(d) => setSelectedInspectDate(d)}
          onRescheduleTask={(t) => setRescheduleTaskTarget(t)}
        />
      )}

      {viewMode === 'WEEK' && (
        <CalendarWeekView
          dateMap={filteredDateMap}
          rangeDates={rawCalendarData.rangeDates}
          onSelectDate={(d) => setSelectedInspectDate(d)}
        />
      )}

      {viewMode === 'MONTH' && (
        <CalendarMonthView
          dateMap={filteredDateMap}
          currentDate={currentDateStr}
          onSelectDate={(d) => setSelectedInspectDate(d)}
        />
      )}

      {viewMode === 'YEAR' && (
        <CalendarYearView
          dateMap={filteredDateMap}
          onSelectDate={(d) => setSelectedInspectDate(d)}
        />
      )}

      {/* 4. Inspection Side/Bottom Panel */}
      {selectedInspectDate && (
        <CalendarDailyDetailPanel
          dateData={rawCalendarData.dateMap[selectedInspectDate]}
          onClose={() => setSelectedInspectDate(null)}
          onToggleTask={onToggleTask}
          onRescheduleTask={(t) => setRescheduleTaskTarget(t)}
        />
      )}

      {/* 5. Reschedule Modal */}
      {rescheduleTaskTarget && (
        <CalendarRescheduleModal
          isOpen={!!rescheduleTaskTarget}
          task={rescheduleTaskTarget}
          onClose={() => setRescheduleTaskTarget(null)}
          onSaveReschedule={(taskId, newStart, newEnd) => {
            if (onRescheduleTask) onRescheduleTask(taskId, newStart, newEnd);
          }}
        />
      )}
    </div>
  );
}
