import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ChevronRight, Edit3, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { diaryDB, safeUUID } from '../../lib/diaryDB';

export default function StoryLibraryView({ onOpenEntry }) {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [showNewStoryForm, setShowNewStoryForm] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const all = await diaryDB.stories.reverse().sortBy('updatedAt');
    setStories(all || []);
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    const newStory = {
      id: 'story-' + safeUUID(),
      diaryId: 'diary-story',
      title: newStoryTitle.trim(),
      author: 'User',
      chapterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await diaryDB.stories.add(newStory);
    setNewStoryTitle('');
    setShowNewStoryForm(false);
    loadStories();
  };

  const deleteStory = async (e, storyId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this story collection and all its chapters?')) {
      await diaryDB.stories.delete(storyId);
      const storyEntries = await diaryDB.entries.where('storyId').equals(storyId).toArray();
      for (const ent of storyEntries) {
        await diaryDB.entries.delete(ent.id);
      }
      if (selectedStory && selectedStory.id === storyId) {
        setSelectedStory(null);
      }
      loadStories();
    }
  };

  const openStoryChapters = async (story) => {
    setSelectedStory(story);
    const storyEntries = await diaryDB.entries
      .where('storyId')
      .equals(story.id)
      .sortBy('chapterNumber');
    setChapters(storyEntries || []);
  };

  const handleAddChapter = () => {
    if (!selectedStory) return;
    const nextChapterNum = chapters.length + 1;
    onOpenEntry({
      diaryId: 'diary-story',
      storyId: selectedStory.id,
      title: `Chapter ${nextChapterNum}`,
      isChapter: true,
      chapterNumber: nextChapterNum,
      date: new Date().toISOString().split('T')[0],
      content: ''
    });
  };

  if (selectedStory) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={() => setSelectedStory(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Back to Stories Library
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              📖 {selectedStory.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
              {chapters.length} Chapters • Ongoing Story Continuation
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={(e) => deleteStory(e, selectedStory.id)}
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={15} /> Delete Story
            </button>
            <button
              onClick={handleAddChapter}
              style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> New Chapter
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chapters.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              No chapters written yet for this story. Click "New Chapter" to start writing!
            </div>
          ) : (
            chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => onOpenEntry(ch)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
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
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Chapter {ch.chapterNumber || idx + 1}: {ch.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    {ch.date} • {(ch.content || '').replace(/<[^>]*>?/gm, '').slice(0, 60)}...
                  </div>
                </div>
                <ChevronRight size={18} color="#DC2626" />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Ongoing Story Collections
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
            Maintain multi-chapter continuous stories locally.
          </p>
        </div>
        <button
          onClick={() => setShowNewStoryForm(true)}
          style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Story
        </button>
      </div>

      {showNewStoryForm && (
        <form onSubmit={handleCreateStory} style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '2px solid #DC2626', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Create New Story Collection</h4>
          <input
            type="text"
            placeholder="Story Title (e.g. The Lost Kingdom / Personal Chronicles)"
            value={newStoryTitle}
            onChange={(e) => setNewStoryTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', marginBottom: '14px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setShowNewStoryForm(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}>Cancel</button>
            <button type="submit" style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Create Story</button>
          </div>
        </form>
      )}

      {stories.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
          <BookOpen size={32} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>No stories created yet</p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Click "New Story" above to start your first story collection.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {stories.map(s => (
            <div
              key={s.id}
              onClick={() => openStoryChapters(s)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '18px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                minHeight: '120px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={22} color="#DC2626" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{s.title}</h4>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{s.chapterCount || 0} chapters</span>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteStory(e, s.id)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                  title="Delete Story"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>Updated {new Date(s.updatedAt).toLocaleDateString()}</span>
                <ChevronRight size={16} color="#DC2626" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
