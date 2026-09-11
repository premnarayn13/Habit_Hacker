import React, { useState, useEffect } from 'react';
import DiaryHomeDashboard from './diary/DiaryHomeDashboard';
import DiaryEditorView from './diary/DiaryEditorView';
import StoryLibraryView from './diary/StoryLibraryView';
import QuickNotesView from './diary/QuickNotesView';
import TodoRemindersView from './diary/TodoRemindersView';
import DiaryLockModal from './diary/DiaryLockModal';
import DiaryExportModal from './diary/DiaryExportModal';
import { diaryDB, initDiaryDB } from '../lib/diaryDB';
import { ArrowLeft, Plus, Lock, Download, ChevronRight, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DiaryMainView({ user }) {
  const [viewState, setViewState] = useState('DASHBOARD'); // 'DASHBOARD', 'ENTRIES_LIST', 'EDITOR', 'STORIES', 'NOTES', 'TODOS'
  const [activeDiary, setActiveDiary] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [securityConfig, setSecurityConfig] = useState(null);

  const userId = user ? (user.id || user.email || 'default_user') : 'default_user';

  useEffect(() => {
    initDiaryDB();
    loadSecurityConfig();
  }, [userId]);

  const loadSecurityConfig = async () => {
    try {
      const { data } = await supabase
        .from('diary_security_config')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) {
        setSecurityConfig({
          passwordHash: data.password_hash,
          passwordSalt: data.password_salt,
          lockPolicy: data.lock_policy
        });
      }
    } catch (e) {
      console.log('No remote diary security config found, running in local vault mode.');
    }
  };

  const handleSaveSecurityConfig = async (newConfig) => {
    setSecurityConfig(newConfig);
    try {
      await supabase.from('diary_security_config').upsert({
        user_id: userId,
        password_hash: newConfig.passwordHash,
        password_salt: newConfig.passwordSalt,
        lock_policy: newConfig.lockPolicy,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to sync security config to PostgreSQL:', e);
    }
  };

  const openDiaryEntries = async (diary) => {
    if (diary.isLocked && !isUnlocked) {
      setActiveDiary(diary);
      setShowLockModal(true);
      return;
    }

    setActiveDiary(diary);
    const list = await diaryDB.entries
      .where('diaryId')
      .equals(diary.id)
      .reverse()
      .sortBy('updatedAt');
    setEntries(list || []);
    setViewState('ENTRIES_LIST');
  };

  const handleOpenEntry = (entryObj) => {
    setActiveEntry(entryObj);
    setViewState('EDITOR');
  };

  const handleCreateNewEntry = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: 'entry-' + crypto.randomUUID(),
      diaryId: activeDiary ? activeDiary.id : 'diary-personal',
      title: `${activeDiary ? activeDiary.name : 'Personal'} - ${todayStr}`,
      content: '',
      date: todayStr,
      isChapter: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActiveEntry(newEntry);
    setViewState('EDITOR');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px', boxSizing: 'border-box' }}>
      {/* View State Switcher */}
      {viewState === 'DASHBOARD' && (
        <DiaryHomeDashboard
          onOpenDiary={openDiaryEntries}
          onOpenStoryLibrary={() => setViewState('STORIES')}
          onOpenNotes={() => setViewState('NOTES')}
          onOpenTodos={() => setViewState('TODOS')}
          onLockVault={() => setShowLockModal(true)}
          securityConfig={securityConfig}
          isUnlocked={isUnlocked}
        />
      )}

      {viewState === 'ENTRIES_LIST' && activeDiary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => setViewState('DASHBOARD')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {activeDiary.name}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                {entries.length} Entries • Device-Local Storage
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowExportModal(true)}
                style={{ backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={handleCreateNewEntry}
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Today's Entry
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                <FileText size={32} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>No entries in this diary yet</p>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Click "Today's Entry" above to start writing.</p>
              </div>
            ) : (
              entries.map(ent => (
                <div
                  key={ent.id}
                  onClick={() => handleOpenEntry(ent)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{ent.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {ent.date} • {(ent.content || '').replace(/<[^>]*>?/gm, '').slice(0, 80)}...
                    </div>
                  </div>
                  <ChevronRight size={18} color="#DC2626" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {viewState === 'EDITOR' && (
        <DiaryEditorView
          entry={activeEntry}
          onBack={() => setViewState(activeDiary ? 'ENTRIES_LIST' : 'DASHBOARD')}
          onOpenExport={() => setShowExportModal(true)}
        />
      )}

      {viewState === 'STORIES' && (
        <div>
          <button
            onClick={() => setViewState('DASHBOARD')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginBottom: '14px' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
          <StoryLibraryView onOpenEntry={handleOpenEntry} />
        </div>
      )}

      {viewState === 'NOTES' && (
        <div>
          <button
            onClick={() => setViewState('DASHBOARD')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginBottom: '14px' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
          <QuickNotesView />
        </div>
      )}

      {viewState === 'TODOS' && (
        <div>
          <button
            onClick={() => setViewState('DASHBOARD')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginBottom: '14px' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
          <TodoRemindersView />
        </div>
      )}

      {/* Lock & Export Modals */}
      <DiaryLockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onUnlockSuccess={() => {
          setIsUnlocked(true);
          if (activeDiary) {
            openDiaryEntries(activeDiary);
          }
        }}
        securityConfig={securityConfig}
        onSaveSecurityConfig={handleSaveSecurityConfig}
      />

      <DiaryExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        diaryName={activeDiary ? activeDiary.name : 'Personal Diary'}
        entries={entries}
        securityConfig={securityConfig}
      />
    </div>
  );
}
