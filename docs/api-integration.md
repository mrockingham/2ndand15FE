# API Integration Guide

## Scope and contract status

The backend lives in the sibling `2ndand15BE` repository. Authentication contracts were verified against its OpenAPI, validators, controllers, service logic, cookie helper, configuration, and route tests in July 2026. See [auth-contract.md](auth-contract.md) for the exact requests, responses, status codes, error envelope, reset-token query parameter, and cookie behavior.

Milestone 0 implements the native-fetch client foundation and environment validation. Frontend Milestone 1 implements authentication; Frontend Milestone 2 implements the verified team and favorite-team contracts in [team-personalization-contract.md](team-personalization-contract.md). Frontend Milestone 8 implements the verified backend Milestone 7 administrative schedule contract documented in [admin-usage.md](admin-usage.md).

## Base configuration

All documented routes are under `/api/v1`. Configure the origin and base path with a public Vite environment variable rather than hard-coding an environment:

```text
VITE_API_BASE_URL=http://localhost:<backend-port>/api/v1
```

Vite environment values are visible to users. Never place secrets in them.

## Known endpoints

| Method | Path                                | Authentication               | Frontend purpose                               |
| ------ | ----------------------------------- | ---------------------------- | ---------------------------------------------- |
| GET    | `/health`                           | Not specified                | Environment/API health diagnostics             |
| GET    | `/teams`                            | Public                       | List active teams and favorite choices         |
| GET    | `/teams/:teamId`                    | Public                       | Active team detail when needed                 |
| POST   | `/auth/register`                    | Public                       | Create an account and immediately authenticate |
| POST   | `/auth/login`                       | Public                       | Authenticate                                   |
| POST   | `/auth/refresh`                     | Refresh cookie               | Restore/renew an access token                  |
| POST   | `/auth/logout`                      | Refresh cookie               | End the session                                |
| POST   | `/auth/forgot-password`             | Public                       | Request password reset instructions            |
| POST   | `/auth/reset-password`              | Public token in JSON request | Complete password reset                        |
| GET    | `/users/me`                         | Bearer token                 | Load current-user DTO                          |
| PATCH  | `/users/me/favorite-team`           | Bearer token                 | Select, replace, or clear favorite team        |
| GET    | `/admin/games`                      | Bearer token; editor/admin   | Bounded administrative schedule list           |
| GET    | `/admin/games/:gameId`              | Bearer token; editor/admin   | Administrative game detail                     |
| POST   | `/admin/games`                      | Bearer token; editor/admin   | Create a manually owned game                   |
| PATCH  | `/admin/games/:gameId`              | Bearer token; editor/admin   | Edit a manually owned base game                |
| PUT    | `/admin/games/:gameId/override`     | Bearer token; editor/admin   | Upsert partial editorial override values       |
| DELETE | `/admin/games/:gameId/override`     | Bearer token; admin          | Delete the complete override                   |
| PUT    | `/admin/games/:gameId/verification` | Bearer token; editor/admin   | Record verification source and timestamp       |
| POST   | `/admin/schedule-imports/validate`  | Bearer token; editor/admin   | Dry-run structured schedule rows               |
| POST   | `/admin/schedule-imports`           | Bearer token; editor/admin   | Write previously validated structured rows     |
| GET    | `/admin/audit-events`               | Bearer token; scoped by role | Cursor-paginated sanitized audit events        |

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
```

- `GET /teams` populates the teams list query.
- `GET /teams/:teamId` is verified but not called because the current catalog response has all required fields.
- `GET /users/me` is the sole source of current-user/favorite-team truth.
- A successful favorite-team mutation updates the `users/me` cache directly from the returned DTO without a duplicate request.
- Logout removes protected user data. Public team data may remain cached unless product/privacy behavior requires otherwise.

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

Authentication and favorite-team contracts are resolved in [auth-contract.md](auth-contract.md) and [team-personalization-contract.md](team-personalization-contract.md). Future sports integrations must still be verified before implementation.

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
