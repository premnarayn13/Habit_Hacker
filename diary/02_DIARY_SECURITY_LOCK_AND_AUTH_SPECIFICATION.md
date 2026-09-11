# HABIT HACKER DIARY SYSTEM — 02: SECURITY, PASSWORD LOCK & AUTHENTICATION SPECIFICATION

## 1. Multi-Tier Security Architecture

The Diary system implements a two-tier authentication architecture:
1. **Tier 1: Habit Hacker Application Login** (Supabase Auth / PostgreSQL JWT) — Grants access to standard productivity dashboards (Home, Today, Tasks, Analytics, Calendar).
2. **Tier 2: Dedicated Diary Lock Password** — Provides zero-knowledge local privacy protection for all personal writing, stories, notes, and reminders.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      TIER 1: APPLICATION LOGIN SYSTEM                           │
│                      (Supabase / PostgreSQL Account)                            │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     TIER 2: PRIVATE DIARY SECURITY LOCK                         │
│                     (Dedicated Master Password & Hash)                          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                   ▼                                           ▼
      [ Overall Diary Vault Lock ]             [ Per-Diary Specific Lock ]
      Unlocks main collection list             Unlocks sensitive individual diary
```

---

## 2. Password Hashing & Verification Lifecycle

### Hashing Mechanism
- Raw passwords are **NEVER** saved to `localStorage`, `sessionStorage`, IndexedDB, or server databases in plaintext.
- Password verification uses **PBKDF2 with SHA-256** (100,000 iterations) via the native `Web Crypto API` (`crypto.subtle`) or BCrypt via backend metadata verification.

### Key Derivation Flow (Web Crypto API)
```javascript
export async function generatePasswordHash(password, saltHex = null) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : window.crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  return {
    hashHex: bytesToHex(new Uint8Array(derivedKey)),
    saltHex: bytesToHex(salt)
  };
}
```

---

## 3. Session Lock Lifecycle & Auto-Lock Policies

To balance privacy with mobile writing convenience, users can choose their preferred session lock policy:

1. **Immediate Lock**: Locks the Diary tab as soon as the user navigates to another tab (e.g., Today or Tasks).
2. **Background Lock (Default)**: Locks the Diary when the mobile application is minimized, closed, or sent to background.
3. **Inactivity Timeout**: Locks after 5 minutes of inactivity (no touch or keystroke events).
4. **Never (Session Only)**: Remains unlocked until the browser/application process is completely terminated.

### Inactivity Manager Implementation
```javascript
let inactivityTimer = null;

export function resetInactivityTimer(onTimeout, timeoutMs = 300000) {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    onTimeout();
  }, timeoutMs);
}
```

---

## 4. Protected Operations & Authentication Gates

The following actions trigger a mandatory password verification modal before proceeding:

1. **Initial Vault Access**: Opening the Diary tab when vault lock is enabled.
2. **Opening Locked Diaries**: Accessing individual diaries configured with `isLocked = true`.
3. **Export Generation**: Exporting Diary entries to PDF or `.docx`.
4. **Password Configuration**: Changing the Diary master password or clearing local storage.

---

## 5. Password Recovery & Security Notice

Since diary text is not backed up on cloud servers:
- Resetting a forgotten password **cannot** recover previously encrypted local entries if AES-256 local encryption is enabled.
- The UI explicitly informs the user during setup:
  > ⚠️ *Important: Your diary password is stored only on this device as a secure cryptographic hash. If you forget your password, our servers cannot recover your diary content for you. Please store a backup of your password in a safe place.*
