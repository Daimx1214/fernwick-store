import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../api/products.js';
import fallbackProducts from '../api/fallback-products.json';

// Catalogue loading — Spec Sec. 4.5 / 5 / 17.
// /products is fetched once per session and kept in a module-level cache,
// so category/search changes and page navigations never re-hit the
// network. On failure the UI shows an error state with Retry; if a retry
// also fails, the saved offline copy loads silently and `offline` flags
// the banner.
let cache = null; // { items, offline }
let inflight = null;

function fetchCatalogue() {
  if (!inflight) {
    inflight = getProducts()
      .then((items) => {
        cache = { items, offline: false };
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useProducts() {
  const [state, setState] = useState(() =>
    cache
      ? { status: 'success', items: cache.items, error: null, offline: cache.offline }
      : { status: 'loading', items: [], error: null, offline: false }
  );
  const attempts = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (cache) {
      setState({ status: 'success', items: cache.items, error: null, offline: cache.offline });
      return;
    }
    attempts.current += 1;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const result = await fetchCatalogue();
      if (!mounted.current) return;
      setState({ status: 'success', items: result.items, error: null, offline: result.offline });
    } catch (e) {
      if (!mounted.current) return;
      if (attempts.current >= 2) {
        cache = { items: fallbackProducts, offline: true };
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
