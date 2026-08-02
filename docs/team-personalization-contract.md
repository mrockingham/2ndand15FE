# Verified Team Personalization Contract

## Source and status

This contract was verified against the sibling backend repository at `C:\projects\2ndand15\2ndand15BE` in July 2026. The authoritative sources are the backend OpenAPI document plus the team/user DTOs, controllers, schemas, services, and route tests.

## Team DTO

All public team responses use the normalized application-owned shape below. Provider mappings are never returned.

```ts
interface TeamDto {
  id: string; // internal UUID
  league: 'NFL';
  city: string;
  name: string;
  fullName: string;
  abbreviation: string;
  conference: 'AFC' | 'NFC';
  division: 'East' | 'North' | 'South' | 'West';
  primaryColor: string; // backend format: #RRGGBB
  secondaryColor: string; // backend format: #RRGGBB
  logoUrl: string | null;
  logoSource: string | null;
  isActive: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}
```

Frontend code treats color and image fields as untrusted display data. It validates color syntax before applying an accent and falls back to an abbreviation badge when the approved logo URL is absent or fails.

## `GET /teams`

- Public endpoint; no bearer token required.
- Success: `200` with `{ "data": TeamDto[] }`.
- Returns active NFL teams ordered by conference, division, and full name.
- Error: `429 RATE_LIMIT_EXCEEDED` using the shared error envelope.

## `GET /teams/:teamId`

- Public endpoint using an internal team UUID.
- Success: `200` with `{ "data": TeamDto }`.
- Errors: `400 VALIDATION_ERROR`, `404 TEAM_NOT_FOUND`, and `429 RATE_LIMIT_EXCEEDED`.
- Milestone 2 does not call this endpoint because the catalog response contains every field needed by selection and personalization surfaces.

## `PATCH /users/me/favorite-team`

- Requires `Authorization: Bearer <accessToken>`.
- Request body is strict and accepts exactly `{ "favoriteTeamId": string | null }`.
- Non-null values must be application-owned team UUIDs. `null` clears the favorite.
- Success: `200` with `{ "data": { "user": UserDto } }`, including the updated `favoriteTeam`.
- Setting, replacing, and repeated clearing are idempotent supported behaviors.
- Errors: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 TEAM_NOT_FOUND`, `409 TEAM_INACTIVE`, and `429 RATE_LIMIT_EXCEEDED`.

The frontend writes the returned user directly to the `['users', 'me']` query cache. It does not optimistically update and does not issue a duplicate `/users/me` request after success.

## Data boundaries

- Teams and the current user remain TanStack Query server state.
- Only `TeamDto.id` is submitted as a favorite-team identifier.
- Provider IDs and mappings are neither expected nor rendered.
- Logo URLs and team colors are not persisted by the frontend.
- Team catalog data is not copied into Zustand.
