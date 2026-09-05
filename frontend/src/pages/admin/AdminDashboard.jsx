import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  CheckCircle,
  Calendar,
  Award,
  Download,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [companyPackages, setCompanyPackages] = useState([]);
  const [funnelStats, setFunnelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, deptRes, pkgRes, funnelRes] = await Promise.all([
        axiosClient.get('/admin/analytics/summary'),
        axiosClient.get('/admin/analytics/department-stats'),
        axiosClient.get('/admin/analytics/company-packages'),
        axiosClient.get('/admin/analytics/funnel')
      ]);

      setSummary(summaryRes.data);
      setDeptStats(deptRes.data || []);
      setCompanyPackages(pkgRes.data || []);
      setFunnelStats(funnelRes.data || []);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const res = await axiosClient.get('/admin/analytics/export-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'campus_placement_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Aggregating placement analytics & charts...</p>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div>
      {/* Header with Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Placement Analytics & BI Dashboard</h1>
          <p className="page-subtitle">Real-time placement rate, departmental metrics, salary packages, and application funnel</p>
        </div>

        <button className="btn btn-primary" onClick={handleExportCsv} disabled={exportingCsv}>
          <Download size={16} />
          <span>{exportingCsv ? 'Generating CSV...' : 'Export Placement Report (CSV)'}</span>
        </button>
      </div>

      {/* Primary KPI Counters */}
      <div className="grid-4">
        <StatCard
          icon={<Users size={22} />}
          value={summary?.totalStudents || 0}
          label="Registered Students"
          subtext="Total candidate pool"
          bgColor="var(--primary-50)"
          iconColor="var(--primary-600)"
        />
        <StatCard
          icon={<Building2 size={22} />}
          value={summary?.totalCompanies || 0}
          label="Recruiting Companies"
          subtext="Active corporate partners"
          bgColor="#eff6ff"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<Briefcase size={22} />}
          value={summary?.totalJobs || 0}
          label="Recruitment Drives"
          subtext="Campus job openings"
          bgColor="#fdf4ff"
          iconColor="#a21caf"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          value={`${summary?.overallPlacementRate || 0}%`}
          label="Overall Placement Rate"
          subtext={`${summary?.selectedCount || 0} confirmed job offers`}
          bgColor="#ecfdf5"
          iconColor="var(--success-600)"
        />
      </div>

      {/* Secondary Workflow Counters */}
      <div className="grid-4" style={{ marginTop: '-0.5rem', marginBottom: '1.75rem' }}>
        <StatCard
          icon={<ClipboardList size={20} />}
          value={summary?.totalApplications || 0}
          label="Total Applications"
          bgColor="var(--gray-100)"
          iconColor="var(--gray-700)"
        />
        <StatCard
          icon={<Award size={20} />}
          value={summary?.shortlistedCount || 0}
          label="Shortlisted Candidates"
          bgColor="#eff6ff"
          iconColor="#3b82f6"
        />
        <StatCard
          icon={<Calendar size={20} />}
          value={summary?.upcomingInterviewsCount || 0}
          label="Upcoming Interviews"
          bgColor="#fef3c7"
          iconColor="#d97706"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          value={summary?.selectedCount || 0}
          label="Selected Offers"
          bgColor="#d1fae5"
          iconColor="#059669"
        />
      </div>

      {/* Charts Section */}
      <div className="grid-2">
        {/* Chart 1: Placement % by Department */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--primary-600)" /> Placement % by Department
            </h2>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis unit="%" domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Placement Rate']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="placementPercentage" radius={[6, 6, 0, 0]}>
                  {deptStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Salary Package by Company */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--success-600)" /> Average Package Offered (LPA)
            </h2>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyPackages} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" unit=" LPA" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="companyName" stroke="#64748b" fontSize={12} tickLine={false} width={100} />
                <Tooltip
                  formatter={(value) => [`${value} LPA`, 'Average Salary']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="averagePackageLPA" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Application Funnel Table & Cards */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--primary-600)" /> Application Funnel Progression
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem' }}>
          {funnelStats.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {item.stage}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.35rem' }}>
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
