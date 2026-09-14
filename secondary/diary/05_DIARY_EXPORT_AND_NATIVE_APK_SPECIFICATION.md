# HABIT HACKER DIARY SYSTEM — 05: EXPORT & NATIVE APK INTEGRATION SPECIFICATION

## 1. Local Document Export Architecture

Exporting diary content into PDF or Word (`.docx`) documents is performed **100% locally on the device** using client-side JavaScript libraries (`jspdf`, `html2pdf.js`, `docx`).

> ⚠️ **EXPORT SECURITY MANDATE**:
> PDF or Word generation must **NEVER** upload diary text to a remote converter API or server. The document binary is compiled in browser memory and passed directly to the device file saver / native share sheet.

```
[ User Requests Export ]
          │
          ▼
[ Authenticate Master Password ] ──(Verification Gate)
          │
          ▼ (Success)
[ Retrieve Local Entries from IndexedDB ]
          │
          ▼
[ Client-Side PDF / DOCX Compiler ] (jsPDF / html2pdf / docx)
          │
          ▼
[ Generate Blob in Memory ]
          │
          ▼
[ Android Native File Saver / Share Sheet ] (saveAs / navigator.share)
```

---

## 2. PDF Export Generation Engine

Using `jspdf` / `html2canvas` for crisp, formatted document rendering:

```javascript
import jsPDF from 'jspdf';

export async function exportDiaryToPDF({ diaryName, entries, title = 'Personal Writing' }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Cover / Header Styling
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38); // Crimson Red Accent (#DC2626)
  doc.text(diaryName.toUpperCase(), 20, 25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated locally on ${new Date().toLocaleDateString()} • Habit Hacker Private Diary`, 20, 32);

  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 38, 38);
  doc.line(20, 36, 190, 36);

  let yOffset = 45;

  entries.forEach((entry, index) => {
    if (yOffset > 260) {
      doc.addPage();
      yOffset = 25;
    }

    // Entry Date & Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${entry.date} — ${entry.title}`, 20, yOffset);
    yOffset += 7;

    // Entry Body
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(entry.content || '', 170);
    doc.text(splitText, 20, yOffset);

    yOffset += (splitText.length * 6) + 12;
  });

  // Save Document Locally
  doc.save(`${diaryName.replace(/\s+/g, '_')}_Export.pdf`);
}
```

---

## 3. Word (.DOCX) Export Engine

Using `docx` library to generate clean, structured Microsoft Word files:

```javascript
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportDiaryToDocx({ diaryName, entries }) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: diaryName,
          heading: HeadingLevel.HEADING_1
        }),
        ...entries.flatMap(entry => [
          new Paragraph({
            text: `${entry.date} : ${entry.title}`,
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: entry.content || '',
                size: 24 // 12pt font
              })
            ]
          }),
          new Paragraph({ text: '' }) // Spacing
        ])
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${diaryName.replace(/\s+/g, '_')}_Export.docx`;
  link.click();
}
```

---

## 4. Mobile APK Native Capabilities & Android Integration

When wrapped in Capacitor / Cordova / WebShell for Android APK distribution:

1. **Native Share Sheet**:
   ```javascript
   if (navigator.share) {
     navigator.share({
       title: diaryName,
       text: 'Exported Private Diary from Habit Hacker',
       files: [fileObject]
     });
   }
   ```
2. **Android Back Button Integration**:
   Pressing the physical Android back button when viewing an entry or locked diary gracefully closes the editor or modal instead of exiting the entire application.
3. **Keyboard Avoidance**:
   The fixed bottom toolbar in `DiaryEditorView.jsx` uses `window.visualViewport` listener to automatically adjust layout height when the Android soft keyboard appears.
