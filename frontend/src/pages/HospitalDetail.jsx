import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import RiskBadge from '../components/RiskBadge';
import StatCard from '../components/StatCard';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { typeLabel } from '../utils/constants';
import { formatNumber, timeAgo } from '../utils/format';

export default function HospitalDetail() {
  const { id } = useParams();
  const { data: f, loading, error, reload } = useApi(() => api.getFacility(id), [id]);

  if (loading) return <Loading label="Loading facility…" />;

  if (error?.status === 404 || error?.status === 400) {
    return (
      <EmptyState title="Facility not found">
        <Link to="/hospitals">Back to all facilities</Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <p className="small"><Link to="/hospitals">← All facilities</Link></p>

      <div className="page-head">
        <div>
          <h1>{f.name}</h1>
          <p className="muted">{typeLabel(f.type)} · {f.city}, {f.state}</p>
        </div>
      </div>

      <section className="grid grid-3" aria-label="Facility summary">
        <StatCard label="Total units" value={formatNumber(f.stats.totalUnits)} />
        <StatCard label="Blood groups tracked" value={f.stats.groupsTracked} />
        <StatCard
          label="Worst risk level"
          value={f.stats.worstRisk ? <RiskBadge level={f.stats.worstRisk} /> : '—'}
        />
      </section>

      <section className="card">
        <h2>Stock by blood group</h2>
        {f.inventory.length === 0 ? (
          <p className="muted">No stock recorded for this facility.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th className="num">Units</th>
                  <th>Risk</th>
                  <th>Why this level?</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {f.inventory.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.bloodGroup}</strong></td>
                    <td className="num">{row.unitsAvailable}</td>
                    <td><RiskBadge level={row.risk.level} reason={row.risk.reason} /></td>
                    <td className="reason">{row.risk.reason}</td>
                    <td>{timeAgo(row.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small note">Synthetic demo data. Risk levels come from an MVP/demo rule-based model, not a medical prediction.</p>
      </section>
    </>
  );
}
