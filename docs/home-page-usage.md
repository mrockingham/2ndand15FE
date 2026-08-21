# Personalized Home usage

Frontend Milestone 21 composes the public `/` route from existing public and authenticated query families. It adds no backend `/home` endpoint and stores no Home response in Zustand or browser persistence.

## Supported states

- Signed-out visitors receive the temporary user-provided Hall of Fame Game artwork, a backend-resolved final-game label, recent/upcoming games, featured News, a compact weekly AI Hub snapshot, historical Stats leaders, team discovery, and sign-in/register personalization actions.
- Authenticated users without a favorite receive the same useful public mix plus a prominent `/choose-team` action. No team identity, matchup, or prediction is fabricated.
- Authenticated users with a favorite receive a team-accent hero, the bounded Team Hub matchup and published team News, the favorite-team weekly prediction, a compact weekly snapshot, factual historical team leaders, and model performance.

The supplied Hall of Fame Game artwork is a temporary, explicitly provided project asset. It is used directly as one responsive, locally encoded hero image. No player photography or official marks are extracted from the desktop mockups, and every ordinary team identity continues to use the generic `TeamHelmet`/safe badge system.

## Query composition

| Existing endpoint                 | Home use                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `GET /games/:gameId`              | Resolve the reviewed Hall of Fame Game status and final score around the public hero   |
| `GET /games?limit=4`              | Bounded public recent/upcoming grid                                                    |
| `GET /articles/featured?limit=3`  | Public featured stories                                                                |
| `GET /teams/:teamId/hub`          | One favorite team's bounded schedule, published News, and historical coverage metadata |
| `GET /ai-hub/weekly-insights`     | Weekly snapshot, favorite-team prediction, and model-performance strip                 |
| `GET /stats/metadata`             | Historical season, metric, label, and precision selection                              |
| `GET /stats/leaders`              | Compact league-wide historical leaders                                                 |
| `GET /teams/:teamId/stat-leaders` | Compact, team-split historical leaders for the favorite team                           |

The weekly-insights query uses the backend's current reviewed `2026 PRE Week 1` context with `top=3` and adds only the favorite team UUID in the personalized state. Its deterministic query key means the prediction card, weekly snapshot, and model-performance strip share one five-minute-cached response. A visitor never requests Team Hub data, and a favorite user requests only one Team Hub rather than all 32.

Every aggregate section owns its loading, error, empty, and retry presentation. AI failure does not remove Games, News, or Stats; News failure does not remove predictions; and Team Hub failure does not remove the favorite identity or independent AI response.

## Trust and data limits

The favorite probability is labeled as baseline model output. `LOW`, `MEDIUM`, and `HIGH` confidence are displayed independently from probability, so a high percentage never implies high model confidence. Null accuracy and Brier score render as an em dash, and zero evaluated games render as zero rather than missing.

Team leaders are labeled with the actual imported historical season and state explicitly that they are not a current 2026 roster or preseason leaderboard. Team-split totals and backend competition ranks are displayed directly. Current 2026 standings are unavailable, so Home uses an Explore Teams panel and never invents records or a division table.

Sparse favorite-team News uses a factual empty state with a league-wide News link. No headlines, current player statistics, roster membership, standings, matchups, scores, or predictions are fabricated. Home adds no polling, play-by-play, Fantasy behavior, scraped assets, provider calls, or backend changes.
