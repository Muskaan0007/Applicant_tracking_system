import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);

      // ✅ Set tokens FIRST so axios interceptor can use them for getMe()
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      const meRes = await getMe();
      login(res.data, meRes.data);
      navigate(meRes.data.role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0];
      setError(msg || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 64 }}>
      <div className="card">
        <h2 style={{ fontWeight: 800, marginBottom: 6 }}>🔐 Login</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 24 }}>
          Welcome back — sign in to continue
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handle}
              required
              autoFocus
              placeholder="your_username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required
              placeholder="••••••••"
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.97rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
