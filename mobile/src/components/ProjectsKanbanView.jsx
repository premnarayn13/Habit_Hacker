import React, { useState } from 'react';
import { Briefcase, Plus, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ProjectsKanbanView({ tasks }) {
  const columns = [
    { title: 'To Do', status: 'PLANNED', color: '#475569' },
    { title: 'In Progress', status: 'IN_PROGRESS', color: '#D97706' },
    { title: 'Completed', status: 'COMPLETED', color: '#DC2626' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={24} color="#DC2626" /> Projects & Kanban Board
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Visual kanban columns for task workflows.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {columns.map(col => {
          const colTasks = tasks.filter(t => (col.status === 'COMPLETED' ? t.progressPercent === 100 : t.progressPercent < 100));
          return (
            <div key={col.title} className="glass-panel" style={{ padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: col.color }}>{col.title}</h3>
                <span className="badge badge-medium">{colTasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.map(t => (
                  <div key={t.id} style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>📁 {t.category}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
