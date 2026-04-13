import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">🎯 ATS Portal</Link>

        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/jobs">Browse Jobs</Link>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-accent">Register</Link>
            </>
          ) : user.role === 'candidate' ? (
            <>
              <Link to="/jobs">Jobs</Link>
              <Link to="/my-applications">My Applications</Link>
              <span style={{ color: '#64748b', fontSize: '0.82rem', padding: '0 6px' }}>
                👤 {user.username}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/jobs/create">Post Job</Link>
              <span style={{ color: '#64748b', fontSize: '0.82rem', padding: '0 6px' }}>
                🏢 {user.username}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
