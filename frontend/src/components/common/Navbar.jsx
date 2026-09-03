import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { User, LogOut, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Briefcase size={20} />
        </div>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.15rem',
            color: 'var(--gray-900)',
            letterSpacing: '-0.02em',
          }}
        >
          Placement<span style={{ color: 'var(--primary-600)' }}>Portal</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Student Notification Bell */}
        {isStudent && <NotificationDropdown />}

        {/* User Profile Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--gray-200)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '9999px',
              backgroundColor: isAdmin ? 'var(--primary-100)' : 'var(--success-50)',
              color: isAdmin ? 'var(--primary-700)' : 'var(--success-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.1 }}>
              {user?.fullName || user?.email}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {isAdmin ? 'Placement Admin' : 'Student'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          style={{ color: 'var(--danger-600)', borderColor: 'var(--gray-200)' }}
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
