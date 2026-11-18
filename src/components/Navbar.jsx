import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { CartIcon, UserIcon } from './icons.jsx';

// Navbar — Spec Sec. 7.1 / 13: sticky 64px surface bar, serif wordmark,
// theme toggle, account button, cart button with quantity bubble that
// bumps on change. The store page slots its search box into the centre
// via UiContext (hidden below 768px, where it becomes its own row).
export default function Navbar() {
  const { totals, openDrawer } = useCart();
  const { isLoggedIn, firstName } = useAuth();
  const { navbarSearch } = useUi();
  const navigate = useNavigate();
  const [bump, setBump] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 200);
    return () => clearTimeout(t);
  }, [totals.itemCount]);

  const badgeLabel = totals.itemCount > 9 ? '9+' : String(totals.itemCount);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="wordmark" aria-label="Fernwick and Co. — home">
          Fernwick <span className="wordmark__amp">&amp;</span> Co.
        </Link>
        {navbarSearch && <div className="navbar__search">{navbarSearch}</div>}
        <div className="navbar__actions">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn navbar__user"
            onClick={() => navigate(isLoggedIn ? '/orders' : '/login')}
            aria-label={isLoggedIn ? `Your orders${firstName ? `, ${firstName}` : ''}` : 'Log in'}
            title={isLoggedIn ? 'My orders' : 'Log in'}
          >
            <UserIcon />
            {isLoggedIn && firstName && <span className="navbar__username">{firstName}</span>}
          </button>
          <button
            type="button"
            className="icon-btn navbar__cart"
            onClick={openDrawer}
            aria-label={`Open cart, ${totals.itemCount} items`}
          >
            <CartIcon />
            {totals.itemCount > 0 && (
              <span className={`cart-badge numbers${bump ? ' cart-badge--bump' : ''}`}>
                {badgeLabel}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
