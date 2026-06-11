import { logger } from "./logger";

/**
 * Push notifications abstraction (PLACEHOLDER — no vendor wired up).
 *
 * Keeps the rest of the app decoupled from expo-notifications / FCM / APNs /
 * OneSignal. Implement `ExpoNotificationProvider` later and register the token
 * with your backend inside `registerForPush`.
 */
export interface NotificationProvider {
  requestPermission(): Promise<boolean>;
  /** Returns the device push token to send to your backend, or null. */
  registerForPush(): Promise<string | null>;
  /** Deep-link target to navigate to when a notification is tapped. */
  onNotificationTap(handler: (route: string) => void): () => void;
}

class NoopNotificationProvider implements NotificationProvider {
  async requestPermission(): Promise<boolean> {
    logger.debug("notifications.requestPermission (noop)");
    return false;
  }
  async registerForPush(): Promise<string | null> {
    logger.debug("notifications.registerForPush (noop)");
    return null;
  }
  onNotificationTap(_handler: (route: string) => void): () => void {
    return () => {};
  }
}

export const notifications: NotificationProvider =
  new NoopNotificationProvider();
