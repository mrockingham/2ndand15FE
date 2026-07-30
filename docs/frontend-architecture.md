# Frontend Architecture

## Status

Milestone 0 implements the application foundation described here. Sections covering authentication and future feature directories remain architectural targets until their milestones begin.

## Goals

- Keep feature work independently understandable and testable.
- Make the authentication lifecycle deterministic.
- Separate server state, client state, and presentation state.
- Support route-level code splitting and responsive shells as the product grows.
- Allow the backend contract to evolve without leaking transport details through the UI.

## Source layout

```text
src/
  app/
    App.tsx
    providers.tsx
    router.tsx
  components/
    feedback/
    navigation/
    surfaces/
  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      types.ts
    teams/
    users/
    games/
    news/
    stats/
    ai/
    fantasy/
    play-visualizer/
  hooks/
  layouts/
  pages/
  services/
    api/
  stores/
  theme/
  types/
  utils/
  test/
```

Milestone 0 creates only `app`, shared navigation/feedback, layouts, pages, API services, theme state, theme configuration, and test helpers. Feature directories will be introduced with their first real feature; empty aspirational directories add noise.

## Module responsibilities

- `app/`: application composition, provider order, route graph, and global error boundaries.
- `features/`: domain-specific API functions, query options, mutations, schemas, components, and tests.
- `pages/`: thin route-level composition and page metadata.
- `layouts/`: public, authentication, and authenticated application shells.
- `components/`: domain-neutral primitives that are more specific than raw MUI components.
- `services/api/`: base URL configuration, request execution, auth header injection, refresh coordination, error normalization, and abort support.
- `stores/`: small client-only Zustand stores. The auth store contains only ephemeral access-token/session-bootstrap state, never user DTOs.
- `theme/`: palettes, semantic tokens, component overrides, typography, and theme-mode utilities.
- `test/`: shared render helpers, mock server setup, and fixtures.

Dependencies should flow from app/pages toward features and shared infrastructure. A shared component must not import from a page. Feature-to-feature imports should go through a small intentional public API or be lifted to shared code when genuinely cross-domain.

## Provider composition

The implemented outer-to-inner order is:

1. Theme mode and MUI theme provider
2. CSS baseline
3. Application error boundary
4. TanStack Query client provider
5. Router provider

The router can later render an application-bootstrap boundary that performs session restoration before authenticated routing decisions. Provider code configures libraries; it does not become a second business-logic layer.

The Query client currently uses a 60-second default stale time, a 30-minute garbage-collection time, two query retries, no automatic window-focus refetch, reconnect refetching, and no mutation retries. Live game and identity features must override those defaults where their domain behavior differs.

## Routing model

The declarative route tree currently exposes `/`, `/games`, `/news`, `/stats`, `/ai`, `/fantasy`, and a catch-all not-found page. Future section routes contain honest placeholders with no fake sports data. Add lazy-loaded page modules when feature weight makes splitting useful.

- Public layout: landing and other freely accessible content.
- Auth layout: login, registration, forgot-password, and reset-password flows.
- App layout: authenticated dashboard and account/team preferences.
- Not-found route: a useful recovery path rather than a dead end.

Protected routing depends on the completed bootstrap state, not merely on whether an in-memory token currently exists. This prevents redirect flicker while silent refresh is in progress.

## State ownership

| State                          | Owner                                             | Persistence                 |
| ------------------------------ | ------------------------------------------------- | --------------------------- |
| Teams and team detail          | TanStack Query                                    | Query cache only            |
| Current user and favorite team | TanStack Query                                    | Query cache only            |
| API mutation state             | TanStack Query                                    | None beyond query cache     |
| Access token                   | Zustand auth store                                | Memory only                 |
| Session bootstrap status       | Zustand auth store or a focused bootstrap context | Memory only                 |
| Theme preference               | Small UI store/theme utility                      | Local storage is acceptable |
| Form values/errors             | React Hook Form                                   | Component lifetime          |
| Route/navigation state         | React Router                                      | URL/history                 |

Do not mirror server DTOs into Zustand. Personalized UI derives from the `users/me` query and related queries.

## Authentication state machine

Use explicit bootstrap states such as `checking`, `authenticated`, and `anonymous`.

```text
application starts
  -> POST /auth/refresh with credentials
     -> success: keep access token in memory -> GET /users/me -> authenticated
     -> failure: clear token/query data -> anonymous
```

A normal authenticated request that receives `401` may trigger one shared refresh attempt. On refresh success, retry the request once. On refresh failure, clear auth state and protected query data. Login and registration both set the returned access token and then establish the current-user query. See `api-integration.md` for details.

## Data-access conventions

- API functions are small typed transport functions and accept an `AbortSignal` where supported.
- Query configuration lives near the feature using query-option factories.
- Query keys are stable factories, for example `teamKeys.all` and `teamKeys.detail(id)`.
- Components consume hooks/query options and do not construct authorization headers.
- Normalize transport failures to a shared `ApiError` shape while preserving safe field errors when the backend supplies them.
- Choose stale times from domain behavior; do not apply one global stale time to live games, teams, and user identity.
- Keep current-user data separate from the access-token store.

## Configuration

Use a checked-in `.env.example` once scaffolding begins. The expected public configuration is:

```text
VITE_API_BASE_URL=http://localhost:<backend-port>/api/v1
```

The exact local/backend URLs are deployment configuration, not hard-coded constants. `readAppEnvironment` validates the required value at startup, accepts only absolute HTTP(S) URLs without embedded credentials, and normalizes the trailing slash. Vite variables are public browser data and may not contain secrets.

## Milestone 0 implementation boundaries

- `src/app/main.tsx` validates environment configuration and mounts React.
- `src/app/App.tsx` composes providers separately from the route graph.
- `src/theme/` owns typed semantic tokens and MUI component defaults.
- `src/stores/themePreferences.ts` is the only Zustand store and persists only theme mode.
- `src/services/api/` owns the native-fetch boundary; no feature instantiates it or makes a backend call yet.
- Desktop navigation exposes all six destinations. Mobile exposes four primary destinations plus a More sheet for AI Hub and Fantasy.
- Authentication, protected routes, team data, refresh coordination, and all sports features remain deferred.

## Error, loading, and empty states

- Provide route-level error handling for unexpected rendering failures.
- Provide localized request errors with retry actions when retrying makes sense.
- Distinguish anonymous startup from backend outage where the contract permits it.
- Use stable skeleton geometry for primary layouts.
- Treat an absent favorite team as a supported empty/personalization state.
- Do not erase useful cached page content because an unrelated mutation fails.

## Testing strategy

- Unit-test schemas, formatters, query-key factories, and complex state transitions.
- Integration-test pages and features with React Testing Library and HTTP-level mocks.
- Test startup refresh success/failure, one-retry behavior, refresh deduplication, logout cleanup, protected routing, favorite-team select/replace/clear, and reset-password states.
- Test theme modes, abbreviation fallbacks, keyboard navigation, and reduced motion for key components.
- Keep backend fixtures realistic and typed; do not invent fields in production code to satisfy a mock.

## Performance and observability

- Split by route/large feature rather than every small component.
- Reserve image dimensions and lazy-load non-critical approved imagery.
- Avoid loading visualization and fantasy code on the landing/auth routes.
- Use query cancellation for abandoned navigation where possible.
- Add error reporting and product analytics only after providers and privacy requirements are chosen; never include tokens or password-reset data.

## Decisions deferred safely

The app can be scaffolded before choosing a hosting provider, analytics vendor, error-reporting vendor, or full play-visualizer rendering technology. Those decisions should be made when their milestones begin and recorded as small architecture decisions.
