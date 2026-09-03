import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, appsRes, interviewsRes, jobsRes] = await Promise.all([
          axiosClient.get('/students/profile'),
          axiosClient.get('/applications/my'),
          axiosClient.get('/interviews/my'),
          axiosClient.get('/jobs?size=4&status=OPEN')
        ]);

        setProfile(profileRes.data);
        setApplications(appsRes.data);
        setInterviews(interviewsRes.data);
        setJobs(jobsRes.data.content || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading student dashboard...</p>
      </div>
    );
  }

  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const selectedCount = applications.filter(a => a.status === 'SELECTED').length;
  const upcomingInterviews = interviews.filter(i => i.status === 'SCHEDULED');
  const eligibleJobsCount = jobs.filter(j => j.isEligible).length;

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          color: '#ffffff',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Academic Session 2025-2026
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
            Welcome back, {profile?.fullName || user?.fullName || 'Student'}! 👋
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '600px' }}>
            {profile?.department} • {profile?.degree} • Class of {profile?.graduationYear} • CGPA: {profile?.cgpa?.toFixed(2)}
          </p>
        </div>

        {!profile?.resumePath && (
          <Link
            to="/student/profile"
            className="btn"
            style={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={16} /> Upload Resume PDF
          </Link>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid-4">
        <StatCard
          icon={<Briefcase size={22} />}
          value={jobs.length}
          label="Active Campus Drives"
          subtext={`${eligibleJobsCount} currently eligible`}
          bgColor="var(--primary-50)"
          iconColor="var(--primary-600)"
        />
        <StatCard
          icon={<FileText size={22} />}
          value={applications.length}
          label="Applications Submitted"
          subtext="Total job applications"
          bgColor="#f0fdf4"
          iconColor="var(--success-600)"
        />
        <StatCard
          icon={<Award size={22} />}
          value={shortlistedCount + selectedCount}
          label="Shortlisted / Offers"
          subtext={`${selectedCount} confirmed offer(s)`}
          bgColor="#eff6ff"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<Calendar size={22} />}
          value={upcomingInterviews.length}
          label="Upcoming Interviews"
          subtext="Scheduled interview rounds"
          bgColor="#fdf4ff"
          iconColor="#a21caf"
        />
      </div>

      <div className="grid-2">
        {/* Upcoming Scheduled Interviews */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Upcoming Interviews
            </h2>
            <Link to="/student/interviews" style={{ color: 'var(--primary-600)', fontSize: '0.825rem', fontWeight: 600 }}>
              View All ({interviews.length})
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>No upcoming interviews scheduled at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {upcomingInterviews.slice(0, 3).map((interview) => (
                <div
                  key={interview.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#fafbfc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--gray-900)' }}>
                      {interview.companyName}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                      {interview.roundName} ({interview.mode})
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      📅 {interview.interviewDate} at {interview.interviewTime}
                    </div>
                  </div>

                  {interview.locationOrLink && (
                    <a
                      href={interview.locationOrLink.startsWith('http') ? interview.locationOrLink : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {interview.mode === 'ONLINE' ? 'Join Call' : 'View Venue'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured / Eligible Campus Job Openings */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Recent Job Openings
            </h2>
            <Link to="/student/jobs" style={{ color: 'var(--primary-600)', fontSize: '0.825rem', fontWeight: 600 }}>
              Explore All Jobs
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--gray-900)' }}>
                      {job.title}
                    </span>
                    {job.isEligible ? (
                      <span className="badge badge-selected" style={{ fontSize: '0.65rem' }}>Eligible</span>
                    ) : (
                      <span className="badge badge-rejected" style={{ fontSize: '0.65rem' }}>Skill Gap</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {job.companyName} • {job.salaryPackage || 'Competitive'} • {job.location || 'Pan India'}
                  </div>
                </div>

                <Link to={`/student/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                  Details <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
