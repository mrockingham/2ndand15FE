# 2nd & 15 Frontend

The frontend foundation for 2nd & 15, a fast, modern NFL experience designed around game-day context, responsible AI insight, and fantasy decision support.

Frontend Milestones 0 through 2, 8, 10, 12, 14, and 16 provide the application shell, authentication and team personalization, administrative schedule management, the editorial CMS, public News, the public 2026 NFL schedule, the private news-source/candidate-review workflow, and the historical player directory, profiles, statistics, and comparisons. Live polling, play-by-play, predictions, and fantasy recommendations remain deferred.

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- The separate 2nd & 15 backend for live authentication flows

## Install

```bash
npm install
```

## Environment

Copy the example environment file:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

The current setting is:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Change it for your local backend when necessary. Vite environment values are public browser configuration and must never contain secrets.

## Local development

```bash
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

For live authentication, run the sibling backend in a second terminal from `../2ndand15BE` after configuring its `.env`, applying its committed migrations, and following its README:

```bash
npm run dev
```

The backend defaults to `http://localhost:3000`, permits the documented frontend origin with credentials, and owns the HTTP-only refresh cookie. A missing or invalid refresh cookie is a normal signed-out startup result.

## Verification

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Additional commands:

```bash
npm run format
npm run test:watch
npm run preview
```

## Current routes

| Route                                 | Current purpose                           |
| ------------------------------------- | ----------------------------------------- |
| `/`                                   | Public or personalized responsive home    |
| `/games`                              | Public week-by-week NFL schedule          |
| `/games/:gameId`                      | Public resolved game detail               |
| `/news`                               | Published and featured article feed       |
| `/news/:slug`                         | Public article detail                     |
| `/players`                            | Historical player directory               |
| `/players/compare`                    | Two-player season comparison              |
| `/players/:playerId`                  | Player profile, summaries, and game log   |
| `/stats`                              | Future Stats section placeholder          |
| `/ai`                                 | Future AI Hub placeholder                 |
| `/fantasy`                            | Future Fantasy section placeholder        |
| `/login`                              | Account sign-in                           |
| `/register`                           | Account registration                      |
| `/forgot-password`                    | Enumeration-safe recovery request         |
| `/reset-password`                     | Token-based password reset                |
| `/account`                            | Protected current-user account summary    |
| `/choose-team`                        | Protected favorite-team selection         |
| `/admin/articles`                     | Editor/admin article workspace            |
| `/admin/articles/new`                 | Editor/admin draft creation               |
| `/admin/articles/:articleId`          | Article edit, lifecycle, and revisions    |
| `/admin/news-sources`                 | Editor/admin source registry and health   |
| `/admin/news-sources/new`             | Admin-only source creation                |
| `/admin/news-sources/:sourceId`       | Source health, operations, and admin edit |
| `/admin/news-candidates`              | Private editorial candidate inbox         |
| `/admin/news-candidates/manual`       | Manual candidate metadata submission      |
| `/admin/news-candidates/:candidateId` | Review, dismissal, and draft conversion   |
| `*`                                   | Not-found recovery page                   |

Placeholder routes contain no fabricated sports data.

## Theme behavior

- Dark and light MUI themes share typed semantic surface tokens.
- The first visit follows the operating-system preference.
- A manual selection is persisted under `2nd-and-15-theme` in local storage.
- Only theme preference is persisted. No authentication or server data is stored locally.
- An inline startup hint applies the saved/system scheme before React initializes to reduce theme flashing.

## Responsive shell

- Desktop and larger tablet layouts use a sticky top header with all primary destinations.
- Mobile uses a compact header and five-item fixed bottom navigation.
- Stats, AI Hub, and Fantasy are available through the mobile **More** sheet to preserve comfortable target sizes.
- Main content reserves safe-area-aware space above the mobile navigation.

## Project structure

```text
src/
  app/                 Bootstrap, providers, query defaults, routes
  components/          Shared navigation and feedback components
  layouts/             Application/public layout composition
  features/            Auth, teams, games, players, administration, articles, and news inbox
  pages/               Public, account, Games, News, Players, and admin composition
  services/api/        Environment validation and typed fetch boundary
  stores/              Theme preference and memory-only auth state
  test/                Test setup and application render helper
  theme/               Semantic tokens, MUI theme, theme provider
```

Additional feature directories will be added only when their milestones begin.

## Backend relationship

The backend is maintained in a sibling repository. The frontend validates `VITE_API_BASE_URL` and uses a testable native-fetch client with JSON handling, credentials support, bearer injection, normalized backend errors, abort compatibility, safe `204` handling, deduplicated refresh, and one-time request retry.

Access tokens remain only in memory. The refresh token is an HTTP-only cookie managed by the backend. TanStack Query owns current-user, team, schedule, player, article, source, and candidate data; Zustand does not duplicate them. Verified contracts and operating guidance are documented in [docs/auth-contract.md](docs/auth-contract.md), [docs/team-personalization-contract.md](docs/team-personalization-contract.md), [docs/admin-usage.md](docs/admin-usage.md), [docs/public-games-usage.md](docs/public-games-usage.md), [docs/player-statistics-usage.md](docs/player-statistics-usage.md), [docs/editorial-cms-usage.md](docs/editorial-cms-usage.md), and [docs/news-inbox-usage.md](docs/news-inbox-usage.md).

The team catalog is cached for 24 hours. Favorite-team updates submit only internal UUIDs and update the current-user cache directly from the backend response. Approved logo URLs are displayed when available; missing or failed images use the shared abbreviation badge.

See [docs/frontend-architecture.md](docs/frontend-architecture.md), [docs/design-system.md](docs/design-system.md), and [docs/api-integration.md](docs/api-integration.md) for the durable engineering decisions.
