import React from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationDrawer({ notifications, onClose, onClear }) {
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      width: '360px',
      maxWidth: 'calc(100vw - 40px)',
      background: '#0d221b',
      border: '1px solid var(--border-glow)',
      borderRadius: '16px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      zIndex: 1100,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
          <Bell size={18} color="#10b981" />
          <span>Platform Notifications</span>
        </div>
        
        <button onClick={onClose} style={{ background: 'transparent', color: '#94a3b8' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
            No new notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.825rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: n.type === 'emergency' ? '#f87171' : '#34d399' }}>
                <span>{n.title}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>{n.time}</span>
              </div>
              <div style={{ color: '#cbd5e1' }}>
                {n.message}
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <button
          onClick={onClear}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '0.775rem',
            fontWeight: 600,
            marginTop: '4px'
          }}
        >
          Clear All Notifications
        </button>
      )}

    </div>
  );
}
