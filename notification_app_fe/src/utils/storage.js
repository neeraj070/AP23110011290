const PREFIX = 'campus_notifications';

const KEYS = {
  profile: `${PREFIX}:profile`,
  credentials: `${PREFIX}:credentials`,
  token: `${PREFIX}:token`,
  viewed: `${PREFIX}:viewed_ids`,
  diagnostics: `${PREFIX}:diagnostics`,
};

export function seedCredentials(profile, credentials) {
  write(KEYS.profile, profile);
  write(KEYS.credentials, credentials);
}

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function read(key, fallback = null) {
  try {
    return safeParse(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return false;
  }
  return true;
}

export function getStoredProfile() {
  return read(KEYS.profile);
}

export function saveProfile(profile) {
  return write(KEYS.profile, profile);
}

export function getStoredCredentials() {
  return read(KEYS.credentials);
}

export function saveCredentials(credentials) {
  return write(KEYS.credentials, credentials);
}

export function getStoredToken() {
  return read(KEYS.token);
}

export function saveToken(tokenInfo) {
  return write(KEYS.token, tokenInfo);
}

export function clearToken() {
  return remove(KEYS.token);
}

export function getViewedIds() {
  const ids = read(KEYS.viewed, []);
  return Array.isArray(ids) ? ids : [];
}

export function saveViewedIds(ids) {
  return write(KEYS.viewed, Array.from(new Set(ids)));
}

export function markViewed(id) {
  if (!id) {
    return getViewedIds();
  }

  const next = Array.from(new Set([...getViewedIds(), String(id)]));
  saveViewedIds(next);
  return next;
}

export function getDiagnostics() {
  const items = read(KEYS.diagnostics, []);
  return Array.isArray(items) ? items : [];
}

export function addDiagnostic(entry) {
  const next = [entry, ...getDiagnostics()].slice(0, 8);
  write(KEYS.diagnostics, next);
  return next;
}

export function clearSessionOnlyAuth() {
  clearToken();
}

export function clearAllAppStorage() {
  remove(KEYS.profile);
  remove(KEYS.credentials);
  remove(KEYS.token);
  remove(KEYS.viewed);
  remove(KEYS.diagnostics);
}
