export default function StatCard({ label, value, hint, tone = 'neutral' }) {
  return (
    <div className={`card stat stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
