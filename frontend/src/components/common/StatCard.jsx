import React from 'react';

const StatCard = ({ icon, label, value, subtext, bgColor = 'var(--primary-50)', iconColor = 'var(--primary-600)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bgColor, color: iconColor }}>
        {icon}
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{label}</div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
