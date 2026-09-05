import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { User, LogOut, Briefcase, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ mobileNavOpen, onToggleMobileNav }) => {
  const { user, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <header className="navbar-header">
      {/* Left: Hamburger (mobile) + Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={onToggleMobileNav}
          aria-label={mobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          title={mobileNavOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}
          >
            <Briefcase size={18} />
          </div>
          <span
            className="navbar-brand-text"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Placement<span style={{ color: 'var(--primary-600)' }}>Portal</span>
          </span>
        </div>
      </div>

      {/* Right: Notifications + User Chip + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Student Notification Bell */}
        {isStudent && <NotificationDropdown />}

        {/* User Profile Chip */}
        <div className="navbar-user-chip">
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
              flexShrink: 0,
            }}
          >
            <User size={15} />
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">
              {user?.fullName ? getFirstName(user.fullName) : user?.email?.split('@')[0]}
            </span>
            <span className="navbar-user-role">
              {isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-secondary btn-sm navbar-logout-btn"
          onClick={handleLogout}
          style={{ color: 'var(--danger-600)', borderColor: 'var(--gray-200)' }}
          title="Sign out of account"
        >
          <LogOut size={16} />
          <span className="navbar-logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
