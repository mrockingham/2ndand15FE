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

After the implemented account, schedule administration, and News slices, sequence remaining backend-supported increments such as public games and schedules, statistics, predictions/accuracy, team and player detail, live play-by-play, the play visualizer, and fantasy integrations. Each needs its own data contract, stale/refresh strategy, responsive design, and trust requirements.

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
