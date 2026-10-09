import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useFilters } from '../hooks/useFilters';
import RiskBadge from '../components/RiskBadge';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { BLOOD_GROUPS } from '../utils/constants';
import { timeAgo } from '../utils/format';

// Friendly client-side check. The backend validates again and also enforces the maximum.
function parseUnits(text) {
  const t = String(text).trim();
  if (!/^\d+$/.test(t)) return { error: 'Units must be a whole number of 0 or more' };
  return { value: Number(t) };
}

export default function Admin() {
  const { user, logout } = useAuth();
  const { values, setFilter, clear, hasFilters } = useFilters(['city', 'bloodGroup']);
  const { city, bloodGroup } = values;

  const facilities = useApi(() => api.getFacilities());
  const cities = useMemo(() => {
    const names = new Set((facilities.data ?? []).map((f) => f.city));
    if (city) names.add(city);
    return [...names].sort();
  }, [facilities.data, city]);

  const stock = useApi(() => api.getBlood({ city, bloodGroup }), [city, bloodGroup]);

  const [message, setMessage] = useState(null); // { type, text, before?, after?, reason? }
  const [busyId, setBusyId] = useState(null); // row id, or 'add' while a request is running
  const [drafts, setDrafts] = useState({}); // unsaved edits: { [rowId]: 'text' }
  const [confirmId, setConfirmId] = useState(null); // row waiting for delete confirmation
  const [form, setForm] = useState({ facilityId: '', bloodGroup: '', units: '' });
  const [formError, setFormError] = useState(null);

  // Runs one API action with shared busy/error handling. Returns the result, or null on failure.
  async function perform(busyKey, action) {
    setBusyId(busyKey);
    setMessage(null);
    try {
      return await action();
    } catch (err) {
      if (err.status === 401) {
        logout(); // token expired or invalid: the route guard sends us to /login
        return null;
      }
      setMessage({ type: 'error', text: err.message });
      return null;
    } finally {
      setBusyId(null);
    }
  }

  async function saveUnits(row) {
    const parsed = parseUnits(drafts[row.id] ?? row.unitsAvailable);
    if (parsed.error) {
      setMessage({ type: 'error', text: `${row.facility.name}, ${row.bloodGroup}: ${parsed.error}` });
      return;
    }
    const res = await perform(row.id, () => api.updateInventory(row.id, parsed.value));
    if (!res) return;

        setDrafts((current) => {
      const next = { ...current };
      delete next[row.id];
      return next;
    });
    setMessage({
      type: 'success',
      text: `${row.facility.name}, ${row.bloodGroup}: ${row.unitsAvailable} → ${res.data.unitsAvailable} units.`,
      before: row.risk.level,
      after: res.data.risk.level,
      reason: res.data.risk.reason,
    });
    stock.reload();
  }

  async function removeRow(row) {
    const res = await perform(row.id, () => api.deleteInventory(row.id));
    setConfirmId(null);
    if (!res) return;
    setMessage({ type: 'success', text: `Deleted ${row.bloodGroup} stock record at ${row.facility.name}.` });
    stock.reload();
  }

  async function addRecord(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.facilityId) return setFormError('Choose a facility');
    if (!form.bloodGroup) return setFormError('Choose a blood group');
    const parsed = parseUnits(form.units);
    if (parsed.error) return setFormError(parsed.error);

    const res = await perform('add', () =>
      api.createInventory({
        facilityId: Number(form.facilityId),
        bloodGroup: form.bloodGroup,
        unitsAvailable: parsed.value,
      })
    );
    if (!res) return;

    setMessage({
      type: 'success',
      text: `Added ${res.data.bloodGroup} at ${res.data.facility.name}: ${res.data.unitsAvailable} units.`,
      after: res.data.risk.level,
      reason: res.data.risk.reason,
    });
    setForm((f) => ({ ...f, units: '' }));
    stock.reload();
    return undefined;
  }

  const anyBusy = busyId !== null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Inventory management</h1>
          <p className="muted">
            Signed in as <strong>{user.name}</strong>. Changes apply to demo data only.
          </p>
        </div>
      </div>

      {message && (
        <div className={`msg msg-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          <div>{message.text}</div>
          {message.after && (
            <div className="msg-risk">
              Risk:{' '}
              {message.before && message.before !== message.after ? (
                <>
                  <RiskBadge level={message.before} /> → <RiskBadge level={message.after} />
                </>
              ) : (
                <RiskBadge level={message.after} />
              )}
              <span className="small"> {message.reason}</span>
            </div>
          )}
        </div>
      )}

      <section className="card" aria-label="Add inventory">
        <h2>Add stock record</h2>
        <form className="filters" onSubmit={addRecord} noValidate>
          <label>
            Facility
            <select value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })}>
              <option value="">Choose…</option>
              {(facilities.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}, {f.city}
                </option>
              ))}
            </select>
          </label>

          <label>
            Blood group
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              <option value="">Choose…</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label>
            Available units
            <input
              type="text"
              inputMode="numeric"
              value={form.units}
              onChange={(e) => setForm({ ...form, units: e.target.value })}
              placeholder="e.g. 12"
            />
          </label>

          <button className="btn" type="submit" disabled={anyBusy}>
            {busyId === 'add' ? 'Adding…' : 'Add record'}
          </button>
        </form>
        {formError && <p className="msg msg-error" role="alert">{formError}</p>}
        <p className="muted small">Each facility can have one record per blood group. To change an existing one, edit it below.</p>
      </section>

      <form className="card filters" onSubmit={(e) => e.preventDefault()} aria-label="Inventory filters">
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
          Blood group
          <select value={bloodGroup} onChange={(e) => setFilter('bloodGroup', e.target.value)}>
            <option value="">All groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-secondary" onClick={clear} disabled={!hasFilters}>
          Clear filters
        </button>
      </form>

      {stock.loading && !stock.data && <Loading label="Loading inventory…" />}
      {stock.error && <ErrorState error={stock.error} onRetry={stock.error.status === 400 ? clear : stock.reload} />}

      {stock.data && stock.data.length === 0 && (
        <EmptyState title="No matching records">Clear the filters or add a record above.</EmptyState>
      )}

      {stock.data && stock.data.length > 0 && (
        <section className="card" aria-label="Inventory records">
          <p className="muted small">
            {stock.data.length} record{stock.data.length === 1 ? '' : 's'}, most urgent first
            {stock.loading && ' · refreshing…'}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>City</th>
                  <th>Group</th>
                  <th>Units</th>
                  <th>Risk</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock.data.map((row) => {
                  const draft = drafts[row.id];
                  const changed = draft !== undefined && draft.trim() !== String(row.unitsAvailable);
                  return (
                    <tr key={row.id}>
                      <td>{row.facility.name}</td>
                      <td>{row.facility.city}</td>
                      <td><strong>{row.bloodGroup}</strong></td>
                      <td>
                        <input
                          className="units-input"
                          type="text"
                          inputMode="numeric"
                          aria-label={`Units for ${row.bloodGroup} at ${row.facility.name}`}
                          value={draft ?? row.unitsAvailable}
                          onChange={(e) => setDrafts({ ...drafts, [row.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && changed && !anyBusy && saveUnits(row)}
                        />
                      </td>
                      <td><RiskBadge level={row.risk.level} reason={row.risk.reason} /></td>
                      <td>{timeAgo(row.updatedAt)}</td>
                      <td className="row-actions">
                        <button className="btn btn-small" onClick={() => saveUnits(row)} disabled={!changed || anyBusy}>
                          {busyId === row.id ? 'Saving…' : 'Save'}
                        </button>
                        {confirmId === row.id ? (
                          <>
                            <button className="btn btn-small btn-danger" onClick={() => removeRow(row)} disabled={anyBusy}>
                              Yes, delete
                            </button>
                            <button className="btn btn-small btn-secondary" onClick={() => setConfirmId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-small btn-secondary" onClick={() => setConfirmId(row.id)} disabled={anyBusy}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
