import { useSearchParams } from 'react-router-dom';

// Keeps filter values in the URL query string.
export function useFilters(keys) {
  const [params, setParams] = useSearchParams();

  const values = Object.fromEntries(keys.map((k) => [k, params.get(k) || '']));

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true }); // don't clutter browser history with every dropdown change
  };

  const clear = () => setParams({}, { replace: true });
  const hasFilters = keys.some((k) => values[k] !== '');

  return { values, setFilter, clear, hasFilters };
}
