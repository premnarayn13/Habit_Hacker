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
  User
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  capacityData, 
  currentUser,
  onToggleSidebar, 
  onTriggerAlertPreview,
  onOpenQuickAdd,
  onOpenAuth
}) {
  const isOverloaded = capacityData?.isOverloaded;

  return (
    <>
      {/* Top Mobile-Responsive Navbar */}
      <header className="glass-panel" style={{ padding: '10px 16px', margin: '10px 12px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Hamburger Menu & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={onToggleSidebar}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A'
              }}
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-red)'
              }}>
                <Flame size={20} color="#FFF" />
              </div>
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>HABIT HACKER</h1>
                <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Task & Discipline System</p>
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
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={13} color="#DC2626" />
              <span>Overplanned (+{capacityData.overloadMinutes}m)</span>
            </div>
          )}

          {/* Top Desktop Navigation Shortcuts */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '4px', background: '#F8FAFC', padding: '3px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <button 
              className={`btn-secondary ${activeTab === 'widgets' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('widgets')}
              style={{ border: 'none', padding: '6px 12px', fontSize: '12px', background: activeTab === 'widgets' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : 'transparent', color: activeTab === 'widgets' ? '#FFF' : '#334155' }}
            >
              <GridIcon size={14} /> Widgets Hub
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

          {/* User Auth Avatar & Quick Add Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={onOpenAuth}
              style={{
                background: currentUser ? '#DC2626' : '#F1F5F9',
                color: currentUser ? '#FFF' : '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Supabase Account Login / Register"
            >
              <User size={14} />
              <span>{currentUser ? (currentUser.user_metadata?.display_name || 'Profile') : 'Login'}</span>
            </button>

            <button className="btn-primary" onClick={onOpenQuickAdd} style={{ padding: '6px 12px', height: '34px', minHeight: '34px', fontSize: '12px' }}>
              <Plus size={14} /> Add Task
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
