import AsyncStorage from "@react-native-async-storage/async-storage";

import type { StateStorage } from "zustand/middleware";

/**
 * Async key-value storage for NON-sensitive data: onboarding flags, theme
 * preference, cached UI state, Zustand persistence.
 *
 * Backed by AsyncStorage — it's bundled in Expo Go and works in dev/prod
 * builds with zero native setup. (A faster sync option is react-native-mmkv,
 * but that's a custom native module: it requires a development build and won't
 * run in Expo Go. Swap it in here later if you build your own client.)
 *
 * Sensitive tokens must use `secureStorage` instead — AsyncStorage is not
 * encrypted.
 */
export const kvStorage = {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async getBoolean(key: string): Promise<boolean | null> {
    const v = await AsyncStorage.getItem(key);
    return v == null ? null : v === "true";
  },
  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};

/**
 * Adapter for Zustand's `persist` middleware. `StateStorage` allows async
 * get/set/remove, so AsyncStorage drops straight in.
 * Usage: persist(..., { storage: createJSONStorage(() => zustandStorage) })
 */
export const zustandStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
