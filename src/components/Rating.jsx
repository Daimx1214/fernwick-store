// Star rating with half-star support — Spec Sec. 7.1 / 15.
// The wrapper carries the accessible label; the stars themselves are
// decorative SVGs (full / half via clip / empty).

function Star({ fill }) {
  // fill: 0 (empty), 0.5 (half), 1 (full)
  return (
    <span className="rating__star" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path
          className="rating__star-bg"
          d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z"
        />
        {fill > 0 && (
          <path
            className="rating__star-fg"
            d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z"
            style={fill < 1 ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
          />
        )}
      </svg>
    </span>
  );
}

export default function Rating({ rate, count }) {
  const fills = Array.from({ length: 5 }, (_, i) => {
    const rest = rate - i;
    if (rest >= 0.75) return 1;
    if (rest >= 0.25) return 0.5;
    return 0;
  });
  return (
    <span
      className="rating"
      role="img"
      aria-label={`Rated ${rate} out of 5 from ${count} reviews`}
    >
      <span className="rating__stars">
        {fills.map((f, i) => (
          <Star key={i} fill={f} />
        ))}
      </span>
      <span className="rating__text numbers">
        {rate.toFixed(1)} ({count})
      </span>
    </span>
  );
}
