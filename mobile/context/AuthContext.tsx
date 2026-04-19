import React, { createContext, useContext, useMemo } from 'react';

type AuthUser = { id: string; email: string };

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const noop = async () => {};
const GUEST: AuthUser = { id: 'guest', email: '' };

const AuthContext = createContext<AuthState>({
  user: GUEST,
  token: 'stub',
  isReady: true,
  signIn: noop,
  signUp: noop,
  signOut: noop,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({ user: GUEST, token: 'stub', isReady: true, signIn: noop, signUp: noop, signOut: noop }),
    [],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useIsAuthenticated(): boolean {
  return true;
}
