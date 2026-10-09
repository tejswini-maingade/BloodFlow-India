import { useMemo } from 'react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import RiskBadge from '../components/RiskBadge';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { BLOOD_GROUPS } from '../utils/constants';
import { RISK_ORDER } from '../utils/risk';
import { timeAgo } from '../utils/format';

export default function Availability() {
  const { values, setFilter, clear, hasFilters } = useFilters(['bloodGroup', 'city', 'risk']);
  const { bloodGroup, city, risk } = values;

  // Facilities are only used to build the city dropdown.
  const facilities = useApi(() => api.getFacilities());
  const cities = useMemo(() => {
    const names = new Set((facilities.data ?? []).map((f) => f.city));
    if (city) names.add(city); // keep a city from the URL selectable even before the list loads
    return [...names].sort();
  }, [facilities.data, city]);

  const result = useApi(() => api.getBlood({ bloodGroup, city, risk }), [bloodGroup, city, risk]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Blood availability</h1>
          <p className="muted">Search stock by blood group, city and risk level. Most urgent first.</p>
        </div>
      </div>

      <form className="card filters" onSubmit={(e) => e.preventDefault()} aria-label="Search filters">
        <label>
          Blood group
          <select value={bloodGroup} onChange={(e) => setFilter('bloodGroup', e.target.value)}>
            <option value="">All groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

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
          Risk level
          <select value={risk} onChange={(e) => setFilter('risk', e.target.value)}>
            <option value="">All levels</option>
            {RISK_ORDER.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <button type="button" className="btn btn-secondary" onClick={clear} disabled={!hasFilters}>
          Clear filters
        </button>
      </form>

      {result.loading && <Loading label="Searching…" />}
      {result.error && (
        <ErrorState
          error={result.error}
          onRetry={result.error.status === 400 ? clear : result.reload}
        />
      )}

      {!result.loading && !result.error && result.data.length === 0 && (
        <EmptyState title="No matching stock">
          Try a different combination or clear the filters.
        </EmptyState>
      )}

      {!result.loading && !result.error && result.data.length > 0 && (
        <section className="card" aria-live="polite">
          <p className="muted small">
            {result.meta.count} result{result.meta.count === 1 ? '' : 's'}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Group</th>
                  <th className="num">Units</th>
                  <th>Risk</th>
                  <th>Why this level?</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.facility.name}</td>
                    <td>{row.facility.city}</td>
                    <td>{row.facility.state}</td>
                    <td><strong>{row.bloodGroup}</strong></td>
                    <td className="num">{row.unitsAvailable}</td>
                    <td><RiskBadge level={row.risk.level} reason={row.risk.reason} /></td>
                    <td className="reason">
                      <details>
                        <summary>Explain</summary>
                        <p>{row.risk.reason}</p>
                      </details>
                    </td>
                    <td title={new Date(row.updatedAt).toLocaleString()}>{timeAgo(row.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small note">{result.meta.riskModel}</p>
        </section>
      )}
    </>
  );
}
