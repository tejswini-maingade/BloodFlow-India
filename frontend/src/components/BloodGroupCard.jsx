import { formatNumber } from '../utils/format';
import { groupCaption, groupStatus } from '../utils/risk';

export default function BloodGroupCard({ group }) {
  const { bloodGroup, totalUnits, facilitiesTracked, criticalCount, lowStockCount } = group;
  const status = groupStatus(group);
  const okCount = Math.max(0, facilitiesTracked - criticalCount - lowStockCount);
  const pct = (n) => (facilitiesTracked ? (n / facilitiesTracked) * 100 : 0);

  return (
    <article className={`group-card gc-${status}`} aria-label={`Blood group ${bloodGroup}`}>
      <svg className="gc-drop" width="52" height="52" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.2c3.4 4.3 6.2 7.6 6.2 11.2a6.2 6.2 0 0 1-12.4 0c0-3.6 2.8-6.9 6.2-11.2z"
          fill="currentColor"
        />
        <text
          x="12"
          y="15.6"
          textAnchor="middle"
          fontSize={bloodGroup.length > 2 ? 5.4 : 6.6}
          fontWeight="700"
          fill="#fff"
        >
          {bloodGroup}
        </text>
      </svg>

      <div className="gc-body">
        <div className="gc-units">
          {formatNumber(totalUnits)} <span>units</span>
        </div>
        <div className="gc-caption">{groupCaption(group)}</div>
        <div className="stack-bar mini" role="img" aria-label="Facilities by stock status">
          <div className="seg seg-low" style={{ width: `${pct(okCount)}%` }} />
          <div className="seg seg-high" style={{ width: `${pct(lowStockCount)}%` }} />
          <div className="seg seg-critical" style={{ width: `${pct(criticalCount)}%` }} />
        </div>
        {facilitiesTracked > 0 && <div className="muted small">of {facilitiesTracked} facilities</div>}
      </div>
    </article>
  );
}
