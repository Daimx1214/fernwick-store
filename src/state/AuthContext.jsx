import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as apiLogin, getUsers } from '../api/auth.js';
import { readJSON, writeJSON, removeKey } from '../utils/storage.js';

// Auth — Spec Sec. 10. POST /auth/login returns only a JWT; the user id
// comes from decoding the token's 'sub' claim, with a GET /users lookup by
// username as fallback. Session persists in shop.auth.v1. Logout clears
// the auth key only — the cart stays, as a shopper expects.
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

  const login = useCallback(async (username, password) => {
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

    const session = { token, userId, username: resolvedUsername, firstName };
    writeJSON(AUTH_KEY, session);
    setAuth(session);
    return session;
  }, []);

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
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
