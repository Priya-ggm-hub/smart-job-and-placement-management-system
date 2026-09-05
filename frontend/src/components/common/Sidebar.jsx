import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  Calendar,
  Building2,
  Users,
  UploadCloud,
  Layers,
  ClipboardList,
  X,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ mobileNavOpen, onCloseMobileNav }) => {
  const { isStudent, isAdmin } = useAuth();

  const studentNavItems = [
    { to: '/student/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/student/profile', icon: <User size={18} />, label: 'My Profile & Resume' },
    { to: '/student/jobs', icon: <Search size={18} />, label: 'Browse Jobs' },
    { to: '/student/applications', icon: <FileText size={18} />, label: 'My Applications' },
    { to: '/student/interviews', icon: <Calendar size={18} />, label: 'My Interviews' },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Analytics & KPIs' },
    { to: '/admin/students', icon: <Users size={18} />, label: 'Student Directory' },
    { to: '/admin/bulk-upload', icon: <UploadCloud size={18} />, label: 'Bulk Student Upload' },
    { to: '/admin/companies', icon: <Building2 size={18} />, label: 'Companies' },
    { to: '/admin/jobs', icon: <Layers size={18} />, label: 'Job Openings' },
    { to: '/admin/applications', icon: <ClipboardList size={18} />, label: 'Applications' },
    { to: '/admin/interviews', icon: <Calendar size={18} />, label: 'Interviews' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const handleNavClick = () => {
    if (onCloseMobileNav) {
      onCloseMobileNav();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobileNav} 
          aria-hidden="true" 
        />
      )}

      <aside className={`app-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        {/* Mobile Header with close button */}
        <div className="sidebar-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Briefcase size={16} />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#ffffff',
              }}
            >
              Placement<span style={{ color: 'var(--primary-500)' }}>Portal</span>
            </span>
          </div>

          <button
            onClick={onCloseMobileNav}
            className="sidebar-close-btn"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Label */}
        <div className="sidebar-section-label">
          {isAdmin ? 'Administration Portal' : 'Student Portal'}
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
