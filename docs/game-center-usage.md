# Game Center usage

The existing public game detail route (`/games/:gameId`) is the Game Center. M38B composes the resolved `Game` record with structured play-by-play, team/player box-score data, and the authoritative media playlist into a dense live-first gamecast. At `lg+` it uses a 25/50/25 three-rail layout; tablet and mobile stack the center live/PBP rail before leaders, team stats, compact media, game info, and the full player box score. No second detail route exists.

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

## Player stats and game leaders

`GET /games/:gameId/stats` also returns backend-selected `data.gameLeaders.home|away.passer|rusher|receiver`. Game Center renders those exact rows without re-ranking them, supports one-sided categories, and hides categories missing on both sides. The same leaders power the compact quick-stat tabs; no extra request is made.

`PlayerStatsPanel` is a full-width section below the three-rail gamecast. A team switch exposes categorized `passing`/`rushing`/`receiving`/`defense`/`kicking`/`punting`/`returns` tables, omitting categories without usable rows. Tables scroll horizontally on narrow screens and keep the player column readable. Completion percentage and per-attempt/carry/reception averages are presentation-only derivations and render unavailable unless both inputs are non-null and the denominator is positive.

`meta.playerStatsCoverageState` is authoritative: `COMPLETE` renders normally, `PARTIAL` keeps resolved rows visible with a quiet matching note, `PENDING` shows an updating state, and `UNAVAILABLE` shows a lightweight unavailable state. Missing values render as an em dash; explicit zeroes remain zero. Reconciliation counts remain internal.

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

`FreshnessIndicator` (near the scoreboard, shown only while `IN_PROGRESS`/`HALFTIME`) renders `LIVE · Refreshed 8 sec ago`, `LIVE · Refreshing…` while a fetch is in flight, or `LIVE · Last refreshed 1 min ago` after a failed background refresh. This deliberately describes frontend API refresh age, not provider update time. Its timestamp is the oldest `dataUpdatedAt` among the three queries that have succeeded at least once. It owns its own 1-second ticking clock internally so only that small indicator re-renders every second, not the rest of the page, and carries no `aria-live` region so it never spams assistive technology on every tick.

The manual "Refresh" button still refetches the game, plays, and stats together and remains available regardless of automatic polling — useful for troubleshooting, never presented as required.

## Sections and tabs

Play-by-play is always the primary center experience. Its only tabs are `Play-by-Play` and `Scoring Plays`; there is no drives tab because the backend has no reliable drive grouping. Plays are grouped by quarter newest-first and ordinary rows remain compact. Team stats, game leaders, media, and player stats render as independent modules so one failed source cannot blank the others.

## Game media (M31B–M32C): curated videos, automatic highlights, and the global video

`GET /games/:gameId/media` (`useGameMediaQuery`, `gameMediaKeys.detail(gameId)`) is the single source of truth for what Game Center's media section renders. Its live-verified response carries `{ gameId, displayMode, curatedVideos, highlights, globalVideo, displayVideos, coverage }`, where `displayMode` is `'CURATED' | 'AUTOMATIC' | 'GLOBAL' | 'NONE'` and `displayVideos` is the backend's **authoritative, pre-ordered viewer playlist** — a flat array of `{ id, mediaType: 'CURATED' | 'AUTOMATIC' | 'GLOBAL', title, embedUrl, canonicalUrl, thumbnailUrl, sourceLabel, canEmbed }` items already merged and ordered from whichever combination of per-game curated videos, the synced automatic Highlightly highlight, and the single global video applies. The frontend never recomputes this ordering, never infers `displayMode` from array lengths, and never separately combines curated + global + highlights client-side — `GameMediaSection` (`src/features/gameMedia/components/`) renders `displayVideos` directly through one unified `GameMediaPlayer`, regardless of which mode produced it.

**Backend ordering rules** (confirmed live against real games): no game-specific media → `[G]`; an automatic highlight exists → `[A0, G, A1, …]`; per-game curated videos exist → `[C0, G, C1, C2, C3]` (global always inserted as the second item once a primary exists). A game with 4 curated videos plus an active global video exposes exactly 5 selectable items — verified live.

**One unified player, three quiet origins.** `GameMediaPlayer` shows the first `displayVideos` item as the main media on load and every subsequent item as a selector in a secondary rail (desktop: right-hand column with internal scrolling past 4 items; mobile: horizontal scrollable strip). A subtle `mediaTypeLabel` caption — "Game Video" (curated), "Game Highlight" (automatic), "Featured Video" (global) — is the only visible distinction; the raw backend `mediaType` enum is never shown. Each item's own `canEmbed` (backend-computed per item, never inferred by host-sniffing) decides its presentation: `canEmbed: true` mounts a 16:9 iframe (`GameHighlightPlayer`, reused as-is) with `src={embedUrl}` used verbatim; `canEmbed: false` shows a thumbnail-with-team-fallback plus a "Watch Highlight ↗" link to `canonicalUrl` instead — the exact same non-embeddable presentation Highlightly's kill switch has always produced, now reachable from any position in the unified list, not only when automatic is the sole video. Global and curated videos come through the manually-reviewed curation path and are not subject to that kill switch; only automatic Highlightly items can land in the non-embeddable branch. Switching the selection always unmounts the previous iframe first — never two players mounted at once.

**Viewer selection is entirely local.** Clicking a secondary item promotes it into the main area for that browser session only — no backend call, no reorder request, no change to the admin-configured order (asserted directly in tests: switching fires zero network requests). Selection resets to `displayVideos[0]` whenever the viewer navigates to a different game (`GameMediaPlayer` is mounted with `key={game.id}`, so a game change fully remounts and resets it) and is preserved across an in-place refetch of the same game's media as long as the previously-selected item still exists in the new list, falling back to the new first item otherwise.

**No selectable video.** When `displayVideos` is empty, `GameMediaSection` falls back to the same FINAL-status/`coverage`-driven "Highlights are being checked" / "Highlights are temporarily unavailable" / hidden messaging the M31C automatic-only experience always used (`getGameHighlightsDisplayState`, reused as-is since `GameMediaResult` carries the same `coverage`/`highlights` fields `GameHighlightsResult` does) — this only actually surfaces when there's no curated video, no available automatic highlight, and no active global video.

`GameMediaSection`'s query is included in the manual Refresh button's `Promise.all` and the one-time LIVE → FINAL transition refetch.

**The standalone `GET /games/:gameId/highlights` endpoint still exists** (`useGameHighlightsQuery`, `getGameHighlights`) but Game Center no longer calls it directly — as of M32C, `/media` already carries full-fidelity highlight objects inline, so there is no second request for the automatic branch.

**No CSP change needed.** This frontend has no Content-Security-Policy anywhere — nothing to loosen for iframes to load.

**Global video (M32C).** A single, globally-configured video (not copied per game, never counted against a game's 4-curated-video cap) that becomes primary (`displayMode: 'GLOBAL'`) for any game with no curated video and no available automatic highlight, and otherwise appears as a secondary selector alongside whatever game-specific media exists. Removing the global video (or a game gaining its own curated/automatic media) is entirely backend-driven — the frontend never has to reconcile this, it just renders whatever `displayVideos` says on the next fetch.

Admin curation happens at `/admin/game-media` (list, with season/season-type/week filters and a page-level Global Game Center Video panel) and `/admin/game-media/:gameId` (detail — add/edit/remove/reorder up to 4 per-game curated videos; see [admin-usage.md](admin-usage.md)).

## Exclusions

This milestone adds no WebSockets, server-sent events, direct Highlightly (or any other provider) calls from the frontend, in-app video playback/embedding, player-level live stats, player tracking, exact replay, drive inference, fantasy, betting, or provider-specific code. Cross-tab synchronization (e.g. `BroadcastChannel`) is also out of scope — multiple open Game Center tabs simply poll independently.
