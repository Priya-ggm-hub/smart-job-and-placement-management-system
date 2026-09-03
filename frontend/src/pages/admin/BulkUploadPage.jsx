import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const BulkUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setErrorMsg('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await axiosClient.post('/admin/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Bulk upload failed. Please verify file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosClient.get('/admin/students/sample-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_bulk_upload_sample.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download template:', err);
      setErrorMsg('Failed to download sample template.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Bulk Student Onboarding</h1>
          <p className="page-subtitle">Upload batches of students via Excel (.xlsx) or CSV with automated validation and error reports</p>
        </div>

        <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
          <Download size={16} /> Download Sample Template (.xlsx)
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleUpload}>
          <div
            style={{
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--gray-50)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <UploadCloud size={48} color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Choose Excel (.xlsx) or CSV (.csv) File
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Columns required: Name, Email, Phone, Department, Degree, GraduationYear, CGPA, Skills
            </p>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ marginTop: '1.25rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
              {uploading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#ffffff' }}></div>
                  <span>Processing & Validating Rows...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  <span>Start Bulk Student Import</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Report */}
      {result && (
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            Bulk Import Summary
          </h2>

          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Rows</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.2rem' }}>{result.totalRows}</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--success-50)', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success-700)' }}>Successfully Added</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '0.2rem' }}>{result.successCount}</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: result.failureCount > 0 ? 'var(--danger-50)' : 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: result.failureCount > 0 ? '1px solid #fecaca' : '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: result.failureCount > 0 ? 'var(--danger-600)' : 'var(--text-muted)' }}>Failed / Skipped Rows</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: result.failureCount > 0 ? 'var(--danger-600)' : 'var(--gray-900)', marginTop: '0.2rem' }}>{result.failureCount}</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <XCircle size={16} /> Skipped Rows & Validation Issues ({result.errors.length})
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Row #</th>
                      <th>Identifier / Email</th>
                      <th>Validation Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>Row {err.rowNumber}</td>
                        <td style={{ color: 'var(--gray-700)' }}>{err.email || 'N/A'}</td>
                        <td style={{ color: 'var(--danger-600)', fontWeight: 500 }}>{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--success-50)', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> All student rows processed and created with initial password 'Student@123'.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUploadPage;
