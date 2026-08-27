# Public Stats Hub usage

The public `/stats` route has two URL-addressable modes. Current Season presents provider-neutral, game-based 2026 team comparisons. Historical preserves the metadata-driven nflverse player leaderboards and recent-performance exploration delivered by Frontend Milestone 18. The two modes use independent TanStack Query families and failure states.

## Current Season mode

`GET /games/current-stats` returns a bounded season/type/week context, backend-derived availability, resolved games, coverage classifications, and both home/away team-stat rows in one request. The UI never fans out to `GET /games/:gameId/stats`. Current reads use a separate five-minute query key, refetch on mount, do not poll, and do not affect Historical caches.

New `/stats` visits default to Current Season. Current URLs use `mode=current`, `season`, `seasonType`, `week`, and optional internal `teamId`. Existing URLs containing Historical keys such as `view`, `type`, `category`, `metric`, or an older season without `seasonType` restore Historical and normalize to `mode=historical` without losing supported filters.

Only backend-advertised seasons, season types, and weeks are rendered. `ALL` means all currently available game contexts, not the whole future schedule. A favorite team is an optional shortcut and never becomes the default league filter.

Cards retain away/home orientation, scores and status, kickoff, week, helmets, coverage, and a Game Center link. `COMPLETE` shows the primary comparison and expandable details; `PARTIAL` preserves available values and uses em dashes for missing values; `UNAVAILABLE` keeps a final game and score visible without fabricating zeroes; `PENDING` explains that statistics will appear after game data is available. Provider names are never rendered.

Current Season does not include current player leaders or aggregate league team rankings. A compact note explains that rankings require sufficiently complete statistical coverage.

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
