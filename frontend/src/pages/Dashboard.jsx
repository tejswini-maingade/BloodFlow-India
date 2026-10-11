import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import StatusBanner from '../components/StatusBanner';
import BloodGroupCard from '../components/BloodGroupCard';
import UnitsChart from '../components/UnitsChart';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { formatNumber, timeAgo } from '../utils/format';
import { RISK_ORDER, riskRanges } from '../utils/risk';

export default function Dashboard() {
  const dash = useApi(() => api.getDashboard());
  const alerts = useApi(() => api.getAlerts(5));

  if (dash.loading) return <Loading label="Loading dashboard…" />;
  if (dash.error) return <ErrorState error={dash.error} onRetry={dash.reload} />;

  const { totals, riskDistribution, bloodGroups, locations, recentUpdates, riskThresholds } = dash.data;

  if (totals.totalFacilities === 0) {
    return (
      <EmptyState title="No data yet">
        The database is empty. Run <code>npm run db:seed</code> in the backend folder to load demo data.
      </EmptyState>
    );
  }

  const ranges = riskRanges(riskThresholds);
  const rowTotal = RISK_ORDER.reduce((sum, level) => sum + riskDistribution[level], 0);
  const criticalGroups = bloodGroups.filter((g) => g.criticalCount > 0).map((g) => g.bloodGroup);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Current blood stock overview across demo facilities.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { dash.reload(); alerts.reload(); }}>
          Refresh
        </button>
      </div>

      <StatusBanner criticalGroups={criticalGroups} latestUpdate={recentUpdates[0]?.updatedAt ?? null} />

      <section className="grid grid-4" aria-label="Key numbers">
        <StatCard label="Total units" value={formatNumber(totals.totalUnits)} />
        <StatCard label="Facilities" value={formatNumber(totals.totalFacilities)} hint="Hospitals and blood banks" />
        <StatCard label="Low stock" value={totals.lowStockCount} tone="high" hint={`Stock rows at ${ranges.HIGH}`} />
        <StatCard label="Critical" value={totals.criticalCount} tone="critical" hint={`Stock rows ${ranges.CRITICAL}`} />
      </section>

      <section className="section" aria-label="Blood group summary">
        <h2>Blood group summary</h2>
        <div className="grid grid-8">
          {bloodGroups.map((g) => (
            <BloodGroupCard key={g.bloodGroup} group={g} />
          ))}
        </div>
      </section>

      <section className="card" aria-label="Units by blood group">
        <h2>Units by blood group</h2>
        <UnitsChart groups={bloodGroups} />
      </section>

      <div className="grid grid-2">
        <section className="card" aria-label="Risk distribution">
          <h2>Risk distribution</h2>
          <p className="muted small">Share of stock rows (facility + blood group) at each level.</p>
          <div className="stack-bar" role="img" aria-label="Risk distribution bar">
            {RISK_ORDER.map((level) =>
              riskDistribution[level] > 0 ? (
                <div
                  key={level}
                  className={`seg seg-${level.toLowerCase()}`}
                  style={{ width: `${(riskDistribution[level] / rowTotal) * 100}%` }}
                  title={`${level}: ${riskDistribution[level]}`}
                />
              ) : null
            )}
          </div>
          <ul className="legend">
            {RISK_ORDER.map((level) => (
              <li key={level}>
                <RiskBadge level={level} /> <strong>{riskDistribution[level]}</strong>
                <span className="muted small"> · {ranges[level]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card" aria-label="Recent alerts">
          <h2>Recent alerts</h2>
          {alerts.loading && <p className="muted">Loading alerts…</p>}
          {alerts.error && <p className="muted">Could not load alerts.</p>}
          {alerts.data && alerts.data.length === 0 && (
            <p className="muted">No alerts yet. They appear when stock drops to HIGH or CRITICAL.</p>
          )}
          {alerts.data && alerts.data.length > 0 && (
            <ul className="alert-list">
              {alerts.data.map((a) => (
                <li key={a.id}>
                  <RiskBadge level={a.riskLevel} />
                  <div>
                    <div>{a.message}</div>
                    <div className="muted small">{timeAgo(a.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card" aria-label="Location overview">
        <h2>Location overview</h2>
        <div className="table-wrap">
          <table className="responsive">
            <thead>
              <tr>
                <th>City</th>
                <th>State</th>
                <th className="num">Facilities</th>
                <th className="num">Units</th>
                <th className="num">Low stock</th>
                <th className="num">Critical</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={`${l.city}-${l.state}`}>
                  <td data-label="City">{l.city}</td>
                  <td data-label="State">{l.state}</td>
                  <td data-label="Facilities" className="num">{l.facilities}</td>
                  <td data-label="Units" className="num">{formatNumber(l.totalUnits)}</td>
                  <td data-label="Low stock" className="num">{l.lowStockCount}</td>
                  <td data-label="Critical" className="num">{l.criticalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-label="Recent inventory updates">
        <h2>Recent inventory updates</h2>
        <div className="table-wrap">
          <table className="responsive">
            <thead>
              <tr>
                <th>Facility</th>
                <th>City</th>
                <th>Group</th>
                <th className="num">Units</th>
                <th>Risk</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentUpdates.map((r) => (
                <tr key={r.id}>
                  <td data-label="Facility">{r.facility.name}</td>
                  <td data-label="City">{r.facility.city}</td>
                  <td data-label="Group"><strong>{r.bloodGroup}</strong></td>
                  <td data-label="Units" className="num">{r.unitsAvailable}</td>
                  <td data-label="Risk"><RiskBadge level={r.risk.level} reason={r.risk.reason} /></td>
                  <td data-label="Updated">{timeAgo(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dash.meta && (
        <p className="muted small note">
          {dash.meta.dataNotice} {dash.meta.riskModel}
        </p>
      )}
    </>
  );
}
