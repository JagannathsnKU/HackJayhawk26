import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../services/authApi';
import { loginRequest, meRequest, registerRequest } from '../services/authApi';
import { clearToken, readToken, saveToken } from '../services/authStorage';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await readToken();
        if (!stored) {
          return;
        }
        const { user: u } = await meRequest(stored);
        if (!cancelled) {
          setToken(stored);
          setUser(u);
        }
      } catch {
        await clearToken();
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await loginRequest(email, password);
    await saveToken(t);
    setToken(t);
    setUser(u);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await registerRequest(email, password);
    await saveToken(t);
    setToken(t);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      signIn,
      signUp,
      signOut,
    }),
    [user, token, isReady, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function useIsAuthenticated(): boolean {
  const { token, user } = useAuth();
  return token != null && user != null;
}
