# Administrative Schedule Usage

## Access and security boundary

Sign in through the normal application flow. Authorized `EDITOR` and `ADMIN` accounts see an Admin link in the public header and may open `/admin`. A `USER` is returned to the public site. `ADMIN` accounts additionally see the complete Audit log and override deletion controls.

These frontend checks improve navigation only. Every administrative request is authenticated through the existing bearer-token/refresh flow and the backend performs the authoritative capability check. A `403` refreshes the current-user record and shows an insufficient-permission message. Roles are never inferred from email addresses or stored separately.

## Routes

| Route                                 | Purpose                                          | Role                          |
| ------------------------------------- | ------------------------------------------------ | ----------------------------- |
| `/admin`                              | Redirect to Games                                | Editor or admin               |
| `/admin/games`                        | Bounded schedule list                            | Editor or admin               |
| `/admin/games/new`                    | Manual game creation                             | Editor or admin               |
| `/admin/games/:gameId`                | Detail, edit, override, verification, game audit | Editor or admin               |
| `/admin/import`                       | Validate and write a schedule CSV                | Editor or admin               |
| `/admin/audit`                        | Complete sanitized audit log                     | Admin                         |
| `/admin/news-sources`                 | Source registry, health, test, and ingest        | Editor or admin               |
| `/admin/news-sources/new`             | Source creation                                  | Admin                         |
| `/admin/news-sources/:sourceId`       | Source detail and admin-only editing             | Editor or admin               |
| `/admin/news-candidates`              | Editorial candidate inbox                        | Editor or admin               |
| `/admin/news-candidates/manual`       | Manual metadata submission                       | Editor or admin               |
| `/admin/news-candidates/:candidateId` | Candidate review and draft conversion            | Editor or admin               |
| `/admin/data-health`                  | Current-season game data coverage and diagnosis  | Editor or admin               |
| `/admin/game-media`                   | Game Center curated video list                   | Editor or admin               |
| `/admin/game-media/:gameId`           | Curated video management for one game            | Editor (view), admin (manage) |

## Games and ownership

The list supports season filtering and backend cursor pagination. The backend currently exposes no other list filters, so week/status/team/date/source/search filters are intentionally absent. No provider IDs are displayed.

Game detail separates:

- Resolved values: the values the public game DTO currently receives.
- Base values: normalized values before editorial fallback.
- Editorial override: populated fields replace base fields; blank fields fall back independently.
- Provenance and verification: source identity, safe external URL, imported/verified timestamps, and plain-text notes.

Manually owned games can be edited directly. Provider-managed games must use an editorial override; a `409 PROVIDER_GAME_REQUIRES_OVERRIDE` is explained rather than silently changing the operation. Editing base or override fields may clear verification. Deleting the entire override requires `ADMIN` and an explicit confirmation.

Kickoff creation requires a local date/time plus an explicit UTC offset. No timezone is guessed. Existing imported games may legitimately have `startTime: null`; admin list, detail, resolved/base previews, and edit defaults display `Time TBD`. Editing another field on a manually owned TBD game preserves the null kickoff by omitting `startTime`. Assigning a kickoff still requires an explicit offset, and manual creation cannot submit null. Override kickoff values may explicitly resolve to a timestamp or null as supported by the backend.

## Verification

Verification records the source name, optional URL, and optional note. When the URL is missing, the UI asks for confirmation. Verification means an authorized person checked the schedule source; it does not grant content, logo, or trademark rights.

## Schedule import

Imports use CSV in the exact backend-documented column order:

```text
season,seasonType,week,startTime,awayTeam,homeTeam,status,venueName,venueCity,broadcastNetwork,isNeutralSite,sourceName,sourceType,sourceUrl,externalReference,notes
```

The browser parses CSV into JSON rows because the API accepts `{ rows, dryRun }`; it does not send multipart files or server paths. Files/content are limited to 1 MiB and 500 rows. Values beginning with spreadsheet formula markers are rejected and all feedback is rendered as text.

The `startTime` CSV value accepts either an ISO 8601 timestamp with an explicit offset or the exact literal `TBD`, matching the backend import contract. `TBD` is never converted into an invented date or time.

The workflow is intentionally two-step:

1. Select or paste CSV and validate without writing.
2. Review created/updated/skipped/warning/failure counts and row feedback.
3. Confirm the separate write action for the exact unchanged content.

Changing content clears the validation result. Buttons are disabled while requests are pending to avoid duplicate submission. Only the final backend response is presented as an import result.

## Audit access

Admins can filter the complete audit log by the backend-supported action, entity type, and entity ID fields and page by cursor. Editors can see only game-scoped events on game detail where the backend permits it. Before/after snapshots are flattened into changed fields, sensitive-key patterns are suppressed again in the UI, and no raw arbitrary JSON or HTML is rendered.

## Game Media

Operators curate up to 4 manually embedded videos per game, plus one globally-configured video, at `/admin/game-media`. A **Global Game Center Video** panel sits above the season/season-type/week filters — it shows the currently active global video (thumbnail, title, source, canonical link) or a "No global video configured" empty state, with Add/Edit/Remove for `ADMIN` and a read-only view for `EDITOR`. The global video is shown on every Game Center: first (primary) when a game has no curated video and no available automatic highlight, second (a selector) when other media exists. It is one database record, never copied per game, and never counts against a game's 4-curated-video cap.

Below the filters, each game row shows curated/automatic counts and a friendly display-mode badge ("Curated media" / "Automatic highlight" / "Global video" / "No media" — the raw backend enum is never shown). "Manage Media" opens `/admin/game-media/:gameId`, which now also shows a small read-only note when a global video is active, explaining whether it's currently primary or secondary for that game — global video management itself stays on the top-level list page, never duplicated into per-game detail.

Both the per-game curated-video form and the global-video form share the same fields and component: title and embed URL are required; canonical URL, thumbnail URL, and source label are optional. The embed-URL field's helper text always reads "Paste the embed URL, not the iframe code" — the form rejects pasted `<iframe>`/HTML markup and non-HTTPS URLs client-side, but does not duplicate the backend's embed-host allowlist; a rejected host (the same `GAME_CURATED_VIDEO_HOST_NOT_ALLOWED` code covers both curated and global videos) or duplicate embed URL is reported back from the backend's error response. Both forms also offer the YouTube oEmbed checker: paste a normal watch link, confirm it allows embedding, and use the result to fill in the embed URL/canonical URL/title/thumbnail for review before saving.

Position 0 is always primary for per-game curated videos (the backend also returns an explicit `isPrimary` flag). Reordering uses Move Up/Move Down buttons (no drag-and-drop) and calls the backend's order endpoint directly; the first item after any reorder is the new primary. Removing a curated video shows a confirmation explaining that the automatic Highlightly highlight, if any, is preserved and unaffected, and that removing the last curated video restores automatic display in Game Center. Removing the global video shows a matching confirmation: games with their own media keep it, games with no other media return to having no video. The Automatic Highlight section on the game detail page remains read-only informational display only — Highlightly data cannot be edited or deleted from Game Media.

Add/Edit/Remove/Reorder controls (both per-game and global) are `ADMIN`-only, matching the mutating-action gating used elsewhere in Admin (e.g. News Sources pause/resume/edit); `EDITOR` accounts see the identical read-only list, detail, and global-video panel with no action buttons.

## Known limitations and exclusions

- Backend list filters are currently limited to season, limit, and cursor.
- Audit filters are currently limited to action, entity type, entity ID, limit, and cursor; actor/date filters are not exposed.
- Import validation returns aggregate counts and failures; it has no separate backend validation token. The frontend ties validation to exact unchanged content for the current page lifetime.
- There is no role-management UI, provider configuration UI, rich-text/HTML editing, multipart upload, live polling, WebSocket, play-by-play, or deployment change. Public schedule behavior is documented in [public-games-usage.md](public-games-usage.md), and the separate Markdown-based article CMS is documented in [editorial-cms-usage.md](editorial-cms-usage.md).
- Highlightly remains evaluation-only. No Highlightly synchronization was added.

News-source and candidate operating guidance lives in [news-inbox-usage.md](news-inbox-usage.md). Ingestion is explicit and creates only private candidates; it never publishes an article. Data Health coverage/diagnosis semantics and the explicit, quota-consuming Highlightly probe live in [data-health-usage.md](data-health-usage.md).
