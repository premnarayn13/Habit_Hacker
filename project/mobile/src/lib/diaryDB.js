/**
 * diaryDB.js — Diary Storage Engine
 *
 * Strategy:
 *  - PRIMARY: Supabase PostgreSQL (persists across devices, browsers, clears)
 *  - FALLBACK: localStorage (offline / guest mode only)
 *
 * All diary entries, notes, todos and stories are stored in the `diary_entries`
 * Supabase table when a user is logged in. If Supabase is unavailable the data
 * is cached locally and synced on next connection.
 */

import { supabase } from './supabaseClient';

// ─── Supabase table helpers ────────────────────────────────────────────────────

const SUPABASE_TABLE = 'diary_entries';

/**
 * Returns the currently logged-in user's ID, or null for guests.
 */
async function getCurrentUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// ─── LocalStorage fallback ─────────────────────────────────────────────────────

function lsGet(key, userId = 'guest') {
  try {
    const raw = window.localStorage.getItem(`hh_table_${userId}_${key}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function lsSave(key, map, userId = 'guest') {
  try {
    window.localStorage.setItem(`hh_table_${userId}_${key}`, JSON.stringify(map));
  } catch {}
}

// ─── Generic entry CRUD via Supabase (with localStorage offline fallback) ──────

class DiaryTable {
  /**
   * @param {string} entryType  — used as the `entry_type` discriminator column
   *                              in the shared diary_entries table
   */
  constructor(entryType) {
    this.entryType = entryType;
  }

  // ── Fetch all records for this type ─────────────────────────────────────────

  async toArray() {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .select('*')
          .eq('user_id', userId)
          .eq('entry_type', this.entryType)
          .order('updated_at', { ascending: false });
        if (!error && data) {
          // Hydrate local cache for offline access
          const map = {};
          data.forEach(r => { map[r.id] = this._fromDB(r); });
          lsSave(this.entryType, map, userId);
          return Object.values(map);
        }
      } catch {}
    }
    // Offline fallback
    return Object.values(lsGet(this.entryType, userId || 'guest'));
  }

  // ── Get single record ────────────────────────────────────────────────────────

  async get(id) {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        if (!error && data) return this._fromDB(data);
      } catch {}
    }
    const map = lsGet(this.entryType, userId || 'guest');
    return map[id] || null;
  }

  // ── Count ────────────────────────────────────────────────────────────────────

  async count() {
    const arr = await this.toArray();
    return arr.length;
  }

  // ── Add (insert) ─────────────────────────────────────────────────────────────

  async add(item) {
    const id = item.id || safeUUID();
    const now = new Date().toISOString();
    const record = { ...item, id, createdAt: item.createdAt || now, updatedAt: now };

    const userId = await getCurrentUserId();
    if (userId) {
      try {
        await supabase.from(SUPABASE_TABLE).insert([this._toDB(record, userId)]);
      } catch {}
    }
    // Always also write to localStorage for immediate offline access
    const map = lsGet(this.entryType, userId || 'guest');
    map[id] = record;
    lsSave(this.entryType, map, userId || 'guest');
    return id;
  }

  // ── Put (upsert) ─────────────────────────────────────────────────────────────

  async put(item) {
    const id = item.id || safeUUID();
    const now = new Date().toISOString();

    const userId = await getCurrentUserId();
    if (userId) {
      try {
        const record = { ...item, id, updatedAt: now };
        await supabase.from(SUPABASE_TABLE).upsert([this._toDB(record, userId)]);
        const map = lsGet(this.entryType, userId);
        map[id] = { ...map[id], ...record };
        lsSave(this.entryType, map, userId);
        return id;
      } catch {}
    }
    const map = lsGet(this.entryType, 'guest');
    map[id] = { ...map[id], ...item, id, updatedAt: now };
    lsSave(this.entryType, map, 'guest');
    return id;
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  async update(id, changes) {
    const existing = await this.get(id);
    const now = new Date().toISOString();
    const record = { ...(existing || {}), ...changes, id, updatedAt: now };
    return await this.put(record);
  }

  // ── BulkAdd ──────────────────────────────────────────────────────────────────

  async bulkAdd(items) {
    const now = new Date().toISOString();
    const userId = await getCurrentUserId();
    const map = lsGet(this.entryType, userId || 'guest');

    const records = items.map(item => {
      const id = item.id || safeUUID();
      return { ...item, id, createdAt: item.createdAt || now, updatedAt: now };
    });

    if (userId) {
      try {
        await supabase.from(SUPABASE_TABLE).insert(records.map(r => this._toDB(r, userId)));
      } catch {}
    }
    records.forEach(r => { map[r.id] = r; });
    lsSave(this.entryType, map, userId || 'guest');
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async delete(id) {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        await supabase.from(SUPABASE_TABLE).delete().eq('id', id).eq('user_id', userId);
      } catch {}
    }
    const map = lsGet(this.entryType, userId || 'guest');
    delete map[id];
    lsSave(this.entryType, map, userId || 'guest');
  }

  // ── Sorting and Order helpers (Dexie-compatible chaining) ─────────────────

  reverse() {
    const self = this;
    return {
      sortBy: async (sortKey) => {
        const all = await self.toArray();
        return all.sort((a, b) => (b[sortKey] || '').toString().localeCompare((a[sortKey] || '').toString()));
      }
    };
  }

  orderBy(key) {
    const self = this;
    return {
      reverse: () => ({
        sortBy: async (sortKey) => {
          const all = await self.toArray();
          return all.sort((a, b) => (b[sortKey] || '').toString().localeCompare((a[sortKey] || '').toString()));
        },
        toArray: async () => {
          const all = await self.toArray();
          return all.sort((a, b) => (b[key] || '').toString().localeCompare((a[key] || '').toString()));
        }
      }),
      toArray: async () => {
        const all = await self.toArray();
        return all.sort((a, b) => (a[key] || '').toString().localeCompare((b[key] || '').toString()));
      }
    };
  }

  // ── Where (filter helper, mirrors old Dexie-like API) ────────────────────────

  where(key) {
    const self = this;
    return {
      equals: (value) => ({
        toArray: async () => {
          const all = await self.toArray();
          return all.filter(item => item[key] === value);
        },
        reverse: () => ({
          sortBy: async (sortKey) => {
            const all = await self.toArray();
            return all
              .filter(item => item[key] === value)
              .sort((a, b) => (b[sortKey] || '').localeCompare(a[sortKey] || ''));
          }
        }),
        delete: async () => {
          const all = await self.toArray();
          const toDelete = all.filter(item => item[key] === value);
          for (const item of toDelete) {
            await self.delete(item.id);
          }
        }
      })
    };
  }

  // ── DB serialisation helpers ─────────────────────────────────────────────────

  _toDB(record, userId) {
    return {
      id: record.id,
      user_id: userId,
      entry_type: this.entryType,
      diary_id: record.diaryId || record.diary_id || null,
      title: record.title || null,
      content: record.content || null,
      metadata: JSON.stringify({
        date: record.date,
        mood: record.mood,
        isChapter: record.isChapter,
        isLocked: record.isLocked,
        displayOrder: record.displayOrder,
        icon: record.icon,
        type: record.type,
        name: record.name,
        tags: record.tags,
        color: record.color,
        isPinned: record.isPinned,
        isArchived: record.isArchived,
        extra: record.extra
      }),
      created_at: record.createdAt || new Date().toISOString(),
      updated_at: record.updatedAt || new Date().toISOString()
    };
  }

  _fromDB(row) {
    let meta = {};
    try { meta = JSON.parse(row.metadata || '{}'); } catch {}
    return {
      id: row.id,
      diaryId: row.diary_id,
      diary_id: row.diary_id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...meta
    };
  }
}

// ─── Exported DB object ────────────────────────────────────────────────────────

export const diaryDB = {
  diaries: new DiaryTable('diary_meta'),
  stories: new DiaryTable('story'),
  entries: new DiaryTable('entry'),
  notes:   new DiaryTable('note'),
  todos:   new DiaryTable('todo'),
};

// ─── Default diary library definitions ────────────────────────────────────────

export const DEFAULT_DIARIES = [
  { id: 'diary-lessons', name: "Today's Lessons",  type: 'DAILY_LESSONS',    icon: 'Lightbulb', isLocked: false, displayOrder: 1 },
  { id: 'diary-proverb', name: "Today's Proverb",  type: 'PROVERB',          icon: 'Quote',     isLocked: false, displayOrder: 2 },
  { id: 'diary-story',   name: "Today's Story",    type: 'STORY_HUB',        icon: 'BookOpen',  isLocked: false, displayOrder: 3 },
  { id: 'diary-events',  name: "Daily Day Events", type: 'DAILY_EVENTS',     icon: 'Calendar',  isLocked: false, displayOrder: 4 },
  { id: 'diary-personal',name: "Personal Diary",   type: 'PERSONAL_JOURNAL', icon: 'Lock',      isLocked: true,  displayOrder: 5 }
];

// ─── UUID helper ───────────────────────────────────────────────────────────────

export function safeUUID() {
  return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) + '-' + Date.now().toString(36);
}

// ─── Init: seed default diary types for a new user ────────────────────────────

export async function initDiaryDB() {
  const count = await diaryDB.diaries.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_DIARIES.map(d => ({ ...d, createdAt: now, updatedAt: now }));
    await diaryDB.diaries.bulkAdd(seeded);
  }
}
