import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X, Lock, CheckCircle2 } from 'lucide-react';
import { exportDiaryToPDF, exportDiaryToDocx } from '../../lib/diaryExporter';
import { verifyPasswordHash } from '../../lib/diarySecurity';

export default function DiaryExportModal({ isOpen, onClose, diaryName, entries, securityConfig }) {
  const [format, setFormat] = useState('PDF'); // 'PDF' or 'DOCX'
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const requiresAuth = securityConfig && securityConfig.passwordHash;

  const handleExport = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (requiresAuth) {
      const isValid = await verifyPasswordHash(password, securityConfig.passwordHash, securityConfig.passwordSalt);
      if (!isValid) {
        setErrorMsg('Incorrect password authentication failed.');
        return;
      }
    }

    setIsExporting(true);
    try {
      if (format === 'PDF') {
        await exportDiaryToPDF({ diaryName, entries });
      } else {
        await exportDiaryToDocx({ diaryName, entries });
      }
      setPassword('');
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMsg('Export failed. Please check local permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E2E8F0',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            <Download size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Export Private Diary
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Exporting <strong>{diaryName}</strong> ({entries ? entries.length : 0} entries)
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#991B1B',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleExport}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Choose Document Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFormat('PDF')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: format === 'PDF' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                  backgroundColor: format === 'PDF' ? '#FEF2F2' : '#FFFFFF',
                  color: format === 'PDF' ? '#DC2626' : '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={18} />
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormat('DOCX')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: format === 'DOCX' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                  backgroundColor: format === 'DOCX' ? '#FEF2F2' : '#FFFFFF',
                  color: format === 'DOCX' ? '#DC2626' : '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileSpreadsheet size={18} />
                Word (.DOCX)
              </button>
            </div>
          </div>

          {requiresAuth && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Enter Diary Password to Authorize Export
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isExporting}
            style={{
              width: '100%',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isExporting ? 0.7 : 1
            }}
          >
            <Download size={18} />
            {isExporting ? 'Compiling Document...' : `Generate Local ${format} Export`}
          </button>
        </form>

        <p style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: '12px', margin: '12px 0 0 0' }}>
          🛡️ Exports are compiled 100% locally in browser memory. Zero cloud server requests.
        </p>
      </div>
    </div>
  );
}
