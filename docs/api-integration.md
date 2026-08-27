# API Integration Guide

## Scope and contract status

The backend lives in the sibling `2ndand15BE` repository. Authentication contracts were verified against its OpenAPI, validators, controllers, service logic, cookie helper, configuration, and route tests in July 2026. See [auth-contract.md](auth-contract.md) for the exact requests, responses, status codes, error envelope, reset-token query parameter, and cookie behavior.

Milestone 0 implements the native-fetch client foundation and environment validation. Frontend Milestones 1 and 2 implement authentication and team personalization. Frontend Milestone 8 implements administrative schedules. Frontend Milestone 10 implements public articles and the CMS. Frontend Milestone 12 implements public games. Frontend Milestone 14 implements the backend Milestone 13 source and candidate contracts documented in [news-inbox-usage.md](news-inbox-usage.md). Frontend Milestone 16 implements the backend Milestone 15 public player contracts documented in [player-statistics-usage.md](player-statistics-usage.md). Frontend Milestone 18 implements backend Milestone 17 Stats Hub reads documented in [stats-hub-usage.md](stats-hub-usage.md). Frontend Milestone 20 implements backend Milestone 19 Team Hub reads documented in [team-hub-usage.md](team-hub-usage.md). Frontend Milestone 21 composes those families with the public weekly-insights endpoint as documented in [home-page-usage.md](home-page-usage.md). Frontend Milestone 25 implements the public Tier 1 prediction experience documented in [ai-hub-frontend.md](ai-hub-frontend.md). Frontend Milestone 26 implements the Game Center foundation (scoreboard, play-by-play, field progress, team stats) against completed-game data, with no live polling, documented in [game-center-usage.md](game-center-usage.md).

## Base configuration

All documented routes are under `/api/v1`. Configure the origin and base path with a public Vite environment variable rather than hard-coding an environment:

```text
VITE_API_BASE_URL=http://localhost:<backend-port>/api/v1
```

Vite environment values are visible to users. Never place secrets in them.

## Known endpoints

| Method    | Path                                                                | Authentication               | Frontend purpose                               |
| --------- | ------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------- |
| GET       | `/health`                                                           | Not specified                | Environment/API health diagnostics             |
| GET       | `/teams`                                                            | Public                       | List active teams and favorite choices         |
| GET       | `/teams/:teamId`                                                    | Public                       | Active team detail when needed                 |
| GET       | `/teams/:teamId/hub`                                                | Public                       | Bounded team overview and historical coverage  |
| GET       | `/teams/:teamId/roster`                                             | Public                       | Cursor-paginated historical roster evidence    |
| GET       | `/teams/:teamId/stat-leaders`                                       | Public                       | Cursor-paginated team-split leaders            |
| POST      | `/auth/register`                                                    | Public                       | Create an account and immediately authenticate |
| POST      | `/auth/login`                                                       | Public                       | Authenticate                                   |
| POST      | `/auth/refresh`                                                     | Refresh cookie               | Restore/renew an access token                  |
| POST      | `/auth/logout`                                                      | Refresh cookie               | End the session                                |
| POST      | `/auth/forgot-password`                                             | Public                       | Request password reset instructions            |
| POST      | `/auth/reset-password`                                              | Public token in JSON request | Complete password reset                        |
| GET       | `/users/me`                                                         | Bearer token                 | Load current-user DTO                          |
| PATCH     | `/users/me/favorite-team`                                           | Bearer token                 | Select, replace, or clear favorite team        |
| GET       | `/games`                                                            | Public                       | Filtered, cursor-paginated resolved games      |
| GET       | `/games/:gameId`                                                    | Public                       | One resolved public game                       |
| GET       | `/games/:gameId/plays`                                              | Public                       | Structured play-by-play for the Game Center    |
| GET       | `/games/:gameId/stats`                                              | Public                       | Per-game team statistics for the Game Center   |
| GET       | `/teams/:teamId/games`                                              | Public                       | Bounded team schedule                          |
| GET       | `/players`                                                          | Public                       | Filtered, cursor-paginated player directory    |
| GET       | `/players/:playerId`                                                | Public                       | Public player identity/profile                 |
| GET       | `/players/:playerId/stats`                                          | Public                       | Cursor-paginated recorded game statistics      |
| GET       | `/players/:playerId/seasons`                                        | Public                       | Available season summaries                     |
| GET       | `/stats/metadata`                                                   | Public                       | Stats capabilities, filters, and coverage      |
| GET       | `/stats/leaders`                                                    | Public                       | Cursor-paginated season leaderboard            |
| GET       | `/stats/weekly-leaders`                                             | Public                       | Cursor-paginated weekly leaderboard            |
| GET       | `/stats/recent`                                                     | Public                       | Recent recorded player performances            |
| GET       | `/admin/games`                                                      | Bearer token; editor/admin   | Bounded administrative schedule list           |
| GET       | `/admin/games/:gameId`                                              | Bearer token; editor/admin   | Administrative game detail                     |
| POST      | `/admin/games`                                                      | Bearer token; editor/admin   | Create a manually owned game                   |
| PATCH     | `/admin/games/:gameId`                                              | Bearer token; editor/admin   | Edit a manually owned base game                |
| PUT       | `/admin/games/:gameId/override`                                     | Bearer token; editor/admin   | Upsert partial editorial override values       |
| DELETE    | `/admin/games/:gameId/override`                                     | Bearer token; admin          | Delete the complete override                   |
| PUT       | `/admin/games/:gameId/verification`                                 | Bearer token; editor/admin   | Record verification source and timestamp       |
| POST      | `/admin/schedule-imports/validate`                                  | Bearer token; editor/admin   | Dry-run structured schedule rows               |
| POST      | `/admin/schedule-imports`                                           | Bearer token; editor/admin   | Write previously validated structured rows     |
| GET       | `/admin/audit-events`                                               | Bearer token; scoped by role | Cursor-paginated sanitized audit events        |
| GET       | `/articles`                                                         | Public                       | Published article list and filters             |
| GET       | `/articles/featured`                                                | Public                       | Currently featured published articles          |
| GET       | `/articles/:slug`                                                   | Public                       | Published article detail                       |
| GET       | `/teams/:teamId/articles`                                           | Public                       | Published team article list                    |
| GET/POST  | `/admin/articles`                                                   | Bearer token; editor/admin   | List articles or create a draft                |
| GET/PATCH | `/admin/articles/:articleId`                                        | Bearer token; editor/admin   | Read or version-edit editorial content         |
| PUT       | `/admin/articles/:articleId/teams`                                  | Bearer token; editor/admin   | Versioned replacement of team tags             |
| POST      | `/admin/articles/:articleId/{publish,unpublish,schedule}`           | Bearer token; editor/admin   | Versioned publication lifecycle                |
| POST      | `/admin/articles/:articleId/{archive,restore}`                      | Bearer token; admin          | Versioned archival lifecycle                   |
| GET       | `/admin/articles/:articleId/revisions`                              | Bearer token; editor/admin   | Immutable revision history                     |
| GET/POST  | `/admin/news-sources`                                               | Bearer token; role-dependent | Source list or admin-only creation             |
| GET/PATCH | `/admin/news-sources/:sourceId`                                     | Bearer token; role-dependent | Source detail or admin-only configuration edit |
| POST      | `/admin/news-sources/:sourceId/{pause,resume}`                      | Bearer token; admin          | Source lifecycle                               |
| POST      | `/admin/news-sources/:sourceId/{test,ingest}`                       | Bearer token; editor/admin   | Explicit feed operation                        |
| GET       | `/admin/news-candidates[/:candidateId]`                             | Bearer token; editor/admin   | Candidate list or detail                       |
| POST      | `/admin/news-candidates/manual`                                     | Bearer token; editor/admin   | Store manual source metadata                   |
| POST      | `/admin/news-candidates/:candidateId/{review,save,dismiss,convert}` | Bearer token; editor/admin   | Candidate workflow action                      |

Frontend paths above are relative to the configured `/api/v1` base.

## Verified authentication behavior

- Login, registration, and refresh return the user DTO, an access token, and `accessTokenExpiresIn` in JSON.
- Registration immediately authenticates the new user.
- Send the access token as `Authorization: Bearer <token>`.
- Access tokens expire after approximately 15 minutes.
- The refresh token is an HTTP-only cookie and cannot/must not be read by frontend JavaScript.
- Refresh calls must include browser credentials.
- The current-user DTO contains `favoriteTeam`, which may be `null`.
- A user can select, replace, or clear the favorite team.
- Team IDs are internal UUIDs; provider mappings are not exposed.
- Logout is idempotent and returns `204` with no response body.
- Password-reset links use the `token` query parameter.
- Passwords are 12–128 characters; the backend defines no composition requirements.

## Session bootstrap

At each full application startup:

1. Set bootstrap state to `pending`.
2. Call `POST /auth/refresh` with credentials included.
3. If successful, put the returned access token in the in-memory auth store.
4. Cache the user returned by refresh in TanStack Query and mark the session `authenticated`.
5. If refresh fails with the verified invalid-session response, clear auth/user state, mark the session `anonymous`, and continue rendering the public application.
6. If startup fails because the API is unavailable or an unexpected error occurs, show a recoverable startup error with retry and signed-out continuation actions.

The verified `401 INVALID_REFRESH_TOKEN` response is treated as the ordinary signed-out case; network and unexpected failures are not silently collapsed into it.

## Authenticated request and refresh policy

- A centralized request layer reads the current access token at request time and adds the bearer header.
- On an eligible `401`, start or join one shared refresh promise so simultaneous failures do not send multiple refresh calls.
- A successful refresh replaces the in-memory token and retries each eligible original request once.
- The refresh request itself, login/register requests, and a request already retried must never recursively trigger refresh.
- A failed refresh clears the access token and authenticated query data. Protected routes then move to the signed-out experience.
- Preserve intended navigation so the user can return after login where appropriate, but do not preserve reset credentials in storage or analytics.

This policy should be tested with parallel requests and aborted navigation.

## Credential handling

- Store the access token only in memory; a full reload relies on the refresh cookie.
- Never store either token in local storage, session storage, IndexedDB, URLs, analytics, or logs.
- Use `credentials: 'include'` for refresh and any other cookie-dependent endpoint. Whether all API calls should include credentials depends on deployment/CORS policy.
- Clear protected TanStack Query data on logout or terminal refresh failure.
- Do not attempt to delete the HTTP-only cookie in JavaScript; the logout response must expire it.
- Treat password-reset tokens as sensitive. Avoid logging them and remove them from the visible URL/history when the chosen backend flow permits.

## Implemented client boundary

`src/services/api/apiClient.ts` currently provides:

- normalized base/path joining
- JSON request serialization and JSON/text response parsing
- `credentials: 'include'` on requests so future HTTP-only cookie flows are supported
- an access-token getter for dependency injection without owning token state
- one shared refresh promise and at most one retry for eligible authenticated requests
- normalized `ApiError` status, code, safe message, field errors, and request ID when supplied
- safe empty/`204` handling
- native `RequestInit` options, including abort signals

`src/services/api/environment.ts` validates `VITE_API_BASE_URL` as an absolute HTTP(S) URL without embedded credentials. `src/features/auth/createAuthApiClients.ts` composes public and authenticated clients; `src/app/createConfiguredApiClients.ts` supplies environment configuration at the application boundary.

## Query ownership and keys

Implemented query-key factories:

```text
userKeys.me              -> ['users', 'me']
teamKeys.lists()         -> ['teams', 'list']
playerKeys.list(filters) -> ['players', 'list', normalizedFilters]
playerKeys.detail(id)    -> ['players', 'detail', id]
playerKeys.stats(id, f)  -> ['players', 'detail', id, 'stats', normalizedFilters]
playerKeys.seasons(id)   -> ['players', 'detail', id, 'seasons']
statsHubKeys.metadata()  -> ['statsHub', 'metadata']
statsHubKeys.season(f)   -> ['statsHub', 'season', normalizedFilters]
statsHubKeys.weekly(f)   -> ['statsHub', 'weekly', normalizedFilters]
statsHubKeys.recent(f)   -> ['statsHub', 'recent', normalizedFilters]
gameKeys.detail(id)      -> ['games', 'detail', id]
gameKeys.plays(id)       -> ['games', 'detail', id, 'plays']
gameKeys.stats(id)       -> ['games', 'detail', id, 'stats']
teamHubKeys.overview(id) -> ['teamHub', 'overview', id]
teamHubKeys.roster(id,f) -> ['teamHub', 'roster', id, normalizedFilters]
teamHubKeys.leader(id,f) -> ['teamHub', 'leaders', id, normalizedFilters]
```

- `GET /teams` populates the teams list query.
- `GET /teams/:teamId` is verified but not called because the current catalog response has all required fields.
- `GET /users/me` is the sole source of current-user/favorite-team truth.
- A successful favorite-team mutation updates the `users/me` cache directly from the returned DTO without a duplicate request.
- Logout removes protected user data. Public team data may remain cached unless product/privacy behavior requires otherwise.
- Player directory/search results, identities, recorded game stats, and season summaries use separate normalized keys. They are historical public reads with no polling; list/search data is fresh for 10 minutes and detail/statistical data for one hour.
- Stats metadata is fresh for 24 hours. Season leaders, weekly leaders, and recent performance are fresh for six hours. These historical queries pass abort signals, do not poll, and do not aggressively refetch on focus. Leaderboard cursors stay opaque and outside the URL.
- Team overview is fresh for five minutes, historical roster pages for one day, and team leader pages for six hours. Each family is separate, passes abort signals, does not poll or refetch on focus, and keeps opaque cursors outside the URL.

## DTO and validation policy

Do not guess transport fields in application components. Once backend DTOs are supplied:

- Define request and response types at the feature API boundary.
- Use `unknown` plus runtime validation for externally variable/high-risk payloads where valuable.
- Preserve internal UUIDs as opaque strings; do not derive provider identifiers.
- Model `favoriteTeam` as nullable exactly as returned.
- Keep optional approved image fields optional and render an abbreviation fallback.
- Normalize only the fields the UI needs; retain source timestamps/timezones without lossy conversion.

## Error handling

Normalize failures into an application-level error containing, when available:

- HTTP status
- stable backend error code
- safe user-facing message
- field-level validation errors
- request/correlation ID

The verified backend envelope is `{ error: { code, message, details?, requestId } }`; validation details use `{ field, message }`. Forms map safe field errors when present and otherwise use stable code/status fallbacks. Forgot-password always presents the backend's generic non-enumerating success message.

## Remaining backend/deployment requirements

- Exact local, test, and production API origins
- Request/response DTOs for future sports endpoints
- Production origin, cookie-domain, and proxy configuration
- CSRF protections for cookie-backed refresh/logout operations
- Product UX for rate-limit retry guidance beyond the verified `429` response
- Date/time formats and canonical timezone behavior

Authentication, favorite-team, public Games, and player-statistics contracts are resolved in [auth-contract.md](auth-contract.md), [team-personalization-contract.md](team-personalization-contract.md), [public-games-usage.md](public-games-usage.md), and [player-statistics-usage.md](player-statistics-usage.md). Future sports integrations must still be verified before implementation.

## Administrative schedule contract

The contract was verified against `src/docs/openapi.ts`, `src/modules/admin/admin.schemas.ts`, `admin.dto.ts`, authorization middleware, controller, service, repository, audit sanitizer, CSV parser, and route tests in the sibling backend repository in August 2026.

- `CurrentUser.role` is `USER`, `EDITOR`, or `ADMIN`; it is never inferred from email and is not copied into client storage.
- The game list currently accepts only `season`, `limit` (1–100), and UUID `cursor`. Suggested status/team/week/date/source filters are not sent because the backend does not expose them.
- Administrative game DTOs contain resolved public values, base values, `providerManaged`, provenance, and an optional override. Provider mappings and provider IDs are not returned.
- Manual kickoff and override timestamps require an explicit offset. The creation UI requires a UTC offset choice; override editing labels its value as UTC.
- Import endpoints accept JSON `{ rows, dryRun }`; there is no multipart upload. The frontend parses the backend-documented CSV format to structured rows and enforces a 1 MiB/500-row limit.
- `EDITOR` has schedule view/edit/import/verify and game-scoped audit capabilities. `ADMIN` additionally has full audit and override-removal capabilities.
- `403` causes a current-user query refresh. `409 PROVIDER_GAME_REQUIRES_OVERRIDE` is presented as a direct-edit ownership conflict, not silently converted into an override.
- Successful game writes seed the returned detail and invalidate the administrative list and audit families. Successful imports invalidate list and audit families. Public team and current-user queries are not broadly invalidated.
