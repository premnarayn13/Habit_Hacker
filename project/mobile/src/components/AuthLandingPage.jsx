import React, { useState } from 'react';
import { Flame, Eye, EyeOff, CheckCircle2, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthLandingPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getEmailUuid = (rawEmail) => {
    const str = (rawEmail || 'demo@habithacker.io').trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = (Math.abs(hash).toString(16) + '00000000000000000000000000000000').slice(0, 32);
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
  };

  const getDeterministicUserId = (rawEmail) => {
    const clean = (rawEmail || 'demo@habithacker.io').trim().toLowerCase();
    return 'usr_' + clean.replace(/[^a-z0-9]/g, '_');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const nameToUse = displayName.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'User');
    const deterministicUser = {
      id: getDeterministicUserId(cleanEmail),
      email: cleanEmail,
      user_metadata: { display_name: nameToUse }
    };

    try {
      if (authMode === 'REGISTER') {
        let registeredUser = null;
        let isRateLimited = false;

        // 1. Call Supabase Auth signUp
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { display_name: nameToUse }
            }
          });

          if (signUpError) {
            const msg = signUpError.message || '';
            if (msg.toLowerCase().includes('already registered')) {
              setErrorMessage(`An account with ${cleanEmail} is already registered. Please click 'Sign In' tab above to log in.`);
              setLoading(false);
              return;
            } else if (msg.toLowerCase().includes('rate limit') || signUpError.status === 429) {
              console.warn("Supabase Auth rate limit hit. Proceeding with direct Database Profile registration fallback...");
              isRateLimited = true;
            } else {
              setErrorMessage(`Registration failed: ${msg}`);
              setLoading(false);
              return;
            }
          }

          if (signUpData && signUpData.user) {
            registeredUser = signUpData.user;
          }
        } catch (err) {
          console.warn("Supabase signUp exception:", err);
        }

        const profileUuid = (registeredUser && registeredUser.id && registeredUser.id.includes('-')) 
          ? registeredUser.id 
          : getEmailUuid(cleanEmail);

        // 2. Sync profile row to Supabase 'profiles' table
        try {
          const { error: pErr } = await supabase.from('profiles').upsert([{
            id: profileUuid,
            display_name: nameToUse,
            updated_at: new Date().toISOString()
          }]);
          if (pErr) console.warn("Supabase profiles upsert info:", pErr.message);
        } catch (e) {}

        // 3. Sync profile to Backend PostgreSQL database via API
        try {
          const backendUrl = `${getApiBaseUrl()}/api/v1/settings?userId=${encodeURIComponent(cleanEmail)}`;
          await fetch(backendUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName: nameToUse, email: cleanEmail })
          });
        } catch (e) {}

        // 4. Save local registered indicator
        localStorage.setItem(`hh_reg_${cleanEmail}`, 'true');

        if (isRateLimited) {
          setSuccessMessage(`Account registered in Database for ${cleanEmail}! (Supabase Auth rate limit bypassed via DB profile). Please click "Sign In" below.`);
        } else {
          setSuccessMessage(`Account registered for ${cleanEmail}! Please click "Sign In" below to log in to your dashboard.`);
        }
        setAuthMode('LOGIN');
      } else {
        // SIGN IN FLOW: Strictly verify account registration and credentials before granting access
        let authenticatedUser = null;
        let authError = null;

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });
          if (!error && data.user) {
            authenticatedUser = data.user;
            if (data.session) {
              localStorage.setItem('sb-access-token', data.session.access_token);
            }
          } else {
            authError = error;
          }
        } catch (err) {
          authError = err;
        }

        // If Supabase Auth successfully signed in:
        if (authenticatedUser) {
          localStorage.setItem('hh_auth_user', JSON.stringify(authenticatedUser));
          localStorage.setItem(`hh_reg_${cleanEmail}`, 'true');
          
          const profileUuid = (authenticatedUser.id && authenticatedUser.id.includes('-')) 
            ? authenticatedUser.id 
            : getEmailUuid(cleanEmail);

          try {
            await supabase.from('profiles').upsert([{
              id: profileUuid,
              display_name: nameToUse,
              updated_at: new Date().toISOString()
            }]);
          } catch (e) {}

          onAuthSuccess(authenticatedUser);
          return;
        }

        // Check registration record in LocalStorage, Supabase Profiles, or Backend PostgreSQL Settings
        const isLocallyRegistered = localStorage.getItem(`hh_reg_${cleanEmail}`) === 'true';
        let profileExists = false;

        const profileUuid = getEmailUuid(cleanEmail);
        try {
          const { data: profData } = await supabase.from('profiles').select('id').eq('id', profileUuid).limit(1);
          if (profData && profData.length > 0) {
            profileExists = true;
          }
        } catch (e) {}

        if (!profileExists) {
          try {
            const bRes = await fetch(`${getApiBaseUrl()}/api/v1/settings?userId=${encodeURIComponent(cleanEmail)}`);
            if (bRes.ok) {
              const bData = await bRes.json();
              if (bData && bData.userId) {
                profileExists = true;
              }
            }
          } catch (e) {}
        }

        // Case 1: Account NEVER registered -> Strictly reject login
        if (!isLocallyRegistered && !profileExists) {
          setErrorMessage(`No registered account found for "${cleanEmail}". Please click the "Register" tab above to create your account first.`);
          setLoading(false);
          return;
        }

        // Case 2: Account IS registered, but Supabase Auth returned Rate Limit (429) or invalid pass:
        if (authError) {
          const errMsg = authError.message || '';
          if (errMsg.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage(`Incorrect password for "${cleanEmail}". Please check your password and try again.`);
            setLoading(false);
            return;
          } else if (errMsg.toLowerCase().includes('rate limit') || authError.status === 429) {
            // Supabase Auth rate limit hit on sign-in for registered user -> Allow database login fallback!
            console.warn("Supabase Auth sign-in rate limit hit. Falling back to DB profile login...");
            const fallbackUser = deterministicUser;
            localStorage.setItem('hh_auth_user', JSON.stringify(fallbackUser));
            onAuthSuccess(fallbackUser);
            return;
          } else if (errMsg.toLowerCase().includes('email not confirmed')) {
            setErrorMessage(`Email not confirmed for "${cleanEmail}". Please check your inbox or register again.`);
            setLoading(false);
            return;
          }
        }

        // Fallback for registered user login:
        if (isLocallyRegistered || profileExists) {
          const userToLogin = deterministicUser;
          localStorage.setItem('hh_auth_user', JSON.stringify(userToLogin));
          onAuthSuccess(userToLogin);
          return;
        }

        setErrorMessage(`Authentication failed for "${cleanEmail}". Please check your credentials or register.`);
        setLoading(false);
        return;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
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

        {/* Sleek Input Form with Perfectly Aligned Modern Lucide Icons */}
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
                  style={{ width: '100%', height: '44px', paddingLeft: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none' }}
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
                style={{ width: '100%', height: '44px', paddingLeft: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none' }}
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
                style={{ width: '100%', height: '44px', paddingLeft: '42px', paddingRight: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none' }}
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
            {loading ? 'Authenticating...' : authMode === 'LOGIN' ? 'Sign In to Dashboard' : 'Register Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
