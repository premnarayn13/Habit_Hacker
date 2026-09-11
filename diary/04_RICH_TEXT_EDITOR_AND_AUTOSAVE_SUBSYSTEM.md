# HABIT HACKER DIARY — RICH TEXT EDITOR & AUTOSAVE SUBSYSTEM

## 1. Mobile-First Editor Architecture

Writing in the Habit Hacker Diary must feel **distraction-free, instantaneous, calm, and responsive**. The editor component (`DailyEntryEditor.jsx`) avoids bloated heavy WYSIWYG frameworks and utilizes a clean, mobile-optimized rich-text writing interface.

```text
+-------------------------------------------------------------------+
| <- Back   Today's Lessons  |  Sep 9, 2026          [Saved locally] |
+-------------------------------------------------------------------+
| Title: Master System Design Patterns                             |
|                                                                   |
| ### What I Learned Today                                          |
| High-concurrency message queues require partitioning by key...   |
|                                                                   |
| * Bullet point item 1                                             |
| * Bullet point item 2                                             |
|                                                                   |
| > "Simplicity is prerequisite for reliability." - Edsger W. Dijkstra |
|                                                                   |
+-------------------------------------------------------------------+
| [H1] [H2] [B] [I] [U] [List] [Num] [Quote] [Divider] [Checklist] |  <- Fixed Keyboard Toolbar
+-------------------------------------------------------------------+
```

---

## 2. Supported Formatting Capabilities

The editor supports a curated set of lightweight markdown/HTML formatting tools:
- **Headings**: H1 (`#`), H2 (`##`), H3 (`###`)
- **Typography**: Bold (`**text**`), Italic (`*text*`), Underline (`<u>text</u>`), Strikethrough (`~~text~~`)
- **Lists**: Bulleted list (`* item`), Numbered list (`1. item`), Interactive Checklists (`- [ ] item`)
- **Blockquotes**: Quote styling (`> quote text`)
- **Separators**: Horizontal rule (`---`)
- **Code & Snippets**: Inline code (```code```)
- **Links**: Hyperlinks (`[Label](url)`)

---

## 3. Real-Time Autosave & Crash Recovery Protocol

To guarantee **zero lost work** under app switches, sudden device shutdowns, or OS background kills, the editor employs a 3-layer autosave strategy:

```text
Typing Event (Keypress/Input)
      │
      ├──> Layer 1: Immediate Memory Sync (React state buffer)
      │
      ├──> Layer 2: Fast LocalDraft Buffer (Saved to IndexedDB every 500ms debounced)
      │
      └──> Layer 3: Persistent Entry Commit (Committed to IndexedDB `entries` store every 2000ms debounced)
```

### 3.1. Autosave State Machine

```javascript
// Local Draft & Commit Debounce Engine
import { debounce } from 'lodash-es';

export function useAutosaveEditor({ entryId, diaryId, initialTitle, initialContent, onSaveLocal }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'typing' | 'saving' | 'saved'

  // Debounced Local Commit (2000ms)
  const debouncedCommit = useMemo(() => 
    debounce(async (latestTitle, latestContent) => {
      setSaveStatus('saving');
      await onSaveLocal({
        id: entryId,
        diaryId,
        title: latestTitle,
        contentHtml: latestContent,
        updatedAt: new Date().toISOString()
      });
      setSaveStatus('saved');
    }, 2000),
  [entryId, diaryId, onSaveLocal]);

  // Fast Local Draft Buffer (500ms)
  const debouncedDraft = useMemo(() =>
    debounce(async (t, c) => {
      await saveLocalDraftBuffer(entryId, diaryId, t, c);
    }, 500),
  [entryId, diaryId]);

  const handleContentChange = (newTitle, newContent) => {
    setTitle(newTitle);
    setContent(newContent);
    setSaveStatus('typing');
    debouncedDraft(newTitle, newContent);
    debouncedCommit(newTitle, newContent);
  };

  return { title, content, saveStatus, handleContentChange };
}
```

---

## 4. UI Save Status Indicators

The editor displays a transparent status badge in the top navigation bar:
- 🟡 `Typing...` (Local draft updated)
- 🔵 `Saving locally...` (Writing to IndexedDB / SQLite)
- 🟢 `Saved locally` (Successfully persisted to device storage)

**Crucial UX Directive**: The status indicator must ALWAYS state **"Saved locally"** and NEVER say "Saved to cloud" or "Synced to server".

---

## 5. Mobile Keyboard Safe Layout Handling

On mobile APK devices:
1. The bottom formatting toolbar floats dynamically above the virtual software keyboard (`window.visualViewport` listener).
2. Tapping formatting icons triggers `preventDefault()` to prevent losing text focus or dropping the software keyboard.
3. Long documents auto-scroll so the active typing line remains centered above the software keyboard.

---

*Specification Document 4 of 9 — Rich Text Editor & Autosave Subsystem*
