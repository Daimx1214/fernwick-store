// Simulated order submit — Spec Sec. 4.2 / 9.3 / Appendix A.3.
// FakeStoreAPI echoes the cart back with an id but saves nothing; checkout
// treats this as best-effort and never lets its failure block an order.

import { request } from './client.js';

export const postCart = (userId, lines) =>
  request('/carts', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      date: new Date().toISOString().slice(0, 10),
      products: lines.map((l) => ({ productId: l.id, quantity: l.qty })),
    }),
  });
