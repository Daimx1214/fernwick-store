// Auth + user endpoints — Spec Sec. 4.2 / 10 / Appendix A.3.

import { request } from './client.js';

export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getUsers = () => request('/users');

export const getUser = (id) => request(`/users/${id}`);
