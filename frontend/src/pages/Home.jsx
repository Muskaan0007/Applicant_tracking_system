import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="container" style={{ paddingTop: 90, paddingBottom: 70, textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: '#3b82f620',
          borderRadius: 999, padding: '5px 18px', marginBottom: 22,
        }}>
          <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.82rem' }}>
            🤖 Powered by Grok AI Agent
          </span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 18 }}>
          Hire Smarter with<br />
          <span style={{ color: '#60a5fa' }}>AI Resume Intelligence</span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Our multi-step Grok agent automatically parses every resume,
          extracts skills, and scores each candidate against your job description — in seconds.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link
              to={user.role === 'recruiter' ? '/dashboard' : '/jobs'}
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '12px 28px' }}
            >
              Go to {user.role === 'recruiter' ? 'Dashboard' : 'Jobs'} →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
                Get Started Free
              </Link>
              <Link
                to="/jobs"
                className="btn btn-outline"
                style={{ fontSize: '1rem', padding: '12px 28px', color: '#94a3b8', borderColor: '#334155' }}
              >
                Browse Jobs
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="grid-3">
          {[
            {
              icon: '📄',
              title: 'Smart Resume Parsing',
              desc: 'Upload any PDF resume. The agent extracts skills, experience, and key details automatically using Grok.',
            },
            {
              icon: '🎯',
              title: 'AI Match Scoring',
              desc: 'Every candidate receives a 0–100 score comparing their profile to the exact job requirements.',
            },
            {
              icon: '🔍',
              title: 'Full Agent Transparency',
              desc: 'See every reasoning step the AI took — skills extraction, scoring logic, and recruiter notes.',
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 16,
                padding: 28,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 10, fontSize: '1.05rem' }}>
                {f.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.68, fontSize: '0.88rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.6rem', marginBottom: 36 }}>
            How the AI Agent Works
          </h2>
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '1', label: 'Candidate uploads PDF resume' },
              { step: '2', label: 'Agent extracts skills & experience' },
              { step: '3', label: 'Grok scores against job description' },
              { step: '4', label: 'Recruiter sees ranked candidates' },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', width: 160 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#3b82f6', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1.1rem', margin: '0 auto 10px',
                  }}>
                    {s.step}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.5 }}>{s.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ color: '#334155', fontSize: '1.5rem', margin: '0 4px', marginBottom: 24 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
