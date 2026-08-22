import React, { useState } from 'react';
import { X, Lock, Mail, User, KeyRound, Flame, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' or 'SIGNUP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (authMode === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName }
          }
        });

        if (error) throw error;
        setSuccessMessage('Account created successfully! Check your email to confirm registration.');
        if (data.user) {
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        setSuccessMessage('Successfully signed in!');
        if (data.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    onAuthSuccess({
      id: 'demo-user-123',
      email: 'prem.narayn@habithacker.app',
      user_metadata: { display_name: 'Prem Narayn' }
    });
    onClose();
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose} style={{ zIndex: 1600 }}>
      <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        <div className="sheet-drag-handle" />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            boxShadow: 'var(--shadow-red)'
          }}>
            <Flame size={26} color="#FFF" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
            {authMode === 'LOGIN' ? 'Welcome Back to Habit Hacker' : 'Create Your Account'}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Secure Cloud Sync & Discipline Analytics
          </p>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => setAuthMode('LOGIN')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authMode === 'LOGIN' ? '#FFF' : 'transparent',
              color: authMode === 'LOGIN' ? '#DC2626' : '#64748B',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: authMode === 'LOGIN' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Sign In
          </button>

          <button 
            onClick={() => setAuthMode('SIGNUP')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authMode === 'SIGNUP' ? '#FFF' : 'transparent',
              color: authMode === 'SIGNUP' ? '#DC2626' : '#64748B',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: authMode === 'SIGNUP' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#059669', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
            {successMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {authMode === 'SIGNUP' && (
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Prem Narayn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px' }}
                required
              />
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', paddingRight: '38px' }}
                required
              />
              <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <button 
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '44px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : authMode === 'LOGIN' ? 'Sign In to Habit Hacker' : 'Create Account'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '16px', paddingTop: '14px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={handleDemoSignIn}
            style={{ background: 'transparent', border: 'none', color: '#D97706', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ShieldCheck size={14} /> Quick Demo Access (Offline Mode)
          </button>
        </div>

      </div>
    </div>
  );
}
