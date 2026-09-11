import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar, Clock, CheckSquare, Square, Trash2, AlertCircle, Volume2, CheckCircle2 } from 'lucide-react';
import { diaryDB } from '../../lib/diaryDB';
import { scheduleTodoNotification } from '../../lib/diaryReminderScheduler';

export default function TodoRemindersView() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [ringtone, setRingtone] = useState('default');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const all = await diaryDB.todos.reverse().sortBy('createdAt');
    setTodos(all || []);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTodo = {
      id: 'todo-' + crypto.randomUUID(),
      title,
      dueDate,
      dueTime,
      reminderDate: reminderDate || dueDate,
      reminderTime: reminderTime || dueTime,
      isCompleted: false,
      ringtone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await diaryDB.todos.add(newTodo);
    if (newTodo.reminderDate && newTodo.reminderTime) {
      await scheduleTodoNotification(newTodo);
    }

    setTitle('');
    setDueDate('');
    setDueTime('');
    setReminderDate('');
    setReminderTime('');
    setShowAddForm(false);
    loadTodos();
  };

  const toggleComplete = async (todo) => {
    await diaryDB.todos.update(todo.id, { isCompleted: !todo.isCompleted });
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await diaryDB.todos.delete(id);
    loadTodos();
  };

  const pendingTodos = todos.filter(t => !t.isCompleted);
  const completedTodos = todos.filter(t => t.isCompleted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Personal Reminders & Local Todos
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
            Device-local reminders. Independent from Habit Hacker tasks.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
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
          <Plus size={16} /> Add Reminder
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddTodo} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px',
          border: '1px solid #DC2626',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
            New Personal Reminder
          </h4>
          <input
            type="text"
            placeholder="e.g. Register for internship portal deadline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Reminder Date</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Reminder Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Schedule Reminder
            </button>
          </div>
        </form>
      )}

      {/* Pending Reminders List */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Upcoming Reminders ({pendingTodos.length})
        </div>
        {pendingTodos.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px border #E2E8F0', color: '#64748B' }}>
            No upcoming reminders.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingTodos.map(t => renderTodoRow(t))}
          </div>
        )}
      </div>

      {/* Completed List */}
      {completedTodos.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Completed ({completedTodos.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.7 }}>
            {completedTodos.map(t => renderTodoRow(t))}
          </div>
        </div>
      )}
    </div>
  );

  function renderTodoRow(t) {
    return (
      <div
        key={t.id}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            onClick={() => toggleComplete(t)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.isCompleted ? '#16A34A' : '#94A3B8' }}
          >
            {t.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: t.isCompleted ? '#94A3B8' : '#0F172A', textDecoration: t.isCompleted ? 'line-through' : 'none' }}>
              {t.title}
            </div>
            {(t.dueDate || t.reminderDate) && (
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {t.dueDate && <span>Due: {t.dueDate} {t.dueTime}</span>}
                {t.reminderDate && <span style={{ color: '#DC2626', fontWeight: 600 }}>🔔 Remind: {t.reminderDate} {t.reminderTime}</span>}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => deleteTodo(t.id)}
          style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }
}
