import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Zap } from 'lucide-react';

export default function CapacityPlannerView({ capacityData, onUpdateCapacity, onRescheduleTask }) {
  const isOverloaded = capacityData?.isOverloaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={22} color="#6366F1" /> Capacity-Aware Workload Planner
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Habit Hacker prevents burnout by comparing your daily available work capacity against your total planned workload.
        </p>

        {/* Capacity Settings Slider */}
        <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>Set Daily Available Capacity</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>{capacityData.availableHours} Hours ({capacityData.availableCapacityMinutes} mins)</span>
          </div>

          <input 
            type="range" 
            min="120" 
            max="720" 
            step="30"
            value={capacityData.availableCapacityMinutes}
            onChange={(e) => onUpdateCapacity(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            <span>2 Hours</span>
            <span>4 Hours</span>
            <span>6 Hours</span>
            <span>8 Hours (Default)</span>
            <span>12 Hours</span>
          </div>
        </div>
      </div>

      {/* Workload Status Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>Workload Breakdown</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>AVAILABLE CAPACITY</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>{capacityData.availableHours}h</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>PLANNED WORKLOAD</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: isOverloaded ? '#EF4444' : '#6366F1' }}>{capacityData.plannedHours}h</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>OVERLOAD AMOUNT</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: isOverloaded ? '#EF4444' : '#10B981' }}>
              {isOverloaded ? `+${capacityData.overloadHours}h` : '0h (Safe)'}
            </div>
          </div>
        </div>

        {/* Overload Alert Warning */}
        {isOverloaded ? (
          <div className="capacity-overload-alert">
            <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>Workload Overload Detected!</h4>
              <p style={{ marginTop: '2px' }}>{capacityData.warningMessage}</p>
              
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => onRescheduleTask('t-103')}
                  style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Reschedule Low Priority Task (Save 90m)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6EE7B7', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#10B981" />
            <div>
              <strong style={{ color: '#FFF' }}>Optimal Workload Balance:</strong> Your planned work fits within your available daily capacity! You have realistic buffer time available.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
