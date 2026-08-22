import React, { useState } from 'react';
import { Bookmark, Play, Plus, Clock, CheckCircle2 } from 'lucide-react';

export default function RoutinesTemplatesView() {
  const [routines, setRoutines] = useState([
    {
      id: 'r-1',
      name: 'Morning Discipline Routine',
      description: 'Hydrate 500ml, 15m stretch, review daily tasks, and start first focus session.',
      timeOfDay: 'Morning (07:00 AM)',
      durationMinutes: 30,
      stepsCount: 4
    },
    {
      id: 'r-2',
      name: 'Evening Review & Diary Routine',
      description: 'Review task history, log reflection diary, and plan tomorrow commitments.',
      timeOfDay: 'Evening (09:00 PM)',
      durationMinutes: 20,
      stepsCount: 3
    }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={24} color="#DC2626" /> Routines & Task Presets
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            One-tap preset routines for daily habits and workflow templates.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> New Routine
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {routines.map(r => (
          <div key={r.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-medium">⏱️ {r.timeOfDay}</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{r.name}</h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{r.description}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 700 }}>{r.durationMinutes}m | {r.stepsCount} Steps</span>
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <Play size={14} /> Start Routine
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
