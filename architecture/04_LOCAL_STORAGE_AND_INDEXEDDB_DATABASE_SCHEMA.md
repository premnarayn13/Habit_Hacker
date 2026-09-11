# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 04: LOCAL STORAGE & INDEXEDDB DATABASE SCHEMA SPECIFICATION

## 1. High-Performance Local Database Architecture

To support offline execution of productivity tasks and 100% private storage of diary entries, stories, quick notes, and local reminders on mobile devices, Habit Hacker utilizes **Dexie.js** (IndexedDB).

### Database Engine Parameters
- **Database Name**: `HabitHackerLocalDB`
- **Driver**: IndexedDB with multi-index transactions and asynchronous Cursor pagination.
- **Maximum Storage Allocation**: Dynamic (typically 50% of available disk space, up to multiple Gigabytes).

---

## 2. Complete Dexie Schema Definition (`db.js`)

```javascript
import Dexie from 'dexie';

export const db = new Dexie('HabitHackerLocalDB');

db.version(1).stores({
  // Productivity Cache (Synced with Supabase PostgreSQL)
  cachedTasks: 'id, title, category, priority, trackingMode, isDoneToday, isArchived, parentTaskId, plannedStart, plannedEnd, updatedAt',
  cachedSubtasks: 'id, parentTaskId, title, isOptional, isDoneToday, updatedAt',
  cachedTaskLogs: 'id, taskId, logDate, isCompleted, isSuccessful, createdAt',
  cachedSubtaskLogs: 'id, subtaskId, logDate, isCompleted, createdAt',
  cachedHabits: 'id, title, category, isArchived, updatedAt',
  cachedGoals: 'id, title, category, targetDate, updatedAt',

  // Offline Sync Queue (For server-backed entities)
  syncQueue: '++id, queueId, entityType, action, entityId, status, createdAt',

  // Private Local Diary (Device-Local ONLY — Banned from Server Sync)
  diaries: 'id, name, type, parentId, isLocked, displayOrder, createdAt, updatedAt',
  stories: 'id, diaryId, title, author, chapterCount, createdAt, updatedAt',
  entries: 'id, diaryId, storyId, title, date, isChapter, chapterNumber, createdAt, updatedAt, [diaryId+date]',
  notes: 'id, title, isPinned, isArchived, createdAt, updatedAt',
  todos: 'id, title, dueDate, dueTime, reminderDate, reminderTime, isCompleted, notificationId, createdAt, updatedAt'
});
```

---

## 3. Entity Definitions & Table Details

### Table: `cachedTasks`
Stores offline productivity tasks for fast rendering and offline modification.
```typescript
interface CachedTask {
  id: string;                   // UUID
  title: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trackingMode: 'end_date' | 'count_days' | 'count_event';
  targetCount?: number;
  currentCount?: number;
  progressPercent: number;
  isDoneToday: boolean;
  isArchived: boolean;
  parentTaskId?: string | null;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  updatedAt: string;
}
```

### Table: `entries` (Private Local Diary Text)
Stores rich text writing, daily entries, and story chapters.
```typescript
interface LocalDiaryEntry {
  id: string;                   // UUID
  diaryId: string;              // Belongs to diary collection
  storyId?: string | null;      // Optional story parent
  title: string;
  content: string;              // HTML / Markdown rich text body
  date: string;                 // YYYY-MM-DD
  isChapter: boolean;
  chapterNumber?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Table: `todos` (Independent Local Reminders)
Stores lightweight personal reminders completely separate from productivity tasks.
```typescript
interface LocalTodoReminder {
  id: string;                   // UUID
  title: string;
  description?: string;
  dueDate?: string;             // YYYY-MM-DD
  dueTime?: string;             // HH:mm
  reminderDate?: string;        // YYYY-MM-DD
  reminderTime?: string;        // HH:mm
  isCompleted: boolean;
  notificationId?: string;
  ringtone: string;             // Sound identifier
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Initial Cache Seeding & Hydration Lifecycle

When the application boots:
1. Load `cachedTasks` and `cachedSubtasks` from IndexedDB instantly (0ms rendering).
2. If network is online, execute background query to fetch updated tasks from Supabase and refresh IndexedDB cache.
3. If network is offline, continue operating seamlessly using IndexedDB data.
