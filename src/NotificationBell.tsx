import { useState, useRef, useEffect } from 'react';
import { useNotifications, notificationIcon, AppNotification } from './useNotifications';

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleNotifClick = (n: AppNotification) => {
    if (!n.read) markAsRead(n.id);
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Notifications"
        style={{
          background: 'rgba(108,92,231,0.12)',
          border: '1px solid rgba(108,92,231,0.3)',
          width: 36,
          height: 36,
          borderRadius: '50%',
          fontSize: 16,
          color: '#e8e8f8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#fd79a8',
            color: '#fff',
            borderRadius: '50%',
            minWidth: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid #07070f'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 46,
          right: 0,
          width: 320,
          maxWidth: '85vw',
          maxHeight: 420,
          overflowY: 'auto',
          background: '#151526',
          border: '1px solid #333',
          borderRadius: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 999
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #262638',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#151526'
          }}>
            <span style={{ fontWeight: 800, color: '#e8e8f8', fontSize: 15 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6C5CE7',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 14 }}>
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#666', fontSize: 14 }}>
              🔕 Aucune notification pour l'instant
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotifClick(n)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #1f1f33',
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(108,92,231,0.08)',
                  display: 'flex',
                  gap: 10
                }}
              >
                <div style={{ fontSize: 20, flexShrink: 0 }}>{notificationIcon(n.type)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: n.read ? 600 : 800,
                    color: '#e8e8f8',
                    fontSize: 14,
                    marginBottom: 2
                  }}>
                    {n.title}
                  </div>
                  <div style={{ color: '#9a9ab0', fontSize: 13, marginBottom: 4, lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ color: '#5a5a75', fontSize: 11 }}>
                    {timeAgo(n.created_at)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#6C5CE7',
                    flexShrink: 0,
                    marginTop: 6
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
