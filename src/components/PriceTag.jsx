import { formatMoney, toCents } from '../utils/money.js';

// Price display — converts dollars to cents once, formats via Intl (Sec. 6).
export default function PriceTag({ price, className = '' }) {
  return <span className={`price numbers ${className}`}>{formatMoney(toCents(price))}</span>;
}
