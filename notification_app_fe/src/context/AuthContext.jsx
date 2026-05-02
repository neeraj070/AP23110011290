import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { authenticate, isTokenValid, register } from '../services/authService';
import { log } from '../middleware/logger';
import {
  clearSessionOnlyAuth,
  getStoredCredentials,
  getStoredProfile,
  getStoredToken,
  saveCredentials,
  saveProfile,
  saveToken,
  seedCredentials,
} from '../utils/storage';

const AuthContext = createContext(null);

function asFriendlyAuthError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return error?.message || 'Authentication failed. Please try again.';
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('initializing');
  const [profile, setProfile] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [startupMessage, setStartupMessage] = useState('');
  const [authError, setAuthError] = useState('');

  const applyToken = useCallback((token) => {
    saveToken(token);
    setTokenInfo(token);
    setStatus('authenticated');
    setAuthError('');
  }, []);

  const authenticateWithSavedData = useCallback(async () => {
    const savedProfile = getStoredProfile();
    const savedCredentials = getStoredCredentials();

    if (!savedProfile || !savedCredentials) {
      throw new Error('Saved registration details are missing.');
    }

    const token = await authenticate(savedProfile, savedCredentials);
    setProfile(savedProfile);
    applyToken(token);
    await log('frontend', 'info', 'auth', 'Automatic authentication completed and bearer token stored');
    return token;
  }, [applyToken]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      await log('frontend', 'info', 'page', 'App startup');

      seedCredentials(
        {
          email: 'neerajkumar_m@srmap.edu.in',
          name: 'M Neeraj Kumar',
          rollNo: 'AP23110011290',
          accessCode: 'QkbpxH',
          mobileNo: '9553820083',
          githubUsername: 'neeraj070',
        },
        {
          clientID: 'b28eb245-46da-44a7-b9c8-cd43b166ea67',
          clientSecret: 'ZVDjDCXsmNnCWvyh',
        }
      );

      const savedProfile = getStoredProfile();
      const savedToken = getStoredToken();

      if (!mounted) {
        return;
      }

      setProfile(savedProfile);

      if (isTokenValid(savedToken)) {
        setTokenInfo(savedToken);
        setStatus('authenticated');
        return;
      }

      if (savedProfile && getStoredCredentials()) {
        try {
          setStartupMessage('Refreshing your expired session...');
          await authenticateWithSavedData();
          return;
        } catch (error) {
          clearSessionOnlyAuth();
          await log('frontend', 'warn', 'auth', `Automatic re-authentication failed: ${asFriendlyAuthError(error)}`);
          if (!mounted) {
            return;
          }
          setAuthError('Your saved session expired. Please authenticate again.');
        }
      }

      if (mounted) {
        setStatus('setup');
      }
    }

    bootstrap().catch(async (error) => {
      await log('frontend', 'error', 'page', `Startup failed: ${asFriendlyAuthError(error)}`);
      if (mounted) {
        setStatus('setup');
        setAuthError('The app could not restore your session. Please continue with setup.');
      }
    });

    return () => {
      mounted = false;
    };
  }, [authenticateWithSavedData]);

  const registerAndAuthenticate = useCallback(
    async (nextProfile) => {
      setStatus('initializing');
      setStartupMessage('Registering and authenticating...');
      setAuthError('');

      try {
        saveProfile(nextProfile);
        setProfile(nextProfile);

        let credentials;
        try {
          credentials = await register(nextProfile);
          saveCredentials(credentials);
        } catch (error) {
          const savedCredentials = getStoredCredentials();
          if (error instanceof ApiError && (error.status === 409 || /registered/i.test(error.message)) && savedCredentials) {
            credentials = savedCredentials;
            await log('frontend', 'warn', 'auth', 'Registration already existed; using stored client credentials');
          } else {
            await log('frontend', 'error', 'auth', `Registration failed: ${asFriendlyAuthError(error)}`);
            throw error;
          }
        }

        const token = await authenticate(nextProfile, credentials);
        applyToken(token);
        await log('frontend', 'info', 'auth', 'Registration and authentication flow completed');
        return true;
      } catch (error) {
        const message = asFriendlyAuthError(error);
        setAuthError(message);
        setStatus('setup');
        await log('frontend', 'error', 'auth', `Auth flow failed: ${message}`);
        return false;
      } finally {
        setStartupMessage('');
      }
    },
    [applyToken],
  );

  const getAccessToken = useCallback(async () => {
    if (isTokenValid(tokenInfo)) {
      return tokenInfo.accessToken;
    }
    const token = await authenticateWithSavedData();
    return token.accessToken;
  }, [authenticateWithSavedData, tokenInfo]);

  const forceReauthenticate = useCallback(async () => {
    clearSessionOnlyAuth();
    const token = await authenticateWithSavedData();
    return token.accessToken;
  }, [authenticateWithSavedData]);

  const signOut = useCallback(async () => {
    clearSessionOnlyAuth();
    setTokenInfo(null);
    setStatus('setup');
    await log('frontend', 'info', 'auth', 'User signed out locally');
  }, []);

  const value = useMemo(
    () => ({
      status,
      profile,
      tokenInfo,
      startupMessage,
      authError,
      registerAndAuthenticate,
      getAccessToken,
      forceReauthenticate,
      signOut,
    }),
    [
      status,
      profile,
      tokenInfo,
      startupMessage,
      authError,
      registerAndAuthenticate,
      getAccessToken,
      forceReauthenticate,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}