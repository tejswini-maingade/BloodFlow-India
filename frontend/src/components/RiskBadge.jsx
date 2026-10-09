// Colour + text (never colour alone), with the reason on hover.
export default function RiskBadge({ level, reason }) {
  return (
    <span className={`badge badge-${level.toLowerCase()}`} title={reason}>
      {level}
    </span>
  );
}
