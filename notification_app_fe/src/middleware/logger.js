import { API_BASE_URL } from '../config/api';
import { addDiagnostic, getStoredToken } from '../utils/storage';

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

export async function log(stack, level, packageName, message) {
  const tokenInfo = getStoredToken();
  const payload = {
    stack: normalize(stack, new Set(['frontend', 'backend']), 'frontend'),
    level: normalize(level, LEVELS, 'info'),
    package: normalize(packageName, PACKAGES, 'utils'),
    message: String(message || 'No message provided').slice(0, 500),
  };

  addDiagnostic({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  try {
    await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenInfo?.accessToken ? { Authorization: `Bearer ${tokenInfo.accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return false;
  }

  return true;
}

export const Log = log;
