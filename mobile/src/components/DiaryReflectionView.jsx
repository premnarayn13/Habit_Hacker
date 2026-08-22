import React, { useState } from 'react';
import { BookOpen, Smile, Zap, Save, CheckCircle } from 'lucide-react';

export default function DiaryReflectionView() {
  const [diaryEntry, setDiaryEntry] = useState({
    title: 'Daily Reflection - Sunday, Aug 16',
    accomplishments: 'Completed ML Architecture document draft and implemented subtask calendar placement.',
    learnings: 'Capacity planning with buffer times reduces stress during long development sessions.',
    improvements: 'Start initial focus sessions earlier in the morning.',
    mood: 'GREAT',
    energy: 'HIGH'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="#6366F1" /> Daily Diary & Self-Reflection Record
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
            Preserve personal reflections and evaluate daily progress over time.
          </p>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Diary Entry</>}
        </button>
      </div>

      {/* Reflection Form */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Mood & Energy Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: '8px' }}>MOOD TODAY</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['GREAT', 'GOOD', 'OKAY', 'LOW'].map(m => (
                <button
                  key={m}
                  onClick={() => setDiaryEntry(prev => ({ ...prev, mood: m }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: diaryEntry.mood === m ? '#10B981' : 'rgba(255,255,255,0.04)',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: '8px' }}>ENERGY LEVEL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['HIGH', 'MEDIUM', 'LOW'].map(e => (
                <button
                  key={e}
                  onClick={() => setDiaryEntry(prev => ({ ...prev, energy: e }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: diaryEntry.energy === e ? '#6366F1' : 'rgba(255,255,255,0.04)',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Prompts */}
        <div>
          <label style={{ fontSize: '13px', color: '#FFF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>What did I accomplish today?</label>
          <textarea 
            rows="3"
            value={diaryEntry.accomplishments}
            onChange={(e) => setDiaryEntry(prev => ({ ...prev, accomplishments: e.target.value }))}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#FFF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>What went well & what did I learn?</label>
          <textarea 
            rows="3"
            value={diaryEntry.learnings}
            onChange={(e) => setDiaryEntry(prev => ({ ...prev, learnings: e.target.value }))}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#FFF', fontWeight: 700, display: 'block', marginBottom: '6px' }}>What can I improve tomorrow?</label>
          <textarea 
            rows="3"
            value={diaryEntry.improvements}
            onChange={(e) => setDiaryEntry(prev => ({ ...prev, improvements: e.target.value }))}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontFamily: 'inherit' }}
          />
        </div>

      </div>

    </div>
  );
}
