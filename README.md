# 2nd & 15 Frontend

The frontend foundation for 2nd & 15, a fast, modern NFL experience designed around game-day context, responsible AI insight, and fantasy decision support.

Milestone 0 provides the application shell, theme system, route structure, test foundation, and typed API boundary. It deliberately does **not** include authentication, sports data, team assets, or live backend calls.

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- The separate 2nd & 15 backend only when working on a later API-backed milestone

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

| Route      | Current purpose                    |
| ---------- | ---------------------------------- |
| `/`        | Minimal responsive landing shell   |
| `/games`   | Future Games section placeholder   |
| `/news`    | Future News section placeholder    |
| `/stats`   | Future Stats section placeholder   |
| `/ai`      | Future AI Hub placeholder          |
| `/fantasy` | Future Fantasy section placeholder |
| `*`        | Not-found recovery page            |

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
- AI Hub and Fantasy are available through the mobile **More** sheet to preserve comfortable target sizes.
- Main content reserves safe-area-aware space above the mobile navigation.

## Project structure

```text
src/
  app/                 Bootstrap, providers, query defaults, routes
  components/          Shared navigation and feedback components
  layouts/             Application/public layout composition
  pages/               Home, section placeholders, route errors
  services/api/        Environment validation and typed fetch boundary
  stores/              Client-only theme preference
  test/                Test setup and application render helper
  theme/               Semantic tokens, MUI theme, theme provider
```

Feature directories will be added only when their milestones begin.

## Backend relationship

The backend is maintained in a separate repository. The frontend validates `VITE_API_BASE_URL` and includes a testable native-fetch client with JSON handling, credentials support, optional authorization-header injection, normalized errors, abort-signal compatibility, and safe `204` handling.

Milestone 0 does not instantiate that client in a feature or make backend requests. Access-token storage, refresh coordination, authentication, teams, favorite-team personalization, and password recovery are deferred.

See [docs/frontend-architecture.md](docs/frontend-architecture.md), [docs/design-system.md](docs/design-system.md), and [docs/api-integration.md](docs/api-integration.md) for the durable engineering decisions.
