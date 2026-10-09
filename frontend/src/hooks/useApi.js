import { useCallback, useEffect, useState } from 'react';

// Runs an API call and tracks loading / error / data.
// Pass dependencies (like filters) to re-fetch when they change; call reload() to retry.
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false; // ignore results from outdated requests
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcher()
      .then(({ data, meta }) => {
        if (!cancelled) setState({ data, meta, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
