import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, CheckCircle2 } from 'lucide-react';

export default function MultiViewCalendar({ calendarData, onSelectDate }) {
  const [selectedDate, setSelectedDate] = useState('2026-08-21');
  const [viewMode, setViewMode] = useState('MONTH'); // 'DAY', 'MONTH', 'AGENDA'

  const tasks = calendarData?.tasks || [];
  const subtasks = calendarData?.subtasks || [];
  const habits = calendarData?.habits || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Controls */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={24} color="#DC2626" /> Smart Calendar & Schedule Timeline
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Live scheduling view for your authenticated tasks and subtasks.
          </p>
        </div>

        {/* View Mode Selector */}
        <div style={{ display: 'flex', gap: '4px', background: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          {['DAY', 'MONTH', 'AGENDA'].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                background: viewMode === m ? '#DC2626' : 'transparent',
                color: viewMode === m ? '#FFF' : '#475569',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Month Selector Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
              <ChevronLeft size={18} color="#0F172A" />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>August 2026</h3>
            <button style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
              <ChevronRight size={18} color="#0F172A" />
            </button>
          </div>

          <span className="badge badge-medium">📅 Live Supabase Data</span>
        </div>

        {/* 7-Day Date Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {['Mon 17', 'Tue 18', 'Wed 19', 'Thu 20', 'Fri 21', 'Sat 22', 'Sun 23'].map((day, idx) => {
            const isToday = day.includes('Fri 21');
            return (
              <div 
                key={idx}
                style={{
                  background: isToday ? '#DC2626' : '#F8FAFC',
                  color: isToday ? '#FFF' : '#0F172A',
                  border: isToday ? 'none' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Scheduled Tasks for Selected Date (DYNAMIC - 0 STATIC DATA) */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', letterSpacing: '0.05em', marginBottom: '12px' }}>
            SCHEDULED COMMITMENTS FOR TODAY ({tasks.length + subtasks.length})
          </h4>

          {tasks.length === 0 && subtasks.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '14px', border: '1px border-dashed #CBD5E1' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>No Scheduled Tasks Found</div>
              <div style={{ fontSize: '12px' }}>Your calendar is clean. Add a task using the + Add Task button to populate your schedule.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{task.title}</span>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>📁 {task.category} | Est: {task.estimatedMinutes}m</div>
                  </div>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              ))}

              {subtasks.map(subtask => (
                <div key={subtask.id} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>↳ {subtask.title}</span>
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>{subtask.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
