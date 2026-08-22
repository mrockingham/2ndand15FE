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

The backend's `start.yardLine`/`end.yardLine` are already offense-relative on a 0–100 scale (own goal 0, midfield 50, opponent goal 100), so the field-progress visualization never needs to guess which physical team's endzone is which — it always labels the track `OWN / 50 / OPP` and derives the "current situation" yard line (e.g. `Opp 42`) from the same number. Selecting a play updates the field; the default selection is the latest play with usable field-position data, and a user's manual selection survives a manual refresh as long as that play still exists in the refreshed list.

## Team stats

`TeamStatsPanel` reuses the away/home comparison-row presentation established by Stats Hub's Current Season cards (primary rows: total/passing/rushing yards, first downs, turnovers, possession; a collapsible "More team stats" detail section covers total plays, sacks, third/fourth downs, penalties, red zone, and quarter-by-quarter scoring) but is implemented independently in the `games` feature against the per-game `/games/:gameId/stats` response, rather than importing Stats Hub's list-endpoint types — the two features intentionally do not share type or component code, to avoid coupling an already-shipping feature to this one. No player statistics are modeled or rendered; the backend's `playerStats` block is out of scope for this milestone.

## Live readiness (no polling yet)

`useGameQuery`, `useGamePlaysQuery`, and `useGameStatsQuery` all accept an optional `{ refetchInterval?, staleTime? }` bag. Nothing in this milestone populates `refetchInterval` — a future M27 milestone can inject one centrally (e.g. from the Game Center page based on live status) without touching any component. A subtle manual "Refresh" action refetches the game, plays, and stats together for development/testing; it is not presented as a required workflow. `staleTime` for plays/stats is longer once the game is finalized (`FINAL`/`POSTPONED`/`CANCELED`/`SUSPENDED`) and shorter otherwise, but no `setInterval`, SSE, or WebSocket exists anywhere in this milestone.

## Sections and tabs

`[ Plays ]` and `[ Team Stats ]` only appear together when both have content. If only one of the two has data, it renders directly with no tab control. If neither has data (e.g. tonight's pregame Eagles–Patriots matchup before kickoff), a single factual Overview message renders instead — never an empty giant box.

## Exclusions

This milestone adds no automatic polling, WebSockets, server-sent events, backend changes, player-level live stats, player tracking, exact replay, drive inference, fantasy, betting, or provider-specific code.
