import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { Building2, Plus, Edit2, Trash2, Globe, Mail, MapPin, Search, CheckCircle, AlertCircle } from 'lucide-react';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    contactEmail: '',
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/companies');
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setFeedback({ type: 'danger', text: 'Failed to load recruiting companies.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '', industry: '', location: '', website: '', contactEmail: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setIsEditing(true);
    setCurrentId(comp.id);
    setFormData({
      name: comp.name || '',
      description: comp.description || '',
      industry: comp.industry || '',
      location: comp.location || '',
      website: comp.website || '',
      contactEmail: comp.contactEmail || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      if (isEditing) {
        await axiosClient.put(`/companies/${currentId}`, formData);
        setFeedback({ type: 'success', text: `Company '${formData.name}' updated successfully.` });
      } else {
        await axiosClient.post('/companies', formData);
        setFeedback({ type: 'success', text: `Company '${formData.name}' registered successfully.` });
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save company information.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete company '${name}' and its associated job openings?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/companies/${id}`);
      setFeedback({ type: 'success', text: `Company '${name}' deleted successfully.` });
      fetchCompanies();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to delete company.' });
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Recruiting Companies</h1>
          <p className="page-subtitle">Manage registered campus hiring organizations, contact points, and profiles</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add New Company
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
            placeholder="Search companies by name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        </div>
      </div>

      {/* Companies Table */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading company directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No companies found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Website & Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((comp) => (
                <tr key={comp.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {comp.description}
                    </div>
                  </td>
                  <td>{comp.industry || 'General IT'}</td>
                  <td>{comp.location || 'India'}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {comp.website && (
                        <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Globe size={13} /> {comp.website.replace('https://', '')}
                        </a>
                      )}
                      {comp.contactEmail && (
                        <div style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <Mail size={13} /> {comp.contactEmail}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(comp)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(comp.id, comp.name)} title="Delete" style={{ color: 'var(--danger-600)' }}>
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

      {/* Add / Edit Company Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Company Profile' : 'Add New Recruiting Partner'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Google, Microsoft, Amazon"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Industry Domain</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cloud Computing, FinTech, AI"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Headquarters</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bangalore, Mumbai"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://company.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recruiter Contact Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="careers@company.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Brief overview of company business and campus hiring focus..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Company' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanyManagement;
