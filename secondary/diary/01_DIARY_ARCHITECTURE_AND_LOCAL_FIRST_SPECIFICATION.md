# HABIT HACKER DIARY SYSTEM — 01: ARCHITECTURE & LOCAL-FIRST STORAGE SPECIFICATION

## 1. System Overview & Architectural Mandate

The **Habit Hacker Private Diary System** is a device-local, privacy-centric personal writing, notes, and reminder platform designed to replace the legacy Focus Timer component. 

### Core Architectural Principle
> **DIARY CONTENT MUST NEVER LEAVE THE USER'S DEVICE.**
> All entry text, story chapters, quick notes, local attachments, and search indexes are stored exclusively within local persistent storage (Dexie.js / IndexedDB / SQLite wrapper). Only non-sensitive metadata (diary IDs, names, folder types, lock status, salted password verification hashes, and timestamps) are managed via backend PostgreSQL endpoints.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    HABIT HACKER APP                                     │
└────────────────────────────────────────────────────────┬────────────────────────────────┘
                                                         │
               ┌─────────────────────────────────────────┴─────────────────────────────────────────┐
               │                                                                                   │
               ▼                                                                                   ▼
┌──────────────────────────────────────────────┐                                ┌──────────────────────────────────────────────┐
│       SERVER PRODUCTIVITY ENGINE (CLOUD)     │                                │      PRIVATE DIARY SYSTEM (DEVICE-LOCAL)     │
├──────────────────────────────────────────────┤                                ├──────────────────────────────────────────────┤
│ • PostgreSQL / Supabase Database             │                                │ • Dexie.js / IndexedDB / Local SQLite        │
│ • Tasks, Subtasks & Hierarchy Logs           │                                │ • Diary Entries, Story Chapters & Notes      │
│ • Habit & Goal Analytics                     │                                │ • Local Todo Reminders & Sound Alarms        │
│ • User Account & Auth System                 │                                │ • Encrypted Password Lock & Local Indexes    │
│ • Diary METADATA ONLY (IDs, Titles, Hashes)  │                                │ • Zero Cloud Sync for Content Body           │
└──────────────────────────────────────────────┘                                └──────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Local Data Store

### Primary Data Storage: Dexie.js (IndexedDB wrapper)
To support hundreds of entries, thousands of notes, long multiline stories, and fast search queries without memory slowdowns or `localStorage` string limits (5MB), the system uses **Dexie.js**, a robust, high-performance IndexedDB wrapper with full transaction, index, and query support.

#### Local Storage Schemas (IndexedDB Database: `HabitHackerDiaryDB`)
```js
// Dexie Database Definition
import Dexie from 'dexie';

export const diaryDB = new Dexie('HabitHackerDiaryDB');

diaryDB.version(1).stores({
  diaries: 'id, name, type, parentId, isLocked, displayOrder, createdAt, updatedAt',
  stories: 'id, diaryId, title, author, chapterCount, createdAt, updatedAt',
  entries: 'id, diaryId, storyId, title, date, isChapter, chapterNumber, createdAt, updatedAt, [diaryId+date]',
  notes: 'id, title, isPinned, isArchived, createdAt, updatedAt',
  todos: 'id, title, dueDate, dueTime, reminderDate, reminderTime, isCompleted, notificationId, createdAt, updatedAt',
  syncQueue: '++id, entityType, action, payload, createdAt'
});
```

---

## 3. Data Boundaries & Privacy Separation

| Data Classification | Storage Location | Cloud Sync Permitted? | Encrypted At Rest? |
| :--- | :--- | :--- | :--- |
| **Diary Entry Content Body** | Local Device (IndexedDB) | ❌ NO (Strictly Banned) | Yes (Web Crypto API / Local AES-256) |
| **Story Chapter Text** | Local Device (IndexedDB) | ❌ NO (Strictly Banned) | Yes (Web Crypto API / Local AES-256) |
| **Quick Note Content** | Local Device (IndexedDB) | ❌ NO (Strictly Banned) | Yes (Web Crypto API / Local AES-256) |
| **Local Todo Text & Reminders** | Local Device (IndexedDB) | ❌ NO (Strictly Banned) | Yes |
| **Diary Metadata (ID, Title, Type)** | PostgreSQL & Local | ✅ YES (Metadata Only) | Standard DB Auth |
| **Password Verification Hash** | PostgreSQL & Local | ✅ YES (Salted Hash Only) | BCrypt / PBKDF2 |
| **Habit Hacker Tasks & Analytics** | PostgreSQL & Local | ✅ YES (Standard Task Sync) | Standard DB Auth |

---

## 4. Offline-First & Network State Architecture

### Network Lifecycle Behavior

```
               [ User Modifies Data ]
                         │
                         ▼
             Is Entity Server-Backed?
            (Tasks, Goals, Metadata)
           ┌─────────────┴─────────────┐
           │ YES                       │ NO (Diary Body / Notes / Todos)
           ▼                           ▼
  Save to Local Storage      Save to Device IndexedDB
           │                           │
  Is Device Online?                    ▼
   ┌───────┴───────┐           [ Complete - Remains Local ]
   │ YES           │ NO
   ▼               ▼
Sync API    Push to SyncQueue
Success     (Local Storage)
                   │
         [ Network Reconnected ]
                   │
                   ▼
         Drain SyncQueue to API
```

1. **Online Mode**:
   - Productivity items (tasks, habits, capacity) write locally and sync immediately with Supabase/PostgreSQL.
   - Diary metadata (diary creation, title change, lock status toggle) syncs metadata with PostgreSQL.
   - Diary entries, text content, notes, and reminders write **exclusively to device IndexedDB**.

2. **Offline Mode**:
   - The application functions seamlessly without internet access.
   - Users can read, write, edit, search, unlock, and export all local diary entries.
   - Non-diary changes are appended to `syncQueue` in IndexedDB.

3. **Reconnection Event**:
   - On `window.addEventListener('online')`, the sync manager processes `syncQueue` items sequentially for productivity metadata.
   - Diary content is ignored by the sync manager, protecting user privacy.

---

## 5. Security & Boundary Guardrails

1. **Zero-Telemetry Rule**: `analyticsEngine.js` and system logging endpoints are strictly forbidden from receiving string payloads from diary text inputs or note titles.
2. **Task Independence**: Diary Todos and Quick Notes have distinct local IDs and schema models. They are never converted into `tasks` or `subtasks` in PostgreSQL.
3. **Multi-Device Boundary**: Help text inside Settings explicitly notifies users:
   > *"Diary entries and notes are stored privately on this device. Uninstalling the app or switching devices without exporting will not transfer private diary text."*
