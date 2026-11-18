import { useEffect } from 'react';

// Locks body scroll while `locked` is true (drawer / modal open) — Sec. 8/15.
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
