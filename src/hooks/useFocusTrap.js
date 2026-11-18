import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Focus trap for the drawer and modal — Spec Sec. 8 / 15.
// On activate: focus moves to `initialFocusRef` (or the first focusable
// element). Tab / Shift+Tab cycle inside the container. On deactivate,
// focus returns to the element that had it before.
export function useFocusTrap(active, initialFocusRef) {
  const containerRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    restoreRef.current = document.activeElement;

    const focusables = () => Array.from(container.querySelectorAll(FOCUSABLE));
    const initial = initialFocusRef?.current || focusables()[0];
    if (initial) initial.focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (restoreRef.current && typeof restoreRef.current.focus === 'function') {
        restoreRef.current.focus();
      }
    };
  }, [active, initialFocusRef]);

  return containerRef;
}
