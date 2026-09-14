# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 07: FRONTEND NETWORK & SYNC MANAGER IMPLEMENTATION PLAN

## 1. Network Status Indicator Badge Component (`SyncStatusBadge.jsx`)

The mobile application displays an executive, non-intrusive status pill at the top of the screen to inform the user of their offline/online state and sync progress.

### Visual States
- **Online & Synced**: `🟢 Synced` (Green dot, subtle gray background)
- **Offline Mode**: `🟡 Offline · Saved Locally` (Gold dot, subtle gold border)
- **Syncing in Progress**: `🔄 Syncing (3 pending)...` (Spinning crimson icon)

### `SyncStatusBadge.jsx` Code
```jsx
import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SyncStatusBadge({ status = 'ONLINE', pendingCount = 0 }) {
  if (status === 'SYNCING') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
        fontSize: '11px',
        fontWeight: 700,
        color: '#DC2626'
      }}>
        <RefreshCw size={12} className="spin-animation" />
        <span>Syncing {pendingCount > 0 ? `(${pendingCount})` : ''}...</span>
      </div>
    );
  }

  if (status === 'OFFLINE') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: '#FFFBEB',
        border: '1px solid #FCD34D',
        fontSize: '11px',
        fontWeight: 700,
        color: '#D97706'
      }}>
        <WifiOff size={12} />
        <span>Offline · Saved Locally</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: '#F0FDF4',
      border: '1px solid #86EFAC',
      fontSize: '11px',
      fontWeight: 700,
      color: '#16A34A'
    }}>
      <CheckCircle2 size={12} />
      <span>Synced</span>
    </div>
  );
}
```

---

## 2. React `useNetworkSync` Custom Hook (`useNetworkSync.js`)

```javascript
import { useState, useEffect } from 'react';
import { processSyncQueue } from '../lib/syncManager';
import { db } from '../lib/db';

export function useNetworkSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncState, setSyncState] = useState(navigator.onLine ? 'ONLINE' : 'OFFLINE');

  const updatePendingCount = async () => {
    try {
      const count = await db.syncQueue.where('status').equals('PENDING').count();
      setPendingCount(count);
    } catch (e) {
      console.error('Error counting sync queue:', e);
    }
  };

  useEffect(() => {
    updatePendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncState('SYNCING');
      await processSyncQueue();
      await updatePendingCount();
      setSyncState('ONLINE');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic count refresh
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, syncState, pendingCount, updatePendingCount };
}
```

---

## 3. Integration Plan for `App.jsx` and Dashboard Components

1. **Wrap Global App State**:
   Import `useNetworkSync` in `App.jsx` to manage connectivity globally.
2. **Mount `SyncStatusBadge` in Header**:
   Render `<SyncStatusBadge status={syncState} pendingCount={pendingCount} />` inside `Header.jsx`.
3. **Local-First Mutations**:
   Update task actions (e.g., `toggleTaskComplete`, `createTask`, `updateTaskProgress`) to execute `db.cachedTasks.put(...)` immediately, followed by `queueMutation(...)`.
