import { SearchIcon } from './icons.jsx';

// Search input — Spec Sec. 7.1. The raw value lives in Store page state;
// debouncing happens there via useDebounce.
export default function SearchBox({ value, onChange, id = 'site-search' }) {
  return (
    <div className="searchbox">
      <SearchIcon />
      <label className="sr-only" htmlFor={id}>
        Search products
      </label>
      <input
        id={id}
        type="search"
        className="searchbox__input"
        placeholder="Search the shelves…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
