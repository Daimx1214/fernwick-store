import { describe, it, expect } from 'vitest';
import {
  cartReducer,
  calculateTotal,
  addToCart,
  removeFromCart,
  updateQuantity,
  initialCartState,
  MAX_QTY,
} from './cartReducer.js';
import { CATEGORY_MAP } from '../utils/categories.js';
import { getBadges } from '../utils/badges.js';
import { toCents } from '../utils/money.js';

const backpack = { id: 1, title: 'Backpack', price: 109.95, image: 'a.jpg', category: "men's clothing" };
const tshirt = { id: 2, title: 'T-Shirt', price: 22.3, image: 'b.jpg', category: "men's clothing" };

describe('cartReducer', () => {
  it('ADD adds a new line with qty 1 and a price snapshot', () => {
    const s = cartReducer(initialCartState, { type: 'ADD', product: backpack });
    expect(s.items).toHaveLength(1);
    expect(s.items[0]).toMatchObject({ id: 1, price: 109.95, qty: 1 });
  });

  it('ADD on an existing id increments instead of duplicating', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', product: backpack });
    s = cartReducer(s, { type: 'ADD', product: backpack });
    expect(s.items).toHaveLength(1);
    expect(s.items[0].qty).toBe(2);
  });

  it('quantity is capped at 10', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', product: backpack });
    for (let i = 0; i < 15; i += 1) s = cartReducer(s, { type: 'INCREMENT', id: 1 });
    expect(s.items[0].qty).toBe(MAX_QTY);
    s = cartReducer(s, { type: 'ADD', product: backpack });
    expect(s.items[0].qty).toBe(MAX_QTY);
  });

  it('DECREMENT at qty 1 removes the line', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', product: backpack });
    s = cartReducer(s, { type: 'DECREMENT', id: 1 });
    expect(s.items).toHaveLength(0);
  });

  it('SET_QTY clamps into 1..10 and ignores NaN', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', product: backpack });
    s = cartReducer(s, { type: 'SET_QTY', id: 1, qty: 99 });
    expect(s.items[0].qty).toBe(10);
    s = cartReducer(s, { type: 'SET_QTY', id: 1, qty: 0 });
    expect(s.items[0].qty).toBe(1);
    const before = s;
    s = cartReducer(s, { type: 'SET_QTY', id: 1, qty: 'abc' });
    expect(s).toBe(before);
  });

  it('REMOVE and CLEAR empty the cart as expected', () => {
    let s = addToCart(initialCartState, backpack);
    s = addToCart(s, tshirt);
    s = removeFromCart(s, 1);
    expect(s.items.map((i) => i.id)).toEqual([2]);
    s = cartReducer(s, { type: 'CLEAR' });
    expect(s.items).toHaveLength(0);
  });

  it('updateQuantity helper dispatches SET_QTY semantics', () => {
    let s = addToCart(initialCartState, backpack);
    s = updateQuantity(s, 1, 4);
    expect(s.items[0].qty).toBe(4);
  });

  it('HYDRATE drops malformed lines and clamps quantities', () => {
    const saved = {
      items: [
        { id: 3, title: 'Good', price: 10, image: '', category: 'electronics', qty: 25 },
        { id: 'x', title: 'Bad id', price: 10, qty: 1 },
        { id: 4, title: 42, price: 10, qty: 1 },
        { id: 5, title: 'Bad price', price: NaN, qty: 1 },
        { id: 6, title: 'Zero qty', price: 10, qty: 0 },
        null,
      ],
    };
    const s = cartReducer(initialCartState, { type: 'HYDRATE', saved });
    expect(s.items).toHaveLength(1);
    expect(s.items[0]).toMatchObject({ id: 3, qty: 10 });
  });

  it('HYDRATE with garbage state yields an empty cart, never a crash', () => {
    expect(cartReducer(initialCartState, { type: 'HYDRATE', saved: null }).items).toEqual([]);
    expect(cartReducer(initialCartState, { type: 'HYDRATE', saved: 'junk' }).items).toEqual([]);
  });
});

describe('calculateTotal', () => {
  it('empty cart is all zeros', () => {
    expect(calculateTotal([])).toEqual({
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });

  it('worked example 1: 2 x 109.95 + 1 x 22.30 (free shipping)', () => {
    const items = [
      { price: 109.95, qty: 2 },
      { price: 22.3, qty: 1 },
    ];
    const t = calculateTotal(items);
    expect(t.subtotalCents).toBe(24220);
    expect(t.shippingCents).toBe(0);
    expect(t.taxCents).toBe(1938); // round(24220 * 0.08) = round(1937.6)
    expect(t.totalCents).toBe(26158);
    expect(t.itemCount).toBe(3);
  });

  it('worked example 2: 1 x 22.30 (paid shipping)', () => {
    const t = calculateTotal([{ price: 22.3, qty: 1 }]);
    expect(t.subtotalCents).toBe(2230);
    expect(t.shippingCents).toBe(799);
    expect(t.taxCents).toBe(178); // round(2230 * 0.08) = round(178.4)
    expect(t.totalCents).toBe(3207);
  });

  it('free shipping starts at exactly 10000 cents', () => {
    const at = calculateTotal([{ price: 100, qty: 1 }]);
    expect(at.subtotalCents).toBe(10000);
    expect(at.shippingCents).toBe(0);
    const below = calculateTotal([{ price: 99.99, qty: 1 }]);
    expect(below.subtotalCents).toBe(9999);
    expect(below.shippingCents).toBe(799);
  });

  it('0.1 + 0.2 float case stays exact in cents', () => {
    expect(toCents(0.1) + toCents(0.2)).toBe(30);
    const t = calculateTotal([
      { price: 0.1, qty: 1 },
      { price: 0.2, qty: 1 },
      { price: 0.3, qty: 1 },
    ]);
    expect(t.subtotalCents).toBe(60);
  });
});

describe('categories map', () => {
  it("keeps the API spelling 'jewelery'", () => {
    expect(CATEGORY_MAP.jewelry).toEqual(['jewelery']);
  });

  it('clothing combines men\'s and women\'s', () => {
    expect(CATEGORY_MAP.clothing).toEqual(["men's clothing", "women's clothing"]);
  });

  it('all maps to null (no filtering)', () => {
    expect(CATEGORY_MAP.all).toBeNull();
  });
});

describe('badges', () => {
  const base = { price: 50, rating: { rate: 4.0, count: 100 } };

  it('rate exactly 4.5 earns Top rated; 4.49 does not', () => {
    expect(getBadges({ ...base, rating: { rate: 4.5, count: 0 } }).map((b) => b.key)).toContain('top');
    expect(getBadges({ ...base, rating: { rate: 4.49, count: 0 } })).toHaveLength(0);
  });

  it('count exactly 300 earns Popular; 299 does not', () => {
    expect(getBadges({ ...base, rating: { rate: 4.0, count: 300 } }).map((b) => b.key)).toContain('popular');
    expect(getBadges({ ...base, rating: { rate: 4.0, count: 299 } })).toHaveLength(0);
  });

  it('price boundary: 24.99 is Under $25, exactly 25 is not', () => {
    expect(getBadges({ ...base, price: 24.99 }).map((b) => b.key)).toContain('value');
    expect(getBadges({ ...base, price: 25 })).toHaveLength(0);
  });

  it('price boundary: exactly 200 is Premium, 199.99 is not', () => {
    expect(getBadges({ ...base, price: 200 }).map((b) => b.key)).toContain('premium');
    expect(getBadges({ ...base, price: 199.99 })).toHaveLength(0);
  });

  it('never returns more than two badges, in rule order', () => {
    const badges = getBadges({ price: 10, rating: { rate: 4.9, count: 500 } });
    expect(badges.map((b) => b.key)).toEqual(['top', 'popular']);
  });
});
