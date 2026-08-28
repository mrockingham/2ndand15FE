# Public standings usage

The public standings experience is available at `/standings`. It uses only the
verified backend standings endpoint and treats the response grouping and team
order as authoritative.

## Request contract

`GET /api/v1/standings` accepts exactly these query parameters:

- `season`: an integer season year
- `seasonType`: `PRE` or `REG` in the current public interface
- `view`: `division`, `conference`, or `league`

The response shape is
`{ data: { season, seasonType, view, groups }, meta: { availableViews, availableSeasonTypes, provider, updatedAt } }`.
The frontend does not recalculate ranks, playoff seeds, records, percentages,
differentials, or grouping order.

## URL and cache behavior

The selected `season`, `seasonType`, and `view` are shareable URL query state.
Invalid or unsupported combinations normalize to a known available season and
its supported season type. Standings use the TanStack Query key
`['standings', season, seasonType, view]`, a five-minute stale time, and no
polling or focus refetch.

The current data catalog exposes 2026 preseason and 2025 regular-season
standings. There is no standings-season catalog endpoint, so this mapping is
kept explicit in the frontend until the backend provides one. Postseason is not
offered because it is not currently available.

## Presentation rules

- Division and conference headings and rows preserve backend order.
- League view is a single backend-ranked table.
- Playoff seeds are shown only for regular-season standings.
- Null numeric values render as an em dash; percentages and differentials are
  formatted for display without changing their meaning.
- Team links use internal team UUIDs and the public Team Hub route. Logo errors
  use the shared abbreviation fallback.
- Tables remain semantic and keyboard accessible, with the Team column sticky
  inside a horizontally scrollable region on narrow screens.

`404 STANDINGS_NOT_FOUND` is a normal unavailable-data state. Other failures
remain retryable errors. The page does not infer standings, fabricate current
records, expose provider identifiers, or add sorting that could obscure the
official backend ranking.
