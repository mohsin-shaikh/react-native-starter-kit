import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { env } from "@/config/env";

/**
 * The better-auth client for the app-one backend (mounted at /api/auth).
 *
 * The Expo plugin persists the session COOKIE in SecureStore and re-attaches
 * it to every auth request — there is no access/refresh token pair anywhere.
 * For non-auth API calls, `authClient.getCookie()` exposes that cookie so the
 * HTTP client can send it too (see better-auth.repository.ts).
 *
 * The backend defines extra user fields via plugins; we declare them manually
 * because this repo lives outside the app-one monorepo and cannot
 * `inferAdditionalFields<typeof auth>()` from `@repo/auth`. Keep this in sync
 * with app-one/packages/auth/auth.ts.
 */
export const authClient = createAuthClient({
  baseURL: `${env.API_URL}/api/auth`,
  plugins: [
    expoClient({ storagePrefix: "starterkit", storage: SecureStore }),
    inferAdditionalFields({
      user: {
        onboardingComplete: { type: "boolean", required: false },
        locale: { type: "string", required: false },
        lastActiveOrganizationId: { type: "string", required: false },
      },
    }),
    magicLinkClient(),
    organizationClient(),
    twoFactorClient(),
  ],
});

export type AuthClient = typeof authClient;
