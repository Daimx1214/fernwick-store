# Fernwick & Co. — E-Commerce Product Catalog & Interactive Shopping Cart

A small, print-catalogue-feeling storefront built with **React 18 + Vite**,
**React Router v6**, **Context + useReducer**, and **plain CSS** with custom
properties. Product data comes from the public
[FakeStoreAPI](https://fakestoreapi.com). The store has a warm paper light
theme and a warm charcoal dark theme, a persistent slide-out cart, exact
integer-cent price math, a simulated two-step checkout, and login against the
FakeStoreAPI auth endpoint.

## Screenshots

<!-- Add screenshots before submission: store page in light mode and in dark mode. -->
- _Light mode: store page — (add screenshot)_
- _Dark mode: store page — (add screenshot)_

## Setup

```bash
npm install     # install dependencies
npm run dev     # start the dev server (Vite)
npm run build   # production build into dist/
npm run preview # preview the production build
npm test        # run the Vitest unit tests
```

No environment variables or API keys are needed — FakeStoreAPI is public.

**Try the demo login:** on the Login page, press “Use demo account” (public
sample credentials from the FakeStoreAPI docs: `mor_2314` / `83r5^_`), then
Log in. At checkout, the test card `4242 4242 4242 4242` passes validation.

## What it does

- **Catalogue** — all 20 products fetched once from `GET /products`, with
  loading skeletons, an error state with Retry, and a saved offline copy
  (`src/api/fallback-products.json`) that loads with a banner if the API
  stays unreachable.
- **Filtering** — category chips (All / Electronics / Jewelry / Clothing)
  with live counts, a 250 ms-debounced search over title + description, and
  sorting (featured, price ↑, price ↓, rating). Category and search are
  mirrored to the URL (`?cat=&q=`) so refresh and sharing work.
- **Product cards** — image on a light tile, star rating with half stars,
  up to two badges derived from real data (Top rated ≥ 4.5, Popular ≥ 300
  reviews, Under $25, Premium ≥ $200), and an Add button with a 900 ms
  “Added” state.
- **Cart drawer** — slides in from the right, focus-trapped, with quantity
  steppers (1–10; minus at 1 removes), a free-shipping progress bar at $100,
  clear-cart confirmation, and aria-live announcements. The cart persists in
  `localStorage` and syncs across tabs.
- **Checkout** — a login-gated modal: validated details form (including a
  Luhn check on the card), a 1.4 s simulated processing step, then a
  confirmation with an order number (`LK-YYMMDD-XXXX`) and a delivery
  estimate of today + 3 days. Orders are saved locally and listed on the
  Orders page. **Card data is never stored anywhere.**
- **Product page, login page, orders page, 404 page**, all in both themes.

## API endpoints used

| Endpoint | Use |
|---|---|
| `GET /products` | The whole catalogue (fetched once, filtered client-side) |
| `GET /products/{id}` | Fallback for a direct visit to a product not in the cached list |
| `GET /products/categories` | Documented; used to validate the category map |
| `POST /auth/login` | Login; returns a JWT whose `sub` claim is the user id |
| `GET /users` | Fallback lookup of the logged-in user's name after login |
| `GET /users/{id}` | Prefills the checkout name/email |
| `POST /carts` | Best-effort simulated order submit at checkout (result ignored) |

FakeStoreAPI is a mock backend: writes return believable responses but save
nothing, so orders live in the browser (`shop.orders.v1`).

## State design

Four small stores instead of one big one, each a Context + hook:

| Store | State | Persisted |
|---|---|---|
| Products (`useProducts` hook) | loading / success / error + items, module-level session cache | memory only (fallback JSON) |
| Cart (`CartContext` + `cartReducer`) | `{ items: [{id, title, price, image, category, qty}] }` | `shop.cart.v1` |
| UI (`UiContext`) | drawer open, checkout open, toast | no |
| Auth (`AuthContext`) | token, userId, username, firstName | `shop.auth.v1` |
| Theme (`ThemeContext`) | `light` / `dark` / `system` preference | `shop.theme` |

The cart is a pure reducer (`ADD`, `REMOVE`, `SET_QTY`, `INCREMENT`,
`DECREMENT`, `CLEAR`, `HYDRATE`). Cart lines store a **price snapshot** from
when the item was added; if the live catalogue price has since changed, the
drawer line shows a small “price updated” note but keeps the snapshot price.
Totals are always derived with `calculateTotal(items)` at render time, never
stored. Saved carts are validated line-by-line on `HYDRATE` — malformed lines
are dropped, never crash the app.

One API quirk drives the category map: the API spells the category
**`jewelery`** (one L). The UI label says “Jewelry”, the code value stays
`jewelery`, and “Clothing” combines the API's `men's clothing` and
`women's clothing`.

## Money rules

All money is integer cents internally (`toCents = Math.round(price * 100)`),
converted back only for display via `Intl.NumberFormat('en-US', USD)`.

- Subtotal = Σ price × qty
- Shipping = $0 for an empty cart or subtotal ≥ $100.00, otherwise $7.99
- Tax = 8% of the subtotal, rounded (`Math.round(subtotal × 0.08)`)
- Total = subtotal + shipping + tax

The two worked examples from the specification are unit tests:
2 × $109.95 + 1 × $22.30 → total **$261.58** (free shipping), and
1 × $22.30 → total **$32.07**.

## Tests

`npm test` runs Vitest over `src/state/cart.test.js`: reducer behaviour
(add / increment / cap at 10 / decrement-to-remove / SET_QTY clamping /
HYDRATE dropping bad data), `calculateTotal` (empty cart, both worked
examples, the exact $100 free-shipping boundary, and a 0.1 + 0.2 float
case), the category map (`jewelery` spelling, clothing combining two API
categories), and badge boundary values (4.5, 300, 25, 200).

## Known limitations

- FakeStoreAPI is a mock: logins use its public sample accounts, and orders
  placed here exist only in this browser's localStorage.
- Checkout is a simulation — the card form validates format (including Luhn)
  but no payment is processed and card details are never stored or sent.
- Product prices in an already-saved cart are snapshots; the catalogue is
  static sample data, so prices effectively never change in practice.
- The offline fallback catalogue is a snapshot of the API response taken at
  build time; it can drift if the API's sample data changes.

## What was learned

- Integer-cent money math removes an entire class of rounding bugs — the
  `0.1 + 0.2` test exists because float totals drift in real carts.
- A pure reducer makes cart behaviour trivially testable and makes features
  like cross-tab sync (`storage` event → `HYDRATE`) almost free.
- Theming with CSS custom properties means dark mode is a token swap, not a
  second stylesheet — but the tokens have to be designed in pairs from the
  start (the product image tile deliberately stays light in dark mode,
  because the product photos have white backgrounds).
- Real APIs have quirks (`jewelery`); checking the live response before
  writing the filter code saved a silent “Jewelry shows nothing” bug.
