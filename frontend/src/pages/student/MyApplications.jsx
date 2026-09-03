import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { FileText, Building2, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/applications/my');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="badge badge-shortlisted">Shortlisted</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className="badge badge-interview">Interview Scheduled</span>;
      case 'SELECTED':
        return <span className="badge badge-selected">Selected (Offer)</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Not Selected</span>;
      default:
        return <span className="badge badge-applied">Applied</span>;
    }
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading application history...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Job Applications</h1>
          <p className="page-subtitle">Track real-time recruitment progress, interview invites, and placement offers</p>
        </div>
        <Link to="/student/jobs" className="btn btn-primary btn-sm">
          Browse More Jobs <ArrowRight size={14} />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>No applications submitted yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Explore available campus drives and apply to positions matching your skillset.
          </p>
          <Link to="/student/jobs" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Explore Open Drives
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                      {app.companyName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Applied on: {new Date(app.applicationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                    {app.jobTitle}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--gray-600)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <DollarSign size={14} color="var(--success-600)" /> {app.salaryPackage || 'Competitive'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> {app.location || 'Pan India'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Status Remarks Banner */}
              {app.remarks && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--gray-50)',
                    borderLeft: '3px solid var(--primary-500)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    color: 'var(--gray-700)',
                  }}
                >
                  <strong>Recruiter Note:</strong> {app.remarks}
                </div>
              )}

              {/* Scheduled Interview Banner if any */}
              {app.interviewId && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#fdf4ff',
                    border: '1px solid #f0abfc',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#86198f' }}>
                      🎯 Scheduled: {app.interviewRound} ({app.interviewMode})
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--gray-700)', marginTop: '0.2rem' }}>
                      Date: {app.interviewDate} at {app.interviewTime}
                    </div>
                  </div>

                  {app.interviewLocationOrLink && (
                    <a
                      href={app.interviewLocationOrLink.startsWith('http') ? app.interviewLocationOrLink : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {app.interviewMode === 'ONLINE' ? 'Open Meeting Link' : 'View Venue Details'}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
