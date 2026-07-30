# API Integration Guide

## Scope and contract status

The backend lives in a separate repository. This guide records only the behavior currently supplied for frontend planning. Exact request/response DTOs, error envelopes, local URLs, cookie attributes, and CORS configuration have not yet been provided and must be confirmed before implementing contract-dependent forms.

Milestone 0 implements a native-fetch client foundation and environment validation, but no feature creates requests and no authentication/refresh behavior exists yet.

## Base configuration

All documented routes are under `/api/v1`. Configure the origin and base path with a public Vite environment variable rather than hard-coding an environment:

```text
VITE_API_BASE_URL=http://localhost:<backend-port>/api/v1
```

Vite environment values are visible to users. Never place secrets in them.

## Known endpoints

| Method | Path                      | Authentication                                      | Frontend purpose                               |
| ------ | ------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| GET    | `/health`                 | Not specified                                       | Environment/API health diagnostics             |
| GET    | `/teams`                  | Not specified; presumed public pending confirmation | List teams and favorite-team choices           |
| GET    | `/teams/:teamId`          | Not specified; presumed public pending confirmation | Team detail                                    |
| POST   | `/auth/register`          | Public                                              | Create an account and immediately authenticate |
| POST   | `/auth/login`             | Public                                              | Authenticate                                   |
| POST   | `/auth/refresh`           | Refresh cookie                                      | Restore/renew an access token                  |
| POST   | `/auth/logout`            | Refresh cookie and possibly bearer token; confirm   | End the session                                |
| POST   | `/auth/forgot-password`   | Public                                              | Request password reset instructions            |
| POST   | `/auth/reset-password`    | Reset credential in request; exact shape unknown    | Complete password reset                        |
| GET    | `/users/me`               | Bearer token                                        | Load current-user DTO                          |
| PATCH  | `/users/me/favorite-team` | Bearer token                                        | Select, replace, or clear favorite team        |

Frontend paths above are relative to the configured `/api/v1` base.

## Known authentication behavior

- Login and registration return an access token in JSON.
- Registration immediately authenticates the new user.
- Send the access token as `Authorization: Bearer <token>`.
- Access tokens expire after approximately 15 minutes.
- The refresh token is an HTTP-only cookie and cannot/must not be read by frontend JavaScript.
- Refresh calls must include browser credentials.
- The current-user DTO contains `favoriteTeam`, which may be `null`.
- A user can select, replace, or clear the favorite team.
- Team IDs are internal UUIDs; provider mappings are not exposed.

## Session bootstrap

At each full application startup:

1. Set bootstrap state to `checking`.
2. Call `POST /auth/refresh` with credentials included.
3. If successful, put the returned access token in the in-memory auth store.
4. Call `GET /users/me` using that token.
5. Cache the current-user DTO in TanStack Query and mark the session `authenticated`.
6. If refresh fails because no valid session exists, clear auth/user state, mark the session `anonymous`, and continue rendering the public application.

An unavailable API and an ordinary invalid/missing refresh cookie may require different UX. The error/status contract is needed to distinguish those cases reliably.

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
- an optional access-token getter for later dependency injection without owning token state
- normalized `ApiError` status, code, safe message, field errors, and request ID when supplied
- safe empty/`204` handling
- native `RequestInit` options, including abort signals

`src/services/api/environment.ts` validates `VITE_API_BASE_URL` as an absolute HTTP(S) URL without embedded credentials. `configuredClient.ts` is only a factory; it is not imported by a feature and performs no network activity. Refresh coordination and automatic retry are explicitly deferred.

## Query ownership and keys

Suggested key factories:

```text
teamKeys.all             -> ['teams']
teamKeys.detail(teamId)  -> ['teams', teamId]
userKeys.me              -> ['users', 'me']
```

- `GET /teams` populates the teams list query.
- `GET /teams/:teamId` populates a team detail query and may seed/read compatible list data if shapes permit.
- `GET /users/me` is the sole source of current-user/favorite-team truth.
- A successful favorite-team mutation should update the `users/me` cache from the returned DTO when available, then invalidate narrowly if needed.
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

The exact backend error envelope is not known. Do not bind form code to an assumed `{ message }` response until it is confirmed. Forgot-password UI should use a non-enumerating success response if supported by the backend.

## Backend/deployment requirements to verify

- Exact local, test, and production API origins
- Request/response DTOs and examples for every endpoint
- Error envelope and validation-error format
- Which endpoints require credentials and/or bearer authentication
- Cookie `SameSite`, `Secure`, domain, path, and expiry behavior
- Allowed CORS origins, methods, headers, and credential support
- CSRF protections for cookie-backed refresh/logout operations
- Reset-password link format and token transport
- Rate-limit responses and retry guidance
- Date/time formats and canonical timezone behavior

The frontend scaffold and public shell can begin without all of these answers. Contract-dependent auth and favorite-team integration should not be declared complete until they are resolved.
