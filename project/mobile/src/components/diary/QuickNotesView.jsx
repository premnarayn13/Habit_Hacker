import React, { useState, useEffect } from 'react';
import { Plus, Pin, Archive, Trash2, Search, Edit3, Check, Sparkles, StickyNote, X } from 'lucide-react';
import { diaryDB, safeUUID } from '../../lib/diaryDB';

export default function QuickNotesView() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  const handleOpenNewNote = () => {
    setActiveNote(null);
    setTitle('');
    setContent('');
    setSelectedColor('#FEF3C7');
    setShowForm(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) return;

    const now = new Date().toISOString();
    if (activeNote && activeNote.id) {
      await diaryDB.notes.update(activeNote.id, {
        title: title || 'Quick Note',
        content: content || '',
        color: selectedColor,
        updatedAt: now
      });
    } else {
      const newNote = {
        id: 'note-' + safeUUID(),
        title: title || 'Quick Note',
        content: content || '',
        isPinned: false,
        isArchived: false,
        color: selectedColor,
        createdAt: now,
        updatedAt: now
      };
      await diaryDB.notes.add(newNote);
    }

    setTitle('');
    setContent('');
    setActiveNote(null);
    setShowForm(false);
    loadNotes();
  };

  const togglePin = async (e, note) => {
    e.stopPropagation();
    await diaryDB.notes.update(note.id, { isPinned: !note.isPinned });
    loadNotes();
  };

  const deleteNote = async (e, id) => {
    e.stopPropagation();
    await diaryDB.notes.delete(id);
    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
      setTitle('');
      setContent('');
      setShowForm(false);
    }
    loadNotes();
  };

  const openEditor = (note) => {
    setActiveNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setSelectedColor(note.color || '#FEF3C7');
    setShowForm(true);
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
          onClick={handleOpenNewNote}
          style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
          }}
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Editor Card / Inline Form */}
      {showForm && (
        <div style={{
          backgroundColor: selectedColor,
          borderRadius: '14px',
          padding: '18px',
          border: '2px solid #DC2626',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
              {activeNote ? 'Edit Note' : 'Create New Note'}
            </span>
            <button
              onClick={() => { setShowForm(false); setActiveNote(null); }}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Note Title (e.g. Project Idea / Shopping List)"
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
            placeholder="Write your quick note here..."
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
              marginBottom: '14px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Color:</span>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: selectedColor === c ? '2px solid #DC2626' : '1px solid #CBD5E1',
                    cursor: 'pointer',
                    boxShadow: selectedColor === c ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setActiveNote(null); }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '6px 12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
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
          justify: 'space-between',
          minHeight: '120px'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{n.title}</h4>
            <button
              onClick={(e) => togglePin(e, n)}
              style={{ background: 'none', border: 'none', color: n.isPinned ? '#DC2626' : '#94A3B8', cursor: 'pointer', padding: '2px 4px' }}
              title={n.isPinned ? "Unpin Note" : "Pin Note"}
            >
              <Pin size={14} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#334155', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {n.content}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '10px', color: '#64748B' }}>
            {new Date(n.updatedAt).toLocaleDateString()}
          </span>
          <button
            onClick={(e) => deleteNote(e, n.id)}
            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }
}
