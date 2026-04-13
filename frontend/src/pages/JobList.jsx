import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs } from '../api/services';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllJobs()
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🧑‍💼 Open Positions</h1>
        <p>{jobs.length} job{jobs.length !== 1 ? 's' : ''} available — find your next opportunity</p>
      </div>

      <input
        className="search-bar"
        placeholder="🔍  Search by title, company, or location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <div className="alert alert-info">No jobs match your search.</div>
      )}

      {filtered.map((job) => (
        <div className="card" key={job.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job.title}</h3>
              <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '0.88rem' }}>
                🏢 {job.company} &nbsp;|&nbsp; 📍 {job.location}
              </p>
              {job.salary_min && (
                <p style={{ color: '#22c55e', fontSize: '0.82rem', marginTop: 4 }}>
                  💰 ₹{Number(job.salary_min).toLocaleString()} – ₹{Number(job.salary_max).toLocaleString()} / yr
                </p>
              )}
            </div>
            <span className="badge badge-green">{job.status}</span>
          </div>

          <p style={{ marginTop: 12, color: '#475569', fontSize: '0.88rem', lineHeight: 1.65 }}>
            {job.description.slice(0, 200)}…
          </p>

          <div className="skills-list" style={{ marginTop: 10 }}>
            {job.skills_required.split(',').slice(0, 6).map((s) => (
              <span className="skill-chip" key={s}>{s.trim()}</span>
            ))}
            {job.skills_required.split(',').length > 6 && (
              <span className="skill-chip" style={{ background: '#f1f5f9', color: '#64748b' }}>
                +{job.skills_required.split(',').length - 6} more
              </span>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
              View & Apply →
            </Link>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {job.application_count} applicant{job.application_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
