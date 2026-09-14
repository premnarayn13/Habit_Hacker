import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportDiaryToPDF({ diaryName, entries }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Title Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38); // Crimson Red
  doc.text(diaryName.toUpperCase(), 20, 25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Exported on ${new Date().toLocaleDateString()} • Habit Hacker Private Diary`, 20, 32);

  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 38, 38);
  doc.line(20, 36, 190, 36);

  let yOffset = 45;

  entries.forEach((entry) => {
    if (yOffset > 260) {
      doc.addPage();
      yOffset = 25;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`${entry.date || 'Undated'} — ${entry.title || 'Untitled Entry'}`, 20, yOffset);
    yOffset += 7;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    // Strip HTML tags for clean text export
    const cleanText = (entry.content || '').replace(/<[^>]*>?/gm, '');
    const splitText = doc.splitTextToSize(cleanText, 170);
    doc.text(splitText, 20, yOffset);

    yOffset += (splitText.length * 5) + 12;
  });

  doc.save(`${diaryName.replace(/\s+/g, '_')}_Export.pdf`);
}

export async function exportDiaryToDocx({ diaryName, entries }) {
  const children = [
    new Paragraph({
      text: diaryName,
      heading: HeadingLevel.HEADING_1
    }),
    new Paragraph({
      text: `Exported on ${new Date().toLocaleDateString()} - Habit Hacker Private Diary`
    }),
    new Paragraph({ text: '' })
  ];

  entries.forEach(entry => {
    const cleanText = (entry.content || '').replace(/<[^>]*>?/gm, '');
    children.push(
      new Paragraph({
        text: `${entry.date || 'Undated'} : ${entry.title || 'Untitled Entry'}`,
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: cleanText,
            size: 24
          })
        ]
      }),
      new Paragraph({ text: '' })
    );
  });

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${diaryName.replace(/\s+/g, '_')}_Export.docx`;
  link.click();
}
