# AI Hub frontend

Frontend Milestone 25 implements the public `/ai` route as a responsive Tier 1 matchup-intelligence dashboard. It uses only published backend predictions and deterministic weekly derivations. The route is lazy-loaded behind the shared application shell and remains useful for signed-out visitors.

## Data and cache ownership

`src/features/aiHub/` owns the public DTOs, API functions, URL normalization, query keys, presentation helpers, and page sections. TanStack Query owns all server state; AI data is not copied into Zustand or browser persistence.

| Endpoint                      | Frontend use                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /ai-hub/weekly-insights` | Featured matchup, strongest/closest/upset/blowout/scoring signals, edges, top-five ranking, and selected-context model performance    |
| `GET /ai-hub/predictions`     | Full selected-week prediction grid (up to 50; currently 16 for 2026 PRE Week 1), plus an existing featured explanation when available |

The page does not call prediction detail because each card already has the fields required for its summary and links to the existing Game Center. It does not request explanations on load; if the weekly prediction list already contains a published explanation for the featured game, it is shown, otherwise deterministic factor labels remain visible. Weekly insights retain their five-minute cache and supply selected-context performance without a redundant `/performance` request; the prediction list uses the backend's shorter public freshness window. Each query has an independent loading, error, retry, and empty presentation.

## URL context and featured behavior

The current default is `season=2026&type=PRE&week=1`. All three values are normalized into the URL, so a selected context is shareable. Season type and week controls can request later preseason, regular-season, and postseason weeks without changing the page structure. The weekly endpoint requires a numeric week, so the special null-week Hall of Fame Game is not offered in this initial selector; shared game date utilities continue to preserve `week: null` correctly elsewhere.

For an authenticated user with a favorite team, weekly insights include that internal team UUID and the returned favorite-team prediction becomes the featured matchup. Only that panel receives a subtle favorite-team accent; purple remains the AI Hub identity. If the favorite has no eligible prediction, the page explains the fallback and features the general closest matchup. Visitors and users without a favorite always receive that non-personalized closest-matchup view, with strongest pick as the final fallback.

## Supported Tier 1 presentation

- Featured matchup with TeamHelmet identity, home/away orientation, probabilities, projected score, predicted winner, backend confidence, weekly rank, and returned factor labels.
- Weekly intelligence for strongest pick, closest matchup, upset watch, most likely blowout, and highest/lowest projected totals.
- Offensive, defensive, and turnover-profile edge cards using only safe labels and bounded relative edge strength—never raw feature snapshots.
- Top-five strongest-pick ranking that preserves the backend confidence label, including current `LOW` values.
- Full reviewed prediction grid with kickoff, probabilities, score projection, winner, confidence, and a working Game Center link.
- Published model-performance panel. Zero evaluated games render as a valid `0–0` state with em dashes for null accuracy and Brier score.
- A factual `baseline-v1` transparency explainer and a subtle preseason uncertainty note.

The reference mockup's player projections, injury impact, what-if simulations, lineup optimization, start/sit, fantasy projections, live stream, and general chat input are intentionally replaced by supported weekly intelligence, edge, ranking, prediction, and performance sections. No official team logos or player imagery are introduced; TeamHelmet and its existing TeamBadge fallback remain the identity system.

## Responsive and theme behavior

Dark and light modes use the same component tree. Desktop places the primary prediction beside a compact quick-insights rail, tablet moves the rail below, and mobile stacks featured matchup, weekly highlights, edges, ranking, all games, and performance. Grids collapse from four or three columns to two and then one without horizontal scrolling. Probabilities always include numerical text in addition to progress visuals.

## Deferred expansion

Tier 2 remains out of scope until verified backend contracts exist: current player/roster projections, injury analysis, fantasy advice, simulations, general AI chat, live predictions, and on-demand public explanations. A future player-projection expansion must use factual current roster and availability inputs rather than filling the mockup with placeholder athletes.
