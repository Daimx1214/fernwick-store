// Orders persistence — Spec Sec. 5 / 9.3. Orders live in shop.orders.v1
// and never contain card data — only the delivery + totals record.

import { readJSON, writeJSON } from './storage.js';

export const ORDERS_KEY = 'shop.orders.v1';

export function readOrders() {
  const list = readJSON(ORDERS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function addOrder(order) {
  const list = readOrders();
  list.unshift(order);
  writeJSON(ORDERS_KEY, list);
  return list;
}

// 'LK-' + YYMMDD + '-' + 4 random uppercase alphanumerics (Sec. 9.3).
export function makeOrderNumber(date = new Date()) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LK-${yy}${mm}${dd}-${suffix}`;
}
