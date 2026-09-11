import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, ShieldCheck, Download, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3 } from 'lucide-react';
import { diaryDB, safeUUID } from '../../lib/diaryDB';

export default function DiaryEditorView({ entry, onBack, onOpenExport }) {
  const [title, setTitle] = useState(entry ? entry.title : '');
  const [content, setContent] = useState(entry ? entry.content : '');
  const [entryDate, setEntryDate] = useState(entry ? entry.date : new Date().toISOString().split('T')[0]);
  const [saveStatus, setSaveStatus] = useState('Saved locally');
  const timerRef = useRef(null);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setEntryDate(entry.date || new Date().toISOString().split('T')[0]);
    }
  }, [entry]);

  // Debounced Autosave Engine (800ms)
  const handleContentChange = (newText) => {
    setContent(newText);
    setSaveStatus('Saving locally...');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await saveCurrentEntry(title, newText, entryDate);
      setSaveStatus('Saved locally');
    }, 800);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setSaveStatus('Saving locally...');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await saveCurrentEntry(newTitle, content, entryDate);
      setSaveStatus('Saved locally');
    }, 800);
  };

  const saveCurrentEntry = async (tStr, cStr, dStr) => {
    const now = new Date().toISOString();
    const entryId = entry && entry.id ? entry.id : 'entry-' + safeUUID();

    const record = {
      id: entryId,
      diaryId: entry ? entry.diaryId : 'diary-personal',
      storyId: entry ? entry.storyId : null,
      title: tStr || 'Untitled Entry',
      content: cStr || '',
      date: dStr,
      isChapter: entry ? Boolean(entry.isChapter) : false,
      chapterNumber: entry ? entry.chapterNumber : null,
      updatedAt: now,
      createdAt: entry && entry.createdAt ? entry.createdAt : now
    };

    await diaryDB.entries.put(record);
  };

  const applyFormatting = (tag) => {
    const textarea = document.getElementById('diary-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let formatted = selected;
    if (tag === 'bold') formatted = `**${selected || 'bold text'}**`;
    else if (tag === 'italic') formatted = `*${selected || 'italic text'}*`;
    else if (tag === 'h1') formatted = `\n# ${selected || 'Heading 1'}\n`;
    else if (tag === 'h2') formatted = `\n## ${selected || 'Heading 2'}\n`;
    else if (tag === 'quote') formatted = `\n> ${selected || 'Quote text'}\n`;
    else if (tag === 'list') formatted = `\n- ${selected || 'List item'}\n`;

    const newContent = content.substring(0, start) + formatted + content.substring(end);
    handleContentChange(newContent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', backgroundColor: '#FAFAF9', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxSizing: 'border-box' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          onClick={async () => {
            await saveCurrentEntry(title, content, entryDate);
            onBack();
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Back to Library
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#16A34A" /> {saveStatus}
          </span>
          <button
            onClick={() => onOpenExport(entry)}
            style={{ backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export Entry
          </button>
        </div>
      </div>

      {/* Entry Metadata Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#475569', backgroundColor: '#FFFFFF' }}
        />
        <input
          type="text"
          placeholder="Entry Title (e.g. September 11 Reflection)"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          style={{ flex: 1, minWidth: '200px', fontSize: '18px', fontWeight: 800, border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#0F172A' }}
        />
      </div>

      {/* Rich Formatting Toolbar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => applyFormatting('bold')} style={toolBtnStyle} title="Bold"><Bold size={14} /></button>
        <button type="button" onClick={() => applyFormatting('italic')} style={toolBtnStyle} title="Italic"><Italic size={14} /></button>
        <button type="button" onClick={() => applyFormatting('h1')} style={toolBtnStyle} title="Heading 1"><Heading1 size={14} /></button>
        <button type="button" onClick={() => applyFormatting('h2')} style={toolBtnStyle} title="Heading 2"><Heading2 size={14} /></button>
        <button type="button" onClick={() => applyFormatting('quote')} style={toolBtnStyle} title="Quote"><Quote size={14} /></button>
        <button type="button" onClick={() => applyFormatting('list')} style={toolBtnStyle} title="Bullet List"><List size={14} /></button>
      </div>

      {/* Main Textarea Writing Area */}
      <textarea
        id="diary-textarea"
        placeholder="Start writing your thoughts, lessons, story chapters or proverb reflections..."
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '400px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#1E293B',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
}

const toolBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  color: '#475569',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
