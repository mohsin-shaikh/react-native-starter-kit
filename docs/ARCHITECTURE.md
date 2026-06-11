# Architecture Deep-Dive

This document explains the *why* behind the structure. The code is the source of truth; this is the map.

---

## 1. Folder responsibilities

### `app/` — routing only

Screens are **thin**. A screen's job is: render UI, collect input, call a hook. No business logic, no `fetch`, no token handling. If a screen file imports a repository or `expo-secure-store`, that's a smell — push it down a layer. Keeping `app/` thin is what lets the tree grow to hundreds of screens without turning into spaghetti.

### `src/` layers

| Folder | Owns | Must NOT |
| --- | --- | --- |
| `components/ui` | Reusable, styled, **stateless** primitives (Button, Input, Text, Card) | Know about features/data |
| `components/guards` | Route protection (`AuthGuard`, `GuestGuard`, `OnboardingGuard`, `RoleGuard`) | Contain feature UI |
| `config` | Validated env + feature flags — the only place reading `process.env` | Be imported before validation |
| `features` | Feature-scoped code (e.g. `auth/schemas.ts`); grows into `features/<x>/{components,hooks,api}` | Cross-import another feature's internals |
| `lib` | Vendor-free cross-cutting abstractions: errors, logger, analytics, crash, notifications | Import a vendor SDK directly (swap the impl instead) |
| `queries` | TanStack Query hooks + keys + client = **server state** | Hold client-only state |
| `services` | `api/` (transport), `auth/` (orchestration), `repositories/` (backend contract), `storage/` | Be called from screens directly |
| `stores` | Zustand = **client state** (session, onboarding, UI) | Cache server data |

**Rule of dependency:** `app → hooks/queries/stores → services → repositories → lib`. Never the reverse.

---

## 2. State management strategy

The single most important decision in a large app is *where each piece of state lives*. Three buckets:

| Put it in… | When | Examples here |
| --- | --- | --- |
| **Zustand** | Client-owned state that outlives a screen and many components read | `auth.status` + `user`, onboarding progress, theme |
| **TanStack Query** | State **owned by the server**: needs caching, refetch, invalidation, loading/error | profile, user lists, anything from a repository |
| **Local `useState`** | Ephemeral, single-screen UI | form draft (via RHF), toggles, modal open/closed |

**The test:** *"If the backend is the source of truth and it can go stale → React Query. If the client owns it → Zustand. If only this screen cares → local state."*

```ts
// ❌ Anti-pattern: server data copied into a store, now you own cache invalidation forever
useUserStore.setState({ profile: await getProfile() });

// ✅ Server state in Query — caching, refetch, invalidation handled for you
const { data: profile } = useProfileQuery();

// ✅ Client session in Zustand — synchronous, many subscribers, drives navigation
const status = useAuthStore((s) => s.status);
```

Why `auth.status` is Zustand and not Query: navigation must read it **synchronously** to decide redirects, it's client-owned (derived from token presence), and it isn't a cacheable server resource.

---

## 3. Auth implementation

Three files, three jobs:

- **`auth.types.ts`** — the domain contract (`AuthRepository`, `AuthSession`, `AuthTokens`). Product types, not vendor types.
- **`auth.service.ts`** — orchestration: calls the repository, **persists tokens to SecureStore**, restores the session on cold start, de-dupes refreshes, hands a valid token to the HTTP client.
- **`auth.store.ts`** — the UI-facing state machine (`idle → restoring → authenticated | unauthenticated`) + `login/signup/logout/refreshSession`.

```
login()  ─► store.login ─► service.login ─► repo.login ─► persist tokens
                                              │
                                              └─► returns AuthSession
store sets status='authenticated' ──► GuestGuard sees it ──► <Redirect> to app
```

Tokens **never** touch the store or AsyncStorage — only `secureStorage` (Keychain/Keystore). Logout always succeeds locally even if the server call fails.

### Token refresh (transparent)

The HTTP client gets a token from an `AuthTokenProvider`. On a `401` it calls `refreshAccessToken()` **once**, replays the original request, and on failure calls `onAuthFailure()` which signs the user out. Concurrent requests share a single in-flight refresh (`refreshInFlight`) so the refresh token is rotated exactly once.

---

## 4. Route protection (example)

A guard is a component that renders a redirect when state is wrong:

```tsx
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const hasOnboarded = useOnboardingStore((s) => s.hasCompleted);

  if (status === 'idle' || status === 'restoring') return <LoadingScreen />;
  if (status === 'unauthenticated') return <Redirect href={ROUTES.LOGIN} />;
  if (!hasOnboarded) return <Redirect href={ROUTES.ONBOARDING_WELCOME} />;
  return <>{children}</>;
}
```

Applied once per group in its `_layout.tsx`:

```tsx
// app/(app)/_layout.tsx
export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}
```

- **Guests can't reach the app** → `AuthGuard` redirects to login.
- **Authenticated users can't reach login** → `GuestGuard` redirects forward.
- **Not-onboarded users are forced into onboarding** → both `AuthGuard` and `index.tsx` enforce it.
- **RBAC** → `<RoleGuard roles={['admin']}>` for in-screen gating.

Declarative redirects beat `useEffect(() => router.replace())`: the protected screen never mounts, so there's no flash and no effect-ordering bug.

---

## 5. Zustand store example (the pattern)

```ts
export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  login: async (creds) => {
    const { user } = await authService.login(creds); // delegates down
    set({ status: 'authenticated', user });
  },
  hasRole: (role) => get().user?.roles.includes(role) ?? false,
}));

// Subscribe to the NARROWEST slice to avoid needless re-renders:
const status = useAuthStore((s) => s.status);          // ✅
const { status, user, login } = useAuthStore();        // ❌ re-renders on any change
```

Onboarding shows the **persisted** variant (`persist` + AsyncStorage adapter) so the flag survives restarts. See `src/stores/onboarding.store.ts`.

---

## 6. SecureStore integration (example)

```ts
// Only this module touches SecureStore. Tokens live in Keychain/Keystore.
await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
```

SecureStore values are capped (~2KB) and async — store **tokens**, not blobs. Non-sensitive prefs go to AsyncStorage (`kvStorage`), which works in Expo Go with no native setup.

---

## 7. API layer — swapping backends

The **repository interface** is the contract; the implementation is a detail selected in one file:

```ts
// src/services/repositories/index.ts — the composition root
function createRepositories(): Repositories {
  if (env.USE_MOCKS) return { auth: new MockAuthRepository(), users: new MockUserRepository() };
  return { auth: new RestAuthRepository(apiClient), users: new MockUserRepository() };
}
```

To migrate to a real provider you implement the same interface and switch one line:

```ts
// Supabase
class SupabaseAuthRepository implements AuthRepository {
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw mapSupabaseError(error);          // normalize → AppError
    return mapSession(data);                            // map → AuthSession
  }
  /* signup, logout, refresh, me, requestPasswordReset … */
}

// Firebase / GraphQL / Hono / FastAPI: same interface, different body.
```

Screens, hooks, stores, and the service layer **do not change** — they depend on `AuthRepository`, not on Supabase. Each repository's only job is to **map vendor shapes ↔ domain shapes** and **map vendor errors → `AppError`**.

---

## 8. Error handling

One normalized error type (`AppError`) with a `kind` discriminant (`network | unauthorized | forbidden | validation | server | …`). The boundary layers convert everything into it:

- **HTTP client** → non-2xx and fetch failures become `AppError` (`kindFromStatus`).
- **Repositories (mock/vendor)** → throw `AppError` directly.
- **React Query** → typed as `AppError`; retries only `isRetryable` kinds (never 401/403/422).
- **Forms** → field-level errors via `error.fields` and Zod.
- **Render-time crashes** → `ErrorBoundary` → `crashReporter.captureException`.

UI switches on `error.kind` / shows `error.userMessage` — it **never** sniffs status codes or string-matches messages. That's what keeps error handling backend-agnostic.

| Error class | Source | Surfaced as |
| --- | --- | --- |
| Network/timeout | HTTP client | retry UI, toast |
| Auth (401) | client/repo | transparent refresh → else sign-out |
| Validation (422/Zod) | repo/forms | inline field errors |
| Unexpected (render) | ErrorBoundary | full-screen fallback + crash report |

---

## 9. Production features (interfaces only — no vendor yet)

| Concern | Where | Swap to |
| --- | --- | --- |
| Environment config | `config/env.ts` | — (single validated reader) |
| Feature flags | `config/feature-flags.ts` | LaunchDarkly / Statsig / PostHog / remote config |
| Analytics | `lib/analytics.ts` | Segment / PostHog / Amplitude / Firebase |
| Crash reporting | `lib/crash-reporting.ts` | Sentry / Bugsnag / Crashlytics |
| Logging | `lib/logger.ts` | Datadog / forward to crash breadcrumbs |
| Push notifications | `lib/notifications.ts` | expo-notifications / FCM / OneSignal |
| Deep linking | `app.json` `scheme` + Expo Router | universal/app links config |
| RBAC | `components/guards/role-guard.tsx` + `user.roles` | server-enforced permissions |

Every one is an **interface with a no-op/console implementation**, so call sites are already in place — adding a vendor means writing one class and registering it.

---

## 10. Best practices

1. **Keep `app/` thin.** Routing + presentation only; logic lives in `src/`.
2. **One source of truth per state.** Don't mirror server data into Zustand.
3. **Depend on interfaces, not vendors.** Screens import `useProfileQuery`, never `supabase`.
4. **Subscribe to the narrowest store slice** to avoid re-render storms.
5. **Tokens only in SecureStore.** Never AsyncStorage / Zustand-persist.
6. **Normalize every error to `AppError`** at the boundary; switch on `kind`.
7. **Validate with Zod once** — infer the form type from the schema.
8. **Declarative redirects** in guards, not imperative navigation in effects.
9. **Centralize keys & routes** (`constants/`) — no magic strings.
10. **Read env in one validated place**; fail loudly on missing config.

## 11. Common mistakes to avoid

- ❌ Calling `fetch`/repositories directly inside a screen → untestable, backend-coupled.
- ❌ Storing JWTs in AsyncStorage or a persisted Zustand store → plain-text on disk.
- ❌ Putting server data in Zustand → you reinvent cache invalidation, badly.
- ❌ `useEffect(() => router.replace(...))` for auth gating → flashes the wrong screen, race conditions.
- ❌ Retrying 401/403/422 → wasted requests; React Query is configured not to.
- ❌ Swallowing errors / leaking raw server messages → use `AppError.userMessage`.
- ❌ Importing a vendor SDK across the app → re-couples you; wrap it in a repository/abstraction.
- ❌ Reading `process.env` everywhere → scatter config; use `config/env.ts`.
- ❌ One giant Zustand store → split by domain (`auth`, `onboarding`, …).
- ❌ Hand-typed route strings → use `ROUTES` so refactors are safe.
```
