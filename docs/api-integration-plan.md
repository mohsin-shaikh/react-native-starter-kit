# API Integration Plan — app-one backend

Integrating this app with the **app-one** backend (supastarter monorepo at
`~/Developer/npnits/app-one`, API served at `http://localhost:3004/api`,
docs at `http://localhost:3004/api/docs`).

**Scope of phase 1: Auth + Organization switching.** Business data (invoices,
documents, …) comes later — last section sketches how.

---

## 1. What the backend actually is

Knowing this shapes every decision below:

| Concern | Backend reality |
|---|---|
| Framework | Hono app mounted at `basePath("/api")` |
| Auth | **better-auth `1.6.11`** at `/api/auth/**` — *not* a custom JWT API |
| Auth plugins | `expo`, `organization`, `magicLink`, `twoFactor`, `username`, `admin`, `passkey`, `openAPI`, invitation-only |
| Sessions | **Cookie-based** (30-day session cookie), *no access/refresh token pair* |
| Multi-tenancy | better-auth `organization` plugin; `session.activeOrganizationId`, persisted as `user.lastActiveOrganizationId` via a session-create DB hook |
| Business APIs | oRPC — type-safe RPC at `/api/rpc/*`, plus OpenAPI-shaped REST at `/api/*` |
| Existing mobile reference | `app-one/apps/mobile` already integrates all of this — **copy its patterns** (`modules/auth/lib/auth-client.ts`, `modules/auth/lib/token.ts`, `modules/organizations/components/OrgSwitcher.tsx`) |

### The key architectural mismatch

Our starter kit's auth layer (`auth.service.ts`, `rest-auth.repository.ts`)
is built around an **access/refresh JWT token pair** with proactive refresh.
better-auth doesn't work that way: the client gets a **session cookie**, and
`@better-auth/expo` stores that cookie in SecureStore and re-attaches it to
every auth request. There is no refresh endpoint and no token expiry juggling.

**Decision: use the official better-auth Expo client and delete the token
machinery, rather than forcing better-auth into the token-pair shape.**
This is exactly what `app-one/apps/mobile` does, so it's a proven path against
this exact backend.

What we keep from the starter kit architecture:

- `useAuthStore` (zustand) as the single source of truth for `status` / `user`
  — its public API (`initialize`, `login`, `signup`, `logout`, `hasRole`)
  stays unchanged, so **guards, screens and forms don't change**.
- React Query mutation hooks in `src/queries/auth.queries.ts`.
- The repository indirection stays for *business data*; for auth it collapses
  into the better-auth client (mock mode keeps working via `env.USE_MOCKS`).

---

## 2. Phase 0 — prerequisites & config

### Backend side (app-one)

1. Add the app scheme to trusted origins in `.env.local`:
   `BETTER_AUTH_TRUSTED_ORIGINS=starterkit://` (the backend already reads and
   splits this env var). Required by the expo plugin or sign-in is rejected.
2. Backend running on `http://localhost:3004`.

### App side

1. `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3004
   EXPO_PUBLIC_USE_MOCKS=false
   ```
   Note for physical devices: `localhost` won't resolve — use the machine's
   LAN IP (or `adb reverse tcp:3004 tcp:3004` on Android emulator use `10.0.2.2`).
2. Dependencies (pin to match backend):
   ```
   pnpm add better-auth@1.6.11 @better-auth/expo@1.6.11
   npx expo install expo-network
   ```
   `expo-network` is required: the Expo client statically `import()`s it
   (Metro bundles it), to pause requests while offline. Already present:
   `expo-secure-store`, `expo-linking`, `expo-constants`, `zustand`,
   `@tanstack/react-query`. (`expo-web-browser` is only needed once social
   login lands — its require is lazy and try/caught.)
3. `app.json` scheme is already `starterkit` ✓ (must match trusted origin).

---

## 3. Phase 1 — Auth

### 3.1 New file: `src/services/auth/better-auth-client.ts`

Mirror of `app-one/apps/mobile/modules/auth/lib/auth-client.ts`:

```ts
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields, magicLinkClient,
  organizationClient, twoFactorClient,
} from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { env } from "@/config/env";

export const authClient = createAuthClient({
  baseURL: `${env.API_URL}/api/auth`,
  plugins: [
    expoClient({ storagePrefix: "starterkit", storage: SecureStore }),
    inferAdditionalFields({
      user: {
        onboardingComplete: { type: "boolean" },
        locale: { type: "string" },
        lastActiveOrganizationId: { type: "string" },
      },
    }),
    magicLinkClient(),
    organizationClient(),
    twoFactorClient(),
  ],
});
```

(We can't use `inferAdditionalFields<typeof auth>()` like the in-monorepo app
does — we're a separate repo with no `@repo/auth` import. Declare the extra
fields manually; see §6 for type-sharing options.)

### 3.2 Refactor `src/services/auth/auth.service.ts`

Delete the token plumbing (`persist`/`loadTokens`/`refresh`/
`getValidAccessToken`, `TOKEN_REFRESH_THRESHOLD_MS` usage) — the expo plugin
owns cookie persistence. The service becomes a thin mapper:

| Method | Implementation |
|---|---|
| `login({ email, password })` | `authClient.signIn.email({ email, password })` |
| `signup({ name, email, password })` | `authClient.signUp.email(...)` |
| `logout()` | `authClient.signOut()` (still swallow server errors, always clear locally) |
| `restoreSession()` | `authClient.getSession()` → map `data.user` to our `User`, null if no session |
| `requestPasswordReset(email)` | `authClient.requestPasswordReset({ email, redirectTo })` |

Each maps better-auth's `{ data, error }` result into our existing `AppError`
(`kind: "unauthorized" | "validation" | …`) so the store and forms keep their
error handling.

Mock mode: keep `MockAuthRepository` behind `env.USE_MOCKS` — the service
picks `authClient` vs mock at construction. `RestAuthRepository` (token-based)
gets deleted.

### 3.3 Update `src/stores/auth.store.ts`

- `initialize()` no longer wires `registerAuthTokenProvider` with refresh
  logic; instead the HTTP client gets a **cookie provider** (§3.4).
- `status` machine, analytics/crash-reporting identify calls, and
  `waitForOnboardingHydration` all stay as-is.
- Map backend user → our `User` type: `id, name, email, image, role,
  onboardingComplete` (backend's `onboardingComplete` can replace/feed the
  local onboarding store decision — decide in this step whether server wins).

### 3.4 Update `src/services/api/client.ts` / `http-client.ts`

Replace the bearer-token provider with a cookie header, exactly like
`app-one/apps/mobile/modules/auth/lib/token.ts`:

```ts
export function getAuthHeaders(): Record<string, string> {
  const cookie = authClient.getCookie?.();
  return cookie ? { cookie } : {};
}
```

- Attach on every request to `/api/*`.
- On 401: no refresh attempt — call `onAuthFailure` → store flips to
  `unauthenticated` (guards handle redirect).

### 3.5 Auth screens

`login.tsx`, `signup.tsx`, `forgot-password.tsx` keep using the existing
mutation hooks — no UI changes needed for phase 1. (Magic link, 2FA, social
login, passkeys are supported by the backend; treat as later enhancements.)

### 3.6 Cleanup

- Remove `ACCESS_TOKEN` / `REFRESH_TOKEN` storage keys + `TOKEN_REFRESH_THRESHOLD_MS` from `src/constants`.
- Delete `src/services/repositories/rest/rest-auth.repository.ts`.
- Trim `AuthTokens` / token fields from `auth.types.ts`.

---

## 4. Phase 2 — Organization switching

The backend treats "active org" as **server state on the session**
(`session.activeOrganizationId`), not client state. Our current
`organization.store.ts` (seeded mock list + persisted `activeOrgId`) inverts
that, so it gets rebuilt:

### 4.1 New queries: `src/queries/organization.queries.ts`

```ts
// list of orgs the user belongs to
useOrganizationsQuery → authClient.organization.list()
// active org id, derived from the session
useActiveOrganizationQuery → authClient.getSession() → session.activeOrganizationId
// switch
useSetActiveOrganizationMutation → authClient.organization.setActive({ organizationId })
```

Add `organizations` / `session` keys to `src/queries/keys.ts`. On switch
success: update the session/org caches **and invalidate every org-scoped data
query** (this is the important contract for all future business-data queries —
their keys must include `activeOrgId`).

### 4.2 Slim down `src/stores/organization.store.ts`

Two options; pick A:

- **A (recommended):** keep a tiny store holding only `activeOrgId` (mirror of
  server value, optimistically updated on switch, hydrated from
  `getSession()` after login/restore). Server list lives purely in React
  Query. Persistence becomes unnecessary — the backend already restores
  `lastActiveOrganizationId` into each new session via its DB hook.
- B: drop the store entirely and read everything from React Query. (Slightly
  more re-render plumbing in deep components; the store read is more ergonomic.)

Delete `SEED_ORGANIZATIONS`; mock mode can register a mock org list behind
`env.USE_MOCKS` at the query level.

### 4.3 Update `src/components/organization/organization-switcher.tsx`

Wire to the new queries/mutation (the `OrgSwitcher.tsx` in app-one's mobile
app is a direct reference: query list + session, optimistic local active id,
mutation to `setActive`). Add loading/error/empty states ("no organizations"
— backend allows users with zero orgs since `requireOrganization: false`).

### 4.4 Org-related follow-ups (same phase, optional)

- ✅ Create organization — `app/(app)/create-organization.tsx` modal; slug is
  auto-derived from the name (retry-once with random suffix on collision /
  forbidden slug). Creating switches into the new org.
- Accept invitations: `authClient.organization.acceptInvitation(...)` — defer.

---

## 5. Verification checklist

Verified manually on device (2026-06-12), iOS + Android emulator:

- [x] Sign up → lands authenticated, welcome notification created server-side
- [x] Kill app → cold start restores session (cookie from SecureStore), no login screen flash beyond `restoring`
- [x] Wrong password → form shows mapped `AppError`, no crash
- [x] Logout → back to `(auth)`, cookie cleared, re-login works
- [x] Org list renders from server; switching calls `setActive` and survives an app restart (new session inherits `lastActiveOrganizationId`)
- [x] Create organization → new org becomes active, appears in the switcher
- [ ] 401 on an API call (revoke session server-side) → app flips to
      unauthenticated — *not yet exercisable: no non-auth API calls exist
      until business data lands (Phase 3). Re-verify then.*
- [x] `EXPO_PUBLIC_USE_MOCKS=true` still fully works offline
- [x] `pnpm typecheck` — *`pnpm lint` (no eslint config committed) and
      `pnpm test` (no test files) are pre-existing gaps unrelated to this
      integration.*

---

## 6. Later phases (out of scope now, decisions to record)

1. **Business data (invoices, documents, payments):** backend exposes oRPC at
   `/api/rpc` with a typed `ApiRouterClient` (`@repo/api/orpc/router`). Since
   this repo is outside the monorepo, options:
   - a. `pnpm add @orpc/client` + import router *types* from app-one via a
     `file:` dependency / published types package → full type safety (best);
   - b. plain REST against the OpenAPI surface (`/api/...`) with zod-validated
     repositories (fits the existing `repositories/rest` pattern, no coupling);
   - c. generate a client from `http://localhost:3004/api/docs` OpenAPI spec.
2. **Onboarding:** drive `onboarding-guard` from server `user.onboardingComplete`
   instead of the local store.
3. **Auth enhancements:** magic link (deep link via `starterkit://`), social
   login (`expo-web-browser`), 2FA, passkeys — all already enabled server-side.
4. **Environments:** staging/prod API URLs per `EXPO_PUBLIC_APP_ENV`.

---

## 7. Suggested commit/PR slicing

1. `chore: add better-auth client deps + env wiring`
2. `feat(auth): replace token-based auth layer with better-auth expo client`
3. `feat(org): server-driven organization list + active-org switching`
4. `chore: remove dead token/mock-org code`

Each step keeps `pnpm typecheck` green and mocks functional.
