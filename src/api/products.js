// Product endpoints — Spec Sec. 4.1 / Appendix A.3.

import { request } from './client.js';

export const getProducts = () => request('/products');

export const getProduct = (id) => request(`/products/${id}`);

export const getCategories = () => request('/products/categories');

// Documented alternative to client-side filtering (kept as a fallback).
export const getByCategory = (category) =>
  request(`/products/category/${encodeURIComponent(category)}`);
