# Verified Authentication Contract

## Source and status

This contract was verified against the sibling backend repository at `C:\projects\2ndand15\2ndand15BE` in July 2026. The authoritative sources were:

- `src/docs/openapi.ts`
- `src/modules/auth/auth.schemas.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.routes.test.ts`
- `src/modules/users/user.dto.ts`
- `src/common/http/refresh-cookie.ts`
- `src/common/middleware/error-handler.ts`
- `src/config/env.ts`

Frontend authentication code must be updated deliberately if those sources change.

## Local environment and credentials

- API origin: `http://localhost:3000`
- Versioned base: `/api/v1`
- Default allowed browser origin: `http://localhost:5173`
- Backend CORS enables credentials and rejects wildcard origins.
- Browser auth requests use `credentials: 'include'` so refresh cookies can be set, rotated, or cleared.
- Authenticated API calls send `Authorization: Bearer <accessToken>`.

## Shared response types

### User DTO

```ts
interface UserDto {
  id: string; // UUID
  email: string;
  displayName: string | null;
  isActive: boolean;
  favoriteTeam: TeamDto | null;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}
```

`TeamDto` contains normalized team fields documented by the backend OpenAPI. It never contains provider mappings. The auth milestone may display a returned favorite team but must not add editing behavior.

### Authentication success

Registration, login, and refresh all return the same shape:

```json
{
  "data": {
    "user": {},
    "accessToken": "short-lived-jwt",
    "accessTokenExpiresIn": 900
  }
}
```

`accessTokenExpiresIn` is a positive integer lifetime in seconds. The refresh token never appears in JSON.

### Current user success

```json
{
  "data": {
    "user": {}
  }
}
```

### Message success

```json
{
  "data": {
    "message": "..."
  }
}
```

### Error response

All centralized application errors use:

```json
{
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe public message",
    "details": [],
    "requestId": "correlation-id"
  }
}
```

`details` is optional. Validation errors currently use an array of `{ "field": string, "message": string }`. Relevant stable codes include:

- `VALIDATION_ERROR` (`400`)
- `INVALID_JSON` (`400`)
- `INVALID_CREDENTIALS` (`401`)
- `INVALID_REFRESH_TOKEN` (`401`)
- `UNAUTHORIZED` (`401`)
- `EMAIL_ALREADY_REGISTERED` (`409`)
- `RATE_LIMIT_EXCEEDED` (`429`)
- `INVALID_RESET_TOKEN` (`400`)
- `INTERNAL_SERVER_ERROR` (`500`)

The frontend preserves codes for programmatic handling but shows curated messages for sensitive/unexpected failures.

## Endpoint contracts

### `POST /auth/register`

Request:

```ts
{
  email: string;        // trimmed, valid email, maximum 254
  password: string;     // exactly 12–128 characters; not trimmed or transformed
  displayName?: string | null; // trimmed, 1–80 when non-null
}
```

- `confirmPassword` is frontend-only and must not be submitted.
- Success: `201` with authentication success body and a refresh cookie.
- Errors: `400` validation, `409 EMAIL_ALREADY_REGISTERED`, `429` rate limit.
- The stored normalized email is lowercase, but the public DTO preserves the submitted trimmed email casing.

### `POST /auth/login`

Request:

```ts
{
  email: string; // trimmed, valid email, maximum 254
  password: string; // exactly 12–128 characters
}
```

- Success: `200` with authentication success body and a refresh cookie.
- Errors: `400` validation, `401 INVALID_CREDENTIALS`, `429` rate limit.
- Known-user and unknown-user failures share `Invalid email or password.`.

### `POST /auth/refresh`

- Request body: none.
- Authentication source: refresh token read only from the HTTP-only cookie.
- Success: `200` with authentication success body, including both `user` and a new access token.
- The refresh cookie rotates on every success; the previous token is invalid after rotation.
- Errors: `401 INVALID_REFRESH_TOKEN`, `429` rate limit.

Because refresh returns the full user DTO, startup restoration may seed the current-user query directly without immediately calling `/users/me`. `/users/me` remains the canonical refetch endpoint.

### `POST /auth/logout`

- Request body: none.
- Success: idempotent `204` with no body, including when no current session exists.
- Clears the refresh cookie and revokes the matching session when present.
- No bearer token is required by the route.

### `POST /auth/forgot-password`

Request:

```ts
{
  email: string;
} // trimmed, valid email, maximum 254
```

- Success: `200` message response.
- Exact generic message: `If an account exists for that email, password reset instructions have been sent.`
- Known, unknown, and inactive users receive the same public success response.
- Errors: `400` validation and `429 RATE_LIMIT_EXCEEDED`.
- Development reset URLs/tokens are backend-only diagnostics and must not appear in normal frontend UI.

### `POST /auth/reset-password`

The backend appends the opaque token to `PASSWORD_RESET_FRONTEND_URL` using the query parameter named `token`, producing a frontend URL such as:

```text
http://localhost:5173/reset-password?token=<opaque-token>
```

Request:

```ts
{
  token: string; // 32–512 characters
  password: string; // exactly 12–128 characters
}
```

- `confirmPassword` is frontend-only and must not be submitted.
- Success: `200` with `Password reset successfully. Please log in again.`
- Success revokes every refresh session, clears the current refresh cookie, and does not authenticate the user.
- Errors: `400 VALIDATION_ERROR`, `400 INVALID_RESET_TOKEN`, and `429` rate limit.
- The token must remain ephemeral: read from the URL, submit only to this endpoint, and never log or persist it.

### `GET /users/me`

- Requires `Authorization: Bearer <accessToken>`.
- Success: `200` current-user success body.
- Errors: `401 UNAUTHORIZED` and `429` rate limit.
- Returned users never contain a password/hash, normalized email, session, access/refresh/reset token, or provider mapping.

## Refresh cookie contract

- Default name: `secondand15_refresh` (backend-configurable; frontend never reads it).
- `HttpOnly`: always.
- Path: `/api/v1/auth`.
- Default `SameSite`: `Lax`.
- Default development `Secure`: false.
- Production `Secure`: required true.
- `SameSite=None` is valid only with `Secure=true`.
- Default lifetime: 30 days.
- Registration/login set it, refresh rotates it, and logout/reset-password clear it.

The frontend creates no cookies and does not inspect `document.cookie` for authentication.
