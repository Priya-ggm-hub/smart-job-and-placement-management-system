import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Search, Briefcase, MapPin, DollarSign, Calendar, Filter, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobBrowser = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    department: '',
    employmentType: '',
    status: 'OPEN',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.department) params.append('department', filters.department);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);
      if (filters.status) params.append('status', filters.status);
      params.append('size', '50');

      const res = await axiosClient.get(`/jobs?${params.toString()}`);
      setJobs(res.data.content || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Browse Campus Drives & Openings</h1>
        <p className="page-subtitle">Discover opportunities, verify your eligibility criteria, and apply directly</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> Search Roles or Companies
            </label>
            <input
              type="text"
              name="query"
              className="form-control"
              placeholder="e.g. Java, TechCorp, Backend..."
              value={filters.query}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Eligible Department</label>
            <select name="department" className="form-control" value={filters.department} onChange={handleFilterChange}>
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Employment Type</label>
            <select name="employmentType" className="form-control" value={filters.employmentType} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Drive Status</label>
            <select name="status" className="form-control" value={filters.status} onChange={handleFilterChange}>
              <option value="OPEN">Open for Applications</option>
              <option value="CLOSED">Closed Drives</option>
              <option value="">All Drives</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Filtering openings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>No recruitment openings matched your criteria</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try clearing filters or search with different keywords.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {job.companyName}
                  </span>
                  {job.hasApplied ? (
                    <span className="badge badge-applied">Applied ({job.applicationStatus})</span>
                  ) : job.isEligible ? (
                    <span className="badge badge-selected" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} /> Eligible
                    </span>
                  ) : (
                    <span className="badge badge-rejected" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={12} /> Skill Gap
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  {job.title}
                </h3>

                <p style={{ fontSize: '0.825rem', color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description || 'Join this exciting recruitment opportunity at ' + job.companyName}
                </p>

                {/* Details Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.775rem', color: 'var(--gray-700)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} color="var(--success-600)" />
                    <strong>{job.salaryPackage || 'Competitive'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--gray-500)" />
                    <span>{job.location || 'Flexible'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--primary-600)" />
                    <span>Deadline: {job.deadline}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Required Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {Array.from(job.requiredSkills || []).map((skill) => (
                      <span key={skill} className="skill-tag" style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Min CGPA: <strong>{job.minCgpa?.toFixed(2)}</strong> ({job.eligibleDepartment})
                </span>
                <Link to={`/student/jobs/${job.id}`} className="btn btn-primary btn-sm">
                  View & Check Eligibility <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBrowser;
