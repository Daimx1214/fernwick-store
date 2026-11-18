// Sort control — Spec Sec. 5.1 / 7.1.
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <div className="sort">
      <label htmlFor="sort-select">Sort</label>
      <select
        id="sort-select"
        className="sort__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
