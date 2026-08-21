# Frontend Architecture

## Status

Frontend Milestones 0 through 2, 8, 10, 12, 14, 16, 18, 20, 21, and 25 implement the application foundation, authentication lifecycle, team personalization, administrative schedule workspace, editorial CMS, public News, public Games schedule, private source/candidate workflow, historical player experiences, public Stats Hub, public Team Directory/Team Hub, personalized Home composition, and Tier 1 AI Hub described here. Remaining live sports feature directories remain architectural targets.

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
    players/
    newsInbox/
    news/
    statsHub/
    teamHub/
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

The current implementation creates only directories with active responsibilities, including `auth`, `teams`, and `users`. Future feature directories will be introduced with their first real feature; empty aspirational directories add noise.

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
5. Auth-aware API clients provider
6. Session bootstrap boundary
7. Router provider

The session bootstrap boundary restores identity before authenticated routing decisions. The API-clients provider injects token access, refresh coordination, and auth cleanup without making the transport layer depend on feature modules. Provider code configures libraries; it does not become a second business-logic layer.

The Query client currently uses a 60-second default stale time, a 30-minute garbage-collection time, two query retries, no automatic window-focus refetch, reconnect refetching, and no mutation retries. Live game and identity features must override those defaults where their domain behavior differs.

## Routing model

The declarative route tree also exposes protected `/choose-team`. Login and registration direct users without a favorite there while preserving a safe destination. Selection is optional: skipping returns to the app without persisting a special flag or causing a redirect loop. `/stats` is public and lazy-loaded; future AI and Fantasy routes contain honest placeholders with no fake data.

- Public layout: landing and other freely accessible content.
- Auth layout: login, registration, forgot-password, and reset-password flows.
- App layout: authenticated dashboard and account/team preferences.
- Admin layout: an authenticated, role-aware schedule workspace with desktop side navigation and a mobile drawer. It intentionally does not render the public bottom navigation.
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

The implementation uses explicit `pending`, `authenticated`, `anonymous`, and `error` bootstrap states.

```text
application starts
  -> POST /auth/refresh with credentials
     -> success: keep access token in memory -> seed returned user -> authenticated
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
- Cache the public team list under `['teams', 'list']` for 24 hours. Team Hub overview, historical roster, and team-leader endpoints use separate `['teamHub', ...]` families rather than copying catalog data.
- Set, replace, and clear favorite teams through one authenticated mutation and write its returned user directly to `['users', 'me']`.
- Do not optimistically update favorite-team state; the server response remains authoritative.

## Configuration

Use a checked-in `.env.example` once scaffolding begins. The expected public configuration is:

```text
VITE_API_BASE_URL=http://localhost:<backend-port>/api/v1
```

The exact local/backend URLs are deployment configuration, not hard-coded constants. `readAppEnvironment` validates the required value at startup, accepts only absolute HTTP(S) URLs without embedded credentials, and normalizes the trailing slash. Vite variables are public browser data and may not contain secrets.

## Current implementation boundaries

- `src/app/main.tsx` validates environment configuration and mounts React.
- `src/app/App.tsx` composes providers separately from the route graph.
- `src/theme/` owns typed semantic tokens and MUI component defaults.
- `src/stores/themePreferences.ts` persists only theme mode. `src/stores/authStore.ts` holds only ephemeral token/bootstrap state and never persists it.
- `src/services/api/` owns the feature-neutral native-fetch boundary. `src/features/auth/createAuthApiClients.ts` composes public and authenticated clients with session behavior.
- Large-desktop navigation exposes all eight destinations; medium desktop/tablet keeps the six released destinations visible and omits the two future placeholders to protect spacing. Mobile exposes four primary destinations plus a More sheet for Teams, Stats, AI Hub, and Fantasy.
- Registration, login, recovery, reset, logout, session restoration, protected account routing, refresh coordination, and current-user loading are implemented.
- Team catalog, favorite-team onboarding/editing, identity fallback, and personalized home states are implemented.
- Public News, editorial administration, the public schedule/game-detail experience, historical player statistics, Home weekly-insights composition, and the Tier 1 AI Hub are implemented. Live polling, play-by-play, Tier 2 player/injury intelligence, AI chat, fantasy recommendations, and other sports features remain deferred.
- `src/features/admin/` owns the verified administrative DTOs, API functions, query keys, mutations, CSV parser, and reusable admin components. Thin route pages live under `src/pages/Admin*` and the dedicated shell lives at `src/layouts/AdminLayout.tsx`.
- `CurrentUser.role` is the single client source for navigation decisions. `/admin` uses the existing authentication guard followed by an `EDITOR`/`ADMIN` experience guard; `/admin/audit` adds an `ADMIN` experience guard. Backend capability middleware remains the security boundary.
- Administrative queries use `adminGameKeys.list(filters)`, `adminGameKeys.detail(id)`, `adminAuditKeys.list(filters)`, and `adminAuditKeys.game(id, cursor)`. Writes update returned game detail data and invalidate affected list/audit families plus public game queries.
- A backend `403` is rendered as insufficient permission and invalidates `['users', 'me']` so stale role data is replaced through the existing session/current-user flow.
- `src/features/articles/` owns public/admin DTOs, distinct query-key families, API functions, form validation, safe Markdown rendering, lifecycle controls, and revision presentation. Public pages consume only public article endpoints.
- `src/features/games/` owns public game DTOs, transport, normalized query keys, nullable kickoff utilities, cards, schedule grouping, and favorite-team next-game composition. Public week lists use cursor-aware queries with a five-minute stale time and no polling.
- `src/features/newsInbox/` owns authenticated source/candidate DTOs, schemas, transport, separate deterministic query-key families, mutations, and reusable workflow components. It stores nothing in Zustand or browser persistence.
- `src/features/players/` owns exact public player DTOs, the four bounded read endpoints, normalized list/search/detail/stats/seasons query families, safe presentation utilities, and responsive player components. Player server data stays in TanStack Query and is never persisted in Zustand or browser storage.
- `src/features/statsHub/` owns metadata, season leaders, weekly leaders, recent performance, metadata-driven presentation, normalized URL state, and separate deterministic query-key families. Metadata is cached for one day and historical reads for six hours, with no polling or focus refetch.
- `src/features/teamHub/` owns Team Hub DTOs and transport, deterministic overview/roster/leader keys, normalized directory/roster/leader URL state, historical roster presentation, team schedule/result helpers, and responsive team components. It reuses team catalog, favorite, game, article, player, and Stats Hub behavior without duplicating their state.
- `src/features/aiHub/` owns public prediction and weekly-insight DTOs, deterministic query families, selected-context URL state, model-performance reads, and the responsive Tier 1 presentation. It reuses favorite-team state and TeamHelmet identity without persisting prediction data.
- The `/players`, `/players/:playerId`, `/players/compare`, `/stats`, `/teams`, `/teams/:teamId`, and `/ai` modules are lazy-loaded behind the shared accessible route fallback.
- The Games route URL owns `type`, `week`, optional `team`, and optional historical `season` filters. The backend remains the source of the default current season.
- News/detail and all admin route modules—including each source and candidate route—are lazy-loaded behind a shared accessible route fallback. Home and lightweight auth/account flows remain eager.
- Public 2026 preseason and regular-season schedules, resolved game details, the event-led/public and favorite-team Home states, favorite-team matchup/prediction presentation, historical 2020–2025 player statistics, historical Team Hubs, and the Tier 1 AI Hub are implemented. Current 2026 rosters, live polling/statistics, play-by-play, Tier 2 AI, fantasy recommendations, and other sports features remain deferred.

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
