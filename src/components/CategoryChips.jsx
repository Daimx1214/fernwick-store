import { CATEGORY_KEYS, CATEGORY_LABELS } from '../utils/categories.js';

// Category filter chips with live counts — Spec Sec. 7.1 / 18.
// Counts are computed from the real catalogue, so they always match the
// API (All 20, Electronics 6, Jewelry 4, Clothing 10 at time of writing).
export default function CategoryChips({ value, onChange, counts }) {
  return (
    <div className="chips" role="group" aria-label="Filter by category">
      {CATEGORY_KEYS.map((key) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            className={`chip${active ? ' chip--active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(key)}
          >
            {CATEGORY_LABELS[key]}
            {counts && <span className="chip__count numbers">{counts[key] ?? 0}</span>}
          </button>
        );
      })}
    </div>
  );
}
