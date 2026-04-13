import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, deleteJob } from '../api/services';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getMyJobs()
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? All applications will also be removed.')) return;
    setDeleting(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      alert('Failed to delete job.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="spinner" />;

  const totalApps = jobs.reduce((s, j) => s + (j.application_count || 0), 0);
  const openJobs  = jobs.filter((j) => j.status === 'open').length;

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>🏢 Recruiter Dashboard</h1>
          <p>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted &nbsp;·&nbsp; {totalApps} total applications</p>
        </div>
        <Link to="/jobs/create" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: '#3b82f6' }}>{jobs.length}</div>
          <div className="stat-label">Jobs Posted</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: '#22c55e' }}>{totalApps}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{openJobs}</div>
          <div className="stat-label">Open Positions</div>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="alert alert-info">
          You haven't posted any jobs yet.{' '}
          <Link to="/jobs/create">Post your first job →</Link>
        </div>
      )}

      {jobs.map((job) => (
        <div className="card" key={job.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontWeight: 700 }}>{job.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
                📍 {job.location} &nbsp;|&nbsp; 🕒 {new Date(job.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
              {job.status}
            </span>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to={`/dashboard/applicants/${job.id}`} className="btn btn-primary btn-sm">
              👥 Applicants ({job.application_count})
            </Link>
            <Link to={`/jobs/${job.id}/edit`} className="btn btn-outline btn-sm">
              ✏️ Edit
            </Link>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(job.id)}
              disabled={deleting === job.id}
            >
              {deleting === job.id ? '…' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
