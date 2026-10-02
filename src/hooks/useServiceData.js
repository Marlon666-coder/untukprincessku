import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads data from a service and reloads it whenever the service reports a change.
 *
 *   const { data, loading, error } = useServiceData(dateService.listDates, dateService.subscribe);
 *
 * Works the same for the preview collections today and Supabase (realtime) later.
 */
export function useServiceData(loader, subscribe, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));
    const safeReload = () => active && reload();
    safeReload();
    const unsubscribe = subscribe ? subscribe(safeReload) : undefined;
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [reload, subscribe]);

  return { ...state, reload };
}
