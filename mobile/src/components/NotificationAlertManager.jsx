import React, { useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle, Volume2, X, Play } from 'lucide-react';

export default function NotificationAlertManager({ isOpen, onClose }) {
  const [activeAlertPopup, setActiveAlertPopup] = useState(null);

  const mockScheduledReminders = [
    { id: 'r-1', title: 'Complete ML Architecture Document', type: 'EXACT_TIME', scheduledTime: '09:00 AM Today', status: 'ACTIVE' },
    { id: 'r-2', title: 'Subtask: Build Data Flow Diagram', type: 'BEFORE_START', scheduledTime: '15 mins before (09:45 AM)', status: 'ACTIVE' },
    { id: 'r-3', title: '30 mins Daily Workout', type: 'HABIT_REMINDER', scheduledTime: '06:00 PM Today', status: 'ACTIVE' },
    { id: 'r-4', title: 'Daily Capacity Planning Reminder', type: 'DAILY_PLANNING', scheduledTime: '08:00 AM Daily', status: 'ACTIVE' }
  ];

  const handleTestAlert = () => {
    setActiveAlertPopup({
      title: 'REMINDER ALERT: Task Starting Now!',
      body: 'Complete Machine Learning Architecture Document (Deadline: Today at 5:00 PM)',
      priority: 'CRITICAL',
      time: 'Just now'
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '24px', position: 'relative' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Bell size={22} color="#F59E0B" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>Task Reminders & Notification Alert Center</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
          Configure exact-time reminders, relative start alerts, and deadline warnings for tasks & subtasks.
        </p>

        {/* Test Alert Button */}
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Volume2 size={20} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>Notification Alert Engine Active</div>
              <div style={{ fontSize: '11px', color: '#FCD34D' }}>Sound and push notifications enabled</div>
            </div>
          </div>

          <button 
            onClick={handleTestAlert}
            style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} /> Test Reminder Alert
          </button>
        </div>

        {/* Scheduled Reminders List */}
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>Scheduled Reminders ({mockScheduledReminders.length})</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
          {mockScheduledReminders.map(rem => (
            <div key={rem.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{rem.title}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                  ⏰ {rem.scheduledTime} | Type: {rem.type}
                </div>
              </div>
              <span className="badge badge-medium">Active</span>
            </div>
          ))}
        </div>

        {/* Live Notification Alert Simulated Modal Popup */}
        {activeAlertPopup && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            background: 'linear-gradient(135deg, #1E1B4B, #111827)',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.5)',
            zIndex: 1100,
            animation: 'pulseAlert 1s infinite alternate'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Bell size={24} color="#F59E0B" />
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FCD34D' }}>{activeAlertPopup.title}</h4>
            </div>
            <p style={{ fontSize: '14px', color: '#FFF', marginBottom: '16px' }}>{activeAlertPopup.body}</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setActiveAlertPopup(null)}
                style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
