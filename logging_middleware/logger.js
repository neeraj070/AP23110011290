const API_BASE_URL = 'http://20.207.122.201/evaluation-service';

const LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const PACKAGES = new Set([
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
]);

function normalize(value, allowed, fallback) {
  const normalized = String(value || '').toLowerCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function getSavedAccessToken() {
  try {
    const tokenInfo = JSON.parse(window.localStorage.getItem('campus_notifications:token') || 'null');
    return tokenInfo?.accessToken || '';
  } catch {
    return '';
  }
}

export async function log(stack, level, packageName, message) {
  const token = getSavedAccessToken();
  const payload = {
    stack: normalize(stack, new Set(['frontend', 'backend']), 'frontend'),
    level: normalize(level, LEVELS, 'info'),
    package: normalize(packageName, PACKAGES, 'utils'),
    message: String(message || 'No message provided').slice(0, 500),
  };

  try {
    await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return false;
  }

  return true;
}

export const Log = log;
