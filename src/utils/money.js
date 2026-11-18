// Money helpers — Spec Sec. 6 / Appendix A.1.
// All money is handled as integer cents internally; conversion back to
// dollars happens only at display time, so 0.1 + 0.2 style float drift
// can never reach a total.

export const toCents = (price) => Math.round(Number(price) * 100);

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (cents) => fmt.format(cents / 100);
