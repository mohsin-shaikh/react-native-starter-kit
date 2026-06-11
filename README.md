# React Native Starter Kit

A production-grade React Native starter built to scale to **hundreds of screens** — SaaS, internal enterprise tools, AI apps, and consumer apps. Batteries included, **no backend lock-in**: ships with a dummy auth/API layer behind clean interfaces so you can plug in Supabase, Firebase, a REST/GraphQL API, Hono, or FastAPI later **without touching a single screen**.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Expo SDK 56+ (New Architecture) |
| Navigation | Expo Router (file-based, typed routes) |
| Language | TypeScript (strict) |
| Client state | Zustand |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Styling | Uniwind (Tailwind CSS v4) + shadcn-style primitives |
| Icons | lucide-react-native (react-native-svg) |
| Secure storage | expo-secure-store (tokens) + AsyncStorage (prefs) |

## Quickstart

```bash
pnpm install
cp .env.example .env
pnpm start
```

Then press `i` (iOS), `a` (Android), or `w` (web).

> Uses **pnpm**. The included `.npmrc` sets `node-linker=hoisted`, which Metro/Expo require to resolve native modules under pnpm.

**Demo login** (seeded mock account): `demo@example.com` / `password123`. Or tap **Sign up** to create a fresh in-memory account.

---

## 1. High-level architecture

The golden rule: **screens never know which backend they talk to.** Every arrow points downward; each layer depends only on the interface below it.

```
┌──────────────────────────────────────────────────────────────┐
│  app/  (Expo Router screens & layouts)                        │
│  - render UI, collect input                                   │
│  - read state via hooks, never call repositories directly     │
└───────────────┬───────────────────────────┬──────────────────┘
                │                            │
        ┌───────▼────────┐          ┌────────▼─────────┐
        │  Zustand       │          │  TanStack Query  │
        │  (client state)│          │  (server state)  │
        │  auth, onboard │          │  profile, lists  │
        └───────┬────────┘          └────────┬─────────┘
                │                            │
        ┌───────▼────────────────────────────▼─────────┐
        │  Services (auth.service, …)                   │
        │  orchestration + token persistence            │
        └───────────────────┬───────────────────────────┘
                            │
        ┌───────────────────▼───────────────────────────┐
        │  Repositories  (INTERFACE = the swap point)    │
        │  AuthRepository · UserRepository               │
        ├────────────────────────────────────────────────┤
        │  Mock │ REST │ Supabase │ Firebase │ GraphQL …  │
        └───────────────────┬───────────────────────────┘
                            │
        ┌───────────────────▼───────────────────────────┐
        │  Cross-cutting: HttpClient, SecureStore, KV,   │
        │  logger, analytics, crashReporter, errors      │
        └────────────────────────────────────────────────┘
```

## 2. Navigation flow

```
App Launch
   │
   ▼
Native Splash (held)
   │  bootstrap: crashReporter.init() + authStore.initialize()
   ▼
Session Check ──── SecureStore tokens? ── refresh if needed ── /auth/me
   │
   ├── not authenticated ─────────────► (auth)   Login / Signup / Forgot
   │
   └── authenticated
         │
         ├── onboarding incomplete ────► (onboarding)  Welcome→Profile→Permissions→Complete
         │
         └── onboarding complete ──────► (app)/(tabs)  Home · Profile · Settings
```

The decision lives in **one** place — `app/index.tsx` — plus a guard per route group. All redirects are **declarative** (`<Redirect>`), so deep links resolve correctly and there are no navigation race conditions.

---

## Route groups — why each exists

| Group | Purpose | Guard | Who may enter |
| --- | --- | --- | --- |
| `(auth)` | Sign in / up / recover | `GuestGuard` | unauthenticated only |
| `(onboarding)` | First-run setup | `OnboardingGuard` | authenticated **and** not yet onboarded |
| `(app)` | The product | `AuthGuard` | authenticated **and** onboarded |

Route groups `(folder)` don't add a URL segment — they exist purely to attach a **shared `_layout.tsx` (and its guard)** to a set of screens. That's how route protection scales: you protect a *group*, not each screen.

### How redirects & protection work

1. The root `_layout` holds the native splash until `authStore.initialize()` resolves the session — no UI flashes during restore.
2. `app/index.tsx` sends the user to the correct group based on `auth.status` + `onboarding.hasCompleted`.
3. Each group `_layout` wraps its `<Stack>` in a guard. A guard is just a component that returns `<Redirect>` when the state is wrong and `children` when it's right. Because the guard renders **before** the screen, a protected screen never mounts for the wrong user.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full deep-dive: folder responsibilities, state strategy, API swapping, error handling, production features, best practices, and common mistakes.

## Folder structure

```
app/                      # Expo Router (routing only — thin screens)
  _layout.tsx             # root: providers + bootstrap + splash
  index.tsx               # entry redirect (the launch flow)
  (auth)/                 # GuestGuard:  login, signup, forgot-password
  (onboarding)/           # OnboardingGuard: welcome → profile → permissions → complete
  (app)/                  # AuthGuard
    (tabs)/               # home, profile, settings

src/
  components/   ui/ (shadcn primitives) · layout/ · feedback/ · guards/
  config/       env.ts · feature-flags.ts
  constants/    storage keys · routes
  features/     feature-scoped code (auth schemas, …)
  hooks/        reusable hooks (use-auth)
  lib/          errors · logger · analytics · crash-reporting · notifications
  providers/    app-providers.tsx (the provider stack)
  queries/      query-client · keys · *.queries.ts (React Query hooks)
  services/     api/ · auth/ · repositories/ · storage/
  stores/       auth.store.ts · onboarding.store.ts (Zustand)
  types/        shared domain types
  utils/        cn, helpers
```

## Scripts

```bash
pnpm start          # Expo dev server
pnpm ios | pnpm android | pnpm web
pnpm typecheck      # tsc --noEmit
pnpm lint
pnpm format
```

## License

MIT — use it as the base for your product.
