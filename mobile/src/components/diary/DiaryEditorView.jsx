import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, ShieldCheck, Download, Bold, Italic, List, ListOrdered, 
  Quote, Heading1, Heading2, Heading3, CheckSquare, Code, Clock, Minus, 
  Maximize2, Minimize2, Copy, Check, Sparkles, Tag, Smile, Type, FileText
} from 'lucide-react';
import { diaryDB, safeUUID } from '../../lib/diaryDB';

export default function DiaryEditorView({ entry, onBack, onOpenExport }) {
  const [title, setTitle] = useState(entry ? entry.title : '');
  const [content, setContent] = useState(entry ? entry.content : '');
  const [entryDate, setEntryDate] = useState(entry ? entry.date : new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState(entry ? entry.mood || '😊' : '😊');
  const [tags, setTags] = useState(entry ? entry.tags || '' : '');
  const [fontFamily, setFontFamily] = useState('sans'); // 'sans', 'serif', 'mono'
  const [fontSize, setFontSize] = useState('15px');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved locally');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const timerRef = useRef(null);

  const MOODS = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '💡', label: 'Inspired' },
    { emoji: '🧘', label: 'Calm' },
    { emoji: '🎯', label: 'Focused' },
    { emoji: '⚡', label: 'Energetic' },
    { emoji: '💭', label: 'Reflective' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🌧️', label: 'Down' }
  ];

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setEntryDate(entry.date || new Date().toISOString().split('T')[0]);
      setMood(entry.mood || '😊');
      setTags(entry.tags || '');
    }
  }, [entry]);

  // Keyboard shortcut Ctrl+S / Cmd+S handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, entryDate, mood, tags]);

  // Debounced Autosave Engine (800ms)
  const handleContentChange = (newText) => {
    setContent(newText);
    setSaveStatus('Saving locally...');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await saveCurrentEntry(title, newText, entryDate, mood, tags);
      setSaveStatus('Saved locally');
    }, 800);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setSaveStatus('Saving locally...');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await saveCurrentEntry(newTitle, content, entryDate, mood, tags);
      setSaveStatus('Saved locally');
    }, 800);
  };

  const saveCurrentEntry = async (tStr, cStr, dStr, mStr, tgStr) => {
    const now = new Date().toISOString();
    const entryId = entry && entry.id ? entry.id : 'entry-' + safeUUID();

    const record = {
      id: entryId,
      diaryId: entry ? entry.diaryId : 'diary-personal',
      storyId: entry ? entry.storyId : null,
      title: tStr || 'Untitled Entry',
      content: cStr || '',
      date: dStr,
      mood: mStr || '😊',
      tags: tgStr || '',
      isChapter: entry ? Boolean(entry.isChapter) : false,
      chapterNumber: entry ? entry.chapterNumber : null,
      updatedAt: now,
      createdAt: entry && entry.createdAt ? entry.createdAt : now
    };

    await diaryDB.entries.put(record);
  };

  const triggerManualSave = async () => {
    setSaveStatus('Saving...');
    await saveCurrentEntry(title, content, entryDate, mood, tags);
    setSaveStatus('Saved locally');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
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
    else if (tag === 'strike') formatted = `~~${selected || 'strikethrough text'}~~`;
    else if (tag === 'h1') formatted = `\n# ${selected || 'Heading 1'}\n`;
    else if (tag === 'h2') formatted = `\n## ${selected || 'Heading 2'}\n`;
    else if (tag === 'h3') formatted = `\n### ${selected || 'Heading 3'}\n`;
    else if (tag === 'quote') formatted = `\n> ${selected || 'Quote text'}\n`;
    else if (tag === 'list') formatted = `\n- ${selected || 'List item'}\n`;
    else if (tag === 'ordered') formatted = `\n1. ${selected || 'First item'}\n`;
    else if (tag === 'check') formatted = `\n- [ ] ${selected || 'Todo task'}\n`;
    else if (tag === 'code') formatted = `\n\`\`\`\n${selected || '// code snippet'}\n\`\`\`\n`;
    else if (tag === 'hr') formatted = `\n---\n`;
    else if (tag === 'time') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      formatted = `[${nowTime}] `;
    }

    const newContent = content.substring(0, start) + formatted + content.substring(end);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatted.length, start + formatted.length);
    }, 50);
  };

  const handleCopyClipboard = () => {
    const fullText = `${title}\nDate: ${entryDate}\n\n${content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word & Character Stats Calculation
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const getFontFamilyStyle = () => {
    if (fontFamily === 'serif') return 'Georgia, Cambria, "Times New Roman", Times, serif';
    if (fontFamily === 'mono') return 'Consolas, Monaco, "Courier New", Courier, monospace';
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isFocusMode ? '100vh' : '100%',
      minHeight: isFocusMode ? '100vh' : '82vh',
      backgroundColor: isFocusMode ? '#F8FAFC' : '#FAFAF9',
      borderRadius: isFocusMode ? '0px' : '16px',
      border: isFocusMode ? 'none' : '1px solid #E2E8F0',
      padding: isFocusMode ? '24px 10%' : '20px',
      boxSizing: 'border-box',
      position: isFocusMode ? 'fixed' : 'relative',
      top: isFocusMode ? 0 : 'auto',
      left: isFocusMode ? 0 : 'auto',
      right: isFocusMode ? 0 : 'auto',
      bottom: isFocusMode ? 0 : 'auto',
      zIndex: isFocusMode ? 9999 : 1,
      transition: 'all 0.2s ease-in-out'
    }}>

      {/* Save Success Toast Indicator */}
      {showSavedToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          backgroundColor: '#16A34A',
          color: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
          zIndex: 10
        }}>
          <Check size={14} /> Entry Saved Successfully!
        </div>
      )}

      {/* Top Header & Actions Deck */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          onClick={async () => {
            await saveCurrentEntry(title, content, entryDate, mood, tags);
            onBack();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            padding: '8px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <ArrowLeft size={16} color="#DC2626" /> Back to Entries
        </button>

        {/* Center Save Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '12px' }}>
            <ShieldCheck size={14} color="#16A34A" /> {saveStatus}
          </span>
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            style={{
              backgroundColor: isFocusMode ? '#DC2626' : '#FFFFFF',
              color: isFocusMode ? '#FFFFFF' : '#475569',
              border: '1px solid #CBD5E1',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode (Fullscreen writing)"}
          >
            {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFocusMode ? "Exit Focus" : "Focus Mode"}
          </button>

          <button
            onClick={handleCopyClipboard}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Copy entry text to clipboard"
          >
            {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={() => onOpenExport(entry)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} /> Export TXT/PDF
          </button>

          {/* Primary Manual Save Button */}
          <button
            onClick={triggerManualSave}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
            }}
          >
            <Save size={15} /> Save Entry
          </button>
        </div>
      </div>

      {/* Entry Title & Metadata Input Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        <input
          type="text"
          placeholder="Entry Title (e.g. Reflections on Resilience & Progress)"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          style={{
            width: '100%',
            fontSize: '22px',
            fontWeight: 900,
            border: 'none',
            backgroundColor: 'transparent',
            outline: 'none',
            color: '#0F172A',
            padding: '4px 0'
          }}
        />

        {/* Date, Mood Selector & Tag Input Deck */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Date:</span>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => {
                setEntryDate(e.target.value);
                saveCurrentEntry(title, content, e.target.value, mood, tags);
              }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155' }}
            />
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1' }} />

          {/* Mood Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smile size={14} color="#64748B" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Mood:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MOODS.map(m => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => {
                    setMood(m.emoji);
                    saveCurrentEntry(title, content, entryDate, m.emoji, tags);
                  }}
                  style={{
                    background: mood === m.emoji ? '#FEF2F2' : 'none',
                    border: mood === m.emoji ? '1px solid #FCA5A5' : 'none',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1' }} />

          {/* Tags Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '160px' }}>
            <Tag size={14} color="#64748B" />
            <input
              type="text"
              placeholder="Tags (e.g. #gratitude #ideas)"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                saveCurrentEntry(title, content, entryDate, mood, e.target.value);
              }}
              style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#334155', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Comprehensive Rich Text Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '10px',
        padding: '6px 10px',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button type="button" onClick={() => applyFormatting('bold')} style={toolBtnStyle} title="Bold (**text**)"><Bold size={15} /></button>
        <button type="button" onClick={() => applyFormatting('italic')} style={toolBtnStyle} title="Italic (*text*)"><Italic size={15} /></button>
        <button type="button" onClick={() => applyFormatting('strike')} style={toolBtnStyle} title="Strikethrough (~~text~~)"><Type size={15} /></button>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        <button type="button" onClick={() => applyFormatting('h1')} style={toolBtnStyle} title="Heading 1 (# H1)"><Heading1 size={15} /></button>
        <button type="button" onClick={() => applyFormatting('h2')} style={toolBtnStyle} title="Heading 2 (## H2)"><Heading2 size={15} /></button>
        <button type="button" onClick={() => applyFormatting('h3')} style={toolBtnStyle} title="Heading 3 (### H3)"><Heading3 size={15} /></button>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        <button type="button" onClick={() => applyFormatting('quote')} style={toolBtnStyle} title="Blockquote (> quote)"><Quote size={15} /></button>
        <button type="button" onClick={() => applyFormatting('list')} style={toolBtnStyle} title="Bullet List (- item)"><List size={15} /></button>
        <button type="button" onClick={() => applyFormatting('ordered')} style={toolBtnStyle} title="Numbered List (1. item)"><ListOrdered size={15} /></button>
        <button type="button" onClick={() => applyFormatting('check')} style={toolBtnStyle} title="Checklist (- [ ] task)"><CheckSquare size={15} /></button>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        <button type="button" onClick={() => applyFormatting('code')} style={toolBtnStyle} title="Code Block (```)"><Code size={15} /></button>
        <button type="button" onClick={() => applyFormatting('time')} style={toolBtnStyle} title="Insert Current Timestamp"><Clock size={15} /></button>
        <button type="button" onClick={() => applyFormatting('hr')} style={toolBtnStyle} title="Insert Horizontal Rule (---)"><Minus size={15} /></button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        {/* Font Family Switcher */}
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#475569' }}
          title="Font Style"
        >
          <option value="sans">Sans-Serif (Modern)</option>
          <option value="serif">Serif (Classic Journal)</option>
          <option value="mono">Monospace (Code)</option>
        </select>

        {/* Font Size Switcher */}
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#475569' }}
          title="Font Size"
        >
          <option value="14px">Small (14px)</option>
          <option value="15px">Medium (15px)</option>
          <option value="17px">Large (17px)</option>
          <option value="19px">Extra Large (19px)</option>
        </select>
      </div>

      {/* Writing Textarea Canvas */}
      <textarea
        id="diary-textarea"
        placeholder="Start writing your thoughts, personal reflections, lessons or story chapters..."
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '380px',
          padding: '18px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          fontSize: fontSize,
          lineHeight: '1.75',
          color: '#0F172A',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: getFontFamilyStyle(),
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
        }}
      />

      {/* Word Count & Writing Analytics Footer */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginTop: '10px',
        padding: '8px 12px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        fontSize: '11px',
        color: '#64748B',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>📝 <strong>{words}</strong> words</span>
          <span>🔤 <strong>{chars}</strong> characters</span>
          <span>⏱️ ~<strong>{readingTimeMinutes}</strong> min read</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700 }}>
          <Sparkles size={13} color="#DC2626" /> Device-Local Private Writing Active
        </div>
      </div>
    </div>
  );
}

const toolBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 8px',
  borderRadius: '4px',
  color: '#475569',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s ease'
};
