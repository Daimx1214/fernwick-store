import { useCart } from '../state/CartContext.jsx';
import { formatMoney, toCents } from '../utils/money.js';
import QuantityStepper from './QuantityStepper.jsx';

// One cart line — Spec Sec. 8: 64px thumbnail on a light tile, clamped
// title, unit price, stepper, right-aligned line total, Remove button.
// Lines keep their price snapshot (Sec. 5.3); if the live catalogue price
// has moved since, a small 'price updated' note says so.
export default function CartLine({ line, livePrice }) {
  const { increment, decrement, removeFromCart } = useCart();
  const shortTitle = line.title.length > 42 ? `${line.title.slice(0, 42)}…` : line.title;
  const priceMoved = livePrice != null && livePrice !== line.price;

  return (
    <li className="cart-line">
      <span className="cart-line__thumb">
        <img src={line.image} alt="" width="64" height="64" loading="lazy" />
      </span>
      <div className="cart-line__main">
        <p className="cart-line__title" title={line.title}>
          {line.title}
        </p>
        <p className="cart-line__unit numbers">{formatMoney(toCents(line.price))} each</p>
        {priceMoved && (
          <p className="cart-line__note">
            Price updated in the catalogue to {formatMoney(toCents(livePrice))} — your cart
            keeps the price you saw.
          </p>
        )}
        <div className="cart-line__controls">
          <QuantityStepper
            qty={line.qty}
            label={shortTitle}
            onIncrement={() => increment(line.id)}
            onDecrement={() => decrement(line.id)}
          />
          <button
            type="button"
            className="cart-line__remove"
            onClick={() => removeFromCart(line.id)}
          >
            Remove
          </button>
        </div>
      </div>
      <p className="cart-line__total numbers">{formatMoney(toCents(line.price) * line.qty)}</p>
    </li>
  );
}
