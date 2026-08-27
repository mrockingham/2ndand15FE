# Global Scoreboard Bar Usage

## Placement

Milestone 34 adds a compact scoreboard strip rendered by `AppLayout` immediately below `AppHeader` and above the routed page content, so it appears on every public and authenticated page that uses the shared layout — Home, News, Games, Stats, Team Hub, Game Center, and the account/onboarding routes. It is suppressed only on the focused authentication routes (`/login`, `/register`, `/forgot-password`, `/reset-password`) and never rendered inside `/admin`, which uses a separate `AdminLayout`.

## Data source and relevance window

The bar reuses the existing public `/games` list endpoint through a dedicated `useScoreboardGamesQuery` hook (`src/features/games/queries.ts`) — it introduces no new backend endpoint and no provider calls. The hook requests one bounded window (2 days before today through 7 days after, `limit=100`) computed once per mount, not recomputed on every render.

From that window, `selectScoreboardGames` (`src/features/games/utils/scoreboard.ts`) picks a small, stable-order card set in priority order: every live (`IN_PROGRESS`/`HALFTIME`) game, everything kicking off today, finals from the last 48 hours, then the nearest upcoming games, capped at 14 cards. The result is always re-sorted chronologically before rendering, so a polling refresh updates card contents in place rather than reordering the strip. Malformed entries (missing team data) are filtered out defensively before sorting so a contract mismatch can never crash the host page.

## Refresh behavior

Polling is scoped to the bar's own query, independent of Game Center's per-game polling: `getScoreboardRefetchInterval` (`src/features/games/gameCenterPolling.ts`) refetches every 20 seconds while any selected game is live, and every 5 minutes otherwise. The query does not retry on failure — a failed request simply leaves the bar hidden rather than retrying aggressively on a component that renders on every page.

## Card states and score semantics

`MiniGameCard` (`src/features/games/components/MiniGameCard.tsx`) renders one of: a weekday/time line for Scheduled/Pregame, `LIVE · Q# · clock` (or plain `LIVE` if clock/quarter are unavailable) for in-progress games, `HALFTIME`, or `FINAL`. Scores render only when the status is score-eligible and both scores are present — a scheduled or pregame matchup never shows a fabricated `0–0`. Final-game winners get a bolder score treatment, not a full celebratory redesign.

## Team visuals and navigation

Cards use the existing `TeamHelmet` component and team abbreviations only — no official logo fetching. The whole card is a link to Game Center (`/games/:gameId`) using the internal game ID; when the viewer is already on that game's Game Center page, the matching card gets a subtle active treatment (background tint, `aria-current="page"`) rather than being disabled.

## Favorite team

When the signed-in user has a favorite team, its game (if present in the current window) gets a left accent border, a small dot indicator, and is scrolled into view on load — the rest of the strip is left in normal chronological order rather than being reshuffled around it.

## Week label and Schedule linkage

A compact label on the left of the strip reads `Week N →` (derived from the most common week number among the selected games) or `Full Schedule →` when no week applies, and links to `/games` — the existing public schedule page. When there are no relevant games in the window, the bar collapses to just this link rather than rendering empty cards.

## Layout and accessibility

Desktop shows optional left/right scroll buttons plus native horizontal scroll (mouse wheel/trackpad); mobile relies on touch scrolling with `scroll-snap` and never causes page-level horizontal overflow. Each card carries a single descriptive `aria-label` (e.g. "Buffalo Bills 27, New York Jets 20, final") so status is never conveyed by color alone, and the scroll buttons are standard focusable icon buttons.

## Exclusions

The bar does not fetch per-game media, stats, or plays — it uses only the fields already present on the list response (teams, kickoff, status, score, quarter, clock). It does not introduce a season/league selector, a new design-system color palette, or animated "live" effects. A failed request hides the bar rather than showing a retry affordance, since it is supplemental navigation rather than primary content.
