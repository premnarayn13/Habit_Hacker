import React, { useState } from 'react';
import { Target, Plus, Award, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function GoalsManagementView() {
  const [goals, setGoals] = useState([
    {
      id: 'g-1',
      title: 'Master Machine Learning Architecture',
      targetDate: '2026-12-31',
      progressPercent: 65,
      keyResults: ['Read 5 papers', 'Build 2 projects', 'Submit benchmarks'],
      category: 'Education'
    },
    {
      id: 'g-2',
      title: 'Maintain 90+ Discipline Score',
      targetDate: '2026-09-30',
      progressPercent: 86,
      keyResults: ['Exercise daily', 'Sleep by 11 PM', 'Log reflection diary'],
      category: 'Health'
    }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={24} color="#DC2626" /> Objectives & Key Results (OKRs)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Connect long-term goals to daily habits and tasks.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Create Goal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {goals.map(g => (
          <div key={g.id} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-medium">📁 {g.category}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{g.title}</h3>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626' }}>{g.progressPercent}%</span>
            </div>

            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${g.progressPercent}%`, height: '100%', background: '#DC2626', borderRadius: '4px' }} />
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>KEY RESULTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {g.keyResults.map((kr, idx) => (
                <div key={idx} style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#DC2626" /> {kr}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
