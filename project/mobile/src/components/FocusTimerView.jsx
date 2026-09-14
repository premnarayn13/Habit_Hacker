import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckSquare, Sparkles } from 'lucide-react';

export default function FocusTimerView({ tasks, subtasks }) {
  const [sessionType, setSessionType] = useState('POMODORO');
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState('t-101');

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(sessionType === 'POMODORO' ? 1500 : 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      {/* Timer Container */}
      <div className="glass-panel" style={{ padding: '36px 24px', width: '100%', maxWidth: '540px', textAlign: 'center' }}>
        
        {/* Mode Switcher */}
        <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => { setSessionType('POMODORO'); setSecondsLeft(1500); setIsRunning(false); }}
            style={{ background: sessionType === 'POMODORO' ? '#6366F1' : 'transparent', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Pomodoro (25m)
          </button>
          <button 
            onClick={() => { setSessionType('STOPWATCH'); setSecondsLeft(0); setIsRunning(false); }}
            style={{ background: sessionType === 'STOPWATCH' ? '#6366F1' : 'transparent', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Stopwatch
          </button>
        </div>

        {/* Focus Task Selector */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SELECT ACTIVE FOCUS TASK</label>
          <select 
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' }}
          >
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.estimatedMinutes}m est)</option>
            ))}
          </select>
        </div>

        {/* Circular Timer Display */}
        <div style={{
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '4px solid rgba(99, 102, 241, 0.4)',
          boxShadow: isRunning ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          background: 'rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          <Sparkles size={24} color="#6366F1" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#FFF', fontFamily: 'monospace' }}>
            {formatTime(secondsLeft)}
          </div>
          <div style={{ fontSize: '12px', color: '#A5B4FC', fontWeight: 600, marginTop: '4px' }}>
            {isRunning ? 'DEEP WORK IN PROGRESS' : 'READY TO FOCUS'}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '16px' }}
          >
            {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start Focus Session</>}
          </button>

          <button 
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '12px 20px' }}
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>

      </div>

    </div>
  );
}
