# HABIT HACKER DIARY SYSTEM — 04: QUICK NOTES, TODOS & LOCAL REMINDERS SPECIFICATION

## 1. Quick Notes Engine

The **Quick Notes** section is designed for fast, spontaneous writing (e.g., app ideas, quick reminders, code snippets, meeting points) that does not belong in a structured daily diary.

### Notes Schema (IndexedDB)
```javascript
const noteEntity = {
  id: 'note-uuid-v4',
  title: 'Check internship registration portal',
  content: 'Deadline is Sept 30. Prepare transcript and resume PDF.',
  isPinned: true,
  isArchived: false,
  color: '#FEF3C7', // Optional warm sticky note accent
  createdAt: '2026-09-09T18:00:00Z',
  updatedAt: '2026-09-09T18:00:00Z'
};
```

### Features
- **Pinning**: Pinned notes remain at the top of the Quick Notes grid.
- **Instant Search**: Local multi-word search across note titles and content.
- **Archive & Trash**: Soft delete to prevent accidental loss.

---

## 2. Todo & Reminder System (Independent from Habit Hacker Tasks)

### Architectural Isolation Rule
> **Diary Todos are strictly isolated personal reminders.**
> They do **NOT** create entries in the PostgreSQL `tasks` or `subtasks` tables and do **NOT** impact productivity analytics, streaks, or completion stats.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION SCHEMAS                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
         ▼                                                       ▼
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│  HABIT HACKER PRODUCTIVITY TASK  │            │        DIARY LOCAL TODO          │
├──────────────────────────────────┤            ├──────────────────────────────────┤
│ • PostgreSQL DB: `tasks`         │            │ • IndexedDB: `todos`             │
│ • Parent/Subtask Hierarchy       │            │ • Standalone Title & Description │
│ • Progress % & Measure Units     │            │ • Device Local Notification      │
│ • Productivity Streaks & Logs    │            │ • Zero Analytics Impact          │
└──────────────────────────────────┘            └──────────────────────────────────┘
```

---

## 3. Todo Data Model & Local Notification Scheduler

### Todo Entity Schema
```javascript
const todoEntity = {
  id: 'todo-uuid-v4',
  title: 'Register for internship',
  description: 'Submit online application form before midnight',
  dueDate: '2026-09-30',
  dueTime: '23:59',
  reminderDate: '2026-09-29',
  reminderTime: '18:00',
  isCompleted: false,
  notificationId: 'notif-100293',
  ringtone: 'default',
  createdAt: '2026-09-09T18:00:00Z'
};
```

### Local Notification Scheduler Engine
Using the Web Notifications API (or Native Android Local Notifications via APK bridge):

```javascript
export async function scheduleLocalNotification(todo) {
  if (!todo.reminderDate || !todo.reminderTime) return null;

  const reminderDateTimeStr = `${todo.reminderDate}T${todo.reminderTime}:00`;
  const reminderTimeMs = new Date(reminderDateTimeStr).getTime();
  const nowMs = Date.now();
  const delayMs = reminderTimeMs - nowMs;

  if (delayMs <= 0) return null;

  // Request Notification Permission if needed
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  }

  // Schedule timeout for web/PWA or invoke native alarm manager for APK
  const timerId = setTimeout(() => {
    new Notification('Habit Hacker Reminder 🔔', {
      body: todo.title,
      icon: '/icon-192.png',
      tag: todo.id,
      requireInteraction: true
    });
    
    // Play custom notification sound if configured
    playReminderSound(todo.ringtone || 'default');
  }, delayMs);

  return timerId;
}
```

---

## 4. Custom Reminder Timing & Sounds

- **Timing Presets**:
  - Exact time
  - 15 minutes before
  - 1 hour before
  - 1 day before (`Sept 29 at 6:00 PM`)
- **Notification Sound Options**:
  - `Default Chime`
  - `Gentle Bell`
  - `Executive Red Tone`
  - `Silent`
- Sound playback uses local Web Audio API synthesizer buffers or local device audio clips.
