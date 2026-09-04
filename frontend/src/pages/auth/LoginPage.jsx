import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, GraduationCap, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleMode, setRoleMode] = useState('student'); // 'student' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        const from = location.state?.from?.pathname || '/student/dashboard';
        navigate(from);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@placement.edu');
      setPassword('Admin@123');
      setRoleMode('admin');
    } else {
      setEmail('rahul.sharma@college.edu');
      setPassword('Password@123');
      setRoleMode('student');
    }
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 1) 90%)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
              marginBottom: '1rem',
            }}
          >
            <Briefcase size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
            Smart Placement Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Sign in to access your recruitment dashboard
          </p>
        </div>

        {/* Card Box */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Quick Demo Fill Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--gray-100)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => fillDemo('student')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: roleMode === 'student' ? '#ffffff' : 'transparent',
                color: roleMode === 'student' ? 'var(--primary-700)' : 'var(--gray-600)',
                boxShadow: roleMode === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)',
              }}
            >
              <GraduationCap size={16} /> Student Login
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: roleMode === 'admin' ? '#ffffff' : 'transparent',
                color: roleMode === 'admin' ? 'var(--primary-700)' : 'var(--gray-600)',
                boxShadow: roleMode === 'admin' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)',
              }}
            >
              <ShieldCheck size={16} /> Admin Login
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. rahul.sharma@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-400)',
                    pointerEvents: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray-400)',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gray-600)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray-400)')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#ffffff' }}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            <div>
              <strong>Quick Demo:</strong> Admin (<code>admin@placement.edu</code> / <code>Admin@123</code>)
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              Student (<code>rahul.sharma@college.edu</code> / <code>Password@123</code>)
            </div>
          </div>
        </div>

        {/* Registration Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Don't have a student account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
