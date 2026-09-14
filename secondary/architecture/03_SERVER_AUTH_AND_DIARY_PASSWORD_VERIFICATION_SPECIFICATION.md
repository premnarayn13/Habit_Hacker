# HABIT HACKER APK & OFFLINE-FIRST SYSTEM ARCHITECTURE — 03: SERVER AUTH & DIARY PASSWORD VERIFICATION SPECIFICATION

## 1. Dual Security Layer Blueprint

The mobile application implements two distinct security layers:

1. **Layer 1: Server User Account Authentication (Supabase Auth / JWT)**
   - Manages user identity, account creation, and PostgreSQL Row-Level Security (RLS) for productivity tasks.
   - Synchronizes metadata across devices.

2. **Layer 2: Dedicated Diary Master Password Lock (PBKDF2/SHA-256)**
   - Unlocks the private device-local diary vault.
   - Stores salted password verification hashes in PostgreSQL `diary_security_config` so the user's password configuration is backed up to their account, without transmitting any diary content.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 1: SUPABASE ACCOUNT AUTH (JWT)                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Validates user login (Email/Password)                                                 │
│ • Issues JWT session token stored securely on device                                    │
│ • Authorizes PostgreSQL access to `tasks`, `subtasks`, `diary_metadata`                 │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 2: DEDICATED DIARY SECURITY VAULT                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Verified against `diary_security_config` salted hash in PostgreSQL                    │
│ • Unlocks local Dexie IndexedDB diary entries, stories, notes & local reminders          │
│ • Zero diary entry text transmitted over network                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Password Hash Verification Lifecycle

### Database Table Schema (`diary_security_config`)
```sql
CREATE TABLE IF NOT EXISTS public.diary_security_config (
    user_id VARCHAR(64) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    lock_policy VARCHAR(64) DEFAULT 'BACKGROUND',
    inactivity_timeout_mins INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Password Setup & Hash Generation
```javascript
export async function createDiaryPassword(userId, rawPassword) {
  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(rawPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Persist security metadata in PostgreSQL via Supabase / Spring Boot API
  await supabase.from('diary_security_config').upsert({
    user_id: userId,
    password_hash: hashHex,
    password_salt: saltHex,
    lock_policy: 'BACKGROUND',
    updated_at: new Date().toISOString()
  });

  return { hashHex, saltHex };
}
```

---

## 3. Local Password Verification Gate

```javascript
export async function verifyDiaryPassword(userId, inputPassword) {
  // Fetch security metadata for user from Supabase or local IndexedDB cache
  const { data: config } = await supabase
    .from('diary_security_config')
    .select('password_hash, password_salt')
    .eq('user_id', userId)
    .single();

  if (!config) return false;

  const saltBytes = new Uint8Array(config.password_salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const enc = new TextEncoder();
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(inputPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const calculatedHash = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return calculatedHash === config.password_hash;
}
```

---

## 4. Session Security & Auto-Lock State Management

```javascript
import { useState, useEffect } from 'react';

export function useDiaryVaultLock(userId) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Lock diary vault when application is minimized or sent to background
        setIsUnlocked(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return { isUnlocked, setIsUnlocked };
}
```
