import { formatMoney } from '../utils/money.js';
import { FREE_SHIPPING_AT } from '../state/cartReducer.js';

// Order totals block — Spec Sec. 8 / 9.2. Shared by the cart drawer and
// the checkout modal so both always show identical math. With
// `showProgress`, renders the free-shipping progress bar (Sec. 6).
export default function OrderSummary({ totals, showProgress = false }) {
  const { subtotalCents, shippingCents, taxCents, totalCents } = totals;
  const remaining = FREE_SHIPPING_AT - subtotalCents;
  const progress = Math.min(100, Math.round((subtotalCents / FREE_SHIPPING_AT) * 100));

  return (
    <div className="summary">
      {showProgress && subtotalCents > 0 && (
        <div className="ship-progress">
          {remaining > 0 ? (
            <p className="ship-progress__text">
              Add <strong className="numbers">{formatMoney(remaining)}</strong> more for free
              shipping
            </p>
          ) : (
            <p className="ship-progress__text ship-progress__text--done">
              Free shipping unlocked
            </p>
          )}
          <div
            className="ship-progress__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Progress to free shipping"
          >
            <div
              className={`ship-progress__fill${remaining <= 0 ? ' ship-progress__fill--done' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <dl className="summary__rows">
        <div className="summary__row">
          <dt>Subtotal</dt>
          <dd className="numbers">{formatMoney(subtotalCents)}</dd>
        </div>
        <div className="summary__row">
          <dt>Shipping</dt>
          <dd className={`numbers${shippingCents === 0 && subtotalCents > 0 ? ' summary__free' : ''}`}>
            {subtotalCents > 0 && shippingCents === 0 ? 'FREE' : formatMoney(shippingCents)}
          </dd>
        </div>
        <div className="summary__row">
          <dt>Tax (8%)</dt>
          <dd className="numbers">{formatMoney(taxCents)}</dd>
        </div>
        <div className="summary__row summary__row--total">
          <dt>Total</dt>
          <dd className="numbers">{formatMoney(totalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
