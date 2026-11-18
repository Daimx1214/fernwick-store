// UI category -> API categories map — Spec Sec. 4.4.
// The API spells it 'jewelery' (one L). The UI label says 'Jewelry' but the
// code value must stay 'jewelery', otherwise filtering matches nothing.
// 'Clothing' in the UI is two API categories combined.

export const CATEGORY_MAP = {
  all: null,
  electronics: ['electronics'],
  jewelry: ['jewelery'], // API spelling — do not "fix"
  clothing: ["men's clothing", "women's clothing"],
};

export const CATEGORY_LABELS = {
  all: 'All',
  electronics: 'Electronics',
  jewelry: 'Jewelry',
  clothing: 'Clothing',
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_MAP);

// Reverse lookup for breadcrumbs / product page: API category -> UI key.
export function uiCategoryFor(apiCategory) {
  for (const key of CATEGORY_KEYS) {
    const list = CATEGORY_MAP[key];
    if (list && list.includes(apiCategory)) return key;
  }
  return 'all';
}
