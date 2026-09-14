# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 01: OVERALL MOBILE ARCHITECTURE & OFFLINE-FIRST SPECIFICATION

## 1. System Vision & Mobile APK Target

Habit Hacker is designed to be distributed as a standalone **Mobile Android Application (APK)** (powered by Capacitor / React Mobile Shell) with complete **Offline-First Capabilities** and **Cloud Synchronization to PostgreSQL / Supabase**.

### Core Architecture Guarantee
> **1. PRODUCTIVITY DATA (Tasks, Subtasks, Logs, Habits, Goals)**: Fully offline-tolerant. Every user action (completing a task, toggling a subtask, logging progress) is committed immediately to local persistent storage (Dexie.js / IndexedDB / SQLite). When network connectivity is restored, an automated Sync Queue pushes pending mutations to PostgreSQL / Supabase.
>
> **2. PRIVATE DIARY DATA (Entries, Stories, Notes, Local Reminders)**: Strictly local-first. Writing content never leaves the user's mobile device. Password verification hashes and metadata sync with PostgreSQL for account persistence, but actual text bodies remain 100% on the device.

```
                               ┌─────────────────────────────────────────────────────────┐
                               │                    HABIT HACKER APK                     │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                     ┌──────────────────────────────────────┴──────────────────────────────────────┐
                     │                                                                             │
                     ▼                                                                             ▼
    ┌──────────────────────────────────────────────┐                              ┌──────────────────────────────────────────────┐
    │          SERVER-BACKED PRODUCTIVITY          │                              │             DEVICE-ONLY DIARY                │
    ├──────────────────────────────────────────────┤                              ├──────────────────────────────────────────────┤
    │ • Tasks, Subtasks & Parent Hierarchy         │                              │ • Personal Journal & Daily Lessons           │
    │ • Task Completion Logs & Progress            │                              │ • Ongoing Stories & Chapter History          │
    │ • Habits, Goals & Capacity Settings          │                              │ • Quick Notes & Local Reminders              │
    ├──────────────────────────────────────────────┤                              ├──────────────────────────────────────────────┤
    │  Offline Cache -> Sync Queue -> Supabase DB  │                              │  Dexie.js IndexedDB / SQLite (100% Local)    │
    └──────────────────────────────────────────────┘                              └──────────────────────────────────────────────┘
```

---

## 2. High-Level Architecture Layers

The APK architecture consists of four distinct processing layers:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. USER INTERFACE LAYER (React Mobile Components, Bottom Nav, Touch Gestures)           │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. APPLICATION STATE & DISPATCH LAYER (React Context, Event Hooks, Task Controllers)    │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
┌──────────────────────────────────────────────┐ ┌──────────────────────────────────────────────┐
│ 3A. LOCAL PERSISTENCE LAYER (IndexedDB)      │ │ 3B. OFFLINE SYNC ENGINE & QUEUE MANAGER      │
│ • Cached Tasks, Subtasks & History Logs      │ │ • Event Listener (online/offline)            │
│ • Local Sync Queue (`syncQueue` Store)       │ │ • Queue Processor & Retries (Exponential)    │
│ • Encrypted Diary Vault & Notes              │ │ • Conflict Resolution (Last-Write-Wins)      │
└──────────────────────────────────────────────┘ └──────────────────────┬───────────────────────┘
                                                                        │
                                                                        ▼
                                                 ┌──────────────────────────────────────────────┐
                                                 │ 4. CLOUD BACKEND LAYER (PostgreSQL)          │
                                                 │ • Supabase Auth JWT                          │
                                                 │ • Spring Boot / REST API                     │
                                                 │ • Remote PostgreSQL Tables                   │
                                                 └──────────────────────────────────────────────┘
```

---

## 3. Network Listener & State Manager (`useNetworkSync`)

The mobile application monitors network transitions using the Browser `navigator.onLine` API and native Capacitor Network listeners (`Network.addListener('networkStatusChange')`).

### Network State Model
```typescript
export type NetworkState = 'ONLINE' | 'OFFLINE' | 'SYNCING';

export interface SyncStatus {
  state: NetworkState;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}
```

### Automatic Reconnection Pipeline
1. **Offline Mode Triggered**:
   - The status indicator in the app header displays `Offline · Changes Saved Locally`.
   - All mutations (completing task, adding log) write to IndexedDB `cachedTasks` and append a transaction record to IndexedDB `syncQueue`.

2. **Network Restored Triggered**:
   - `window.addEventListener('online')` fires.
   - The indicator updates to `Syncing...`.
   - The Sync Queue Processor reads `syncQueue` records in FIFO order and executes HTTP POST/PUT/PATCH requests to Supabase REST / Spring Boot APIs.
   - Upon successful server response, queue items are removed from `syncQueue`.
   - The indicator updates to `Synced`.

---

## 4. Supabase Auth & Diary Password Dual-Gate Security

```
[ User Launches App ]
          │
          ▼
[ Check Supabase Account Auth ] ──(Invalid)──► [ Auth Landing / Login Modal ]
          │ (Valid JWT Token)
          ▼
[ App Dashboard Active ] (Home, Today, Tasks, Analytics)
          │
          ├── User clicks "Diary" tab
          │
          ▼
[ Diary Master Password Prompt ] ──(Invalid)──► [ Access Denied ]
          │ (Valid Salted Hash Verification)
          ▼
[ Unlocked Device-Local Diary Vault ]
```

1. **Supabase Application Login**: Grants access to server-backed productivity data (Tasks, Habits, Analytics).
2. **Diary Password Verification**: Validates password against `diary_security_config` hash stored in PostgreSQL while keeping diary text 100% on device.

---

## 5. Security & Privacy Boundary Verification

| Component | Storage Location | Server Sync? | Direct SQL Storage? |
| :--- | :--- | :--- | :--- |
| **Tasks & Completion Flags** | IndexedDB + PostgreSQL | ✅ YES (Offline Queue) | `tasks` table |
| **Subtasks & Parent Links** | IndexedDB + PostgreSQL | ✅ YES (Offline Queue) | `subtasks` table |
| **Task Execution Logs** | IndexedDB + PostgreSQL | ✅ YES (Offline Queue) | `task_logs` table |
| **Habits & Goals** | IndexedDB + PostgreSQL | ✅ YES (Offline Queue) | `habits`, `goals` tables |
| **Diary Metadata & Security Hash** | IndexedDB + PostgreSQL | ✅ YES (Metadata Only) | `diary_metadata`, `diary_security_config` |
| **Diary Content Text & Stories** | Mobile Device IndexedDB | ❌ NO (Local Only) | Banned |
| **Quick Notes & Reminders** | Mobile Device IndexedDB | ❌ NO (Local Only) | Banned |
