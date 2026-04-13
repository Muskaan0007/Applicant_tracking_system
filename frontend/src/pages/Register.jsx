import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'candidate', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      // register endpoint returns { user, access, refresh }
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      login(res.data, res.data.user);
      navigate(res.data.user.role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msgs);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 64 }}>
      <div className="card">
        <h2 style={{ fontWeight: 800, marginBottom: 6 }}>✍️ Create Account</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 24 }}>
          Join the ATS platform — takes 30 seconds
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Username *</label>
              <input name="username" value={form.username} onChange={handle} required placeholder="john_doe" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required
              minLength={6}
              placeholder="Min 6 characters"
            />
          </div>

          <div className="form-group">
            <label>I am a… *</label>
            <select name="role" value={form.role} onChange={handle}>
              <option value="candidate">🧑‍💼 Candidate — looking for a job</option>
              <option value="recruiter">🏢 Recruiter — hiring talent</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.97rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
