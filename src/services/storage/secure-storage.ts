import * as SecureStore from "expo-secure-store";

import { logger } from "@/lib/logger";

/**
 * Secure storage for SENSITIVE values only — auth tokens, refresh tokens.
 * Backed by Keychain (iOS) / Keystore (Android) via expo-secure-store.
 *
 * Rules:
 *  - Tokens NEVER go into AsyncStorage/Zustand-persist (those are plain text
 *    on disk). Only this module touches SecureStore.
 *  - Values are limited to ~2KB by the platform; store tokens, not blobs.
 */
export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class ExpoSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error("secureStorage.getItem failed", {
        key,
        error: String(error),
      });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

export const secureStorage: SecureStorage = new ExpoSecureStorage();
