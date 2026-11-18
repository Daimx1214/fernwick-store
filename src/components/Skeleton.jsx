// Loading skeletons — Spec Sec. 7.1: 8 cards with a slow shimmer
// (disabled under prefers-reduced-motion via the .skeleton CSS).
export function SkeletonCard() {
  return (
    <li className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton--tile" />
      <div className="skeleton skeleton--line" style={{ width: '40%' }} />
      <div className="skeleton skeleton--line" style={{ width: '90%' }} />
      <div className="skeleton skeleton--line" style={{ width: '70%' }} />
      <div className="skeleton skeleton--btn" />
    </li>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <ul className="grid" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </ul>
  );
}
