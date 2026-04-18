import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'hackjayhawk_jwt';

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    // On some runtimes (web / missing native module), this can throw.
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveToken(token: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    globalThis.localStorage.setItem(TOKEN_KEY, token);
  }
}

export async function readToken(): Promise<string | null> {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    return globalThis.localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export async function clearToken(): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    globalThis.localStorage.removeItem(TOKEN_KEY);
  }
}
