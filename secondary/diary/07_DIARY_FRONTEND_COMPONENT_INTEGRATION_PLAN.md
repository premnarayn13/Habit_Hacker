# HABIT HACKER DIARY SYSTEM — 07: FRONTEND COMPONENT INTEGRATION PLAN

## 1. Frontend Component Structure

The new Diary system completely replaces `FocusTimerView.jsx` with `DiaryMainView.jsx` and its dedicated subcomponents:

```
mobile/src/components/
├── DiaryMainView.jsx             (Master Container for Diary Tab)
├── diary/
│   ├── DiaryHomeDashboard.jsx    (Personal Writing Hub: My Diaries, Notes, Todos)
│   ├── DiaryLibraryView.jsx      (Multi-Diary Folder Grid & Collection Organizer)
│   ├── DiaryEditorView.jsx       (Mobile Rich Text Autosave Writing Canvas)
│   ├── StoryLibraryView.jsx      (Story Collections & Ongoing Chapter Manager)
│   ├── QuickNotesView.jsx        (Fast Sticky Notes & Search Grid)
│   ├── TodoRemindersView.jsx     (Local Reminders & Notification Scheduler)
│   ├── DiaryLockModal.jsx        (Master Password Lock & Per-Diary Protection)
│   └── DiaryExportModal.jsx      (Password-Protected Local PDF & DOCX Compiler)
```

---

## 2. Navigation Routing & Tab Integration

### `App.jsx`
1. Update tab state from `'focus'` to `'diary'`:
   ```javascript
   // Replace:
   // const [activeTab, setActiveTab] = useState('widgets'); // or focus
   // With:
   const [activeTab, setActiveTab] = useState('today'); // default tab
   ```
2. Replace view import:
   ```javascript
   // Replace:
   // import FocusTimerView from './components/FocusTimerView';
   // With:
   import DiaryMainView from './components/DiaryMainView';
   ```
3. Update render switch:
   ```jsx
   {activeTab === 'diary' && (
     <DiaryMainView 
       user={user} 
       onNavigate={setActiveTab}
     />
   )}
   ```

### `Header.jsx` & `SidebarDrawer.jsx`
- Replace navigation item ID `focus` -> `diary`.
- Label: `"Diary"`.
- Icon: Lucide `BookOpen`.

---

## 3. UI/UX Design Token Specifications

The Diary system uses an **Executive Crimson & Warm Paper** palette, fitting seamlessly inside Habit Hacker's existing Red & White design language while feeling distinctively calm and personal:

- **Primary Canvas**: `#FAFAF9` (Warm Cream White)
- **Card Background**: `#FFFFFF` (Executive White Surface)
- **Primary Accent**: `#DC2626` (Crimson Red)
- **Highlight Accent**: `#F59E0B` (Gold / Amber)
- **Text Color**: `#0F172A` (Slate Dark)
- **Muted Text**: `#64748B` (Slate Muted)
- **Border Outline**: `#E2E8F0` (Soft Slate)

---

## 4. Verification & Testing Checklist

1. **Focus Tab Replacement**: Confirm the Focus timer view is completely replaced by the Diary space in both desktop header nav and mobile bottom nav.
2. **Default Diaries Seeding**: Verify 5 default diaries (*Today's Lessons, Today's Proverb, Today's Story, Daily Day Events, Personal Diary*) initialize on first launch.
3. **Story Continuation**: Test creating a story title (*e.g., "The Last Kingdom"*) and appending multiple chapter entries without content loss.
4. **Local Autosave**: Edit an entry, simulate low memory app termination, and verify draft auto-recovers from Dexie.js.
5. **Password Protection**: Enable Diary Lock, set password, verify access is blocked until correct password is entered.
6. **Local Document Export**: Generate PDF and DOCX exports after password verification, checking that zero remote API requests occur.
7. **Offline Functionality**: Disable internet access, write new diary entries, create Quick Notes and local Todos, and verify 100% features work offline.
