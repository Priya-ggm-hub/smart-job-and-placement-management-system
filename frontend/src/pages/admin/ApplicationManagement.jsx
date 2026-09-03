import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { ClipboardList, Filter, Search, Calendar, Edit3, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterJobId, setFilterJobId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Schedule Interview Modal State
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviewDate: '',
    interviewTime: '11:00',
    mode: 'ONLINE',
    locationOrLink: 'https://meet.google.com/abc-placement',
    roundName: 'Technical Round 1',
    remarks: '',
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [filterJobId, filterStatus, search]);

  const fetchJobs = async () => {
    try {
      const res = await axiosClient.get('/jobs?size=100');
      setJobs(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterJobId) params.append('jobId', filterJobId);
      if (filterStatus) params.append('status', filterStatus);
      if (search) params.append('query', search);
      params.append('size', '50');

      const res = await axiosClient.get(`/applications?${params.toString()}`);
      setApplications(res.data.content || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const res = await axiosClient.get(`/students/resume/${studentId}`, {
        responseType: 'blob',
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Failed to download student resume:', err);
      alert('Failed to retrieve student resume PDF.');
    }
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusRemarks(app.remarks || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await axiosClient.put(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        remarks: statusRemarks,
      });
      setFeedback({ type: 'success', text: `Application status updated to ${newStatus}. Student notified.` });
      setStatusModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to update application status.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenInterviewModal = (app) => {
    setSelectedApp(app);
    setInterviewData({
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewTime: '11:00',
      mode: 'ONLINE',
      locationOrLink: 'https://meet.google.com/drive-' + Math.random().toString(36).substring(7),
      roundName: 'Technical Round 1',
      remarks: 'Please prepare DSA, OOP concepts, and project walkthrough.',
    });
    setInterviewModalOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await axiosClient.post('/interviews', {
        applicationId: selectedApp.id,
        ...interviewData,
      });
      setFeedback({ type: 'success', text: `Interview scheduled for ${selectedApp.studentName}. Invitation sent.` });
      setInterviewModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to schedule interview.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED': return <span className="badge badge-shortlisted">Shortlisted</span>;
      case 'INTERVIEW_SCHEDULED': return <span className="badge badge-interview">Interview</span>;
      case 'SELECTED': return <span className="badge badge-selected">Selected</span>;
      case 'REJECTED': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge badge-applied">Applied</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Candidate Applications & Status Workflow</h1>
        <p className="page-subtitle">Review applicant profiles, shortlist candidates, trigger notifications, and schedule interview rounds</p>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{feedback.text}</div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> Search Student Name / Email
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Rahul, ananya@..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Job Opening</label>
            <select className="form-control" value={filterJobId} onChange={(e) => setFilterJobId(e.target.value)}>
              <option value="">All Job Drives</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.companyName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Application Status</label>
            <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="APPLIED">APPLIED</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
              <option value="SELECTED">SELECTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Filtering candidate applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No applications found for selected filters</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Target Drive & Company</th>
                <th>Academic Stats</th>
                <th>Resume</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{app.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.studentEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{app.jobTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600 }}>{app.companyName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      CGPA: <strong>{app.studentCgpa?.toFixed(2)}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.studentDepartment} ({app.studentDegree})</div>
                  </td>
                  <td>
                    {app.studentResumePath ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(app.studentId, app.studentName)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.725rem', gap: '0.25rem' }}
                      >
                        <Download size={12} /> PDF
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No File</span>
                    )}
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenStatusModal(app)} title="Change Status">
                        <Edit3 size={14} /> Status
                      </button>

                      {(app.status === 'SHORTLISTED' || app.status === 'APPLIED') && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenInterviewModal(app)} title="Schedule Interview">
                          <Calendar size={14} /> Schedule
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

      {/* Change Application Status Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Application Status">
        {selectedApp && (
          <form onSubmit={handleUpdateStatus}>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Updating application for <strong>{selectedApp.studentName}</strong> ({selectedApp.jobTitle} at {selectedApp.companyName})
            </div>

            <div className="form-group">
              <label className="form-label">New Status *</label>
              <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                <option value="APPLIED">APPLIED</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                <option value="SELECTED">SELECTED (Offer Released)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recruiter Remarks / Feedback (Sent in Notification)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Excellent technical performance, shortlisted for HR round..."
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Save & Dispatch Alert'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={interviewModalOpen} onClose={() => setInterviewModalOpen(false)} title="Schedule Interview Round">
        {selectedApp && (
          <form onSubmit={handleScheduleInterview}>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Candidate: <strong>{selectedApp.studentName}</strong> | {selectedApp.jobTitle} ({selectedApp.companyName})
            </div>

            <div className="form-group">
              <label className="form-label">Round Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Technical Round 1, System Design, HR"
                value={interviewData.roundName}
                onChange={(e) => setInterviewData({ ...interviewData, roundName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interview Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={interviewData.interviewDate}
                  onChange={(e) => setInterviewData({ ...interviewData, interviewDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interview Time *</label>
                <input
                  type="time"
                  className="form-control"
                  value={interviewData.interviewTime}
                  onChange={(e) => setInterviewData({ ...interviewData, interviewTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interview Mode *</label>
                <select
                  className="form-control"
                  value={interviewData.mode}
                  onChange={(e) => setInterviewData({ ...interviewData, mode: e.target.value })}
                >
                  <option value="ONLINE">ONLINE (Google Meet / Teams)</option>
                  <option value="OFFLINE">OFFLINE (Campus Venue)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Meeting URL or Campus Room *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://meet.google.com/xxx or Room 302"
                  value={interviewData.locationOrLink}
                  onChange={(e) => setInterviewData({ ...interviewData, locationOrLink: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instructions for Candidate</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Any special guidelines or tools required..."
                value={interviewData.remarks}
                onChange={(e) => setInterviewData({ ...interviewData, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setInterviewModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Send Interview Invitation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationManagement;
