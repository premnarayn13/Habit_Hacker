import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Crown, 
  LogOut, 
  Sliders, 
  Calendar, 
  Clock, 
  Save,
  Palette,
  Check
} from 'lucide-react';

export default function SettingsProfileView({ currentUser, onLogout, onOpenAuth }) {
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.user_metadata?.display_name || 'Prem Narayn',
    email: currentUser?.email || 'prem.narayn@habithacker.app',
    capacityHours: 8,
    weekStartDay: 'Monday',
    dateFormat: 'YYYY-MM-DD',
    notificationsEnabled: true,
    soundAlerts: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} color="#DC2626" /> Profile & System Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Manage profile information, capacity quotas, date preferences, and Supabase cloud sync.
          </p>
        </div>

        {currentUser ? (
          <button className="btn-secondary" onClick={onLogout} style={{ color: '#DC2626' }}>
            <LogOut size={16} /> Sign Out
          </button>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <User size={16} /> Sign In / Register
          </button>
        )}
      </div>

      {savedSuccess && (
        <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.4)', color: '#059669', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> Profile settings updated successfully!
        </div>
      )}

      {/* User Profile Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '22px',
            position: 'relative'
          }}>
            PN
            <span style={{ position: 'absolute', bottom: '0', right: '0', background: '#D97706', borderRadius: '50%', padding: '4px' }}>
              <Crown size={14} color="#FFF" />
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{profileData.displayName}</h3>
              <span className="badge badge-high">Pro Member</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{profileData.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DISPLAY NAME</label>
              <input 
                type="text" 
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: '100%' }}
                disabled
              />
            </div>
          </div>

          {/* Daily Capacity Setting */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Daily Workload Capacity Quota</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#DC2626' }}>{profileData.capacityHours} Hours ({profileData.capacityHours * 60} mins)</span>
            </div>
            <input 
              type="range"
              min="2"
              max="16"
              value={profileData.capacityHours}
              onChange={(e) => setProfileData(prev => ({ ...prev, capacityHours: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Date & Week Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>WEEK START DAY</label>
              <select 
                value={profileData.weekStartDay}
                onChange={(e) => setProfileData(prev => ({ ...prev, weekStartDay: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>DATE FORMAT</label>
              <select 
                value={profileData.dateFormat}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateFormat: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Profile Settings
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
