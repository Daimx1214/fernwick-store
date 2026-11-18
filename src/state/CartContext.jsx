import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { cartReducer, calculateTotal, initialCartState, MAX_QTY } from './cartReducer.js';
import { readJSON, writeJSON } from '../utils/storage.js';
import { useUi } from './UiContext.jsx';

// Cart provider — Spec Sec. 5 / 8.
// Persists to localStorage (shop.cart.v1), restores through HYDRATE
// validation, and stays in sync across tabs via the 'storage' event.
const CartContext = createContext(null);
export const CART_KEY = 'shop.cart.v1';

function initCart() {
  const saved = readJSON(CART_KEY, null);
  if (!saved) return initialCartState;
  return cartReducer(initialCartState, { type: 'HYDRATE', saved });
}

export function CartProvider({ children }) {
  const { showToast, openDrawer } = useUi();
  // Restore synchronously through the reducer's HYDRATE validation.
  const [state, dispatch] = useReducer(cartReducer, undefined, initCart);

  // Persist on every change.
  useEffect(() => {
    writeJSON(CART_KEY, state);
  }, [state]);

  // Cross-tab sync: another tab changed the cart -> adopt its state.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== CART_KEY) return;
      try {
        const saved = e.newValue ? JSON.parse(e.newValue) : { items: [] };
        dispatch({ type: 'HYDRATE', saved });
      } catch {
        /* malformed value from another tab — ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const totals = useMemo(() => calculateTotal(state.items), [state.items]);

  const addToCart = useCallback(
    (product) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing && existing.qty >= MAX_QTY) {
        showToast('Maximum 10 per item');
        return false;
      }
      dispatch({ type: 'ADD', product });
      showToast('Added to cart');
      return true;
    },
    [state.items, showToast]
  );

  // Add several units at once (product page quantity picker).
  const addToCartWithQty = useCallback(
    (product, qty) => {
      const existing = state.items.find((i) => i.id === product.id);
      const room = MAX_QTY - (existing ? existing.qty : 0);
      if (room <= 0) {
        showToast('Maximum 10 per item');
        return false;
      }
      const n = Math.min(qty, room);
      for (let i = 0; i < n; i += 1) dispatch({ type: 'ADD', product });
      showToast('Added to cart');
      return true;
    },
    [state.items, showToast]
  );

  const removeFromCart = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const updateQuantity = useCallback(
    (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
    []
  );
  const increment = useCallback((id) => dispatch({ type: 'INCREMENT', id }), []);
  const decrement = useCallback((id) => dispatch({ type: 'DECREMENT', id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = useMemo(
    () => ({
      items: state.items,
      totals,
      addToCart,
      addToCartWithQty,
      removeFromCart,
      updateQuantity,
      increment,
      decrement,
      clearCart,
      openDrawer,
    }),
    [state.items, totals, addToCart, addToCartWithQty, removeFromCart, updateQuantity, increment, decrement, clearCart, openDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
