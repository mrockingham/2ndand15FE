# Personalized Home usage

Frontend Milestone 21 composes the public `/` route from existing public and authenticated query families. Milestone 35B layers the Homepage CMS (Hero carousel, Top Stories, Highlights, League Leaders) on top of the generic (non-personalized) Home only — see [homepage-usage.md](homepage-usage.md) for that contract in full. This document covers the parts of Home that predate and remain outside the CMS: the personalized/team Home, and the generic Home's fallback behavior when no CMS content is configured.

Frontend Milestone 39C reuses M39B's Team Homepage presentation on the authenticated favorite-team Home. Its existing Team Hub request now supplies the CMS banner, backend-resolved ARTICLE/VIDEO editorial composition, and ordered highlights without another public request. Next Game and the favorite-team Baseline Model remain in their approved positions; the AI Hub snapshot follows Team Highlights so it no longer creates an empty editorial rail.

## Supported states

- Signed-out visitors receive the CMS Hero carousel when configured (otherwise the original Hall of Fame Game artwork hero), curated Top Stories when configured (otherwise featured News), recent/upcoming games, Highlights, a compact weekly AI Hub snapshot, the League Leaders three-category view, team discovery, and sign-in/register personalization actions.
- Authenticated users without a favorite receive the same useful public mix plus a prominent `/choose-team` action. No team identity, matchup, or prediction is fabricated.
- Authenticated users with a favorite receive the CMS-aware team hero, bounded Team Hub matchup, backend-resolved team editorial and highlights, the favorite-team weekly prediction, a compact weekly snapshot, factual historical team leaders, and model performance.

The supplied Hall of Fame Game artwork is a temporary, explicitly provided project asset. It is used directly as one responsive, locally encoded hero image. No player photography or official marks are extracted from the desktop mockups, and every ordinary team identity continues to use the generic `TeamHelmet`/safe badge system.

## Query composition

| Existing endpoint                 | Home use                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GET /homepage`                   | CMS Hero slides, Top Stories, Highlights, and League Leaders (generic Home only; see [homepage-usage.md](homepage-usage.md)) |
| `GET /games/:gameId`              | Resolve the reviewed Hall of Fame Game status and final score for the static Hero fallback                                   |
| `GET /games?limit=4`              | Bounded public recent/upcoming grid                                                                                          |
| `GET /articles/featured?limit=3`  | Featured stories fallback, used only when no Top Stories are curated                                                         |
| `GET /teams/:teamId/hub`          | One favorite team's banner, editorial, highlights, bounded schedule, News, and historical coverage                           |
| `GET /ai-hub/weekly-insights`     | Weekly snapshot, favorite-team prediction, and model-performance strip                                                       |
| `GET /stats/metadata`             | Historical season, metric, label, and precision selection                                                                    |
| `GET /teams/:teamId/stat-leaders` | Compact, team-split historical leaders for the favorite team (personalized Home only)                                        |

The weekly-insights query uses the backend's current reviewed `2026 PRE Week 1` context with `top=3` and adds only the favorite team UUID in the personalized state. Its deterministic query key means the prediction card, weekly snapshot, and model-performance strip share one five-minute-cached response. A visitor never requests Team Hub data, and a favorite user requests only one Team Hub rather than all 32.

Every aggregate section owns its loading, error, empty, and retry presentation. AI failure does not remove Games, News, or Stats; News failure does not remove predictions; and Team Hub failure does not remove the favorite identity or independent AI response.

The personalized Home and dedicated Team Hub share `teamHubKeys.overview(teamId)`. Team Homepage Admin mutations invalidate that exact selected-team key, so either mounted view refetches the same authoritative CMS composition without invalidating other teams.

## Trust and data limits

The favorite probability is labeled as baseline model output. `LOW`, `MEDIUM`, and `HIGH` confidence are displayed independently from probability, so a high percentage never implies high model confidence. Null accuracy and Brier score render as an em dash, and zero evaluated games render as zero rather than missing.

Team leaders are labeled with the actual imported historical season and state explicitly that they are not a current 2026 roster or preseason leaderboard. Team-split totals and backend competition ranks are displayed directly. Current 2026 standings are unavailable, so Home uses an Explore Teams panel and never invents records or a division table.

Sparse favorite-team News uses a factual empty state with a league-wide News link. No headlines, current player statistics, roster membership, standings, matchups, scores, or predictions are fabricated. Home adds no polling, play-by-play, Fantasy behavior, scraped assets, provider calls, or backend changes.
