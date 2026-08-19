import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * React Native-safe storage wrapper around AsyncStorage.
 * Provides synchronous-like API with an in-memory cache to avoid
 * async reads during React state initialization.
 */

const memoryCache: Record<string, string | null> = {};

/** Call once at app startup to hydrate the in-memory cache */
export async function hydrateStorage(): Promise<void> {
  const keys = ['rv_jwt_token', 'rv_cart', 'rv_seen_notifications'];
  await Promise.all(
    keys.map(async (key) => {
      memoryCache[key] = await AsyncStorage.getItem(key);
    })
  );
}

/** Synchronous read from in-memory cache (safe for useState initializers) */
export function getItem(key: string): string | null {
  return memoryCache[key] ?? null;
}

/** Async write to both in-memory cache and AsyncStorage */
export async function setItem(key: string, value: string): Promise<void> {
  memoryCache[key] = value;
  await AsyncStorage.setItem(key, value);
}

/** Async remove from both in-memory cache and AsyncStorage */
export async function removeItem(key: string): Promise<void> {
  memoryCache[key] = null;
  await AsyncStorage.removeItem(key);
}
