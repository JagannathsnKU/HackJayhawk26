/**
 * HTTP client for the FastAPI backend (XRPL, Solana, voice, memory).
 * Set EXPO_PUBLIC_BACKEND_URL in .env. On physical devices use your LAN IP, not localhost.
 */
const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const DEFAULT_TIMEOUT_MS = 12_000;

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { ...init, signal: controller.signal });
    return res;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`);
    }
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach backend at ${BACKEND_URL}${path}. ${message}`);
  } finally {
    clearTimeout(timer);
  }
}

export function getBackendUrl(): string {
  return BACKEND_URL;
}
