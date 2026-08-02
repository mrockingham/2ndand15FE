# Administrative Schedule Usage

## Access and security boundary

Sign in through the normal application flow. Authorized `EDITOR` and `ADMIN` accounts see an Admin link in the public header and may open `/admin`. A `USER` is returned to the public site. `ADMIN` accounts additionally see the complete Audit log and override deletion controls.

These frontend checks improve navigation only. Every administrative request is authenticated through the existing bearer-token/refresh flow and the backend performs the authoritative capability check. A `403` refreshes the current-user record and shows an insufficient-permission message. Roles are never inferred from email addresses or stored separately.

## Routes

| Route                  | Purpose                                          | Role            |
| ---------------------- | ------------------------------------------------ | --------------- |
| `/admin`               | Redirect to Games                                | Editor or admin |
| `/admin/games`         | Bounded schedule list                            | Editor or admin |
| `/admin/games/new`     | Manual game creation                             | Editor or admin |
| `/admin/games/:gameId` | Detail, edit, override, verification, game audit | Editor or admin |
| `/admin/import`        | Validate and write a schedule CSV                | Editor or admin |
| `/admin/audit`         | Complete sanitized audit log                     | Admin           |

## Games and ownership

The list supports season filtering and backend cursor pagination. The backend currently exposes no other list filters, so week/status/team/date/source/search filters are intentionally absent. No provider IDs are displayed.

Game detail separates:

- Resolved values: the values the public game DTO currently receives.
- Base values: normalized values before editorial fallback.
- Editorial override: populated fields replace base fields; blank fields fall back independently.
- Provenance and verification: source identity, safe external URL, imported/verified timestamps, and plain-text notes.

Manually owned games can be edited directly. Provider-managed games must use an editorial override; a `409 PROVIDER_GAME_REQUIRES_OVERRIDE` is explained rather than silently changing the operation. Editing base or override fields may clear verification. Deleting the entire override requires `ADMIN` and an explicit confirmation.

Kickoff creation requires a local date/time plus an explicit UTC offset. No timezone is guessed. Override kickoff values are explicitly entered as UTC.

## Verification

Verification records the source name, optional URL, and optional note. When the URL is missing, the UI asks for confirmation. Verification means an authorized person checked the schedule source; it does not grant content, logo, or trademark rights.

## Schedule import

Imports use CSV in the exact backend-documented column order:

```text
season,seasonType,week,startTime,awayTeam,homeTeam,status,venueName,venueCity,broadcastNetwork,isNeutralSite,sourceName,sourceType,sourceUrl,externalReference,notes
```

The browser parses CSV into JSON rows because the API accepts `{ rows, dryRun }`; it does not send multipart files or server paths. Files/content are limited to 1 MiB and 500 rows. Values beginning with spreadsheet formula markers are rejected and all feedback is rendered as text.

The workflow is intentionally two-step:

1. Select or paste CSV and validate without writing.
2. Review created/updated/skipped/warning/failure counts and row feedback.
3. Confirm the separate write action for the exact unchanged content.

Changing content clears the validation result. Buttons are disabled while requests are pending to avoid duplicate submission. Only the final backend response is presented as an import result.

## Audit access

Admins can filter the complete audit log by the backend-supported action, entity type, and entity ID fields and page by cursor. Editors can see only game-scoped events on game detail where the backend permits it. Before/after snapshots are flattened into changed fields, sensitive-key patterns are suppressed again in the UI, and no raw arbitrary JSON or HTML is rendered.

## Known limitations and exclusions

- Backend list filters are currently limited to season, limit, and cursor.
- Audit filters are currently limited to action, entity type, entity ID, limit, and cursor; actor/date filters are not exposed.
- Import validation returns aggregate counts and failures; it has no separate backend validation token. The frontend ties validation to exact unchanged content for the current page lifetime.
- There is no role-management UI, provider configuration UI, media/news CMS, rich-text editing, multipart upload, public schedule, live polling, WebSocket, play-by-play, or deployment change.
- Highlightly remains evaluation-only. No Highlightly synchronization was added.
