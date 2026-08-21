# MVP Roadmap

## Delivery approach

Build in small vertical milestones. Each milestone should leave the repository runnable, tested in proportion to its risk, and documented. Do not fill future modules with fake production data merely to make the dashboard look complete.

## Milestone 0 — Repository foundation

Status: implemented and verified as of July 2026, with the browser-service limitation recorded in the Milestone 0 handoff.

Deliverables:

- Vite React TypeScript scaffold using npm
- Strict TypeScript, `@/` source alias, ESLint, and Prettier
- Vitest, React Testing Library, DOM test setup, and a basic render test
- MUI theme foundation with dark/light palettes and CSS baseline
- TanStack Query, React Router, and minimal provider composition
- Initial feature-oriented folders created only as needed
- `.env.example` and configuration validation for the API base URL
- CI-ready scripts for format check, lint, typecheck, test, and build

Exit criteria: a minimal application shell runs, both themes render, a basic route is accessible, and all repository checks pass.

## Milestone 1 — Public shell and teams

Status: completed across Frontend Milestones 0 and 2 in July 2026.

Deliverables:

- Responsive public layout with desktop top navigation and mobile bottom navigation behavior
- Public landing-page structure using honest product messaging
- Typed API transport foundation and normalized errors
- Teams list integration and reusable team identity with abbreviation fallback
- Loading, empty, offline/error, and image-failure states

Exit criteria: a signed-out visitor gets a useful responsive experience and live backend team data can be rendered without unofficial assets.

## Milestone 2 — Authentication entry

Status: implemented and verified as part of approved Frontend Milestone 1 in July 2026.

Deliverables:

- Register and login forms using React Hook Form and Zod
- In-memory access-token store
- Successful login/registration current-user loading
- Accessible field, submission, and server-error behavior
- Auth route layout and safe post-auth navigation

Exit criteria: a user can register or log in and reach an authenticated shell without persisting tokens in browser storage.

## Milestone 3 — Session restoration and route protection

Status: implemented and verified as part of approved Frontend Milestone 1 in July 2026.

Deliverables:

- Startup bootstrap state machine
- Credentialed silent refresh
- Deduplicated runtime refresh and one-time request retry
- Authenticated route boundary without redirect flicker
- Terminal failure cleanup and public fallback
- Integration tests covering success, missing session, expiry, parallel `401`s, and API errors

Exit criteria: a valid session survives a browser reload and expired/invalid sessions fail safely without loops.

## Milestone 4 — Favorite-team personalization

Status: implemented and verified as approved Frontend Milestone 2 in July 2026.

Deliverables:

- Favorite-team onboarding using backend UUIDs
- Personalized dashboard shell based on the current-user query
- Replace and clear favorite-team actions
- Correct current-user cache updates/invalidation
- No-favorite, loading, mutation-error, and approved-image fallback states

Exit criteria: favorite-team state remains correct across selection, replacement, clearing, navigation, and session restoration.

## Milestone 5 — Account recovery and logout

Status: implemented and verified as part of approved Frontend Milestone 1 in July 2026.

Deliverables:

- Logout with server cookie invalidation and local cleanup
- Forgot-password request flow with account-enumeration-safe messaging
- Reset-password flow using the backend's confirmed token/link contract
- Expired/invalid reset, success, and retry paths

Exit criteria: a user can deliberately end a session and complete the supported recovery journey without leaking reset credentials.

## Milestone 6 — MVP hardening and release readiness

Deliverables:

- Responsive and cross-browser review of all MVP flows
- Keyboard, screen-reader, contrast, reduced-motion, reflow, and focus review
- Performance budget and bundle inspection
- Production error handling and approved observability/privacy configuration
- Security review of token, cookie, CORS, CSRF, and reset behavior
- Deployment configuration and end-to-end smoke checks

Exit criteria: the complete MVP journey meets agreed accessibility, performance, security, and operational release gates.

## Later product increments

After the implemented account, schedule administration, News, public Games, and historical player-statistics slices, sequence remaining backend-supported increments such as predictions/accuracy, team detail, live play-by-play, the play visualizer, and fantasy integrations. Each needs its own data contract, stale/refresh strategy, responsive design, and trust requirements.

## Frontend Milestone 8 — Administrative schedule management

Status: implemented against backend Milestone 7 in August 2026.

Deliverables:

- Current-user `USER`/`EDITOR`/`ADMIN` roles and role-aware admin navigation
- Protected `/admin/games`, create/detail, import, and admin-only full audit routes
- Responsive admin shell without the public mobile bottom navigation
- Bounded cursor-based game listing using only backend-supported filters
- Resolved/base/provenance/override/verification and game-scoped audit detail
- Manual game creation and eligible base editing with explicit kickoff timezone input
- Partial editorial override updates, field clearing, resolved preview, and admin-only deletion confirmation
- Two-step CSV-to-JSON schedule validation/write flow with file, row, and formula protections
- Sanitized audit differences and backend-scoped audit access
- Focused role, route, API, CSV, state, mutation, and regression tests

Exit criteria: editors can maintain supported schedule data without database or Swagger access, admins receive only the additional backend-supported controls, stale roles fail safely, and no public schedule/live feature or provider synchronization UI is introduced.

## Frontend Milestone 10 — Editorial CMS and public News

Status: implemented against backend Milestone 9 in August 2026.

Deliverables:

- Public `/news` featured/feed experience, source-aware article cards, team personalization, and `/news/:slug` detail
- Public routes backed only by public DTOs and backend-derived publication/featured visibility
- Editor/admin article list, draft creation, versioned editing/team tags, publish/schedule/unpublish lifecycle, and immutable revisions
- Admin-only archive/restore controls and full article audit events
- Type-aware original, curated, and announcement validation with explicit-offset timestamps
- Markdown rendering that drops raw HTML, executable links, and inline remote images
- Route-level code splitting for News/detail and administrative workspaces
- HTTP-boundary, schema, renderer, role, lifecycle, revision, and regression tests

Exit criteria: editors can operate the backend-supported CMS without database or Swagger access, curated material is unmistakably attributed, unpublished material never uses a public endpoint, version conflicts preserve unsaved work, and the public shell does not eagerly load the CMS.

## Frontend Milestone 12 — Public Games and personalized schedule

Status: implemented against backend Milestone 11 in August 2026.

Deliverables:

- Lazy public `/games` and `/games/:gameId` routes backed only by resolved public DTOs
- Preseason and regular-season week navigation with URL-backed week/team filters
- Responsive accessible cards with legitimate statuses/scores, venue, broadcast, and neutral-site context
- First-class nullable kickoff handling with consistent `Time TBD` presentation and deterministic ordering
- Favorite-team schedule shortcut, bounded next-game derivation, valid regular-season bye handling, and Home integration
- Cursor pagination, moderate caching, abort signals, manual refresh, and no automatic polling
- Nullable kickoff compatibility across existing admin values, previews, edits, overrides, and CSV import

Exit criteria: signed-out and personalized users can browse the 2026 schedule without fabricated kickoff, score, correction, or live state; administrative writes invalidate the affected public schedule family; and deferred sports scopes remain excluded.

## Frontend Milestone 14 — News sources and candidate inbox

Status: implemented against backend Milestone 13 in August 2026.

- Lazy editor/admin source registry, source health/detail, candidate inbox, candidate detail, and manual-candidate routes
- Admin-only source create/edit/pause/resume with public-URL validation and live-feed change confirmation
- Read-only source testing and separately confirmed manual ingestion with bounded result feedback
- URL-owned candidate filters, cursor pagination, plain-text publisher metadata, safe links, and deterministic team suggestions
- Backend-authoritative review/save/dismiss transitions and required dismissal reasons
- Candidate conversion requiring an empty-by-default original summary and producing only a `CURATED` `DRAFT` before navigation to the article editor
- Separate normalized source/candidate query families and narrow source, candidate, article-list, and audit invalidation

Exit criteria: authorized editors can collect and review metadata without scraping or auto-publication; administrators alone can change source definitions; publisher descriptions never initialize original summaries; and no scheduler, AI generation, image fetching, or recurring ingestion is introduced.

## Frontend Milestone 16 â€” Players and historical statistics

Status: implemented against backend Milestone 15 in August 2026.

- Lazy public player directory, profile, and two-player comparison routes
- URL-owned debounced search, exact raw-position/team/season filters, favorite-team shortcut, and cursor pagination
- Exact nullable identity fields with safe HTTP(S) headshots and initials fallback
- Backend-derived regular-season, postseason, and combined season summaries with position-aware metric groups
- Recorded-appearance game logs that never turn missing weeks, byes, or nullable values into zero-stat rows
- Neutral URL-shareable comparisons using only existing season-summary APIs, with cross-position warnings and no overall winner
- Separate normalized list/search/detail/stats/seasons query families, historical stale times, abort signals, and no polling
- Visible backend-provided nflverse/CC BY 4.0 attribution and clear local-storage provenance
- HTTP-boundary, formatting, nullable-data, pagination, profile, comparison, and route tests

Exit criteria: visitors can find players, inspect verified historical summaries and recorded appearances, and compare two players without provider identifiers, fabricated data, direct nflverse calls, imports, predictions, or fantasy recommendations.

## Frontend Milestone 18 — Public Stats Hub

Status: implemented against backend Milestone 17 in August 2026.

- Lazy public `/stats` route driven by backend metadata rather than hardcoded seasons, categories, metrics, positions, precision, limits, or ranking rules
- URL-shareable season and weekly leaderboards with compatible filter normalization and exact `REG`, `POST`, and `REG_POST` behavior
- Responsive tables/cards displaying backend competition ranks, ties, team context, player/game links, recorded zeroes, and nullable values faithfully
- Team, favorite-team, exact position, and position-group filtering with traded-player split semantics
- Opaque cursor pagination that preserves backend order and rank continuity without cursor decoding or URL persistence
- Debounced player selection and server-summarized recent recorded appearances with 5/10/20 limits and no trend claims
- Separate metadata, season, weekly, and recent query families with one-day/six-hour stale times, abort signals, and no polling
- Visible nflverse attribution and backend coverage notes, including the absence of live 2026 player statistics

Exit criteria: visitors can share and explore historical rankings and recent recorded performance without fabricated data, client-side ranking or aggregation, private provider details, rate/fantasy metrics, AI analysis, predictions, or backend changes.

## Frontend Milestone 20 — Team Directory and Team Hub

Status: implemented against backend Milestone 19 in August 2026.

- Lazy public `/teams` and `/teams/:teamId` routes with URL-backed directory, historical-roster, and team-leader filters
- Conference/division grouping, full identity search, safe logo fallback, and existing authenticated/anonymous favorite workflow
- Team hero plus bounded backend-ordered upcoming games, recent completed games, and published article previews
- Historical roster tables/cards preserving weekly membership evidence, historical position, null/zero values, and separately labeled latest-team context
- Stats-metadata-driven team leaders preserving backend competition rank, precision, ties, team-only production, and compatible full Stats Hub links
- Separate five-minute overview, one-day roster, and six-hour leader query families with abort signals, no polling, and opaque cursor pagination outside URLs
- Section-local loading, empty, error, retry, and cursor-reset states with visible nflverse attribution and historical coverage limits

Exit criteria: visitors can find teams and explore bounded public team context without fabricated current rosters, season records, kickoff times, scores, league-wide totals mislabeled as team production, provider/import details, direct nflverse access, live statistics, AI analysis, fantasy recommendations, predictions, or backend changes.

## Frontend Milestone 21 — Personalized Home and public Hall of Fame landing

Status: implemented in August 2026.

- Distinct visitor, authenticated/no-favorite, and authenticated/favorite Home states
- Temporary user-provided Hall of Fame Game hero with backend-resolved final status and score
- Section-local Games, published News, compact weekly AI Hub, and historical Stats composition
- Favorite-team hero, bounded Team Hub matchup/recent fallback and published team News
- One shared weekly-insights response for favorite prediction, compact snapshot, and model performance
- Explicit LOW-confidence, null-evaluation, historical-team-leader, and unavailable-standings semantics
- Responsive dark/light composition using generic TeamHelmet identity and favorite-team accent tokens
- No Home endpoint, all-team hub fan-out, fake 2026 player data, fake standings, scraped assets, polling, or Fantasy implementation

Exit criteria: Home remains useful without authentication, gains factual team relevance with one favorite, and isolates aggregate query failures without turning unavailable data into invented sports content.

## Frontend Milestone 25 — AI Hub v1

Status: implemented in August 2026.

- Lazy public `/ai` route with URL-backed season-type and week controls
- Favorite-team featured prediction with honest closest-matchup fallback
- Deterministic weekly intelligence, matchup edges, and top-five ranking
- Full published prediction grid with Game Center links
- Independent public model-performance state with null-safe evaluation metrics
- Responsive dark/light sports-dashboard hierarchy using TeamHelmet identity
- No player projections, injury analysis, simulations, fantasy, betting, live stream, or fake chat

Exit criteria: visitors can explore published Tier 1 weekly predictions and model performance without raw feature data, fabricated explanations, unsupported player intelligence, official-logo scraping, or backend changes.

## Proposed first implementation plan

After approval, begin only with Milestone 0:

1. Scaffold Vite/React/TypeScript and install the approved foundation dependencies.
2. Configure TypeScript, linting, formatting, test tooling, scripts, and the `@/` alias.
3. Add theme tokens and provider composition.
4. Add a minimal responsive application frame and placeholder route whose copy is clearly non-live.
5. Add `.env.example`, API configuration parsing, a basic render test, and verification commands.
6. Stop for review before implementing team or authentication screens.

## Implementation blockers

No decision blocks Milestone 0 if the team accepts the proposed stack and architecture in the project brief.

Before completing API-backed milestones, the frontend needs the backend's exact DTOs/error envelope and environment/CORS/cookie details listed in `api-integration.md`. Before completing password reset, it also needs the reset-link/token contract. These are integration blockers, not reasons to delay the repository foundation.
