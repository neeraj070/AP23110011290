import { API_BASE_URL } from '../config/api';
import { addDiagnostic } from '../utils/storage';

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path, query) {
  const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
  const url = new URL(`${base}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('The server returned invalid JSON.', response.status, text.slice(0, 200));
  }
}

function getErrorMessage(status, data) {
  const serverMessage = data?.message || data?.error || data?.details;
  if (serverMessage) {
    return String(serverMessage);
  }

  if (status === 400) {
    return 'The server rejected the request. Please check the details and try again.';
  }

  if (status === 401 || status === 403) {
    return 'Your session is invalid or expired. Please authenticate again.';
  }

  if (status === 409) {
    return 'This user appears to be registered already.';
  }

  if (status >= 500) {
    return 'The evaluation server is temporarily unavailable.';
  }

  return 'The request failed unexpectedly.';
}

export async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    query,
    timeoutMs = 15000,
    allowEmpty = false,
  } = options;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  const url = buildUrl(path, query);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const durationMs = Math.round(performance.now() - startedAt);
    const data = await parseResponse(response);

    addDiagnostic({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      stack: 'frontend',
      level: response.ok ? 'debug' : 'warn',
      package: 'api',
      message: `${method} ${path} ${response.status} in ${durationMs}ms`,
    });

    if (!response.ok) {
      throw new ApiError(getErrorMessage(response.status, data), response.status, data);
    }

    if (!allowEmpty && data === null) {
      throw new ApiError('The server returned an empty response.', response.status, data);
    }

    return {
      data,
      status: response.status,
      durationMs,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please check your network and try again.');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Network error. Please check your connection and try again.', 0, error);
  } finally {
    window.clearTimeout(timeout);
  }
}
