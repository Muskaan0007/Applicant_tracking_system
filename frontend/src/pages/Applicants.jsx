import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobApplicants, updateAppStatus } from '../api/services';
import ScoreRing from '../components/ScoreRing';
import AgentLog from '../components/AgentLog';

const STATUS_OPTS  = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
const STATUS_BADGE = {
  pending:     'badge-yellow',
  reviewing:   'badge-blue',
  shortlisted: 'badge-green',
  rejected:    'badge-red',
  hired:       'badge-purple',
};

export default function Applicants() {
  const { jobId } = useParams();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getJobApplicants(jobId)
      .then((res) => setApps(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  const changeStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const res = await updateAppStatus(appId, status);
      setApps((prev) => prev.map((a) => (a.id === appId ? res.data : a)));
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="spinner" />;

  const jobTitle = apps[0]?.job_info?.title || 'Job';
  const avg = apps.length
    ? (apps.reduce((s, a) => s + (a.match_score || 0), 0) / apps.length).toFixed(1)
    : 'N/A';

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>👥 Applicants</h1>
            <p>
              <strong>{jobTitle}</strong> &nbsp;·&nbsp;
              {apps.length} applicant{apps.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              Avg AI Score: <strong>{avg}</strong> &nbsp;·&nbsp;
              Sorted by match score ↓
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>
      </div>

      {apps.length === 0 && (
        <div className="alert alert-info">No applications yet for this job.</div>
      )}

      {apps.map((app, idx) => (
        <div className="card" key={app.id}>

          {/* Top row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Rank medal */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.82rem',
              color: idx < 3 ? '#fff' : '#64748b',
            }}>
              #{idx + 1}
            </div>

            <ScoreRing score={app.match_score} />

            <div style={{ flex: 1, minWidth: 180 }}>
              <h3 style={{ fontWeight: 700 }}>
                {app.candidate_info?.username}
                <span style={{ fontSize: '0.78rem', fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                  {app.candidate_info?.email}
                </span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Applied {new Date(app.applied_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>

            {/* Status selector */}
            <select
              value={app.status}
              disabled={updating === app.id}
              onChange={(e) => changeStatus(app.id, e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: 8,
                border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <span className={`badge ${STATUS_BADGE[app.status] || 'badge-gray'}`}>
              {app.status}
            </span>
          </div>

          {/* AI analysis panel */}
          {app.extracted_skills && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🛠️ Extracted Skills
                  </p>
                  <div className="skills-list">
                    {app.extracted_skills.split(',').map((s) => (
                      <span className="skill-chip" key={s}>{s.trim()}</span>
                    ))}
                  </div>
                </div>

                {app.experience_summary && (
                  <div style={{ flex: 2, minWidth: 260 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📋 Experience Summary
                    </p>
                    <p style={{ fontSize: '0.87rem', color: '#475569', lineHeight: 1.65 }}>
                      {app.experience_summary}
                    </p>
                  </div>
                )}
              </div>

              {app.ai_feedback && (
                <div style={{
                  marginTop: 14, padding: '11px 16px',
                  background: '#f8fafc', borderRadius: 9,
                  borderLeft: '4px solid #3b82f6',
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🤖 AI Recruiter Note
                  </p>
                  <p style={{ fontSize: '0.87rem', color: '#475569', lineHeight: 1.65 }}>
                    {app.ai_feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`http://localhost:8000${app.resume}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              📄 Download Resume
            </a>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              {expanded === app.id ? '▲ Hide' : '▼ Show'} Agent Log
            </button>
          </div>

          {expanded === app.id && <AgentLog log={app.agent_log_parsed} />}
        </div>
      ))}
    </div>
  );
}
