import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../api/products.js';
import fallbackProducts from '../api/fallback-products.json';

// Catalogue loading — Spec Sec. 4.5 / 5 / 17.
// Fetches /products once. On failure the Store shows an error state with a
// Retry button; if that retry also fails, the saved offline copy is loaded
// silently and flagged with `offline: true` so the UI can show its banner.
export function useProducts() {
  const [state, setState] = useState({ status: 'loading', items: [], error: null, offline: false });
  const attempts = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    attempts.current += 1;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const items = await getProducts();
      if (!mounted.current) return;
      setState({ status: 'success', items, error: null, offline: false });
    } catch (e) {
      if (!mounted.current) return;
      if (attempts.current >= 2) {
        // One retry already failed — fall back to the saved catalogue.
        setState({ status: 'success', items: fallbackProducts, error: null, offline: true });
      } else {
        setState({ status: 'error', items: [], error: e, offline: false });
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { ...state, retry: load };
}
