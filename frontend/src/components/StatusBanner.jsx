import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/format';

const alertIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

const okIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l3 3 5-6" />
  </svg>
);

export default function StatusBanner({ criticalGroups, latestUpdate }) {
  const critical = criticalGroups.length > 0;
  const n = criticalGroups.length;

  return (
    <div className={`banner ${critical ? 'banner-critical' : 'banner-ok'}`} role="status">
      {critical ? alertIcon : okIcon}
      <div className="banner-text">
        <strong>{critical ? `${n} blood group${n === 1 ? '' : 's'} with critical stock` : 'No critical stock'}</strong>
        <span>
          {critical
            ? `${criticalGroups.join(', ')} below the critical threshold at one or more facilities.`
            : 'No facility is below the critical threshold.'}
          {latestUpdate && ` Latest stock update ${timeAgo(latestUpdate)}.`}
        </span>
      </div>
      {critical && (
        <Link className="btn btn-small" to="/availability?risk=CRITICAL">
          View critical stock
        </Link>
      )}
    </div>
  );
}
