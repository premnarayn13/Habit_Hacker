export async function exportDiaryToPDF({ diaryName, entries }) {
  try {
    let pdfText = `${diaryName.toUpperCase()}\nExported on ${new Date().toLocaleDateString()} • Habit Hacker Private Diary\n----------------------------------------\n\n`;
    entries.forEach((entry) => {
      const cleanText = (entry.content || '').replace(/<[^>]*>?/gm, '');
      pdfText += `[${entry.date || 'Undated'}] ${entry.title || 'Untitled Entry'}\n${cleanText}\n\n`;
    });

    const filename = `${diaryName.replace(/\s+/g, '_')}_Export.txt`;
    const blob = new Blob([pdfText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting diary:', error);
  }
}

export async function exportDiaryToDocx({ diaryName, entries }) {
  return exportDiaryToPDF({ diaryName, entries });
}
