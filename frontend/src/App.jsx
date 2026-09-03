import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Public Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import JobBrowser from './pages/student/JobBrowser';
import JobDetails from './pages/student/JobDetails';
import MyApplications from './pages/student/MyApplications';
import MyInterviews from './pages/student/MyInterviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyManagement from './pages/admin/CompanyManagement';
import JobManagement from './pages/admin/JobManagement';
import StudentRegistry from './pages/admin/StudentRegistry';
import BulkUploadPage from './pages/admin/BulkUploadPage';
import ApplicationManagement from './pages/admin/ApplicationManagement';
import InterviewManagement from './pages/admin/InterviewManagement';

// Layout Wrapper for Authenticated Pages
const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main className="main-content">
            <div className="page-body">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user.role === 'ROLE_ADMIN' 
    ? <Navigate to="/admin/dashboard" replace /> 
    : <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <StudentDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <StudentProfile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/jobs"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <JobBrowser />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/jobs/:id"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <JobDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <MyApplications />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/interviews"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AppLayout>
                    <MyInterviews />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <CompanyManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <JobManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <StudentRegistry />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bulk-upload"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <BulkUploadPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <ApplicationManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/interviews"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AppLayout>
                    <InterviewManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
