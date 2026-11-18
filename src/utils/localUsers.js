// Local accounts — accounts created on the Sign up page live in this
// browser, because FakeStoreAPI cannot keep them: POST /users echoes a
// new id but saves nothing, and POST /auth/login only knows the API's
// ten sample users. Passwords are stored as SHA-256 digests (via
// crypto.subtle), never in plain text. See the README's Accounts note.

import { readJSON, writeJSON } from './storage.js';

export const USERS_KEY = 'shop.users.v1';

export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(String(password));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readUsers() {
  const list = readJSON(USERS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function sameName(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function findLocalUser(username) {
  if (!username) return null;
  return readUsers().find((u) => sameName(u.username, username)) || null;
}

export async function registerLocalUser({ username, email, firstName, lastName, password }) {
  const name = String(username).trim();
  if (findLocalUser(name)) {
    const err = new Error('That username is taken.');
    err.code = 'USERNAME_TAKEN';
    throw err;
  }
  const record = {
    username: name,
    email: String(email).trim(),
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    passHash: await hashPassword(password),
  };
  writeJSON(USERS_KEY, [...readUsers(), record]);
  return record;
}

// Returns the account record when the password matches, null otherwise
// (unknown username or wrong password — callers cannot tell which).
export async function verifyLocalUser(username, password) {
  const user = findLocalUser(username);
  if (!user) return null;
  const hash = await hashPassword(password);
  return hash === user.passHash ? user : null;
}
