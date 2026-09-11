import React, { useState, useEffect } from 'react';
import { Plus, Pin, Archive, Trash2, Search, Edit3, Check, Sparkles, StickyNote } from 'lucide-react';
import { diaryDB, safeUUID } from '../../lib/diaryDB';

export default function QuickNotesView() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FEF3C7');

  const COLORS = ['#FEF3C7', '#E0F2FE', '#DCFCE7', '#FCE7F3', '#F3E8FF', '#FFFFFF'];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const all = await diaryDB.notes.reverse().sortBy('createdAt');
    setNotes(all || []);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) return;

    const now = new Date().toISOString();
    if (activeNote) {
      await diaryDB.notes.update(activeNote.id, {
        title,
        content,
        color: selectedColor,
        updatedAt: now
      });
    } else {
      await diaryDB.notes.add({
        id: 'note-' + safeUUID(),
        title: title || 'Quick Note',
        content,
        isPinned: false,
        isArchived: false,
        color: selectedColor,
        createdAt: now,
        updatedAt: now
      });
    }

    setTitle('');
    setContent('');
    setActiveNote(null);
    loadNotes();
  };

  const togglePin = async (note) => {
    await diaryDB.notes.update(note.id, { isPinned: !note.isPinned });
    loadNotes();
  };

  const deleteNote = async (id) => {
    await diaryDB.notes.delete(id);
    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
      setTitle('');
      setContent('');
    }
    loadNotes();
  };

  const openEditor = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setSelectedColor(note.color || '#FEF3C7');
  };

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Create Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          onClick={() => { setActiveNote(null); setTitle(''); setContent(''); }}
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
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {(activeNote !== null || title || content) && (
        <div style={{
          backgroundColor: selectedColor,
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              fontSize: '16px',
              fontWeight: 800,
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              marginBottom: '10px',
              color: '#0F172A'
            }}
          />
          <textarea
            placeholder="Write a quick note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              fontSize: '13px',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              resize: 'vertical',
              color: '#334155',
              fontFamily: 'inherit',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: selectedColor === c ? '2px solid #DC2626' : '1px solid #94A3B8',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setActiveNote(null); setTitle(''); setContent(''); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Notes Grid */}
      {pinnedNotes.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Pin size={12} /> Pinned Notes ({pinnedNotes.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {pinnedNotes.map(n => renderNoteCard(n))}
          </div>
        </div>
      )}

      {/* All Notes Grid */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Recent Notes ({otherNotes.length})
        </div>
        {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
            <StickyNote size={32} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>No quick notes created yet</p>
            <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Click "New Note" above to write down ideas or quick reminders.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {otherNotes.map(n => renderNoteCard(n))}
          </div>
        )}
      </div>
    </div>
  );

  function renderNoteCard(n) {
    return (
      <div
        key={n.id}
        onClick={() => openEditor(n)}
        style={{
          backgroundColor: n.color || '#FEF3C7',
          borderRadius: '12px',
          padding: '14px',
          border: '1px solid #E2E8F0',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{n.title}</h4>
            <button
              onClick={(e) => { e.stopPropagation(); togglePin(n); }}
              style={{ background: 'none', border: 'none', color: n.isPinned ? '#DC2626' : '#94A3B8', cursor: 'pointer' }}
            >
              <Pin size={14} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#334155', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {n.content}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', pt: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '10px', color: '#64748B' }}>
            {new Date(n.updatedAt).toLocaleDateString()}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }
}
