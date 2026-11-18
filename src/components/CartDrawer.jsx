import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import CartLine from './CartLine.jsx';
import OrderSummary from './OrderSummary.jsx';
import { BagIcon, CloseIcon } from './icons.jsx';

// Cart drawer — Spec Sec. 8. Slides from the right (420px), focus is
// trapped, body scroll locks, Escape / overlay click close it, and
// quantity changes are announced through an aria-live region.
export default function CartDrawer() {
  const { items, totals, clearCart } = useCart();
  const { items: catalogue } = useProducts();
  const { drawerOpen, closeDrawer, openCheckout } = useUi();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const closeRef = useRef(null);
  const trapRef = useFocusTrap(drawerOpen, closeRef);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const firstTotals = useRef(true);

  useLockBodyScroll(drawerOpen);

  useEffect(() => {
    if (!drawerOpen) setConfirmingClear(false);
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  // Announce quantity changes politely while the drawer is open.
  useEffect(() => {
    if (firstTotals.current) {
      firstTotals.current = false;
      return;
    }
    if (drawerOpen) {
      setAnnouncement(
        totals.itemCount === 0
          ? 'Your cart is now empty.'
          : `Cart updated: ${totals.itemCount} item${totals.itemCount === 1 ? '' : 's'} in your cart.`
      );
    }
  }, [totals.itemCount, drawerOpen]);

  const handleCheckout = () => {
    closeDrawer();
    if (!isLoggedIn) {
      navigate('/login?next=checkout');
    } else {
      openCheckout();
    }
  };

  const empty = items.length === 0;

  return (
    <>
      <div
        className={`overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        ref={trapRef}
        className={`drawer${drawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen ? '' : undefined}
      >
        <div className="drawer__header">
          <h2 id="drawer-title" className="drawer__title">
            Your cart{' '}
            <span className="drawer__count numbers">
              ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button
            type="button"
            ref={closeRef}
            className="icon-btn"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>

        {empty ? (
          <div className="drawer__empty">
            <BagIcon />
            <p className="drawer__empty-title">Your cart is empty</p>
            <p className="drawer__empty-text">
              Nothing on the trolley yet. The shelves, however, are full.
            </p>
            <button type="button" className="btn btn--primary" onClick={closeDrawer}>
              Browse products
            </button>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {items.map((line) => (
                <CartLine
                  key={line.id}
                  line={line}
                  livePrice={catalogue.find((p) => p.id === line.id)?.price}
                />
              ))}
            </ul>
            <div className="drawer__footer">
              <OrderSummary totals={totals} showProgress />
              <button type="button" className="btn btn--checkout" onClick={handleCheckout}>
                Checkout
              </button>
              <div className="drawer__links">
                <button type="button" className="text-btn" onClick={closeDrawer}>
                  Continue shopping
                </button>
                {confirmingClear ? (
                  <span className="drawer__confirm">
                    Clear everything?
                    <button
                      type="button"
                      className="text-btn text-btn--danger"
                      onClick={() => {
                        clearCart();
                        setConfirmingClear(false);
                      }}
                    >
                      Yes, clear
                    </button>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => setConfirmingClear(false)}
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setConfirmingClear(true)}
                  >
                    Clear cart
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
