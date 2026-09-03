import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { Layers, Plus, Edit2, Trash2, Calendar, DollarSign, Search, CheckCircle, AlertCircle, X } from 'lucide-react';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    minCgpa: '7.00',
    eligibleDepartment: 'ALL',
    graduationYear: 2025,
    location: 'Bangalore, India',
    employmentType: 'Full-time',
    salaryPackage: '10.0 LPA',
    deadline: '',
    status: 'OPEN',
  });

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchSkills();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/jobs?size=100');
      setJobs(res.data.content || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setFeedback({ type: 'danger', text: 'Failed to load recruitment openings.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosClient.get('/companies');
      setCompanies(res.data || []);
      if (res.data && res.data.length > 0 && !formData.companyId) {
        setFormData((prev) => ({ ...prev, companyId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axiosClient.get('/students/skills');
      setAvailableSkills(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      companyId: companies.length > 0 ? companies[0].id : '',
      title: '',
      description: '',
      minCgpa: '7.00',
      eligibleDepartment: 'ALL',
      graduationYear: 2025,
      location: '',
      employmentType: 'Full-time',
      salaryPackage: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'OPEN',
    });
    setRequiredSkills(['Java', 'SQL']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setIsEditing(true);
    setCurrentId(job.id);
    setFormData({
      companyId: job.companyId || '',
      title: job.title || '',
      description: job.description || '',
      minCgpa: job.minCgpa != null ? job.minCgpa.toString() : '0.00',
      eligibleDepartment: job.eligibleDepartment || 'ALL',
      graduationYear: job.graduationYear || 2025,
      location: job.location || '',
      employmentType: job.employmentType || 'Full-time',
      salaryPackage: job.salaryPackage || '',
      deadline: job.deadline || '',
      status: job.status || 'OPEN',
    });
    setRequiredSkills(Array.from(job.requiredSkills || []));
    setIsModalOpen(true);
  };

  const handleAddSkill = (skillName) => {
    const target = (skillName || skillInput).trim();
    if (target && !requiredSkills.includes(target)) {
      setRequiredSkills((prev) => [...prev, target]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        companyId: parseInt(formData.companyId, 10),
        minCgpa: parseFloat(formData.minCgpa),
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        requiredSkills,
      };

      if (isEditing) {
        await axiosClient.put(`/jobs/${currentId}`, payload);
        setFeedback({ type: 'success', text: `Job opening '${formData.title}' updated successfully.` });
      } else {
        await axiosClient.post('/jobs', payload);
        setFeedback({ type: 'success', text: `Job opening '${formData.title}' created successfully.` });
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save job opening.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete job drive '${title}'?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/jobs/${id}`);
      setFeedback({ type: 'success', text: `Job drive '${title}' deleted successfully.` });
      fetchJobs();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to delete job drive.' });
    }
  };

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.companyName && j.companyName.toLowerCase().includes(search.toLowerCase())) ||
    (j.eligibleDepartment && j.eligibleDepartment.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Campus Recruitment Openings</h1>
          <p className="page-subtitle">Configure placement job postings, eligibility parameters, required skillsets, and deadlines</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal} disabled={companies.length === 0}>
          <Plus size={16} /> Create Job Opening
        </button>
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
            placeholder="Search openings by role, company, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        </div>
      </div>

      {/* Openings Table */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading openings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Layers size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No recruitment openings found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Package & Type</th>
                <th>Eligibility Criteria</th>
                <th>Required Skills</th>
                <th>Deadline & Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                      {job.companyName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <DollarSign size={14} /> {job.salaryPackage || 'Competitive'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.employmentType}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      Min CGPA: <strong>{job.minCgpa?.toFixed(2)}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Dept: <strong>{job.eligibleDepartment}</strong> • Year: {job.graduationYear || 'All'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', maxWidth: '240px' }}>
                      {Array.from(job.requiredSkills || []).map((skill) => (
                        <span key={skill} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-800)' }}>{job.deadline}</div>
                    <span className={`badge ${job.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`} style={{ fontSize: '0.65rem' }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(job)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(job.id, job.title)} title="Delete" style={{ color: 'var(--danger-600)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Job Opening' : 'Create Campus Job Opening'} maxWidth="700px">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Recruiting Company *</label>
              <select
                className="form-control"
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.industry || 'IT'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Designation / Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Graduate Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Salary Package (e.g. 12.0 LPA) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 14.5 LPA"
                value={formData.salaryPackage}
                onChange={(e) => setFormData({ ...formData, salaryPackage: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bangalore, Hyderabad, Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Minimum CGPA Required *</label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="10.0"
                className="form-control"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligible Department *</label>
              <select
                className="form-control"
                value={formData.eligibleDepartment}
                onChange={(e) => setFormData({ ...formData, eligibleDepartment: e.target.value })}
                required
              >
                <option value="ALL">ALL Departments (Open to all)</option>
                <option value="CSE">CSE Only</option>
                <option value="IT">IT Only</option>
                <option value="ECE">ECE Only</option>
                <option value="MECH">MECH Only</option>
                <option value="CIVIL">CIVIL Only</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                className="form-control"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Drive Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="OPEN">OPEN (Accepting Applications)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Required Skills Configuration */}
          <div className="form-group">
            <label className="form-label">Required Skills (Evaluated by Eligibility & Skill Gap Engine)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type skill name..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              />
              <button type="button" className="btn btn-secondary" onClick={() => handleAddSkill()}>
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
              {requiredSkills.map((s) => (
                <span key={s} className="skill-tag">
                  {s}
                  <X size={14} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => handleRemoveSkill(s)} />
                </span>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Quick Add:</strong>{' '}
              {availableSkills
                .filter((s) => !requiredSkills.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: 'none',
                      border: '1px dashed var(--gray-300)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.15rem 0.5rem',
                      marginRight: '0.35rem',
                      fontSize: '0.725rem',
                      color: 'var(--primary-600)',
                      cursor: 'pointer',
                    }}
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description & Responsibilities</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe roles, technical stack, eligibility details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Opening' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobManagement;
