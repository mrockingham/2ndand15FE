# Game Center usage

The existing public game detail route (`/games/:gameId`) is the Game Center. It composes the resolved `Game` record with two additional per-game reads — structured play-by-play and team statistics — into a scoreboard, an interactive play feed with a 2D field-progress visualization, and a team-stats comparison. No second detail route exists; every "Game Center" link across Stats Hub, AI Hub, and Home already points here.

## Endpoints and ownership

| Endpoint                   | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `GET /games/:gameId`       | Resolved public game (unchanged)                    |
| `GET /games/:gameId/plays` | Provider-neutral, sequence-ordered structured plays |
| `GET /games/:gameId/stats` | Per-game team statistics (home/away)                |

Each family is a separate TanStack Query hook — `useGameQuery`, `useGamePlaysQuery`, `useGameStatsQuery` — all defined in `src/features/games/queries.ts` and keyed under `gameKeys.detail(gameId)` (`src/features/games/queryKeys.ts`). A stats or plays failure is isolated to its own panel; it never fails the scoreboard or the other panel.

A 404 from `/games/:gameId/stats` (the backend's "not computed yet" response) is treated as `coverage: 'UNAVAILABLE'` data, not a thrown error — `getGameStats` (`src/features/games/api.ts`) catches it and returns a normal result so the Team Stats panel can render its own factual empty message instead of an error banner. An empty `plays: []` array is likewise a normal response, not an error.

## Scoreboard

The scoreboard (`ScoreboardHero`) never fabricates a `0–0` score for a scheduled or pregame game: it only renders scores when the backend status is score-bearing (`IN_PROGRESS`, `HALFTIME`, `FINAL`) **and** both scores are non-null. A factual `0–0` for a live or final game renders normally, since `0` is a real recorded value, not a missing one. The center status line shows kickoff timing for `SCHEDULED`/`PREGAME`, a tight `Q2 · 04:31` line while `IN_PROGRESS`, `Halftime` for `HALFTIME`, and nothing extra for `FINAL`/`POSTPONED`/`CANCELED`/`SUSPENDED` (the status chip already says so).

## Play-by-play and field progress

Plays are keyed by their stable backend `id` (never array index) and displayed newest-first while the backend's `sequence` field is preserved for selection and default-play logic. Each row shows only the fields the backend actually returned — down/distance is hidden, not fabricated, when either value is null — and marks scoring, turnover, and penalty plays with an icon-plus-text badge (`SCORE`, `TURNOVER`, `FLAG`), never color alone.

The backend's `start.yardLine`/`end.yardLine` are already offense-relative on a 0–100 scale (own goal 0, midfield 50, opponent goal 100), so the field-progress visualization never needs to guess which physical team's endzone is which — it always labels the track `OWN / 50 / OPP` and derives the "current situation" yard line (e.g. `Opp 42`) from the same number. Selecting a play updates the field; the default selection is the latest play with usable field-position data.

Backend `GamePlay` IDs are stable only for the currently-active snapshot — the FINAL authoritative replacement (see below) can mint entirely new IDs for the same logical plays. `resolveSelectedPlayAfterRefresh` (`src/features/games/gameCenterSelection.ts`) resolves the selection after every refresh in three steps: keep the same ID if it still exists; otherwise fall back to a play at the same `sequence`/`period`/`clock` (survives an ID swap when the logical play is still represented); otherwise fall back to the latest play with usable field data. It never throws or renders a broken state when a previously-selected play disappears. New plays never force-scroll the feed or reset the user's place: a lightweight "N new plays" control appears only when the user has scrolled away from the newest region and more plays arrive, on the desktop two-column layout's own scroll container (mobile page-flow scrolling is out of scope for this indicator in V1).

## Team stats

`TeamStatsPanel` reuses the away/home comparison-row presentation established by Stats Hub's Current Season cards (primary rows: total/passing/rushing yards, first downs, turnovers, possession; a collapsible "More team stats" detail section covers total plays, sacks, third/fourth downs, penalties, red zone, and quarter-by-quarter scoring) but is implemented independently in the `games` feature against the per-game `/games/:gameId/stats` response, rather than importing Stats Hub's list-endpoint types — the two features intentionally do not share type or component code, to avoid coupling an already-shipping feature to this one.

## Player stats

`PlayerStatsPanel` renders directly below `TeamStatsPanel` (same Team Stats tab, same `/games/:gameId/stats` response — no separate request) once team stats are available. The backend's `data.playerStats.{home,away}` block is categorized into `passing`/`rushing`/`receiving`/`defense`/`kicking`/`punting`/`returns`, each an array of rows keyed by a player identity (`id`, `displayName`, `position`, `positionGroup`, `headshotUrl`). Each category renders as two side-by-side tables — away then home — so player production is always separated by team; a category with zero rows for both teams is omitted entirely rather than showing an empty table, and a team with zero rows in a category that the other team has data for simply doesn't get a table for that category.

The backend also returns `meta.playerStatsAvailable`, which is currently `false` for every game in the local dataset ("Player box scores are unavailable until stable internal player identities are reconciled." — a backend limitation, not a frontend gap). When `playerStatsAvailable` is false, or every category is empty for both teams, the panel shows one factual message — "Player statistics are not yet available for this game." — instead of an empty grid of tables. `meta.playerStatsCoverage` (provider/resolved/unresolved row counts) is received but not surfaced in the UI; it's an internal reconciliation metric, not something the public UI needs to explain.

## Automatic live polling

Game Center updates itself during live games by polling the 2nd & 15 backend only — it never calls Highlightly or any other provider directly, matching the provider-neutral public contract. All intervals are centralized in `src/features/games/gameCenterPolling.ts` (`getGameRefetchInterval`, `getPlaysRefetchInterval`, `getStatsRefetchInterval`, `getGameCenterStaleTime`), not scattered across components:

| Game status                                | Game state | Plays      | Stats      |
| ------------------------------------------ | ---------- | ---------- | ---------- |
| `SCHEDULED`/`PREGAME`, >10 min to kickoff  | no polling | no polling | no polling |
| `SCHEDULED`/`PREGAME`, ≤10 min to kickoff  | 30s        | no polling | no polling |
| `IN_PROGRESS`                              | 15s        | 15s        | 30s        |
| `HALFTIME`                                 | 30s        | 30s        | 60s        |
| `FINAL`/`POSTPONED`/`CANCELED`/`SUSPENDED` | stopped    | stopped    | stopped    |

`useGameQuery` self-polls: it defaults its `refetchInterval`/`staleTime` to a TanStack Query v5 function form — `(query) => getGameRefetchInterval(query.state.data)` — evaluated against its own just-fetched data, so `GameDetailPage` needs no changes to get live game-state updates. `useGamePlaysQuery`/`useGameStatsQuery` can't self-determine their cadence (their data carries no game status), so `GameCenterContent` — which already holds the loaded game — computes their interval/staleTime from the same policy functions and passes them in as plain numbers. This is the "already-loaded game query as status authority" pattern: no extra fetch is made just to decide a polling cadence, and the plays/stats intervals update automatically via ordinary re-render whenever the game's status changes, with no remount.

`staleTime` for the live/halftime/pregame-window states is set to match the active polling interval itself (not a flat five minutes) specifically so that `refetchOnWindowFocus` (the TanStack Query v5 default, left enabled on all three hooks) reliably refetches promptly when a user returns to a background tab — if the flat five-minute value were kept, a refocus after a short hidden period would often see data that's technically still "fresh" and skip the refetch. Interval polling itself relies on the TanStack Query v5 default of pausing while `document.visibilityState` is hidden (`refetchIntervalInBackground` is left unset); no custom visibility system was built.

At the LIVE → FINAL transition, `GameCenterContent` fires exactly one extra plays+stats refetch (the game record itself is already the fresh FINAL data that triggered it) to pick up the backend's authoritative snapshot replacement, then polling stops on its own since every policy function returns `false` once finalized. A background poll failure never blanks existing data: every query-result branch in the page/panels checks `data === undefined` rather than `isError` alone, so a transient failure with prior data keeps rendering that data (TanStack Query preserves it across a failed background refetch) while the shared `FreshnessIndicator` communicates staleness.

`FreshnessIndicator` (near the scoreboard, shown only while `IN_PROGRESS`/`HALFTIME`) renders `LIVE · Updated 8 sec ago`, `LIVE · Updating…` while a fetch is in flight, or `LIVE · Last updated 1 min ago` after a failed background refresh. Its timestamp is the oldest `dataUpdatedAt` among the three queries that have succeeded at least once (a deliberately conservative choice — the label is never falsely optimistic about freshness). It owns its own 1-second ticking clock internally so only that small indicator re-renders every second, not the rest of the page, and carries no `aria-live` region so it never spams assistive technology on every tick.

The manual "Refresh" button still refetches the game, plays, and stats together and remains available regardless of automatic polling — useful for troubleshooting, never presented as required.

## Sections and tabs

`[ Plays ]` and `[ Team Stats ]` only appear together when both have content. If only one of the two has data, it renders directly with no tab control. If neither has data (e.g. tonight's pregame Eagles–Patriots matchup before kickoff), a single factual Overview message renders instead — never an empty giant box.

## Exclusions

This milestone adds no WebSockets, server-sent events, backend changes, direct Highlightly (or any other provider) calls from the frontend, player-level live stats, player tracking, exact replay, drive inference, fantasy, betting, or provider-specific code. Cross-tab synchronization (e.g. `BroadcastChannel`) is also out of scope — multiple open Game Center tabs simply poll independently.
