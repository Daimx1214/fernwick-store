import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useUi } from '../state/UiContext.jsx';
import { CATEGORY_MAP, CATEGORY_KEYS } from '../utils/categories.js';
import SearchBox from '../components/SearchBox.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import SortSelect from '../components/SortSelect.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';

// Store page — Spec Sec. 7.1. Category + query live in local state and
// are mirrored to the URL (?cat=&q=) so refresh and sharing work; the
// visible list is derived with useMemo, never stored (Sec. 5.1, A.4).
export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, items, error, offline, retry } = useProducts();
  const { setNavbarSearch } = useUi();

  const [category, setCategory] = useState(() => {
    const cat = searchParams.get('cat');
    return CATEGORY_KEYS.includes(cat) ? cat : 'all';
  });
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [sort, setSort] = useState('featured');
  const debouncedQuery = useDebounce(query, 250);

  // Slot the search box into the navbar centre (Sec. 7.1).
  useEffect(() => {
    setNavbarSearch(<SearchBox value={query} onChange={setQuery} />);
    return () => setNavbarSearch(null);
  }, [query, setNavbarSearch]);

  // Mirror category + debounced query to the URL, and adopt URL changes
  // that come from outside this page (e.g. footer category links). The
  // signature ref keeps the two directions from fighting each other.
  const syncRef = useRef(null);
  useEffect(() => {
    const next = {};
    if (category !== 'all') next.cat = category;
    const q = debouncedQuery.trim();
    if (q) next.q = q;
    const sig = new URLSearchParams(next).toString();
    if (syncRef.current !== sig) {
      syncRef.current = sig;
      setSearchParams(next, { replace: true });
    }
  }, [category, debouncedQuery, setSearchParams]);

  useEffect(() => {
    const sig = searchParams.toString();
    if (syncRef.current === null) {
      syncRef.current = sig;
      return;
    }
    if (sig === syncRef.current) return;
    syncRef.current = sig;
    const cat = searchParams.get('cat');
    setCategory(CATEGORY_KEYS.includes(cat) ? cat : 'all');
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const counts = useMemo(() => {
    const out = { all: items.length };
    for (const key of CATEGORY_KEYS) {
      const allowed = CATEGORY_MAP[key];
      if (allowed) out[key] = items.filter((p) => allowed.includes(p.category)).length;
    }
    return out;
  }, [items]);

  const visible = useMemo(() => {
    const allowed = CATEGORY_MAP[category];
    const q = debouncedQuery.trim().toLowerCase();
    let list = items.filter(
      (p) =>
        (!allowed || allowed.includes(p.category)) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating.rate - a.rating.rate);
    return list;
  }, [items, category, debouncedQuery, sort]);

  const clearFilters = () => {
    setCategory('all');
    setQuery('');
    setSort('featured');
  };

  return (
    <main className="container page">
      <a href="#products" className="skip-link">
        Skip to products
      </a>

      <section className="hero">
        <h1 className="hero__title">Well-made goods, honestly priced.</h1>
        <p className="hero__text">
          A small catalogue, chosen slowly: electronics that earn their keep, jewelry that
          lasts, and clothing cut for everyday wear. No noise, no nonsense — just the good
          stuff, shelved with care.
        </p>
      </section>

      <div className="toolbar-search">
        <SearchBox id="site-search-mobile" value={query} onChange={setQuery} />
      </div>

      <div className="toolbar">
        <CategoryChips value={category} onChange={setCategory} counts={status === 'success' ? counts : null} />
        <div className="toolbar__right">
          {status === 'success' && (
            <span className="toolbar__count numbers" role="status">
              {visible.length} {visible.length === 1 ? 'product' : 'products'}
            </span>
          )}
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <section id="products" aria-label="Products">
        {offline && (
          <p className="offline-banner" role="status">
            Showing saved catalogue (offline copy) — the live shop could not be reached.
          </p>
        )}
        {status === 'loading' && <SkeletonGrid />}
        {status === 'error' && <ErrorState error={error} onRetry={retry} />}
        {status === 'success' &&
          (visible.length > 0 ? (
            <ProductGrid products={visible} />
          ) : (
            <EmptyState
              title="No products match your search"
              text="Try a shorter word, or clear the filters and browse the whole shelf."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ))}
      </section>
    </main>
  );
}
