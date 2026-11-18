// Cart state: pure reducer + the required helper functions — Spec Sec. 5/6,
// Appendix A.1/A.2. Cart lines store a price snapshot from the moment the
// item was added, so a later catalogue change never rewrites a shopper's cart.

import { toCents } from '../utils/money.js';

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_AT = 10000; // cents ($100.00)
export const SHIPPING_FLAT = 799; // cents ($7.99)
export const MAX_QTY = 10;

export const initialCartState = { items: [] };

const clamp = (n) => Math.min(MAX_QTY, Math.max(1, n));

function sanitize(saved) {
  const list = Array.isArray(saved?.items) ? saved.items : [];
  return list
    .filter(
      (i) =>
        i &&
        Number.isInteger(i.id) &&
        typeof i.title === 'string' &&
        Number.isFinite(i.price) &&
        Number.isInteger(i.qty) &&
        i.qty > 0
    )
    .map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      image: typeof i.image === 'string' ? i.image : '',
      category: typeof i.category === 'string' ? i.category : '',
      qty: clamp(i.qty),
    }));
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const p = action.product;
      const found = state.items.find((i) => i.id === p.id);
      if (found) {
        return {
          items: state.items.map((i) =>
            i.id === p.id ? { ...i, qty: clamp(i.qty + 1) } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { id: p.id, title: p.title, price: p.price, image: p.image, category: p.category, qty: 1 },
        ],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'SET_QTY': {
      const q = Number(action.qty);
      if (!Number.isFinite(q)) return state;
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: clamp(Math.floor(q)) } : i
        ),
      };
    }
    case 'INCREMENT':
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: clamp(i.qty + 1) } : i
        ),
      };
    case 'DECREMENT':
      return {
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
      };
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: sanitize(action.saved) };
    default:
      return state;
  }
}

// ---- Required helper API (Spec R9) -------------------------------------
// These are pure dispatch-free helpers over a state value, so they can be
// unit-tested directly; CartContext wraps them with dispatch.

export function addToCart(state, product) {
  return cartReducer(state, { type: 'ADD', product });
}

export function removeFromCart(state, id) {
  return cartReducer(state, { type: 'REMOVE', id });
}

export function updateQuantity(state, id, qty) {
  return cartReducer(state, { type: 'SET_QTY', id, qty });
}

export function calculateTotal(items) {
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const subtotalCents = items.reduce((sum, i) => sum + toCents(i.price) * i.qty, 0);
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return {
    itemCount,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
  };
}
