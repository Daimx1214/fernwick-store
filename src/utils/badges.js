// Derived product badges — Spec Sec. 7.1 / Appendix A.4.
// Badges come only from real product data (the API has no discount field,
// so there are no invented 'SALE' badges). At most two, in this order.

export function getBadges(p) {
  const out = [];
  if (p.rating && p.rating.rate >= 4.5) out.push({ key: 'top', label: 'Top rated' });
  if (p.rating && p.rating.count >= 300) out.push({ key: 'popular', label: 'Popular' });
  if (p.price < 25) out.push({ key: 'value', label: 'Under $25' });
  if (p.price >= 200) out.push({ key: 'premium', label: 'Premium' });
  return out.slice(0, 2);
}
