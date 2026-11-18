import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { readOrders } from '../utils/orders.js';
import { formatMoney, toCents } from '../utils/money.js';
import { useAuth } from '../state/AuthContext.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import EmptyState from '../components/EmptyState.jsx';

// Orders page — Spec Sec. 7.4. Reads shop.orders.v1 (login required via
// RequireAuth). Status is derived from age: 'Processing' for the first
// minute after ordering, then 'Confirmed'.
function statusFor(isoDate) {
  const ageMs = Date.now() - new Date(isoDate).getTime();
  return ageMs < 60 * 1000 ? 'Processing' : 'Confirmed';
}

export default function Orders() {
  const [orders] = useState(() => readOrders());
  const [openId, setOpenId] = useState(null);
  const { logout, firstName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="container page">
      <div className="orders-head">
        <div>
          <h1 className="page-title">My orders</h1>
          {firstName && <p className="orders-head__sub">Signed in as {firstName}</p>}
        </div>
        <button type="button" className="btn btn--secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          text="When you place an order it will be shelved here, receipt and all."
          actionLabel="Shop now"
          onAction={() => navigate('/')}
        />
      ) : (
        <ul className="orders">
          {orders.map((order) => {
            const open = openId === order.orderNo;
            return (
              <li key={order.orderNo} className="order-card">
                <div className="order-card__head">
                  <div>
                    <p className="order-card__no numbers">{order.orderNo}</p>
                    <p className="order-card__date">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="order-card__thumbs" aria-hidden="true">
                    {order.lines.slice(0, 4).map((l) => (
                      <img key={l.id} src={l.image} alt="" width="40" height="40" loading="lazy" />
                    ))}
                  </span>
                  <p className="order-card__total numbers">
                    {formatMoney(order.totals.totalCents)}
                  </p>
                  <span
                    className={`status-chip status-chip--${statusFor(order.date).toLowerCase()}`}
                  >
                    {statusFor(order.date)}
                  </span>
                  <button
                    type="button"
                    className="text-btn"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : order.orderNo)}
                  >
                    {open ? 'Hide details' : 'View details'}
                  </button>
                </div>
                {open && (
                  <div className="order-card__details">
                    <ul className="order-card__lines">
                      {order.lines.map((l) => (
                        <li key={l.id}>
                          <span>
                            {l.title} × {l.qty}
                          </span>
                          <span className="numbers">
                            {formatMoney(toCents(l.price) * l.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <OrderSummary totals={order.totals} />
                    <p className="order-card__address">
                      Deliver to: {order.customer.fullName}, {order.customer.address},{' '}
                      {order.customer.city} {order.customer.postalCode}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="orders-note">
        Orders here are simulated for this demo storefront. <Link to="/">Back to the shop</Link>
      </p>
    </main>
  );
}
