import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// UI store — Spec Sec. 5: drawer open, checkout open, and the current toast.
// Toasts auto-dismiss after 3s (Sec. 13) and are announced via aria-live.
const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // The store page slots its search box into the navbar centre (Sec. 7.1).
  const [navbarSearch, setNavbarSearch] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const value = useMemo(
    () => ({
      drawerOpen,
      checkoutOpen,
      toast,
      navbarSearch,
      setNavbarSearch,
      showToast,
      openDrawer,
      closeDrawer,
      openCheckout,
      closeCheckout,
    }),
    [drawerOpen, checkoutOpen, toast, navbarSearch, showToast, openDrawer, closeDrawer, openCheckout, closeCheckout]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside UiProvider');
  return ctx;
}
