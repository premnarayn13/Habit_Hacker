import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Quote, Calendar, Lock, Plus, Search, ChevronRight, FileText, StickyNote, Bell, ShieldCheck, Download } from 'lucide-react';
import { diaryDB, initDiaryDB, DEFAULT_DIARIES } from '../../lib/diaryDB';

export default function DiaryHomeDashboard({ onOpenDiary, onOpenStoryLibrary, onOpenNotes, onOpenTodos, onLockVault, securityConfig, isUnlocked }) {
  const [diaries, setDiaries] = useState([]);
  const [entryCounts, setEntryCounts] = useState({});
  const [recentEntries, setRecentEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDiaryName, setNewDiaryName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await initDiaryDB();
    const allDiaries = await diaryDB.diaries.orderBy('displayOrder').toArray();
    setDiaries(allDiaries || []);

    const counts = {};
    for (const d of allDiaries) {
      const cnt = await diaryDB.entries.where('diaryId').equals(d.id).count();
      counts[d.id] = cnt;
    }
    setEntryCounts(counts);

    const recents = await diaryDB.entries.reverse().sortBy('updatedAt');
    setRecentEntries((recents || []).slice(0, 5));
  };

  const handleCreateCustomDiary = async (e) => {
    e.preventDefault();
    if (!newDiaryName.trim()) return;

    const newDiary = {
      id: 'diary-custom-' + crypto.randomUUID(),
      name: newDiaryName,
      type: 'CUSTOM',
      icon: 'BookOpen',
      isLocked: false,
      displayOrder: diaries.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await diaryDB.diaries.add(newDiary);
    setNewDiaryName('');
    setShowAddModal(false);
    loadData();
  };

  const getIconComponent = (iconName) => {
    if (iconName === 'Lightbulb') return <Lightbulb size={22} color="#DC2626" />;
    if (iconName === 'Quote') return <Quote size={22} color="#DC2626" />;
    if (iconName === 'Calendar') return <Calendar size={22} color="#DC2626" />;
    if (iconName === 'Lock') return <Lock size={22} color="#DC2626" />;
    return <BookOpen size={22} color="#DC2626" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Welcome Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
              Private Device-Local Vault
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#16A34A" /> Offline Storage Active
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Personal Writing & Reflections
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Maintain daily lessons, proverbs, ongoing stories, events, quick notes & local reminders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onLockVault}
            style={{
              backgroundColor: isUnlocked ? '#FEF2F2' : '#F1F5F9',
              color: isUnlocked ? '#DC2626' : '#475569',
              border: '1px solid #CBD5E1',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lock size={16} /> {isUnlocked ? 'Lock Vault' : 'Vault Security'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> New Diary
          </button>
        </div>
      </div>

      {/* Add Custom Diary Modal */}
      {showAddModal && (
        <form onSubmit={handleCreateCustomDiary} style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #DC2626' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Create Custom Diary Folder</h4>
          <input
            type="text"
            placeholder="e.g. Travel Journal, Internship Notes, Project Ideas"
            value={newDiaryName}
            onChange={(e) => setNewDiaryName(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Create Diary</button>
          </div>
        </form>
      )}

      {/* Main 5 Default Diaries & Collections Library */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            📖 My Diaries Library
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>{diaries.length} Collections</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {diaries.map(d => (
            <div
              key={d.id}
              onClick={() => {
                if (d.type === 'STORY_HUB') onOpenStoryLibrary();
                else onOpenDiary(d);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '120px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIconComponent(d.icon)}
                  </div>
                  {d.isLocked && <Lock size={16} color="#DC2626" title="Locked Password Protected" />}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '12px 0 4px 0' }}>
                  {d.name}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  {entryCounts[d.id] || 0} entries written
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                  {d.type === 'STORY_HUB' ? 'Open Story Chapters' : 'Write / Browse Entries'}
                </span>
                <ChevronRight size={16} color="#DC2626" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Modules: Notes & Reminders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Quick Notes Card */}
        <div
          onClick={onOpenNotes}
          style={{
            backgroundColor: '#FEF3C7',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #FCD34D',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <StickyNote size={24} color="#D97706" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#78350F' }}>Quick Notes</h4>
          </div>
          <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
            Fast temporary sticky notes, code snippets & app ideas.
          </p>
        </div>

        {/* Local Reminders Card */}
        <div
          onClick={onOpenTodos}
          style={{
            backgroundColor: '#E0F2FE',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #7DD3FC',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Bell size={24} color="#0284C7" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#075985' }}>Todo Reminders</h4>
          </div>
          <p style={{ fontSize: '12px', color: '#0369A1', margin: 0 }}>
            Independent personal todo list & scheduled device alarms.
          </p>
        </div>
      </div>
    </div>
  );
}
