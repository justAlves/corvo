import http from 'k6/http';
import { check } from 'k6';
import { API, CREDS, HEADERS_JSON } from './config.js';

// Per-VU state — each VU has its own JS context
let _token = null;

/**
 * Returns headers with Authorization Bearer token for authenticated requests.
 * Call ensureAuthenticated() before using this.
 */
export function authHeaders(extra = {}) {
  if (!_token) return { ...HEADERS_JSON, ...extra };
  return { ...HEADERS_JSON, Authorization: `Bearer ${_token}`, ...extra };
}

/**
 * Logs in the current VU if not already authenticated.
 * Extracts the Bearer token from the response body and stores it per-VU.
 */
export function ensureAuthenticated() {
  if (_token) return true;

  const res = http.post(
    `${API}/api/auth/sign-in/email`,
    JSON.stringify({ email: CREDS.email, password: CREDS.password }),
    { headers: HEADERS_JSON, tags: { name: 'login' } },
  );

  const ok = check(res, {
    'login: status 200': (r) => r.status === 200,
  });

  if (!ok) return false;

  try {
    const body = JSON.parse(res.body);
    _token = body?.token ?? null;
  } catch {
    _token = null;
  }

  return !!_token;
}

/**
 * Forces a fresh login — use in soak tests to refresh expired sessions.
 */
export function forceLogin() {
  _token = null;
  return ensureAuthenticated();
}
