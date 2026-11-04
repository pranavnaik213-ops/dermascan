import React from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';

export default function NotificationDrawer({ notifications, onClose, onClear }) {
  return (
    <div 
      role="dialog"
      aria-labelledby="notification-title"
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 1100,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: 'pageFadeIn 0.25s ease-out forwards'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Bell size={16} />
          </div>
          <div>
            <h3 id="notification-title" style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
              System Alerts
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Live emergency & triage broadcasts
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {notifications.length > 0 && (
            <button 
              onClick={onClear} 
              title="Clear all notifications"
              style={{ 
                background: 'transparent', 
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
          <button 
            onClick={onClose} 
            aria-label="Close notification panel"
            style={{ 
              background: 'transparent', 
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        maxHeight: '380px', 
        overflowY: 'auto',
        paddingRight: '2px'
      }}>
        {notifications.length === 0 ? (
          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem', 
            textAlign: 'center', 
            padding: '30px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={24} color="var(--primary)" />
            <span>All caught up! No unread notifications.</span>
          </div>
        ) : (
          notifications.map((n) => {
            const isEmergency = n.type === 'emergency';
            return (
              <div 
                key={n.id} 
                style={{
                  background: isEmergency ? 'var(--emergency-bg)' : 'var(--bg-card-subtle)',
                  border: isEmergency ? '1px solid var(--emergency-border)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontWeight: 700, 
                  color: isEmergency ? 'var(--emergency)' : 'var(--text-main)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isEmergency ? <AlertTriangle size={14} /> : <Info size={14} color="var(--primary)" />}
                    <span>{n.title}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {n.time}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45, fontSize: '0.8rem' }}>
                  {n.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
