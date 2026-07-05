/**
 * SmartLand AI — LocalStorage Auth with JWT-style tokens
 *
 * We generate a signed-looking JWT (header.payload.signature) entirely
 * client-side using btoa(). This is NOT cryptographically secure (no real
 * secret key verification happens client-side), but it gives the correct
 * JWT structure/format for a frontend-only app.
 *
 * For production, replace with real JWT issued by your backend.
 */

const USERS_KEY   = 'smartland_users';
const TOKEN_KEY   = 'smartland_token';
const TOKEN_TTL   = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/* ── JWT helpers ──────────────────────────────── */

function b64(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createToken(payload) {
  const header    = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body      = b64(JSON.stringify(payload));
  // Signature: in a real app this would be HMAC-SHA256(header+"."+body, SECRET)
  // Here we use a deterministic hash based on email + iat for demo purposes
  const sigRaw    = `${payload.email}:${payload.iat}:smartland_secret`;
  const signature = b64(sigRaw);
  return `${header}.${body}.${signature}`;
}

function parseToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const padded  = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (padded.length % 4)) % 4;
    const decoded = decodeURIComponent(escape(atob(padded + '='.repeat(padding))));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  return Date.now() > payload.exp;
}

/* ── Password hashing (simple, client-safe) ──── */
// In production use bcrypt on the backend. Here we do a deterministic hash.
function hashPassword(password, email) {
  // Simple deterministic obfuscation — NOT real security
  const combined = `${email}:${password}:smartland`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (Math.imul(31, hash) + combined.charCodeAt(i)) | 0;
  }
  return b64(String(hash) + combined.length);
}

/* ── User storage ─────────────────────────────── */

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveUser({ name, email, password, phone = '' }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' };
  }
  const newUser = {
    id:           Date.now(),
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    phone,
    passwordHash: hashPassword(password, email.toLowerCase().trim()),
    createdAt:    new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}

/* ── Auth ─────────────────────────────────────── */

export function loginUser(email, password) {
  const users = getUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return { error: 'No account found with this email.' };

  const hash = hashPassword(password, user.email);
  if (hash !== user.passwordHash) return { error: 'Incorrect password.' };

  const now     = Date.now();
  const payload = {
    sub:   user.id,
    name:  user.name,
    email: user.email,
    phone: user.phone || '',
    iat:   now,
    exp:   now + TOKEN_TTL,
  };

  const token = createToken(payload);
  localStorage.setItem(TOKEN_KEY, token);
  return { success: true, token, user: { ...payload } };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/* ── Session (reads JWT from storage) ────────── */

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getSession() {
  const token   = getToken();
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload || isTokenExpired(payload)) {
    logout(); // auto-clear expired token
    return null;
  }
  return payload;
}

export function isAuthenticated() {
  return getSession() !== null;
}

/* ── Predictions history ──────────────────────── */

export function savePrediction(result, formInputs = {}) {
  const session = getSession();
  if (!session) return;
  const key     = `smartland_preds_${session.sub}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.unshift({
    ...result,
    ...formInputs,
    id:   Date.now(),
    date: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}

export function getPredictions() {
  const session = getSession();
  if (!session) return [];
  const key = `smartland_preds_${session.sub}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/* ── Saved properties ─────────────────────────── */

export function saveProperty(property) {
  const session = getSession();
  if (!session) return;
  const key   = `smartland_saved_${session.sub}`;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  if (saved.find(p => p.id === property.id)) return;
  saved.unshift({ ...property, savedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(saved.slice(0, 30)));
}

export function getSavedProperties() {
  const session = getSession();
  if (!session) return [];
  const key = `smartland_saved_${session.sub}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function removeSavedProperty(id) {
  const session = getSession();
  if (!session) return;
  const key   = `smartland_saved_${session.sub}`;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify(saved.filter(p => p.id !== id)));
}
