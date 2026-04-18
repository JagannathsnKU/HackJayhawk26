/**
 * Auth API client — JWT auth against the Node server (MongoDB Atlas).
 * Set EXPO_PUBLIC_API_URL (see .env.example). On device, use your machine IP, not localhost.
 */
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type AuthUser = { id: string; email: string };

export type AuthResponse = { token: string; user: AuthUser };

/** Flip to `false` to use real network auth again. */
export const AUTH_API_DISABLED_FOR_DEV = true;

export const DEV_AUTH_USER: AuthUser = { id: 'dev-user', email: 'dev@local' };

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach auth server at ${API_URL}${path}. ${message}`);
  }
}

export async function registerRequest(email: string, password: string): Promise<AuthResponse> {
  if (AUTH_API_DISABLED_FOR_DEV) {
    return {
      token: 'dev-jwt-stub',
      user: { ...DEV_AUTH_USER, email: email.trim() || DEV_AUTH_USER.email },
    };
  }
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  if (AUTH_API_DISABLED_FOR_DEV) {
    return {
      token: 'dev-jwt-stub',
      user: { ...DEV_AUTH_USER, email: email.trim() || DEV_AUTH_USER.email },
    };
  }
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function meRequest(token: string): Promise<{ user: AuthUser }> {
  if (AUTH_API_DISABLED_FOR_DEV) {
    return { user: DEV_AUTH_USER };
  }
  const res = await apiFetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ user: AuthUser }>;
}

export function getApiBaseUrl(): string {
  return API_URL;
}
