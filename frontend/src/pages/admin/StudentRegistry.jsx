import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import { Users, Search, Download, Eye, FileCheck, X, FileText } from 'lucide-react';

const StudentRegistry = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State for Viewing Student Detail
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [search, page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/students?query=${encodeURIComponent(search)}&page=${page}&size=15`);
      setStudents(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const res = await axiosClient.get(`/students/resume/${studentId}`, {
        responseType: 'blob',
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Failed to download student resume:', err);
      alert('Failed to retrieve student resume PDF. Please check server status.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Student Directory & Academic Profiles</h1>
          <p className="page-subtitle">Search candidate records, review academic CGPA scores, skills, and download uploaded resumes</p>
        </div>
      </div>

      {/* Search Header */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by student name, department (e.g. CSE), or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <h3>No students matched your search criteria</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department & Degree</th>
                <th>Batch</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Resume</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{student.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{student.department}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.degree}</div>
                  </td>
                  <td>{student.graduationYear}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                      {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', maxWidth: '200px' }}>
                      {Array.from(student.skills || []).slice(0, 3).map((skill) => (
                        <span key={skill} className="skill-tag" style={{ fontSize: '0.675rem', padding: '0.1rem 0.35rem' }}>
                          {skill}
                        </span>
                      ))}
                      {student.skills && student.skills.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{student.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {student.resumePath ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(student.id, student.fullName)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.725rem', gap: '0.25rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Download size={13} /> PDF
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Resume</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewStudent(student)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Student Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Student Profile & Academic Record" maxWidth="600px">
        {selectedStudent && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                {selectedStudent.fullName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>{selectedStudent.fullName}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedStudent.email} • {selectedStudent.phone || 'No phone'}</div>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department & Degree</div>
                <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{selectedStudent.department} ({selectedStudent.degree})</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic CGPA & Batch</div>
                <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{selectedStudent.cgpa?.toFixed(2)} • Class of {selectedStudent.graduationYear}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                Student Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {Array.from(selectedStudent.skills || []).map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {selectedStudent.resumePath && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--success-50)', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="var(--success-700)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success-700)' }}>
                    Student Resume Available (PDF)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadResume(selectedStudent.id, selectedStudent.fullName)}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentRegistry;
