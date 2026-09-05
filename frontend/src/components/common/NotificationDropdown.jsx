import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, Calendar, Award } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'INTERVIEW':
        return <Calendar size={16} color="#9333ea" />;
      case 'STATUS_UPDATE':
        return <Award size={16} color="#2563eb" />;
      default:
        return <Info size={16} color="#059669" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '0.5rem',
          borderRadius: 'var(--radius-full)',
          width: '40px',
          height: '40px',
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: 'var(--danger-500)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '9999px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            width: 'min(360px, calc(100vw - 24px))',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '440px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--gray-50)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
              Notifications ({unreadCount} new)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--gray-100)',
                    backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: n.read ? 600 : 700,
                        fontSize: '0.825rem',
                        color: 'var(--gray-900)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
