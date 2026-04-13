import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/services';
import ScoreRing from '../components/ScoreRing';
import AgentLog from '../components/AgentLog';

const STATUS_BADGE = {
  pending:     'badge-yellow',
  reviewing:   'badge-blue',
  shortlisted: 'badge-green',
  rejected:    'badge-red',
  hired:       'badge-purple',
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyApplications()
      .then((res) => setApps(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="container">
      <div className="page-header">
        <h1>📋 My Applications</h1>
        <p>Track your applications and view AI analysis results</p>
      </div>

      {apps.length === 0 && (
        <div className="alert alert-info">
          You haven't applied to any jobs yet.{' '}
          <Link to="/jobs">Browse open jobs →</Link>
        </div>
      )}

      {apps.map((app) => (
        <div className="card" key={app.id}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ScoreRing score={app.match_score} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700 }}>{app.job_info?.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 3 }}>
                🏢 {app.job_info?.company} &nbsp;|&nbsp; 📍 {app.job_info?.location}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>
                Applied {new Date(app.applied_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <span className={`badge ${STATUS_BADGE[app.status] || 'badge-gray'}`}>
              {app.status}
            </span>
          </div>

          {/* AI Analysis */}
          {app.extracted_skills && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🤖 AI Analysis
              </p>
              <div className="skills-list">
                {app.extracted_skills.split(',').slice(0, 8).map((s) => (
                  <span className="skill-chip" key={s}>{s.trim()}</span>
                ))}
                {app.extracted_skills.split(',').length > 8 && (
                  <span className="skill-chip" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    +{app.extracted_skills.split(',').length - 8} more
                  </span>
                )}
              </div>

              {app.experience_summary && (
                <p style={{ marginTop: 10, fontSize: '0.87rem', color: '#475569', lineHeight: 1.65 }}>
                  {app.experience_summary}
                </p>
              )}

              {app.ai_feedback && (
                <div style={{
                  marginTop: 10, padding: '10px 14px',
                  background: '#f8fafc', borderRadius: 8,
                  borderLeft: '3px solid #3b82f6',
                }}>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                    💬 {app.ai_feedback}
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
              📄 View Resume
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
