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
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
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

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div style={{ padding: '1.5rem 1.25rem 0.5rem', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
        {isAdmin ? 'Administration Portal' : 'Student Portal'}
      </div>

      <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
              transition: 'var(--transition)',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
