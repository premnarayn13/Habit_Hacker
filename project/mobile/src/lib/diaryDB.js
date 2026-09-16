class LocalStorageTable {
  constructor(tableName) {
    this.tableName = `hh_table_${tableName}`;
  }

  async _getAllMap() {
    try {
      if (typeof window === 'undefined') return {};
      const raw = window.localStorage.getItem(this.tableName);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error(`Error reading table ${this.tableName}:`, e);
      return {};
    }
  }

  async _saveAllMap(map) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.tableName, JSON.stringify(map));
      }
    } catch (e) {
      console.error(`Error writing table ${this.tableName}:`, e);
    }
  }

  async toArray() {
    const map = await this._getAllMap();
    return Object.values(map);
  }

  async count() {
    const map = await this._getAllMap();
    return Object.keys(map).length;
  }

  async get(id) {
    const map = await this._getAllMap();
    return map[id] || null;
  }

  async add(item) {
    const map = await this._getAllMap();
    const id = item.id || safeUUID();
    map[id] = { ...item, id };
    await this._saveAllMap(map);
    return id;
  }

  async put(item) {
    const map = await this._getAllMap();
    const id = item.id || safeUUID();
    map[id] = { ...map[id], ...item, id };
    await this._saveAllMap(map);
    return id;
  }

  async bulkAdd(items) {
    const map = await this._getAllMap();
    items.forEach((item) => {
      const id = item.id || safeUUID();
      map[id] = { ...item, id };
    });
    await this._saveAllMap(map);
  }

  async delete(id) {
    const map = await this._getAllMap();
    delete map[id];
    await this._saveAllMap(map);
  }

  where(key) {
    return {
      equals: (value) => ({
        toArray: async () => {
          const map = await this._getAllMap();
          return Object.values(map).filter((item) => item[key] === value);
        },
        delete: async () => {
          const map = await this._getAllMap();
          Object.keys(map).forEach((id) => {
            if (map[id][key] === value) {
              delete map[id];
            }
          });
          await this._saveAllMap(map);
        },
      }),
    };
  }
}

export const diaryDB = {
  diaries: new LocalStorageTable('diaries'),
  stories: new LocalStorageTable('stories'),
  entries: new LocalStorageTable('entries'),
  notes: new LocalStorageTable('notes'),
  todos: new LocalStorageTable('todos'),
};

export const DEFAULT_DIARIES = [
  { id: 'diary-lessons', name: "Today's Lessons", type: 'DAILY_LESSONS', icon: 'Lightbulb', isLocked: false, displayOrder: 1 },
  { id: 'diary-proverb', name: "Today's Proverb", type: 'PROVERB', icon: 'Quote', isLocked: false, displayOrder: 2 },
  { id: 'diary-story', name: "Today's Story", type: 'STORY_HUB', icon: 'BookOpen', isLocked: false, displayOrder: 3 },
  { id: 'diary-events', name: "Daily Day Events", type: 'DAILY_EVENTS', icon: 'Calendar', isLocked: false, displayOrder: 4 },
  { id: 'diary-personal', name: "Personal Diary", type: 'PERSONAL_JOURNAL', icon: 'Lock', isLocked: true, displayOrder: 5 }
];

export function safeUUID() {
  return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) + '-' + Date.now().toString(36);
}

export async function initDiaryDB() {
  const count = await diaryDB.diaries.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const seededDiaries = DEFAULT_DIARIES.map(d => ({
      ...d,
      createdAt: now,
      updatedAt: now
    }));
    await diaryDB.diaries.bulkAdd(seededDiaries);
  }
}
