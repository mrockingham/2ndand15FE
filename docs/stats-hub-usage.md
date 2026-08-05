# Public Stats Hub usage

Frontend Milestone 18 consumes the read-only Stats Hub delivered by backend Milestone 17. The public `/stats` route provides metadata-driven historical leaderboards and one-player recent-performance exploration. It does not contact nflverse directly and includes no live 2026 player statistics.

## Endpoints and ownership

| Endpoint                    | Purpose                                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /stats/metadata`       | API version, imported seasons, endpoint season types, ordered categories and metrics, exact position filters, limits, ranking rules, coverage notes, and attribution |
| `GET /stats/leaders`        | Historical `REG`, `POST`, or `REG_POST` player-season leaders                                                                                                        |
| `GET /stats/weekly-leaders` | Historical `REG` or `POST` player/game/team rows for one week                                                                                                        |
| `GET /stats/recent`         | Chronological recorded appearances and backend-calculated aggregates for one internal player ID and metric                                                           |

TanStack Query owns all four response families. Metadata is fresh for 24 hours; other historical reads are fresh for six hours. Requests pass abort signals, do not poll, do not refetch on window focus, and are never copied into Zustand or browser persistence.

## Metadata-driven controls and URLs

Metadata is loaded before leaderboard requests. It is the source of truth for imported seasons, category order, metric IDs and labels, endpoint availability, decimal precision, exact positions and groups, season types, limits, ranking notes, and nflverse attribution. The current registry contains 20 volume metrics across Passing, Rushing, Receiving, Defense, and Kicking, but the UI does not duplicate that registry.

The current IDs are `passing_yards`, `passing_touchdowns`, `completions`, `passing_attempts`, `interceptions_thrown`, `rushing_yards`, `rushing_touchdowns`, `rushing_attempts`, `receiving_yards`, `receiving_touchdowns`, `receptions`, `targets`, `tackles`, `solo_tackles`, `sacks`, `defensive_interceptions`, `forced_fumbles`, `field_goals_made`, `field_goals_attempted`, and `extra_points_made`. This inventory documents backend v1; UI controls still consume the response definitions.

The URL owns `view`, `season`, `type`, `category`, `metric`, and optional `week`, `teamId`, `position`, and `positionGroup`. Recent exploration may additionally use `recentPlayerId`, `recentSeason`, `recentType`, and `recentGames`. Invalid or stale values are replaced with metadata-derived defaults before they enter query keys. The latest imported season, `REG`, season view, the first supported metric in metadata category order, and the backend limit are the defaults. Weekly view bounds week to 1–22 and never sends `REG_POST`.

Leaderboard cursors are opaque TanStack Query page state. The frontend passes `nextCursor` unchanged, never decodes or deduplicates rows, and never places a cursor in the URL. Filter changes therefore start a distinct query from the first page while global backend ranks remain intact.

## Ranking and display semantics

The backend uses competition ranking (`1, 2, 2, 4`). The frontend displays `rank` and `tied` directly and never recalculates ranking. Metric values use the backend `decimalPlaces`; recorded zero remains `0`, while null is unavailable and displays as an em dash. No percentages, rates, client-side qualification, or fantasy scoring are inferred.

Unfiltered season totals show the returned `NONE`, `SINGLE`, or `MULTI` contributing-team context. A team-filtered season request represents only production recorded for that internal team ID, so a traded player's complete season is never mislabeled as one team's production. Positions come from historical season/game records, not a player's latest profile.

Weekly rows remain distinct player/game/team performances. Player links use internal player UUIDs and game links use internal game UUIDs. The responsive desktop table and mobile cards preserve rank, ties, metric values, team/opponent context, and week or games information.

## Recent recorded performance

The explorer reuses the debounced bounded player search and internal player IDs. It supports 5, 10, or 20 appearances within the backend maximum plus optional imported season and `REG`/`POST` filters. Returned appearances remain oldest to newest. The frontend does not synthesize byes, DNPs, scheduled games, or missing zeroes.

Games represented, known values, missing count, average, total, minimum, and maximum are displayed exactly as returned. Null values are excluded by the backend from aggregates; all-null aggregates remain unavailable. The UI makes no claims about improvement, decline, momentum, prediction, or future performance.

## Attribution, errors, and boundaries

Backend-provided nflverse/CC BY 4.0 attribution and coverage notes remain visible at the bottom of the page. Stable Stats Hub, player, and team errors map to bounded public messages. Invalid URL filters normalize before requests when metadata can resolve them, and public errors never trigger authentication redirects.

The feature exposes no external player IDs, provider mappings, source hashes, import paths/runs, actor data, conflict metadata, SQL fields, or cursor contents. It adds no backend work, imports, scraping, providers, live polling, rate statistics, fantasy metrics, custom scoring, AI explanations, predictions, or recommendations.
