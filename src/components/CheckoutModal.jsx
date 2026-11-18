import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import { postCart } from '../api/carts.js';
import { getUser } from '../api/auth.js';
import { addOrder, makeOrderNumber } from '../utils/orders.js';
import { formatMoney, toCents } from '../utils/money.js';
import OrderSummary from './OrderSummary.jsx';
import { CheckIcon, CloseIcon, LockIcon } from './icons.jsx';

// Checkout modal — Spec Sec. 9. Two steps: a validated details form, then
// a simulated processing pause and the confirmation. Card data is never
// stored anywhere; the order record keeps lines + totals only.

const emptyForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

function luhnValid(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validate(form) {
  const errors = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (!form.address.trim()) errors.address = 'Please enter your address.';
  if (!form.city.trim()) errors.city = 'Please enter your city.';
  const postal = form.postalCode.trim();
  if (postal.length < 4 || postal.length > 10)
    errors.postalCode = 'Postal code must be 4–10 characters.';
  const digits = form.cardNumber.replace(/\D/g, '');
  if (digits.length !== 16 || !luhnValid(digits))
    errors.cardNumber = 'Please enter a valid 16-digit card number.';
  const m = form.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) {
    errors.expiry = 'Use MM/YY.';
  } else {
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    const now = new Date();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    if (month < 1 || month > 12) errors.expiry = 'Month must be 01–12.';
    else if (endOfMonth < now) errors.expiry = 'This card has expired.';
  }
  if (!/^\d{3}$/.test(form.cvc.trim())) errors.cvc = 'CVC must be 3 digits.';
  return errors;
}

export default function CheckoutModal() {
  const { items, totals, clearCart } = useCart();
  const { checkoutOpen, closeCheckout } = useUi();
  const { userId, firstName } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // form | processing | done
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [order, setOrder] = useState(null);
  const openedTotals = useRef(null);
  const firstFieldRef = useRef(null);
  const trapRef = useFocusTrap(checkoutOpen && step === 'form', firstFieldRef);

  useLockBodyScroll(checkoutOpen);

  // On open: reset, snapshot the totals the shopper saw in the drawer, and
  // prefill the name from the account record when we can (Sec. 9.2).
  useEffect(() => {
    if (!checkoutOpen) return;
    setStep('form');
    setErrors({});
    setTouched({});
    setOrder(null);
    openedTotals.current = totals;
    setForm((f) => ({ ...emptyForm, fullName: f.fullName || '' }));
    if (userId != null) {
      getUser(userId)
        .then((u) => {
          const name = [u?.name?.firstname, u?.name?.lastname]
            .filter(Boolean)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');
          if (name) setForm((f) => (f.fullName ? f : { ...f, fullName: name }));
          if (u?.email) setForm((f) => (f.email ? f : { ...f, email: u.email }));
        })
        .catch(() => {
          /* prefill is best-effort */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && checkoutOpen && step !== 'processing') closeCheckout();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [checkoutOpen, step, closeCheckout]);

  const totalsChanged =
    step === 'form' &&
    openedTotals.current &&
    openedTotals.current.totalCents !== totals.totalCents;

  const deliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [order]);

  if (!checkoutOpen) return null;

  const setField = (name, value) => {
    let v = value;
    if (name === 'cardNumber') v = formatCardNumber(value);
    if (name === 'expiry') v = formatExpiry(value);
    if (name === 'cvc') v = value.replace(/\D/g, '').slice(0, 3);
    setForm((f) => ({ ...f, [name]: v }));
  };

  const blurField = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  const placeOrder = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({
      fullName: true, email: true, address: true, city: true,
      postalCode: true, cardNumber: true, expiry: true, cvc: true,
    });
    const firstBad = Object.keys(errs)[0];
    if (firstBad) {
      document.getElementById(`co-${firstBad}`)?.focus();
      return;
    }
    setStep('processing');
    const orderTotals = totals;
    const orderLines = items.map((l) => ({ ...l }));
    const customer = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
    };
    // Simulated submit to the API — best effort, never blocks success.
    if (userId != null) {
      postCart(userId, orderLines).catch(() => {});
    }
    setTimeout(() => {
      const record = {
        orderNo: makeOrderNumber(),
        date: new Date().toISOString(),
        lines: orderLines,
        totals: orderTotals,
        customer,
      };
      addOrder(record);
      setOrder(record);
      clearCart();
      setForm(emptyForm);
      setStep('done');
    }, 1400);
  };

  const closeAndReset = () => {
    closeCheckout();
    if (step === 'done') navigate('/');
  };

  return (
    <>
      <div className="overlay open" onClick={step !== 'processing' ? closeAndReset : undefined} aria-hidden="true" />
      <div
        ref={trapRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="modal__header">
          <h2 id="checkout-title" className="modal__title">
            {step === 'done' ? 'Order confirmed' : 'Checkout'}
          </h2>
          {step !== 'processing' && (
            <button type="button" className="icon-btn" onClick={closeAndReset} aria-label="Close checkout">
              <CloseIcon />
            </button>
          )}
        </div>

        {step === 'done' && order ? (
          <div className="confirm">
            <span className="confirm__check">
              <CheckIcon size={30} />
            </span>
            <h3 className="confirm__title">Thank you{firstName ? `, ${firstName}` : ''}</h3>
            <p className="confirm__text">
              Order <strong className="numbers">{order.orderNo}</strong> is on the books.
              Estimated delivery: <strong>{deliveryDate}</strong>.
            </p>
            <ul className="confirm__items">
              {order.lines.map((l) => (
                <li key={l.id}>
                  <span>
                    {l.title} × {l.qty}
                  </span>
                  <span className="numbers">{formatMoney(toCents(l.price) * l.qty)}</span>
                </li>
              ))}
            </ul>
            <OrderSummary totals={order.totals} />
            <div className="confirm__actions">
              <button type="button" className="btn btn--primary" onClick={closeAndReset}>
                Continue shopping
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  closeCheckout();
                  navigate('/orders');
                }}
              >
                View orders
              </button>
            </div>
          </div>
        ) : step === 'processing' ? (
          <div className="processing" role="status">
            <span className="spinner spinner--large" aria-hidden="true" />
            <p>Processing…</p>
            <p className="processing__note">Simulated checkout — no real payment is taken.</p>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={placeOrder} noValidate>
            <div className="checkout-form__main">
              <Field
                id="co-fullName" label="Full name" error={fieldError('fullName')}
                inputRef={firstFieldRef}
                inputProps={{
                  value: form.fullName, autoComplete: 'name',
                  onChange: (e) => setField('fullName', e.target.value),
                  onBlur: () => blurField('fullName'),
                }}
              />
              <Field
                id="co-email" label="Email" error={fieldError('email')}
                inputProps={{
                  type: 'email', value: form.email, autoComplete: 'email',
                  onChange: (e) => setField('email', e.target.value),
                  onBlur: () => blurField('email'),
                }}
              />
              <Field
                id="co-address" label="Address" error={fieldError('address')}
                inputProps={{
                  value: form.address, autoComplete: 'street-address',
                  onChange: (e) => setField('address', e.target.value),
                  onBlur: () => blurField('address'),
                }}
              />
              <div className="checkout-form__row">
                <Field
                  id="co-city" label="City" error={fieldError('city')}
                  inputProps={{
                    value: form.city, autoComplete: 'address-level2',
                    onChange: (e) => setField('city', e.target.value),
                    onBlur: () => blurField('city'),
                  }}
                />
                <Field
                  id="co-postalCode" label="Postal code" error={fieldError('postalCode')}
                  inputProps={{
                    value: form.postalCode, autoComplete: 'postal-code',
                    onChange: (e) => setField('postalCode', e.target.value),
                    onBlur: () => blurField('postalCode'),
                  }}
                />
              </div>
              <Field
                id="co-cardNumber" label="Card number" error={fieldError('cardNumber')}
                hint="Test mode, no real payment. Use 4242 4242 4242 4242"
                inputProps={{
                  value: form.cardNumber, inputMode: 'numeric', autoComplete: 'cc-number',
                  placeholder: '4242 4242 4242 4242',
                  onChange: (e) => setField('cardNumber', e.target.value),
                  onBlur: () => blurField('cardNumber'),
                }}
              />
              <div className="checkout-form__row">
                <Field
                  id="co-expiry" label="Expiry" error={fieldError('expiry')}
                  inputProps={{
                    value: form.expiry, inputMode: 'numeric', autoComplete: 'cc-exp',
                    placeholder: 'MM/YY',
                    onChange: (e) => setField('expiry', e.target.value),
                    onBlur: () => blurField('expiry'),
                  }}
                />
                <Field
                  id="co-cvc" label="CVC" error={fieldError('cvc')}
                  inputProps={{
                    value: form.cvc, inputMode: 'numeric', autoComplete: 'cc-csc',
                    placeholder: '123',
                    onChange: (e) => setField('cvc', e.target.value),
                    onBlur: () => blurField('cvc'),
                  }}
                />
              </div>
              <p className="checkout-form__secure">
                <LockIcon /> Simulated checkout — your card details never leave this page and are
                never stored.
              </p>
            </div>
            <aside className="checkout-form__side">
              {totalsChanged && (
                <p className="notice" role="status">
                  Prices were updated since you opened checkout — the totals below are current.
                </p>
              )}
              <OrderSummary totals={totals} />
              <button type="submit" className="btn btn--checkout">
                Place order
              </button>
            </aside>
          </form>
        )}
      </div>
    </>
  );
}

function Field({ id, label, error, hint, inputProps, inputRef }) {
  const name = id.replace('co-', '');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        ref={inputRef}
        className={error ? 'input input--invalid' : 'input'}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...inputProps}
      />
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
