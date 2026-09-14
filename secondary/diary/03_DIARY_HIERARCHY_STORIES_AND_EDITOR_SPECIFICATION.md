# HABIT HACKER DIARY SYSTEM — 03: HIERARCHY, STORIES & EDITOR SPECIFICATION

## 1. Default Five Diaries Initialization

When a user initializes the Diary tab for the first time, the application automatically seeds the local IndexedDB database with five default diaries:

```
📖 MY DIARIES LIBRARY
├── 1. Today's Lessons      [Type: DAILY_LESSONS,  Icon: Lightbulb]
├── 2. Today's Proverb      [Type: PROVERB,        Icon: Quote]
├── 3. Today's Story        [Type: STORY_HUB,      Icon: BookOpen]
├── 4. Daily Day Events     [Type: DAILY_EVENTS,   Icon: Calendar]
└── 5. Personal Diary       [Type: PERSONAL_JOURNAL, Icon: Lock]
```

### Initial Seeding Script (IndexedDB)
```javascript
export async function seedDefaultDiaries(db) {
  const count = await db.diaries.count();
  if (count === 0) {
    const defaultDiaries = [
      { id: 'diary-lessons', name: "Today's Lessons", type: 'DAILY_LESSONS', icon: 'Lightbulb', isLocked: false, displayOrder: 1, createdAt: new Date().toISOString() },
      { id: 'diary-proverb', name: "Today's Proverb", type: 'PROVERB', icon: 'Quote', isLocked: false, displayOrder: 2, createdAt: new Date().toISOString() },
      { id: 'diary-story', name: "Today's Story", type: 'STORY_HUB', icon: 'BookOpen', isLocked: false, displayOrder: 3, createdAt: new Date().toISOString() },
      { id: 'diary-events', name: "Daily Day Events", type: 'DAILY_EVENTS', icon: 'Calendar', isLocked: false, displayOrder: 4, createdAt: new Date().toISOString() },
      { id: 'diary-personal', name: "Personal Diary", type: 'PERSONAL_JOURNAL', icon: 'Lock', isLocked: true, displayOrder: 5, createdAt: new Date().toISOString() }
    ];
    await db.diaries.bulkAdd(defaultDiaries);
  }
}
```

---

## 2. Continuing Story Architecture & Chapter Model

The Story Diary system supports ongoing creative writing through a dedicated **Story Collection → Story Title → Chapter/Entry** model.

### Entity Relationship Model
```
[ Diary: Today's Story ]
          │
          ├── [ Story A: "The Lost Kingdom" ]
          │        ├── Chapter 1: The Arrival
          │        ├── Chapter 2: Into the Dark Forest
          │        └── Chapter 3: The Forgotten Citadel
          │
          └── [ Story B: "Chronicles of Mars" ]
                   ├── Chapter 1: Launch Day
                   └── Chapter 2: Red Horizon
```

### Story Chapter Execution Rules
1. **Append-Only History**: New daily continuation entries create distinct chapter records rather than overwriting previous chapters.
2. **Chronological Reordering**: Users can reorder chapters manually or sort by date created.
3. **Story Exporting**: Users can export individual chapters or compile the entire story into a single PDF / `.docx` book document.

---

## 3. Mobile-Optimized Rich Text Writing Editor

The editor provides a fast, distraction-free writing experience tailored for mobile touch input:

### Supported Formatting Capabilities
- **Typography**: Paragraphs, Heading 1 (`H1`), Heading 2 (`H2`), Heading 3 (`H3`).
- **Inline Styling**: Bold (`ctrl+b`), Italic (`ctrl+i`), Underline (`ctrl+u`), Strikethrough.
- **Lists**: Bullet lists (`•`), Numbered lists (`1.`), Checklists (`[ ]`).
- **Quotes & Separators**: Blockquotes (`">"`), Horizontal rule lines (`---`).

### Robust Autosave Engine
To prevent content loss during app switching, low memory termination, or crashes:
- **Debounced Draft Persistence**: Automatically writes active content to IndexedDB 800ms after the last keypress.
- **Immediate Unmount Flush**: Saves draft synchronously on component unmount or tab switch.
- **Visual Status Indicator**:
  - `Saving locally...` (during edit)
  - `Saved locally` (with timestamp)

```javascript
import { useEffect, useRef, useState } from 'react';

export function useAutosave(initialValue, onSave, delayMs = 800) {
  const [content, setContent] = useState(initialValue);
  const [status, setStatus] = useState('Saved locally');
  const timerRef = useRef(null);

  const updateContent = (newText) => {
    setContent(newText);
    setStatus('Saving locally...');
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await onSave(newText);
      setStatus('Saved locally');
    }, delayMs);
  };

  return { content, updateContent, status };
}
```
