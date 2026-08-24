import React from 'react';
import { 
  Menu,
  CheckSquare, 
  Calendar as CalendarIcon, 
  Flame, 
  BarChart3, 
  Clock, 
  BookOpen, 
  Bell, 
  Layers,
  AlertTriangle,
  Grid as GridIcon,
  Plus,
  Zap,
  User,
  Archive
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  capacityData, 
  currentUser,
  onToggleSidebar, 
  onTriggerAlertPreview,
  onOpenQuickAdd,
  onOpenAuth,
  showArchivedVault,
  onToggleArchivedVault
}) {
  const isOverloaded = capacityData?.isOverloaded;

  return (
    <>
      {/* Top Mobile-Responsive Navbar */}
      <header className="glass-panel" style={{ padding: '8px 12px', margin: '8px 8px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '6px' }}>
          
          {/* Hamburger Menu & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button 
              onClick={onToggleSidebar}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A',
                flexShrink: 0
              }}
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-red)',
                flexShrink: 0
              }}>
                <Flame size={18} color="#FFF" />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <h1 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', margin: 0 }}>HABIT HACKER</h1>
                <p className="desktop-only-sub" style={{ fontSize: '9px', color: '#64748B', fontWeight: 600, margin: 0 }}>Task System</p>
              </div>
            </div>
          </div>

          {/* Capacity Warning Indicator Pill */}
          {isOverloaded && (
            <div 
              onClick={() => setActiveTab('planner')}
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#DC2626',
                padding: '3px 8px',
                borderRadius: '16px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={12} color="#DC2626" />
              <span>+{capacityData.overloadMinutes}m</span>
            </div>
          )}

          {/* Top Desktop Navigation Shortcuts */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '4px', background: '#F8FAFC', padding: '3px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <button 
              className={`btn-secondary ${activeTab === 'widgets' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('widgets')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'widgets' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'widgets' ? '#FFF' : '#334155' }}
            >
              <GridIcon size={14} /> Widgets
            </button>

            <button 
              className={`btn-secondary ${activeTab === 'today' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('today')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'today' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'today' ? '#FFF' : '#334155' }}
            >
              <CheckSquare size={14} /> Today
            </button>

            <button 
              className={`btn-secondary ${activeTab === 'tasks' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('tasks')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'tasks' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'tasks' ? '#FFF' : '#334155' }}
            >
              <Layers size={14} /> Tasks
            </button>

            <button 
              className={`btn-secondary ${activeTab === 'calendar' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('calendar')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'calendar' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'calendar' ? '#FFF' : '#334155' }}
            >
              <CalendarIcon size={14} /> Calendar
            </button>

            <button 
              className={`btn-secondary ${activeTab === 'analytics' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('analytics')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'analytics' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'analytics' ? '#FFF' : '#334155' }}
            >
              <BarChart3 size={14} /> Analytics
            </button>
          </nav>

          {/* Archived Vault & Quick Add Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {onToggleArchivedVault && (
              <button
                className="btn-secondary"
                onClick={onToggleArchivedVault}
                style={{
                  color: showArchivedVault ? '#DC2626' : '#475569',
                  borderColor: showArchivedVault ? '#DC2626' : '#CBD5E1',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '5px 8px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title="Toggle Archived Task Vault"
              >
                <Archive size={13} /> Vault
              </button>
            )}

            <button 
              className="btn-primary" 
              onClick={onOpenQuickAdd} 
              style={{ padding: '5px 10px', height: '32px', minHeight: '32px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              <Plus size={13} /> Add Task
            </button>
          </div>

        </div>
      </header>

      {/* Permanent Bottom Navigation Bar */}
      <nav className="app-bottom-nav">
        <button className={`bottom-nav-item ${activeTab === 'widgets' ? 'active' : ''}`} onClick={() => setActiveTab('widgets')}>
          <GridIcon size={18} />
          <span>Widgets</span>
        </button>

        <button className={`bottom-nav-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
          <CheckSquare size={18} />
          <span>Today</span>
        </button>

        <button className={`bottom-nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <Layers size={18} />
          <span>Tasks</span>
        </button>

        <button className={`bottom-nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <CalendarIcon size={18} />
          <span>Calendar</span>
        </button>

        <button className={`bottom-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>

        <button className={`bottom-nav-item ${activeTab === 'focus' ? 'active' : ''}`} onClick={() => setActiveTab('focus')}>
          <Zap size={18} />
          <span>Focus</span>
        </button>
      </nav>
    </>
  );
}
