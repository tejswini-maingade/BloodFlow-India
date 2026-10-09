import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import RiskBadge from '../components/RiskBadge';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { FACILITY_TYPES, typeLabel } from '../utils/constants';
import { formatNumber } from '../utils/format';

export default function Hospitals() {
  const { values, setFilter, clear, hasFilters } = useFilters(['city', 'type']);
  const { city, type } = values;

  const all = useApi(() => api.getFacilities()); // unfiltered, for the city dropdown
  const cities = useMemo(() => {
    const names = new Set((all.data ?? []).map((f) => f.city));
    if (city) names.add(city);
    return [...names].sort();
  }, [all.data, city]);

  const result = useApi(() => api.getFacilities({ city, type }), [city, type]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hospitals and blood banks</h1>
          <p className="muted">Demo facilities (fictional) with a summary of their blood stock.</p>
        </div>
      </div>

      <form className="card filters" onSubmit={(e) => e.preventDefault()} aria-label="Facility filters">
        <label>
          City
          <select value={city} onChange={(e) => setFilter('city', e.target.value)}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Type
          <select value={type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {FACILITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <button type="button" className="btn btn-secondary" onClick={clear} disabled={!hasFilters}>
          Clear filters
        </button>
      </form>

      {result.loading && <Loading label="Loading facilities…" />}
      {result.error && (
        <ErrorState error={result.error} onRetry={result.error.status === 400 ? clear : result.reload} />
      )}

      {!result.loading && !result.error && result.data.length === 0 && (
        <EmptyState title="No facilities found">Try clearing the filters.</EmptyState>
      )}

      {!result.loading && !result.error && result.data.length > 0 && (
        <div className="grid grid-3" aria-live="polite">
          {result.data.map((f) => (
            <Link key={f.id} to={`/hospitals/${f.id}`} className="card facility-card">
              <div className="facility-type muted small">{typeLabel(f.type)}</div>
              <h2>{f.name}</h2>
              <div className="muted">{f.city}, {f.state}</div>
              <div className="facility-stats">
                <span><strong>{formatNumber(f.stats.totalUnits)}</strong> units</span>
                <span><strong>{f.stats.groupsTracked}</strong> groups</span>
                {f.stats.worstRisk ? (
                  <span>Worst: <RiskBadge level={f.stats.worstRisk} /></span>
                ) : (
                  <span className="muted">No stock recorded</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
