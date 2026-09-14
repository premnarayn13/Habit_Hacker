# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 02: PRODUCTIVITY TASK OFFLINE SYNC ENGINE SPECIFICATION

## 1. Offline Synchronization Engine Concept

The **Productivity Task Offline Sync Engine** guarantees that all user interactions on tasks, subtasks, habits, and execution logs take effect **instantly on the device**, regardless of network status.

When the network is unavailable:
1. Local UI state updates immediately (0ms latency).
2. The complete entity state is written to local IndexedDB tables (`cachedTasks`, `cachedSubtasks`, `cachedLogs`).
3. An operational mutation record is appended to the local `syncQueue` table in IndexedDB.
4. When network recovers, the queue manager processes pending actions sequentially, syncing with PostgreSQL via Supabase REST APIs.

---

## 2. Sync Queue Data Structure

### `SyncQueueItem` Interface
```typescript
export interface SyncQueueItem {
  id?: number;                  // Auto-increment primary key in IndexedDB
  queueId: string;              // Unique UUID for transaction tracking
  entityType: 'TASK' | 'SUBTASK' | 'TASK_LOG' | 'SUBTASK_LOG' | 'HABIT' | 'GOAL' | 'DIARY_META';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE_COMPLETE';
  entityId: string;             // UUID of the target entity
  payload: Record<string, any>; // Complete JSON payload for backend API
  createdAt: string;            // ISO timestamp when user performed action
  retryCount: number;           // Track failed attempts
  lastAttemptAt?: string;       // Timestamp of last network attempt
  status: 'PENDING' | 'SYNCING' | 'FAILED';
}
```

---

## 3. Queue Processing & Network Reconnection Flow

```
[ Network Listener Detects 'ONLINE' Event ]
                    │
                    ▼
[ Read all 'PENDING' items from Dexie db.syncQueue ]
                    │
            Is queue empty?
           ┌────────┴────────┐
           │ YES             │ NO
           ▼                 ▼
     [ Set State:    Sort Queue by createdAt (FIFO)
       'Synced' ]            │
                             ▼
                    [ Loop Each Queue Item ]
                             │
                             ▼
                Send HTTP API Request to Supabase
                             │
                  Did request succeed (200/201)?
                 ┌───────────┴───────────┐
                 │ YES                   │ NO (5xx / Network Error)
                 ▼                       ▼
      Delete item from           Increment retryCount.
      db.syncQueue               If retryCount > 5:
                 │               Mark 'FAILED', notify user.
                 │               Else: Keep for next attempt.
                 ▼
     Process Next Item in Queue
```

---

## 4. Conflict Resolution Strategy (Last-Write-Wins)

To prevent data corruption when syncing offline changes across devices:

1. **Timestamp-Based Last-Write-Wins (LWW)**:
   Every entity includes an `updated_at` ISO 8601 timestamp generated at mutation time on the device.
   The PostgreSQL update query uses an atomic check:
   ```sql
   UPDATE public.tasks 
   SET title = :title, 
       is_done_today = :isDoneToday, 
       progress_percent = :progressPercent, 
       updated_at = :updatedAt
   WHERE id = :id AND (updated_at IS NULL OR updated_at <= :updatedAt);
   ```
2. **Atomic Completion Toggles**:
   Completing a task generates an immutable completion log in `task_logs` with a unique composite key `(task_id, log_date)`, preventing duplicate log insertion during sync retries.

---

## 5. JavaScript Offline Sync Manager Implementation (`syncManager.js`)

```javascript
import { db } from './db';
import { supabase } from './supabaseClient';

export async function queueMutation(entityType, action, entityId, payload) {
  const queueItem = {
    queueId: crypto.randomUUID(),
    entityType,
    action,
    entityId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'PENDING'
  };

  await db.syncQueue.add(queueItem);
  
  if (navigator.onLine) {
    processSyncQueue();
  }
}

export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const pendingItems = await db.syncQueue
    .where('status')
    .equals('PENDING')
    .sortBy('createdAt');

  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    try {
      await db.syncQueue.update(item.id, { status: 'SYNCING' });

      let result = null;
      if (item.entityType === 'TASK') {
        if (item.action === 'UPDATE' || item.action === 'TOGGLE_COMPLETE') {
          result = await supabase.from('tasks').upsert(item.payload);
        } else if (item.action === 'CREATE') {
          result = await supabase.from('tasks').insert(item.payload);
        }
      } else if (item.entityType === 'TASK_LOG') {
        result = await supabase.from('task_logs').upsert(item.payload);
      }

      if (result && !result.error) {
        await db.syncQueue.delete(item.id);
      } else {
        await db.syncQueue.update(item.id, { 
          status: 'PENDING', 
          retryCount: item.retryCount + 1,
          lastAttemptAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Sync error for item:', item.queueId, err);
      await db.syncQueue.update(item.id, { 
        status: 'PENDING', 
        retryCount: item.retryCount + 1 
      });
    }
  }
}
```
