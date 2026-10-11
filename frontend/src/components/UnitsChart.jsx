import { formatNumber } from '../utils/format';

export default function UnitsChart({ groups }) {
  const max = Math.max(1, ...groups.map((g) => g.totalUnits));

  return (
    <ul className="bars" aria-label="Total units by blood group">
      {groups.map((g) => (
        <li key={g.bloodGroup}>
          <span className="bar-label">{g.bloodGroup}</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: g.totalUnits > 0 ? `${Math.max(2, (g.totalUnits / max) * 100)}%` : '0%' }}
            />
          </span>
          <span className="bar-value">{formatNumber(g.totalUnits)}</span>
        </li>
      ))}
    </ul>
  );
}
