import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { Calendar, Clock, Video, MapPin, Edit2, XCircle, Search, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Rescheduling / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    interviewDate: '',
    interviewTime: '',
    mode: 'ONLINE',
    locationOrLink: '',
    roundName: '',
    status: 'SCHEDULED',
    remarks: '',
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/interviews');
      setInterviews(res.data || []);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setFeedback({ type: 'danger', text: 'Failed to load interviews.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (interview) => {
    setCurrentId(interview.id);
    setFormData({
      interviewDate: interview.interviewDate || '',
      interviewTime: interview.interviewTime || '',
      mode: interview.mode || 'ONLINE',
      locationOrLink: interview.locationOrLink || '',
      roundName: interview.roundName || '',
      status: interview.status || 'SCHEDULED',
      remarks: interview.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await axiosClient.put(`/interviews/${currentId}`, formData);
      setFeedback({ type: 'success', text: 'Interview schedule updated and notification dispatched to student.' });
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to update interview details.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInterview = async (id, candidateName, round) => {
    if (!window.confirm(`Are you sure you want to CANCEL '${round}' for ${candidateName}?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/interviews/${id}`);
      setFeedback({ type: 'success', text: `Interview cancelled. Cancellation notice dispatched.` });
      fetchInterviews();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to cancel interview.' });
    }
  };

  const filtered = interviews.filter((i) =>
    (i.studentName && i.studentName.toLowerCase().includes(search.toLowerCase())) ||
    (i.companyName && i.companyName.toLowerCase().includes(search.toLowerCase())) ||
    (i.roundName && i.roundName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Campus Interview Schedules & Rounds</h1>
        <p className="page-subtitle">Oversee candidate interview schedules, video conference links, venue allocations, and cancellations</p>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{feedback.text}</div>
        </div>
      )}

      {/* Search Header */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by student candidate, company, or round title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        </div>
      </div>

      {/* Interviews Table */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading scheduled interviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No interviews match your search criteria</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Company & Drive</th>
                <th>Round Name</th>
                <th>Date & Time</th>
                <th>Mode / Venue</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.studentEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.companyName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.jobTitle}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{item.roundName}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.interviewDate}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.interviewTime}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      {item.mode === 'ONLINE' ? <Video size={14} color="#9333ea" /> : <MapPin size={14} color="#059669" />}
                      <span>{item.mode}</span>
                    </div>
                    {item.mode === 'ONLINE' && item.locationOrLink && (
                      <a
                        href={item.locationOrLink.startsWith('http') ? item.locationOrLink : `https://${item.locationOrLink}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.725rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}
                      >
                        Meeting Link <ExternalLink size={10} />
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'SCHEDULED' ? 'badge-interview' : item.status === 'COMPLETED' ? 'badge-selected' : 'badge-rejected'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(item)} title="Reschedule / Edit">
                        <Edit2 size={13} />
                      </button>
                      {item.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCancelInterview(item.id, item.studentName, item.roundName)}
                          title="Cancel Interview"
                          style={{ color: 'var(--danger-600)' }}
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reschedule or Update Interview Round">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Round Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.roundName}
              onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Interview Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interview Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.interviewTime}
                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mode *</label>
              <select className="form-control" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })}>
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting URL or Campus Location *</label>
            <input
              type="text"
              className="form-control"
              value={formData.locationOrLink}
              onChange={(e) => setFormData({ ...formData, locationOrLink: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions / Remarks</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update & Notify Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InterviewManagement;
