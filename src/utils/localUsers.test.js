import { describe, it, expect, beforeEach } from 'vitest';
import { webcrypto } from 'node:crypto';
import {
  findLocalUser,
  registerLocalUser,
  verifyLocalUser,
  hashPassword,
  USERS_KEY,
} from './localUsers.js';

// The test environment is plain Node: no window/localStorage, and the
// storage helpers read window.localStorage at call time. Install an
// in-memory stand-in, and make sure WebCrypto (used for the SHA-256
// password digests) is present.
function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}
const memoryStorage = createMemoryStorage();
globalThis.window = { localStorage: memoryStorage };
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

const daim = {
  username: 'daim_a',
  email: 'daim@example.com',
  firstName: 'Daim',
  lastName: 'Ali',
  password: 'shelf-42',
};

beforeEach(() => {
  memoryStorage.clear();
});

describe('localUsers', () => {
  it('hashPassword returns a SHA-256 hex digest, never the plain password', async () => {
    const hash = await hashPassword(daim.password);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(daim.password);
    expect(await hashPassword(daim.password)).toBe(hash);
  });

  it('register then verify succeeds with the right password', async () => {
    const record = await registerLocalUser(daim);
    expect(record).toMatchObject({
      username: 'daim_a',
      email: 'daim@example.com',
      firstName: 'Daim',
      lastName: 'Ali',
    });
    const verified = await verifyLocalUser('daim_a', 'shelf-42');
    expect(verified).not.toBeNull();
    expect(verified.username).toBe('daim_a');
    expect(verified.firstName).toBe('Daim');
  });

  it('verify fails with the wrong password and for unknown usernames', async () => {
    await registerLocalUser(daim);
    expect(await verifyLocalUser('daim_a', 'wrong-password')).toBeNull();
    expect(await verifyLocalUser('nobody', 'shelf-42')).toBeNull();
  });

  it('findLocalUser finds by username (any case) and misses cleanly', async () => {
    expect(findLocalUser('daim_a')).toBeNull();
    await registerLocalUser(daim);
    expect(findLocalUser('daim_a')?.username).toBe('daim_a');
    expect(findLocalUser('DAIM_A')?.username).toBe('daim_a');
  });

  it('register rejects a duplicate username, including a case variant', async () => {
    await registerLocalUser(daim);
    await expect(registerLocalUser(daim)).rejects.toMatchObject({
      code: 'USERNAME_TAKEN',
    });
    await expect(
      registerLocalUser({ ...daim, username: 'Daim_A' })
    ).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
  });

  it('stores only the hash — the plain password never reaches localStorage', async () => {
    await registerLocalUser(daim);
    const raw = memoryStorage.getItem(USERS_KEY);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain(daim.password);
    const [stored] = JSON.parse(raw);
    expect(stored.passHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored).not.toHaveProperty('password');
  });
});
