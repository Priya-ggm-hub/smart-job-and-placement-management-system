import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Calendar, Building2, Clock, Video, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/interviews/my');
      setInterviews(res.data || []);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading scheduled interviews...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">My Scheduled Interviews</h1>
        <p className="page-subtitle">View your upcoming evaluation rounds, meeting invitations, and offline venue allocations</p>
      </div>

      {interviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>No interview rounds scheduled yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
            When recruiters shortlist your applications, your interview schedules and meeting links will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {interviews.map((item) => (
            <div key={item.id} className="card" style={{ borderTop: '4px solid var(--primary-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                  {item.companyName}
                </span>
                <span className={`badge ${item.status === 'SCHEDULED' ? 'badge-interview' : item.status === 'COMPLETED' ? 'badge-selected' : 'badge-rejected'}`}>
                  {item.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                {item.roundName}
              </h3>
              <div style={{ fontSize: '0.825rem', color: 'var(--gray-600)', marginTop: '0.2rem' }}>
                Role: {item.jobTitle}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--gray-700)', backgroundColor: 'var(--gray-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary-600)" />
                  <span><strong>Date:</strong> {item.interviewDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--primary-600)" />
                  <span><strong>Time:</strong> {item.interviewTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.mode === 'ONLINE' ? <Video size={16} color="#9333ea" /> : <MapPin size={16} color="#059669" />}
                  <span><strong>Mode:</strong> {item.mode}</span>
                </div>
              </div>

              {item.remarks && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Note: {item.remarks}
                </div>
              )}

              {item.locationOrLink && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  {item.mode === 'ONLINE' ? (
                    <a
                      href={item.locationOrLink.startsWith('http') ? item.locationOrLink : `https://${item.locationOrLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', gap: '0.35rem' }}
                    >
                      <Video size={14} /> Join Video Meeting <ExternalLink size={12} />
                    </a>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-800)' }}>
                      📍 <strong>Venue / Room:</strong> {item.locationOrLink}
                    </div>
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

export default MyInterviews;
