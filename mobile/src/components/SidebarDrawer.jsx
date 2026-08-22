import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Layers, 
  Calendar, 
  Grid, 
  BarChart3, 
  Clock, 
  BookOpen, 
  Flame, 
  Target, 
  Briefcase, 
  Sliders, 
  User,
  Zap,
  Bookmark,
  Search,
  Bell,
  Settings,
  Plus,
  Crown,
  Inbox,
  Award,
  ShoppingBag,
  Activity,
  Star
} from 'lucide-react';

export default function SidebarDrawer({ isOpen, onClose, activeTab, setActiveTab }) {
  if (!isOpen) return null;

  // Replicating image copy 4.png dynamic sections with Lucide icons (NO EMOJIS)
  const [categories, setCategories] = useState([
    { id: 'c-1', name: 'Work', icon: Briefcase },
    { id: 'c-2', name: 'Personal', icon: User },
    { id: 'c-3', name: 'Shopping', icon: ShoppingBag },
    { id: 'c-4', name: 'Learning', icon: BookOpen },
    { id: 'c-5', name: 'Fitness', icon: Activity },
    { id: 'c-6', name: 'Wish List', icon: Star }
  ]);

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setCategories(prev => [
      ...prev,
      { id: `c-${Date.now()}`, name: newSectionName.trim(), icon: Bookmark }
    ]);
    setNewSectionName('');
    setIsAddSectionOpen(false);
  };

  const menuItems = [
    { id: 'widgets', label: 'Widgets Hub', icon: Grid },
    { id: 'today', label: 'Today Dashboard', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks & Subtasks', icon: Layers },
    { id: 'calendar', label: 'Smart Calendar', icon: Calendar },
    { id: 'planner', label: 'Capacity Planner', icon: Clock },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus Timer', icon: Zap },
    { id: 'diary', label: 'Diary & Reflection', icon: BookOpen },
    { id: 'goals', label: 'Goals Management', icon: Target },
    { id: 'settings', label: 'Settings & Profile', icon: Sliders }
  ];

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Profile Header (Image copy 4.png) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '16px',
              position: 'relative'
            }}>
              PN
              <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#D97706', borderRadius: '50%', padding: '2px' }}>
                <Crown size={12} color="#FFF" />
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Prem Narayn</h3>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Pro Member</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', color: '#64748B' }}>
            <Search size={18} style={{ cursor: 'pointer' }} />
            <Bell size={18} style={{ cursor: 'pointer' }} />
            <Settings size={18} style={{ cursor: 'pointer' }} />
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Lists: Today & Inbox (Image copy 4.png) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
          <button
            onClick={() => { setActiveTab('today'); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'today' ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
              color: activeTab === 'today' ? '#DC2626' : '#0F172A',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={18} color="#DC2626" /> Today</span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>5</span>
          </button>

          <button
            onClick={() => { setActiveTab('tasks'); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'tasks' ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
              color: activeTab === 'tasks' ? '#DC2626' : '#0F172A',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Inbox size={18} color="#475569" /> Inbox</span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>10</span>
          </button>
        </div>

        {/* User Categories List (Image copy 4.png) */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
          DAILY SCHEDULE SECTIONS & LISTS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveTab('tasks'); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={16} color="#DC2626" />
                <span>{cat.name}</span>
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '10px', paddingTop: '10px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === item.id ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                    color: activeTab === item.id ? '#DC2626' : '#64748B',
                    fontSize: '13px',
                    fontWeight: activeTab === item.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom + Add Section Button */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
          {isAddSectionOpen ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                placeholder="New section name" 
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
              />
              <button onClick={handleAddSection} style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>OK</button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddSectionOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#DC2626', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={16} /> Add Section / List
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
