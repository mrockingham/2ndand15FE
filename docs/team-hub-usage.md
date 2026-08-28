# Public Team Directory and Team Hub usage

Frontend Milestone 20 consumes the read-only Team Hub delivered by backend Milestone 19. The public `/teams` directory and `/teams/:teamId` hub combine approved team identity, bounded schedule and news previews, historical roster evidence, and team-split statistical leaders. They do not provide current 2026 rosters, injuries, depth charts, transactions, live statistics, AI analysis, fantasy recommendations, or predictions.

Frontend Milestone 39B consumes M39A's backend-authored `homepage` object from that same Hub response. It adds a focal-point action-image banner with the prior identity treatment as its null/load-failure fallback, a resolved ARTICLE/VIDEO featured editorial slot with ordered mixed supporting content, and an ordered horizontal Team Highlights row. These modules never issue separate public requests or recompute featured ownership, media eligibility, or ordering.

## Endpoints and query ownership

| Endpoint                          | Frontend use                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `GET /teams`                      | Active-team directory and shared team identity                               |
| `GET /teams/:teamId/hub`          | Team hero, bounded upcoming/recent games, published news, and coverage       |
| `GET /teams/:teamId/roster`       | Cursor-paginated historical weekly-roster evidence for one imported season   |
| `GET /teams/:teamId/stat-leaders` | Cursor-paginated team-split historical leaders                               |
| `GET /stats/metadata`             | Leader seasons, types, categories, metrics, precision, positions, and limits |
| `PATCH /users/me/favorite-team`   | Existing authenticated set/replace workflow using an internal team UUID      |

Team Homepage administration lives at `/admin/team-homepages?teamId=<uuid>` and calls only `/admin/teams/:teamId/homepage` plus its banner, editorial, candidate, order, highlight, and settings subresources. Mutations invalidate that team's admin detail, the relevant team-scoped candidate family, and `teamHubKeys.overview(teamId)`; they do not invalidate every Team Hub.

The active team catalog remains under `['teams', 'list']` and is fresh for 24 hours. Team Hub overview, roster, and leader reads use separate deterministic `['teamHub', ...]` families with five-minute, one-day, and six-hour stale times respectively. Overview reads refetch on mount so synchronized current-season results become visible; historical roster and leader caching is unchanged. Stats metadata retains its existing one-day cache. All requests pass abort signals, do not poll, do not aggressively refetch on focus, and are never copied into Zustand or browser persistence.

The hub request resolves before roster and leader reads are enabled. Roster and leader filters are normalized before entering their query keys. Only the selected roster season and selected leader configuration are fetched; the frontend never preloads every season, category, metric, or cursor page.

## Team directory and favorite behavior

The directory groups the backend team catalog in AFC/NFC and East/North/South/West order while sorting teams alphabetically within a division. Search matches the returned full name, city, nickname, or abbreviation. `search`, `conference`, and `division` are URL-backed and invalid values normalize away. Empty filters show all active teams; an unmatched combination is factual emptiness rather than an API error.

Cards reuse `TeamIdentity`, including its safe approved-logo handling, strict color validation, image-failure recovery, and accessible abbreviation fallback. The team name is a normal link and the favorite action is a separate control, avoiding nested interactive content.

Authenticated favorite actions reuse the existing mutation and write the returned current-user DTO directly to `['users', 'me']`, so the header, Account, Home, directory, and hub derive the same state. Signed-out users can still browse every team and are sent through the existing login flow only when they invoke a favorite action.

## Team overview semantics

The hub uses the backend order for its maximum-three upcoming games, maximum-three recent final games, and maximum-three published articles. It does not refetch a full schedule or infer news through title matching. Kickoff `null` remains `Time TBD`; scores are not invented. A Win/Loss/Tie label appears only for a final game when both scores are present, and no season record is calculated.

Article previews use only public article DTOs and existing article links. Draft status, candidate/source-inbox metadata, editor notes, moderation details, and audit data have no representation on the public route. Schedule, news, roster, and statistics each have content-specific empty states.

Invalid team UUIDs fail locally, and backend `TEAM_NOT_FOUND`/404 responses use the existing not-found experience. A hub failure has a bounded retry surface. Roster or Stats metadata/leader failures remain section-local and do not collapse already available identity, schedule, news, or other historical content.

## Historical roster semantics

`rosterSeason`, `rosterPosition`, `rosterPositionGroup`, and `rosterSearch` are shareable URL state. The season defaults to the greatest season returned in `historicalData.rosterSeasons`; no fixed 2020–2025 list and no inferred 2026 option is used. Position and group values come from the hub coverage response. Search is trimmed, debounced, limited to 100 characters, and sent only at the backend minimum of two characters.

A row means at least one stored weekly roster record linked the player to the team and selected season. It does not establish full-season membership or current-team membership. Historical position, group, jersey, status, first/last recorded week, and roster-week count are displayed as returned. The latest known team is labeled separately because it describes imported player-profile context, not the historical roster relationship.

Null values remain unavailable and recorded numeric zero remains zero. Player links use internal player UUIDs. Desktop tables have captions and headers; mobile uses cards with the same historical distinctions. Backend `nextCursor` values are passed unchanged as TanStack Query page state, never decoded, deduplicated, logged, or written to the URL. Filter changes therefore restart pagination from the first page.

## Team statistical leaders

Leader state uses `leaderSeason`, `leaderType`, `leaderCategory`, `leaderMetric`, `leaderPosition`, and `leaderPositionGroup`, keeping it distinct from roster state. The season defaults to the greatest intersection of the team's `statSeasons` and Stats metadata seasons. `REG` is preferred when available, followed by the first backend-supported season type. Category order, metric availability and description, exact positions/groups, page limit, decimal precision, and ranking explanation all come from Stats metadata.

Category changes select that category's first season-leader metric and reset pagination. The frontend requests only the path team, selected season/type/metric, and compatible position filters. Backend competition ranks and ties are displayed directly. Values use metadata precision (including one decimal place for sacks); zero remains `0`, and null is not converted to zero.

Team leader totals represent only production recorded for the path team. A traded player's league-wide full-season total is never substituted. The Team Hub provides a compatible deep link to `/stats` using the Stats Hub's `teamId`, `season`, `type`, `category`, `metric`, and optional position parameters rather than Team-Hub-specific names.

## Attribution and privacy boundary

Backend-provided nflverse/CC BY 4.0 attribution and historical coverage notes remain visible. The frontend serves locally stored normalized records and never contacts nflverse directly.

Only internal team, player, game, and article identifiers are used for links and requests. The feature does not display or depend on provider IDs, external player/game IDs, import hashes, manifests, checksums, source filenames or paths, import actors, audit payloads, draft/candidate data, moderation notes, raw SQL fields, or decoded cursor contents.
