# Admin Data Health usage

## Purpose

Before this feature, an admin had no way to tell what current-season game data actually exists without querying the database by hand — especially for `CurrentGamePlayerStat`, where "missing" could mean Highlightly never published it, the backend failed to ingest it, player identity reconciliation blocked it, or the game simply hasn't reached that stage yet. `/admin/data-health` (Editor or admin) answers this deterministically, using the backend's M29A/M29A.1 Data Health APIs (`/admin/data-health/games`, `/admin/data-health/games/:gameId`, `/admin/data-health/games/:gameId/probes`, `/admin/data-health/games/:gameId/probe`).

## DB-only by default; the provider check is explicit

The overview table, summary cards, and detail drawer are **strictly DB-only** — they never call Highlightly, regardless of what an admin does on the page. The only way any Highlightly request happens is the drawer's **Check Highlightly** button, gated to `ADMIN` (`PROBE_GAME_DATA`; `EDITOR` sees it disabled with an explanatory caption), triggered only by an explicit click — never automatically when the drawer opens. A probe issues at most two Highlightly requests per click and is never fired more than once without another click. "Refresh Database Status" only refetches the DB-only games list; it never calls the probe endpoint.

## Coverage states

`result`, `teamStats`, `playerStats`, and `plays` each carry an independent `DataHealthCoverageState`, rendered as `DataHealthStateChip` (icon + text, never color alone):

- **Complete** — the database has what it should for this stage of the game.
- **Partial** — useful data exists but coverage is incomplete (for player stats, this most often means some provider players couldn't yet be matched to internal player identities — real, usable rows already exist; this is not a failure).
- **Missing** — the game has reached a stage where this data is expected, but the database has none.
- **Pending** — the game hasn't reached a stage where this data is expected yet.
- **Unavailable** — the game is in a terminal non-playing state, or the provider itself has nothing (e.g. no matchup record) — this is a provider limitation, not a backend bug.
- **Unknown** — reserved; should not occur in practice.

## Diagnosis codes

Each section also carries a `reasonCode` from one of four separate, non-interchangeable vocabularies (result / team stats / player stats / plays) — `src/features/dataHealth/presentation.ts` maps every verified code (including the `PROBE_REQUIRED` sentinel — "we don't know why yet without a probe") to plain-language text; a raw backend enum string is never shown in the main UI. The overview row's cached `lastProbe` diagnosis (when present) is preferred over the DB-only `reasonCode`, since it reflects the more specific findings of the last explicit check without spending another Highlightly request. A probe's own response additionally returns backend-authored `explanation` strings per section, shown directly rather than re-derived.

## Summary cards

Per-category `complete`/`missing` counts come straight from the backend's `DataHealthSummary` and are authoritative across the entire filtered result set. The backend does **not** aggregate partial/unavailable/pending counts, so those are derived client-side from the games currently on the page and explicitly labeled "On this page" — never presented as a global total, and never counted as "missing."

## Player identity resolution

A partial player-stats game (e.g. 82 provider rows, 67 resolved, 15 unresolved) is a normal, expected state, not an ingestion bug — the probe's bounded reconciliation (two Highlightly requests total, regardless of roster size) can only confirm existing player mappings, not perform full per-player profile lookups, so its `unresolvedPlayers` count is an upper bound, not a final verdict. A full backfill may still resolve some of those players later. The drawer's Player Stats section shows database rows, provider rows observed, and resolved/unresolved counts side by side whenever a prior probe's coverage data exists.

## Issue Type filter

`Issue Type` (client-side only, scoped to the currently loaded page — not a backend query parameter) narrows the visible rows by category: missing result, team stats, player stats, plays, missing provider mapping, a failed provider check, or unresolved player identities. `Only Problems` is the one filter that is a real backend parameter (`issuesOnly`).

## Known limitations and exclusions

- No bulk "probe every missing game" action — matches the backend's deliberate exclusion of an automatic sweep in this milestone.
- No frontend-invented low-quota warning threshold; quota (`remaining / limit`) is shown as plain metadata since the backend does not currently flag a threshold.
- The per-game detail endpoint does not include team names, kickoff, or season/week — the drawer gets that context from the already-loaded overview row it was opened from, not a second request.
- No admin action repairs a data gap directly from this page (e.g. no "resync this game" button) — this page is diagnostic only. Existing schedule-editing and plays-diagnostic/repair tools remain the mechanism for fixes.
