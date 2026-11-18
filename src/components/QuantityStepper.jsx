import { MAX_QTY } from '../state/cartReducer.js';
import { MinusIcon, PlusIcon, TrashIcon } from './icons.jsx';

// Quantity stepper — Spec Sec. 6 / 8.
// Minus at qty 1 removes the line (trash icon). Plus disables at the max
// of 10 with an explanatory tooltip. Quantity changes are announced by the
// drawer's aria-live region.
export default function QuantityStepper({ qty, onIncrement, onDecrement, label = 'item' }) {
  const atMax = qty >= MAX_QTY;
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper__btn"
        onClick={onDecrement}
        aria-label={qty === 1 ? `Remove ${label} from cart` : `Decrease quantity of ${label}`}
      >
        {qty === 1 ? <TrashIcon size={15} /> : <MinusIcon size={15} />}
      </button>
      <span className="stepper__qty numbers" aria-label={`Quantity ${qty}`}>
        {qty}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={onIncrement}
        disabled={atMax}
        title={atMax ? 'Maximum 10 per item' : undefined}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon size={15} />
      </button>
    </div>
  );
}
