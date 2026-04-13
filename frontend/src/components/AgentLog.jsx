import { useState } from 'react';

const STEP_LABELS = {
  init:                 '🚀 Initialised',
  extract_skills:       '🔍 Step 1 — Extract Skills',
  summarise_experience: '📋 Step 2 — Summarise Experience',
  score_candidate:      '🎯 Step 3 — Score Candidate',
  generate_feedback:    '💬 Step 4 — Generate Feedback',
  done:                 '✅ Complete',
};

export default function AgentLog({ log }) {
  const [open, setOpen] = useState(false);

  if (!log || log.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '▲ Hide' : '▼ Show'} AI Agent Reasoning Log ({log.length} steps)
      </button>

      {open && (
        <div className="agent-log">
          {log.map((entry, i) => (
            <div key={i} className="agent-log-step">
              <div className="step-label">
                {STEP_LABELS[entry.step] || entry.step}
                <span style={{ color: '#475569', fontWeight: 400, marginLeft: 8 }}>
                  [{entry.role}]
                </span>
              </div>
              <div className="step-content">{entry.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
