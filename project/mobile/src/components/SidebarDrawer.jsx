import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckSquare, 
  Layers, 
  Calendar, 
  Grid, 
  BarChart3, 
  BookOpen, 
  Flame, 
  Target, 
  Sliders, 
  User,
  Zap,
  Bookmark,
  Plus,
  Crown,
  Inbox,
  ShoppingBag,
  Activity,
  Star,
  Smile,
  Coffee,
  Music,
  Camera,
  DollarSign,
  Compass,
  Globe,
  Terminal,
  Laptop,
  PenTool,
  Palette,
  Utensils,
  Home as HomeIcon,
  Car,
  Award,
  Shield,
  Sun,
  Moon,
  Cpu,
  Folder,
  Sparkles,
  PhoneCall,
  Lightbulb,
  LogOut
} from 'lucide-react';

const ICON_MAP = {
  Briefcase: User,
  User,
  Activity,
  BookOpen,
  ShoppingBag,
  Star,
  Target,
  Flame,
  Zap,
  Smile,
  Coffee,
  Music,
  Camera,
  DollarSign,
  Compass,
  Globe,
  Terminal,
  Laptop,
  PenTool,
  Palette,
  Utensils,
  Home: HomeIcon,
  Car,
  CheckSquare,
  Calendar,
  Award,
  Shield,
  Sun,
  Moon,
  Cpu,
  Folder,
  Layers,
  Sparkles,
  PhoneCall,
  Lightbulb,
  Bookmark
};

const ICON_NAMES = Object.keys(ICON_MAP);

const DEFAULT_CATEGORY_ICONS = {
  'Fitness': 'Activity',
  'Personal': 'User',
  'General': 'Bookmark',
  'Shopping': 'ShoppingBag',
  'Mindfulness': 'Smile',
  'Productivity': 'Zap',
  'Goals': 'Target',
  'Finance': 'DollarSign',
  'Hobbies': 'Camera',
  'Routine': 'Clock',
  'Streak': 'Flame',
  'Entertainment': 'Music'
};

export default function SidebarDrawer({ isOpen, onClose, activeTab, setActiveTab, tasks = [], onSelectCategory, onLogout, currentUser }) {
  if (!isOpen) return null;

  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('hh_sidebar_categories_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('Bookmark');

  useEffect(() => {
    try {
      localStorage.setItem('hh_sidebar_categories_v1', JSON.stringify(customCategories));
    } catch (e) {}
  }, [customCategories]);

  const categories = useMemo(() => {
    const defaultList = [
      { id: 'cat-fitness', name: 'Fitness', iconName: 'Activity' },
      { id: 'cat-personal', name: 'Personal', iconName: 'User' },
      { id: 'cat-general', name: 'General', iconName: 'Bookmark' },
      { id: 'cat-shopping', name: 'Shopping', iconName: 'ShoppingBag' },
      { id: 'cat-mindfulness', name: 'Mindfulness', iconName: 'Smile' },
      { id: 'cat-productivity', name: 'Productivity', iconName: 'Zap' }
    ];

    const categoryMap = new Map();
    defaultList.forEach(item => categoryMap.set(item.name, item));

    (tasks || []).forEach(t => {
      if (t && t.category && !categoryMap.has(t.category)) {
        const iconName = DEFAULT_CATEGORY_ICONS[t.category] || 'Bookmark';
        categoryMap.set(t.category, {
          id: `cat-task-${t.category.toLowerCase().replace(/\s+/g, '-')}`,
          name: t.category,
          iconName
        });
      }
    });

    (customCategories || []).forEach(cc => {
      if (cc && cc.name) {
        categoryMap.set(cc.name, {
          id: cc.id || `cat-custom-${Date.now()}`,
          name: cc.name,
          iconName: cc.iconName || 'Bookmark'
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [tasks, customCategories]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    
    setCustomCategories(prev => [
      ...prev.filter(c => c.name.toLowerCase() !== catName.toLowerCase()),
      { id: `c-${Date.now()}`, name: catName, iconName: selectedIconName }
    ]);

    setNewCategoryName('');
    setSelectedIconName('Bookmark');
    setIsAddCategoryOpen(false);
  };

  const menuItems = [
    { id: 'widgets', label: 'Home', icon: Grid },
    { id: 'today', label: 'Today Dashboard', icon: CheckSquare },
    { id: 'tasks', label: 'Habits & Subhabits', icon: Layers },
    { id: 'calendar', label: 'Smart Calendar', icon: Calendar },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3 },
    { id: 'diary', label: 'Private Diary', icon: BookOpen },
    { id: 'goals', label: 'Goals Management', icon: Target },
    { id: 'settings', label: 'Settings & Profile', icon: Sliders }
  ];

  const SelectedIconComponent = ICON_MAP[selectedIconName] || Bookmark;

  const displayName = currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Profile Header */}
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
              {initial}
              <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#D97706', borderRadius: '50%', padding: '2px' }}>
                <Crown size={12} color="#FFF" />
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{displayName}</h3>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{currentUser?.email || 'Pro Member'}</span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Quick Navigation Lists */}
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#DC2626" /> Today Dashboard
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>
              {(tasks || []).filter(t => t && !t.parentTaskId).length}
            </span>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Inbox size={18} color="#475569" /> All Habits & Subhabits
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>
              {(tasks || []).length}
            </span>
          </button>
        </div>

        {/* Dynamic Categories List Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>
            PROJECT CATEGORIES ({categories.length})
          </span>
          <button 
            onClick={() => setIsAddCategoryOpen(prev => !prev)}
            style={{
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Inline Category Creation Panel */}
        {isAddCategoryOpen && (
          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Create New Category
            </div>

            <input 
              type="text" 
              placeholder="Category name (e.g., Coding, Fitness)..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                marginBottom: '10px',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                Select Icon:
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SelectedIconComponent size={14} /> {selectedIconName}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '6px',
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '6px',
              background: '#FFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '10px'
            }}>
              {ICON_NAMES.map(iconName => {
                const IconComp = ICON_MAP[iconName] || Bookmark;
                const isSelected = selectedIconName === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    onClick={() => setSelectedIconName(iconName)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #DC2626' : '1px solid #E2E8F0',
                      background: isSelected ? '#FEF2F2' : '#FFF',
                      color: isSelected ? '#DC2626' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComp size={16} />
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsAddCategoryOpen(false)} 
                style={{
                  background: 'transparent',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory} 
                style={{
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Save Category
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Categories & Main Menu List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
          {categories.map(cat => {
            const Icon = ICON_MAP[cat.iconName] || Bookmark;
            const count = (tasks || []).filter(t => t && t.category === cat.name).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(cat.name);
                  }
                  setActiveTab('tasks');
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1E293B',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color="#DC2626" />
                  <span>{cat.name}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                  {count}
                </span>
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '10px', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
              MAIN NAVIGATION
            </div>
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
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Direct LogOut Button */}
            <button
              onClick={() => {
                if (onLogout) onLogout();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                width: '100%',
                marginTop: '14px',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
