// Tiny fetch wrapper — Spec Sec. 4.5 / Appendix A.3.
// One place for the base URL, JSON headers, a 10s timeout and readable
// errors. Components never call fetch() directly.

const BASE_URL = 'https://fakestoreapi.com';

export async function request(path, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      ...options,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed (${res.status})`);
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The server took too long to respond.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
