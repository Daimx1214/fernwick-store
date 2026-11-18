// Small pill badge — Spec Sec. 7.1 / 13. Colour role comes from the key.
export default function Badge({ badge }) {
  return <span className={`badge badge--${badge.key}`}>{badge.label}</span>;
}
