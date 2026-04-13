import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJob, updateJob } from '../api/services';

const EMPTY = {
  title: '', company: '', location: '', description: '',
  requirements: '', skills_required: '', salary_min: '', salary_max: '', status: 'open',
};

export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getJob(id)
      .then((res) => setForm(res.data))
      .catch(() => setError('Could not load job details.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateJob(id, form);
      } else {
        await createJob(form);
      }
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msgs);
      } else {
        setError('Failed to save job. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ maxWidth: 740, paddingTop: 32 }}>
      <div className="card">
        <h2 style={{ fontWeight: 800, marginBottom: 6 }}>
          {isEdit ? '✏️ Edit Job' : '➕ Post a New Job'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 24 }}>
          {isEdit
            ? 'Update the job details below.'
            : 'Fill in the details — the AI agent will use the skills list to score applicants.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Job Title *</label>
              <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Senior Django Developer" />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input name="company" value={form.company} onChange={handle} required placeholder="e.g. Acme Corp" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Location *</label>
              <input name="location" value={form.location} onChange={handle} required placeholder="e.g. Remote / Bangalore" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handle}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Min Salary (₹/yr)</label>
              <input name="salary_min" type="number" value={form.salary_min} onChange={handle} placeholder="800000" />
            </div>
            <div className="form-group">
              <label>Max Salary (₹/yr)</label>
              <input name="salary_max" type="number" value={form.salary_max} onChange={handle} placeholder="1500000" />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              required
              rows={6}
              placeholder="Describe the role, day-to-day responsibilities, and what success looks like…"
            />
          </div>

          <div className="form-group">
            <label>Requirements *</label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handle}
              required
              rows={5}
              placeholder="List qualifications, education, years of experience required…"
            />
          </div>

          <div className="form-group">
            <label>Required Skills * (comma-separated)</label>
            <input
              name="skills_required"
              value={form.skills_required}
              onChange={handle}
              required
              placeholder="Python, Django, REST API, MySQL, Docker, Git, React"
            />
            <small>
              The AI agent matches these exactly against the candidate's resume to generate a score.
            </small>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '🚀 Post Job'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
