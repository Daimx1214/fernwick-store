import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as apiLogin, getUsers, registerUser } from '../api/auth.js';
import { findLocalUser, registerLocalUser, verifyLocalUser } from '../utils/localUsers.js';
import { readJSON, writeJSON, removeKey } from '../utils/storage.js';

// Auth — Spec Sec. 10. POST /auth/login returns only a JWT; the user id
// comes from decoding the token's 'sub' claim, with a GET /users lookup by
// username as fallback. Session persists in shop.auth.v1. Logout clears
// the auth key only — the cart stays, as a shopper expects.
//
// Accounts created on the Sign up page are the one exception: the mock
// API cannot persist them (POST /users saves nothing, and /auth/login
// only knows the ten sample users), so they are stored locally — see
// utils/localUsers.js. Login checks those local accounts first, then
// falls back to the API sample accounts.
const AuthContext = createContext(null);
export const AUTH_KEY = 'shop.auth.v1';

function decodeJwt(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readJSON(AUTH_KEY, null));

  const startSession = useCallback((session) => {
    writeJSON(AUTH_KEY, session);
    setAuth(session);
    return session;
  }, []);

  const login = useCallback(async (username, password) => {
    // Local accounts first: a username registered on the Sign up page
    // belongs to the local store, so its password is checked against the
    // stored hash and never sent to the API. Unknown usernames fall
    // through to the API sample accounts below.
    if (findLocalUser(username)) {
      const local = await verifyLocalUser(username, password);
      if (!local) throw new Error('Username or password is incorrect');
      return startSession({
        token: `local-${local.username}`,
        userId: null,
        username: local.username,
        firstName: local.firstName,
      });
    }

    const { token } = await apiLogin(username, password);
    let userId = null;
    let firstName = '';
    let resolvedUsername = username;

    const payload = decodeJwt(token);
    if (payload) {
      if (payload.sub != null) userId = Number(payload.sub);
      if (payload.user) resolvedUsername = payload.user;
    }
    // Fallback / enrichment: find the user record for the display name.
    try {
      const users = await getUsers();
      const found = users.find((u) => u.username === resolvedUsername);
      if (found) {
        if (userId == null) userId = found.id;
        firstName = titleCase(found.name?.firstname || '');
      }
    } catch {
      /* name is a nicety — login still succeeds without it */
    }

    return startSession({ token, userId, username: resolvedUsername, firstName });
  }, [startSession]);

  const signup = useCallback(
    async ({ firstName, lastName, email, username, password }) => {
      const name = username.trim();
      const taken = () => {
        const err = new Error('That username is taken.');
        err.code = 'USERNAME_TAKEN';
        return err;
      };
      if (findLocalUser(name)) throw taken();
      // The API's sample usernames are taken too: a local account with
      // one of those names could never be told apart from the sample
      // account at login. Best-effort — if the API is unreachable the
      // check is skipped and the local account is still created.
      try {
        const users = await getUsers();
        if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
          throw taken();
        }
      } catch (err) {
        if (err.code === 'USERNAME_TAKEN') throw err;
        /* API unreachable — clash check skipped */
      }
      // Best-effort echo to the mock API; it saves nothing and the
      // result is ignored, exactly like the checkout POST /carts.
      registerUser({
        email: email.trim(),
        username: name,
        password,
        name: { firstname: firstName.trim(), lastname: lastName.trim() },
      }).catch(() => {});

      const record = await registerLocalUser({
        username: name,
        email,
        firstName,
        lastName,
        password,
      });
      return startSession({
        token: `local-${record.username}`,
        userId: null,
        username: record.username,
        firstName: record.firstName,
      });
    },
    [startSession]
  );

  const logout = useCallback(() => {
    removeKey(AUTH_KEY);
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      userId: auth?.userId ?? null,
      username: auth?.username || null,
      firstName: auth?.firstName || '',
      isLoggedIn: Boolean(auth?.token),
      login,
      signup,
      logout,
    }),
    [auth, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
