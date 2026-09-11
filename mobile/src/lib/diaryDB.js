import Dexie from 'dexie';

export const diaryDB = new Dexie('HabitHackerDiaryDB');

diaryDB.version(1).stores({
  diaries: 'id, name, type, parentId, isLocked, displayOrder, createdAt, updatedAt',
  stories: 'id, diaryId, title, author, chapterCount, createdAt, updatedAt',
  entries: 'id, diaryId, storyId, title, date, isChapter, chapterNumber, createdAt, updatedAt, [diaryId+date]',
  notes: 'id, title, isPinned, isArchived, color, createdAt, updatedAt',
  todos: 'id, title, dueDate, dueTime, reminderDate, reminderTime, isCompleted, notificationId, ringtone, createdAt, updatedAt'
});

export const DEFAULT_DIARIES = [
  { id: 'diary-lessons', name: "Today's Lessons", type: 'DAILY_LESSONS', icon: 'Lightbulb', isLocked: false, displayOrder: 1 },
  { id: 'diary-proverb', name: "Today's Proverb", type: 'PROVERB', icon: 'Quote', isLocked: false, displayOrder: 2 },
  { id: 'diary-story', name: "Today's Story", type: 'STORY_HUB', icon: 'BookOpen', isLocked: false, displayOrder: 3 },
  { id: 'diary-events', name: "Daily Day Events", type: 'DAILY_EVENTS', icon: 'Calendar', isLocked: false, displayOrder: 4 },
  { id: 'diary-personal', name: "Personal Diary", type: 'PERSONAL_JOURNAL', icon: 'Lock', isLocked: true, displayOrder: 5 }
];

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
