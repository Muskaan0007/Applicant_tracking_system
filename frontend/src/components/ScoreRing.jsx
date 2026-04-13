export default function ScoreRing({ score }) {
  if (score === null || score === undefined) {
    return (
      <div className="score-ring score-low" title="Not yet scored">
        —
      </div>
    );
  }
  const cls =
    score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';
  return (
    <div className={`score-ring ${cls}`} title={`AI Match Score: ${score}/100`}>
      {Math.round(score)}
    </div>
  );
}
