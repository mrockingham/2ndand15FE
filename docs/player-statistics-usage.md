# Public Player Statistics Usage

## Scope

Frontend Milestone 16 consumes the read-only player APIs delivered by backend Milestone 15. It provides a public directory, profiles with season summaries and recorded game appearances, and a neutral two-player comparison. The frontend does not import player data, contact nflverse directly, poll for changes, synthesize missing appearances, calculate predictions, or make fantasy recommendations.

The contract was verified against the sibling backend player schemas, DTO mapping, routes, service, repository, and tests in August 2026.

## Public routes

- `/players` is the searchable, filterable, cursor-paginated directory.
- `/players/:playerId` shows backend-provided identity, available season summaries, and recorded game-stat rows.
- `/players/compare` compares exactly two different players for one season shared by both players.

All three route modules are lazy-loaded. Their meaningful filters and selections are stored in the URL so navigation, reloads, and shared links preserve context.

## API boundary

The frontend calls only these public endpoints:

| Endpoint                         | Supported frontend use                                                           |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `GET /players`                   | `search`, `teamId`, raw `position`, `season`, `limit`, and backend cursor        |
| `GET /players/:playerId`         | One profile addressed by an internal UUID                                        |
| `GET /players/:playerId/stats`   | `season`, optional `week`/`seasonType`, `limit`, and backend cursor              |
| `GET /players/:playerId/seasons` | Backend-derived `REG`, `POST`, and combined `REG_POST` summaries when they exist |

Directory search starts at two trimmed characters. Seasons are limited by the verified backend contract to 2020 through 2025, weeks to 1 through 22, list limits to 1 through 100, and season types to `PRE`, `REG`, or `POST`. The UI never sends invented filters.

Player, team, game, stat, and summary IDs are opaque internal UUIDs. Provider mappings and provider IDs must never appear in URLs, application state, logs, or presentation.

## Directory filter meaning

Position filtering uses the exact uppercase backend position value; the frontend does not collapse or guess position aliases. When a team is supplied without a season, the backend matches the latest team or any stored roster membership. When team and season are supplied together, the backend matches stored roster membership for that season. The UI labels these semantics explicitly and treats the signed-in favorite team only as a convenient team-filter shortcut.

The backend owns deterministic ordering and cursor continuation. The frontend appends returned pages with a bounded **Load more players** action and never computes its own cursor.

## Profile and statistical presentation

- Identity fields are shown exactly as returned. Nullable birth date, measurements, college, draft round/pick, jersey number, status, position, and team data use honest unavailable states.
- A recorded numeric zero is rendered as `0`. A nullable value is not converted into zero; it is omitted from position-specific metric groups or rendered as an em dash when comparison context requires a shared row.
- Weekly logs render only rows returned by `/stats`. Missing weeks, byes, and non-appearances are never expanded into synthetic zero-stat games.
- Position-relevant groups are derived from non-null backend fields. Basic percentages and per-attempt averages are calculated only when both operands exist and the denominator is non-zero.
- Combined regular-season/postseason views use the backend `REG_POST` summary. Their game log omits preseason records; no combined total is recomputed in the browser.
- Game links use internal `gameId` values and existing public `/games/:gameId` routes.

Source-provided fantasy totals may be labeled and displayed as historical source data. They are not a scoring-system endorsement, recommendation, projection, or contest feature.

## Comparison behavior

Comparison uses only the two players' `/seasons` responses. Search is debounced and calls the public directory endpoint. Selecting the same player on both sides is prevented, and manually supplied duplicate IDs do not produce a comparison.

The comparison selects the newest shared season when no valid season is present in the URL, preferring `REG_POST`, then `REG`, then `POST` for each player. Shared metrics are presented first, role-specific metrics remain visible with unavailable values, and an explicit warning appears for different positions or position groups. The UI does not calculate an overall winner or color-code a conclusion. A **Higher value** annotation is limited to straightforward positive counting/efficiency metrics and is never applied to negative statistics such as interceptions thrown.

## Attribution, images, and trust

Every successful player response includes the backend-provided nflverse attribution. The UI links to the supplied source URL, displays the `CC BY 4.0` license, and explains that data is normalized and served from local backend storage rather than fetched live from nflverse.

Headshot URLs are untrusted display input. Only HTTP(S) URLs are attempted, referrers are not sent, and absent, invalid, or failed images fall back to player initials. The frontend does not fetch or cache source images itself.

## Query behavior and failures

Player list/search queries use normalized `['players', 'list' | 'search', filters]` families and a 10-minute stale time. Identity, stats, and seasons live below `['players', 'detail', playerId, ...]` and use a one-hour stale time because this milestone is historical rather than live. Requests carry abort signals and never poll or refetch on an interval.

Invalid UUID routes fail locally. Public `404`, validation, rate-limit, network, and server failures use bounded user-facing messages without echoing backend bodies. Directory, profile, summary, game-log, and comparison surfaces provide intentional loading, empty, and retry states where appropriate.
