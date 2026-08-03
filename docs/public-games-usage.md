# Public Games Usage

## Coverage and routes

Frontend Milestone 12 exposes the backend’s configured current-season schedule at `/games` and resolved game detail at `/games/:gameId`. The development dataset contains all 32 active NFL teams, 48 preseason games, and 272 regular-season games for 2026. It has 17 regular-season games and one valid bye per team. The Hall of Fame Game is omitted because it is not present in the imported schedule. Postseason navigation is intentionally absent until records exist.

The imported schedule is verified-source data but remains editorially unverified until an authorized editor or administrator reviews it. The public UI displays the backend’s resolved game DTO only. Provider mappings, provenance, verification actors, base/override separation, internal notes, and audit history never enter the public model.

## Filters and initial week

The Games route stores `type`, `week`, and an optional internal team UUID in the URL. A valid optional `season` parameter preserves the backend’s supported historical access. Changing the week preserves the other filters. Requests include one selected week and a limit of 100, which safely bounds a normal NFL week; a returned cursor is exposed through Load more rather than ignored.

When `type` or `week` is absent, the frontend makes one bounded unfiltered request. The backend applies its configured current season and 14-day upcoming window. The frontend chooses an active game first, then the next scheduled or pregame game, then a returned final, and falls back to Regular Season Week 1. This uses returned records rather than calendar week math and does not request a full season. Supplying a season type without a week defaults to Week 1 for that type.

The team selector reuses the 24-hour active team catalog and sends application-owned UUIDs only. Signed-in users with a favorite team receive a My Team shortcut, but league-wide games remain the default. Signed-out and no-favorite states do not render a broken shortcut.

## Nullable kickoff times

The public and administrative read models define `startTime` as `string | null`. Twenty-four current games have an officially unannounced kickoff. A null or defensively invalid timestamp is never passed to formatting and always renders as `Time TBD`; no midnight, noon, date, or venue-local timezone is invented.

Known kickoffs use `Intl.DateTimeFormat` in the user’s local timezone with its timezone abbreviation. Within a schedule section, known kickoffs sort chronologically and appear in calendar-day groups. TBD games remain under their backend season/week and appear in a separate Time TBD group after known kickoffs. Their fallback order is away team, home team, then ID.

## Statuses, scores, and details

Public labels map backend statuses exactly: Scheduled, Pregame, Live, Halftime, Final, Postponed, Canceled, and Suspended. No client-side status transition or polling runs. Scores appear only for active or final statuses when both score values are present. Missing scores do not become `0–0`, and final winners receive stronger typography rather than color-only treatment.

Venue, broadcast, neutral-site, quarter, and clock context appear only when supplied. Team identities use approved URLs with the shared abbreviation fallback. Detail pages expose the same resolved fields as cards.

The current public DTO has no correction note, schedule-change flag, or public provider-update timestamp. Consequently, the frontend does not claim that a schedule changed or compare cached values to invent a correction. If the backend deliberately adds such a public contract later, document and implement it before rendering update messaging. Future flex scheduling may turn current TBD values into concrete resolved kickoffs through ordinary cache invalidation or manual refresh.

## Personalization and empty states

The Home schedule section uses a bounded `/teams/:teamId/games?limit=100` request for a favorite team. It derives the next Scheduled or Pregame matchup from season type, week, and a validated known kickoff, while preserving TBD games as candidates. Postponed, canceled, suspended, final, and past scheduled games are not selected as upcoming. Schedule errors stay local and never prevent Home or News from rendering.

A successful empty 2026 regular-season team/week response displays `Bye week`. League-wide emptiness, preseason emptiness, loading, and request errors use distinct messages. No bye is inferred from an error, preseason result, or league-wide filter. If no scheduled or pregame team game remains, the next-game component reports that no remaining game is available and links to the team schedule.

## Caching and exclusions

Public week, detail, and team queries use deterministic `['games', ...]` keys, pass abort signals, remain stale for five minutes, and never persist to Zustand or local storage. Administrative schedule writes invalidate the public game family along with the narrow admin families. Manual refresh is available; `refetchInterval` is not configured.

This milestone adds no live polling, WebSockets, server-sent events, provider synchronization, play-by-play, drives, statistics, standings, injuries, betting, predictions, fantasy tools, calendar export, scraping, or postseason placeholders.
