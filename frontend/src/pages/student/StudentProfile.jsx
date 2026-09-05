import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  User,
  UploadCloud,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Save,
  Lock,
  Plus,
  X,
  Download,
  ExternalLink
} from 'lucide-react';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    department: 'CSE',
    degree: 'B.Tech',
    graduationYear: 2025,
    cgpa: '8.00',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);

  // Resume Upload & View State
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [viewingResume, setViewingResume] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Notifications & State
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/students/profile');
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        dateOfBirth: res.data.dateOfBirth || '',
        department: res.data.department || 'CSE',
        degree: res.data.degree || 'B.Tech',
        graduationYear: res.data.graduationYear || 2025,
        cgpa: res.data.cgpa != null ? res.data.cgpa.toString() : '8.00',
      });
      setSkills(Array.from(res.data.skills || []));
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'danger', text: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const res = await axiosClient.get('/students/skills');
      setAvailableSkills(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (skillToAdd) => {
    const target = (skillToAdd || skillInput).trim();
    if (target && !skills.includes(target)) {
      setSkills((prev) => [...prev, target]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setSavingProfile(true);

    try {
      const payload = {
        ...formData,
        graduationYear: parseInt(formData.graduationYear, 10),
        cgpa: parseFloat(formData.cgpa),
        skills,
      };

      const res = await axiosClient.put('/students/profile', payload);
      setProfile(res.data);
      setStatusMessage({ type: 'success', text: 'Student profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Error updating profile. Please check inputs.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
      setStatusMessage({ type: 'danger', text: 'Only PDF documents are supported for resume upload.' });
      return;
    }

    if (resumeFile.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'danger', text: 'File size exceeds maximum 2MB limit.' });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', resumeFile);

    setUploadingResume(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/students/resume', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setResumeFile(null);
      setStatusMessage({ type: 'success', text: 'Resume PDF uploaded successfully!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to upload resume PDF.',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleViewResume = async () => {
    setViewingResume(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await axiosClient.get('/students/resume', {
        responseType: 'blob',
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Failed to view resume:', err);
      setStatusMessage({
        type: 'danger',
        text: 'Failed to retrieve resume PDF. Please ensure you are logged in and have uploaded a resume.',
      });
    } finally {
      setViewingResume(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: 'danger', text: 'New password and confirm password do not match.' });
      return;
    }

    setChangingPassword(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await axiosClient.put('/students/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMessage({ type: 'success', text: 'Password has been updated successfully.' });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to change password. Check current password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading student profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">My Profile & Resume</h1>
        <p className="page-subtitle">Manage your personal details, academic scores, skills, and resume PDF</p>
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      <div className="grid-2">
        {/* Left Column: Profile Information Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary-600)" /> Personal & Academic Information
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input type="text" className="form-control" value={profile?.email || ''} disabled style={{ backgroundColor: 'var(--gray-100)' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select name="department" className="form-control" value={formData.department} onChange={handleInputChange} required>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Degree *</label>
                <input type="text" name="degree" className="form-control" value={formData.degree} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Graduation Year *</label>
                <input type="number" name="graduationYear" className="form-control" value={formData.graduationYear} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Current CGPA (0.0 - 10.0) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  name="cgpa"
                  className="form-control"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Technical Skills */}
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Technical Skills (Used for job eligibility & gap analysis)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add skill (e.g. React, Spring Boot, AWS, Docker)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                />
                <button type="button" className="btn btn-secondary" onClick={() => handleAddSkill()}>
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Tag Cloud */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minHeight: '36px' }}>
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <X size={14} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => handleRemoveSkill(skill)} />
                  </span>
                ))}
              </div>

              {/* Suggested Skills */}
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Suggestions:</strong>{' '}
                {availableSkills
                  .filter((s) => !skills.includes(s))
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#ffffff' }}></div>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Resume Management & Password Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Resume Upload Box */}
          <div className="card">
            <div className="card-header">
              <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={20} color="var(--accent-600)" /> PDF Resume Storage
              </h2>
            </div>

            {profile?.resumePath ? (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--success-50)',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileCheck size={32} color="var(--success-600)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--success-700)' }}>
                      Resume Uploaded & Active
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--gray-600)' }}>
                      Accessible by campus recruiters during drive shortlisting
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleViewResume}
                  disabled={viewingResume}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Download size={14} /> {viewingResume ? 'Opening PDF...' : 'View PDF'}
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--warning-50)',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--warning-600)',
                }}
              >
                ⚠️ You have not uploaded a resume yet. Uploading a PDF resume is recommended before applying to company openings.
              </div>
            )}

            <form onSubmit={handleResumeUpload}>
              <div className="form-group">
                <label className="form-label">Select PDF Resume (Max 2MB)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={!resumeFile || uploadingResume}>
                {uploadingResume ? 'Uploading PDF...' : profile?.resumePath ? 'Replace Existing Resume PDF' : 'Upload Resume PDF'}
              </button>
            </form>
          </div>

          {/* Password Security Box */}
          <div className="card">
            <div className="card-header">
              <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="var(--gray-700)" /> Security & Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={changingPassword}>
                {changingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
