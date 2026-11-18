// Hand-written inline SVG icons (Sec. 2) — stroke currentColor so they
// follow the theme tokens. All decorative: aria-hidden.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const CartIcon = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 4h2l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2L21 8H6" />
    <circle cx="10" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="21" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const SearchIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const SunIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
  </svg>
);

export const UserIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-3.6 4.5-5.4 8-5.4s6.5 1.8 8 5.4" />
  </svg>
);

export const TrashIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
  </svg>
);

export const PlusIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const LockIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const BagIcon = ({ size = 56 }) => (
  <svg {...base} strokeWidth={1.2} width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 8h14l-1.2 12.1a1.5 1.5 0 0 1-1.5 1.4H7.7a1.5 1.5 0 0 1-1.5-1.4L5 8Z" />
    <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" />
  </svg>
);

export const EyeIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 4l16 16" />
    <path d="M10.6 6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.1 9.5 6.1a17.6 17.6 0 0 1-3.2 3.5M6.6 8A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.3 3.3-.7" />
  </svg>
);
