// Auth + user endpoints — Spec Sec. 4.2 / 10 / Appendix A.3.

import { request } from './client.js';

export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

// Signup echo — the mock API returns a fresh id but saves nothing, so
// the account itself is kept locally (see utils/localUsers.js). Callers
// treat this as best-effort, exactly like the checkout POST /carts.
export const registerUser = (payload) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getUsers = () => request('/users');

export const getUser = (id) => request(`/users/${id}`);
