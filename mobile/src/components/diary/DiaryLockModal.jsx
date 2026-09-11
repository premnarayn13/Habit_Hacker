import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { verifyPasswordHash, generatePasswordHash } from '../../lib/diarySecurity';

export default function DiaryLockModal({ isOpen, onClose, onUnlockSuccess, securityConfig, onSaveSecurityConfig }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(!securityConfig || !securityConfig.passwordHash);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSetupMode) {
      if (!password || password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      const { hashHex, saltHex } = await generatePasswordHash(password);
      const newConfig = {
        passwordHash: hashHex,
        passwordSalt: saltHex,
        lockPolicy: 'BACKGROUND'
      };
      
      if (onSaveSecurityConfig) {
        await onSaveSecurityConfig(newConfig);
      }
      onUnlockSuccess();
      onClose();
    } else {
      const isValid = await verifyPasswordHash(password, securityConfig.passwordHash, securityConfig.passwordSalt);
      if (isValid) {
        setPassword('');
        onUnlockSuccess();
        onClose();
      } else {
        setErrorMsg('Incorrect password. Access denied.');
      }
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
        maxWidth: '400px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        position: 'relative'
      }}>
        {onClose && (
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
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            border: '2px solid #FCA5A5'
          }}>
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {isSetupMode ? 'Create Diary Password' : 'Private Diary Vault Locked'}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
            {isSetupMode 
              ? 'Set a dedicated password to protect your private personal writing.'
              : 'Enter your diary password to unlock private entries.'}
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {isSetupMode ? 'New Master Password' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
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
              <KeyRound size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
            </div>
          </div>

          {isSetupMode && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={18} />
            {isSetupMode ? 'Save & Unlock Vault' : 'Unlock Private Diary'}
          </button>
        </form>

        <p style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: '14px', margin: '14px 0 0 0' }}>
          🔒 Passwords are verified via PBKDF2 cryptography. Your private writing text is stored only on this device.
        </p>
      </div>
    </div>
  );
}
