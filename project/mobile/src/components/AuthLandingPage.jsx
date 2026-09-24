import React, { useState } from 'react';
import { Flame, Eye, EyeOff, CheckCircle2, Mail, Lock, User } from 'lucide-react';
import { getApiBaseUrl } from '../lib/apiConfig';

/**
 * AuthLandingPage — Clean authentication component.
 *
 * Architecture:
 *  - ALL auth calls go to Spring Boot backend (/api/v1/auth/register and /api/v1/auth/login)
 *  - Backend verifies credentials against Supabase app_users table
 *  - On success, user object = { id: email, email, displayName } is stored in localStorage
 *  - user_id used for all habits/tasks/diary = the user's email address
 *  - Zero Supabase Auth usage — no email confirmations, no rate limits
 */
export default function AuthLandingPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const nameToUse = displayName.trim() || cleanEmail.split('@')[0];
    const apiBase = getApiBaseUrl();

    try {
      if (authMode === 'REGISTER') {
        // ── REGISTER ────────────────────────────────────────────────────────
        let res;
        try {
          res = await fetch(`${apiBase}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password, displayName: nameToUse })
          });
        } catch (netErr) {
          setErrorMessage('Cannot connect to server. Make sure the backend is running on ' + apiBase);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (res.status === 409) {
          setErrorMessage(data.error || `An account for ${cleanEmail} already exists. Please sign in.`);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setErrorMessage(data.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }

        setSuccessMessage(`Account created for ${cleanEmail}! Please click "Sign In" to access your dashboard.`);
        setAuthMode('LOGIN');
        setPassword('');
        setDisplayName('');

      } else {
        // ── LOGIN ────────────────────────────────────────────────────────────
        let res;
        try {
          res = await fetch(`${apiBase}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password })
          });
        } catch (netErr) {
          setErrorMessage('Cannot connect to server. Make sure the backend is running on ' + apiBase);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (res.status === 404) {
          setErrorMessage(data.error || `No account found for "${cleanEmail}". Please register first.`);
          setLoading(false);
          return;
        }

        if (res.status === 401) {
          setErrorMessage(data.error || `Incorrect password for "${cleanEmail}". Please try again.`);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setErrorMessage(data.error || 'Login failed. Please try again.');
          setLoading(false);
          return;
        }

        // Build user object — id = email (used as user_id in all tables)
        const chosenDisplayName = data.user?.displayName || nameToUse;
        const loggedInUser = {
          id: cleanEmail,          // user_id = email — consistent across all devices
          email: cleanEmail,
          displayName: chosenDisplayName,
          user_metadata: { 
            display_name: chosenDisplayName,
            full_name: chosenDisplayName
          }
        };

        // Persist session to localStorage
        localStorage.setItem('hh_auth_user', JSON.stringify(loggedInUser));

        // Notify App.jsx
        onAuthSuccess(loggedInUser);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A, #1E293B)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '36px 28px',
        position: 'relative'
      }}>
        
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)'
          }}>
            <Flame size={32} color="#FFF" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            HABIT HACKER
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Personal Task, Subtask & Discipline Engine
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '14px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: authMode === 'LOGIN' ? '#FFF' : 'transparent',
              color: authMode === 'LOGIN' ? '#DC2626' : '#64748B',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: authMode === 'LOGIN' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>

          <button 
            type="button"
            onClick={() => { setAuthMode('REGISTER'); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: authMode === 'REGISTER' ? '#FFF' : 'transparent',
              color: authMode === 'REGISTER' ? '#DC2626' : '#64748B',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: authMode === 'REGISTER' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#DC2626', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', marginBottom: '16px', fontWeight: 600 }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#059669', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {authMode === 'REGISTER' && (
            <div>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ width: '100%', height: '44px', paddingLeft: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '44px', paddingLeft: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#475569', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', height: '44px', paddingLeft: '42px', paddingRight: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '46px', fontSize: '15px', marginTop: '8px', borderRadius: '12px', fontWeight: 800 }}
          >
            {loading ? 'Please wait...' : authMode === 'LOGIN' ? 'Sign In to Dashboard' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
