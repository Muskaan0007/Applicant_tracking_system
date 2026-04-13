import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, applyToJob } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getJob(id)
      .then((res) => setJob(res.data))
      .catch(() => setError('Job not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) { setError('Please select your resume PDF.'); return; }
    setApplying(true);
    setError('');

    const fd = new FormData();
    fd.append('job', id);
    fd.append('resume', resume);
    fd.append('cover_letter', coverLetter);

    try {
      await applyToJob(fd);
      setSuccess('✅ Application submitted! Our AI agent is analysing your resume…');
      setTimeout(() => navigate('/my-applications'), 2800);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to apply. You may have already applied to this job.'
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!job) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="alert alert-error">{error || 'Job not found.'}</div>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: 820, paddingTop: 32 }}>

      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800 }}>{job.title}</h1>
            <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.92rem' }}>
              🏢 {job.company} &nbsp;|&nbsp; 📍 {job.location}
            </p>
            {job.salary_min && (
              <p style={{ color: '#22c55e', marginTop: 5, fontSize: '0.88rem' }}>
                💰 ₹{Number(job.salary_min).toLocaleString()} – ₹{Number(job.salary_max).toLocaleString()} / yr
              </p>
            )}
          </div>
          <span className="badge badge-green">{job.status}</span>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📄 Job Description</h3>
        <p style={{ lineHeight: 1.78, color: '#475569', whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>
          {job.description}
        </p>
      </div>

      {/* Requirements */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>✅ Requirements</h3>
        <p style={{ lineHeight: 1.78, color: '#475569', whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>
          {job.requirements}
        </p>
      </div>

      {/* Skills */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🛠️ Skills Required</h3>
        <div className="skills-list">
          {job.skills_required.split(',').map((s) => (
            <span className="skill-chip" key={s}>{s.trim()}</span>
          ))}
        </div>
      </div>

      {/* Apply form — candidates only */}
      {user?.role === 'candidate' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>🚀 Apply for this Position</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 20 }}>
            Our AI agent will automatically extract your skills and generate a match score.
          </p>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleApply}>
            <div className="form-group">
              <label>Resume (PDF only) *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
              <small>Max 10MB · PDF format only · AI will parse this automatically</small>
            </div>

            <div className="form-group">
              <label>Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role…"
                rows={5}
              />
            </div>

            <button className="btn btn-primary" disabled={applying}>
              {applying ? '⏳ Submitting & analysing resume…' : '📤 Submit Application'}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="alert alert-info">
          <strong>Want to apply?</strong>{' '}
          <Link to="/login">Login</Link> or <Link to="/register">Register</Link> as a candidate.
        </div>
      )}

      {user?.role === 'recruiter' && (
        <div className="alert alert-info">
          You are logged in as a recruiter. Switch to a candidate account to apply.
        </div>
      )}
    </div>
  );
}
