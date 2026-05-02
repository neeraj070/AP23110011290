import { requestJson } from './apiClient';
import { log } from '../middleware/logger';

function extractCredentials(data) {
  const clientID = data?.clientID || data?.clientId || data?.client_id;
  const clientSecret = data?.clientSecret || data?.client_secret;

  if (!clientID || !clientSecret) {
    throw new Error('Registration succeeded, but client credentials were missing.');
  }

  return { clientID, clientSecret };
}

function extractToken(data) {
  const accessToken = data?.access_token || data?.accessToken || data?.token;
  const tokenType = data?.token_type || data?.tokenType || 'Bearer';
  const expiresIn = Number(data?.expires_in || data?.expiresIn || 0);

  if (!accessToken) {
    throw new Error('Authentication succeeded, but the access token was missing.');
  }

  return {
    accessToken,
    tokenType,
    expiresAt: Date.now() + Math.max(expiresIn - 30, 60) * 1000,
  };
}

export async function register(profile) {
  const result = await requestJson('/register', {
    method: 'POST',
    body: profile,
  });

  const credentials = extractCredentials(result.data);
  await log('frontend', 'info', 'auth', `Registration succeeded in ${result.durationMs}ms`);
  return credentials;
}

export async function authenticate(profile, credentials) {
  const result = await requestJson('/auth', {
    method: 'POST',
    body: {
      email: profile.email,
      name: profile.name,
      rollNo: profile.rollNo,
      accessCode: profile.accessCode,
      ...credentials,
    },
  });

  const token = extractToken(result.data);
  await log('frontend', 'info', 'auth', `Authentication succeeded in ${result.durationMs}ms`);
  return token;
}

export function isTokenValid(tokenInfo) {
  return Boolean(tokenInfo?.accessToken && tokenInfo.expiresAt && tokenInfo.expiresAt > Date.now());
}
