import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ArrowLeft,
  Send,
  Globe
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchJobAndEligibility();
  }, [id]);

  const fetchJobAndEligibility = async () => {
    try {
      setLoading(true);
      const [jobRes, eligibilityRes] = await Promise.all([
        axiosClient.get(`/jobs/${id}`),
        axiosClient.get(`/jobs/${id}/eligibility`)
      ]);

      setJob(jobRes.data);
      setEligibility(eligibilityRes.data);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'danger', text: 'Failed to load job details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!eligibility?.eligible) return;

    setApplying(true);
    setFeedback({ type: '', text: '' });

    try {
      await axiosClient.post('/applications', { jobId: parseInt(id, 10) });
      setFeedback({
        type: 'success',
        text: 'Congratulations! Your application has been successfully submitted to the campus placement cell.',
      });
      // Refresh eligibility to show applied status
      const eligRes = await axiosClient.get(`/jobs/${id}/eligibility`);
      setEligibility(eligRes.data);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Application submission failed. Please try again.',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Evaluating job requirements & eligibility...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Job opening not found</h3>
        <Link to="/student/jobs" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Job Browser
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/student/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Job Browser
        </Link>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type}`} style={{ marginBottom: '1.5rem' }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{feedback.text}</div>
        </div>
      )}

      {/* Hero Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>
              <Building2 size={18} /> {job.companyName}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <DollarSign size={16} color="var(--success-600)" /> <strong>{job.salaryPackage || 'Competitive Package'}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={16} /> {job.location || 'Pan India'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={16} /> {job.employmentType}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} color="var(--danger-500)" /> Deadline: <strong>{job.deadline}</strong>
              </span>
              {job.companyWebsite && (
                <a href={job.companyWebsite} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-600)' }}>
                  <Globe size={16} /> Visit Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Apply Action Button */}
          <div>
            {eligibility?.alreadyApplied ? (
              <div style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--primary-200)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> Application Submitted
              </div>
            ) : eligibility?.eligible ? (
              <button className="btn btn-primary" onClick={handleApply} disabled={applying} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                {applying ? 'Submitting Application...' : (
                  <>
                    <Send size={18} /> Apply for this Position
                  </>
                )}
              </button>
            ) : (
              <button className="btn btn-secondary" disabled title="Review skill gaps below to become eligible">
                Not Eligible to Apply
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Job Description & Criteria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="section-title">Job Overview & Responsibilities</h2>
            <div style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.description || 'No detailed description provided by the company.'}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Eligibility Criteria Set by Company</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum CGPA</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                  {job.minCgpa?.toFixed(2)} / 10.0
                </div>
              </div>

              <div style={{ padding: '0.875rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Department</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                  {job.eligibleDepartment}
                </div>
              </div>

              <div style={{ padding: '0.875rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graduation Batch</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                  {job.graduationYear ? `Class of ${job.graduationYear}` : 'All Batches'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Eligibility & Skill Gap Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Eligibility Breakdown Card */}
          <div className="card">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {eligibility?.eligible ? (
                <>
                  <CheckCircle size={20} color="var(--success-600)" />
                  <span>You Are Eligible!</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={20} color="var(--danger-600)" />
                  <span>Eligibility Evaluation</span>
                </>
              )}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>CGPA Requirement ({job.minCgpa?.toFixed(2)})</span>
                {eligibility?.cgpaSatisfied ? (
                  <span className="badge badge-selected"><CheckCircle size={12} /> Satisfied ({eligibility.studentCgpa?.toFixed(2)})</span>
                ) : (
                  <span className="badge badge-rejected"><XCircle size={12} /> Below ({eligibility.studentCgpa?.toFixed(2)})</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>Department ({job.eligibleDepartment})</span>
                {eligibility?.departmentSatisfied ? (
                  <span className="badge badge-selected"><CheckCircle size={12} /> Eligible ({eligibility.studentDepartment})</span>
                ) : (
                  <span className="badge badge-rejected"><XCircle size={12} /> Ineligible</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>Required Technical Skills</span>
                {eligibility?.skillsSatisfied ? (
                  <span className="badge badge-selected"><CheckCircle size={12} /> All Matched</span>
                ) : (
                  <span className="badge badge-rejected"><XCircle size={12} /> Skill Gap Detected</span>
                )}
              </div>
            </div>

            {/* Reasons List if Ineligible */}
            {!eligibility?.eligible && eligibility?.reasons?.length > 0 && (
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--danger-50)', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: 'var(--danger-600)' }}>
                <strong>Reasons for ineligibility:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                  {eligibility.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Skill Gap Analysis & Recommended Learning Resources */}
          <div className="card">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--primary-600)" /> Skill Gap Analysis & Learning Guide
            </h2>

            {/* Matched Skills */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success-700)', marginBottom: '0.35rem' }}>
                ✓ Matched Skills in Your Profile ({eligibility?.matchedSkills?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {eligibility?.matchedSkills?.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No required skills found in profile</span>
                ) : (
                  eligibility?.matchedSkills?.map((skill) => (
                    <span key={skill} className="skill-tag skill-tag-matched">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--danger-600)', marginBottom: '0.35rem' }}>
                ✗ Missing Skills Required for this Drive ({eligibility?.missingSkills?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {eligibility?.missingSkills?.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success-700)', fontWeight: 600 }}>
                    None! Your skillset satisfies all requirements.
                  </span>
                ) : (
                  eligibility?.missingSkills?.map((skill) => (
                    <span key={skill} className="skill-tag skill-tag-missing">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Curated Learning Resources */}
            {eligibility?.learningResources?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                  Recommended Guides & Preparation Materials:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {eligibility.learningResources.map((res, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.875rem',
                        backgroundColor: 'var(--gray-50)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginBottom: '0.25rem' }}>
                            {res.skillName}
                          </span>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                            {res.resourceTitle}
                          </div>
                          <p style={{ fontSize: '0.775rem', color: 'var(--gray-600)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                            {res.description}
                          </p>
                        </div>

                        <a
                          href={res.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.725rem', gap: '0.25rem', flexShrink: 0 }}
                        >
                          Learn <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
