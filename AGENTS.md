# 2nd and 15 Frontend Engineering Guide

This file applies to the entire repository. It is the durable working agreement for people and coding agents contributing to the frontend.

## Current repository state

Frontend Milestones 0 through 2, 8, 10, 12, 14, 16, and 18 are implemented. The repository includes the responsive public shell, dual theme system, complete authentication lifecycle, team personalization, role-aware schedule administration, an editorial article CMS, public News, the public 2026 preseason/regular-season schedule, private news-source/candidate administration, historical player experiences, and the public historical Stats Hub. Live polling, play-by-play, predictions, fantasy recommendations, and other sports features remain deferred.

Read the documents under `docs/` before beginning a new milestone. Do not expand into a later milestone without approval.

## Product principles

- Build a fast, modern, consumer-facing NFL experience with a cinematic premium feel.
- Make live game information, scores, and key actions easy to scan.
- Treat personalization as an enhancement: signed-out and no-favorite-team states must remain useful.
- Clearly label AI-generated content, prediction confidence, historical accuracy, timestamps, and source attribution.
- Never imply that a prediction is certain or encourage gambling.
- Do not add paid fantasy contests or cash-prize features to the MVP.
- Never use unofficial NFL/team logos or copyrighted imagery. Render an abbreviation badge whenever an approved image URL is absent or fails.

## Approved technical direction

- React, Vite, and TypeScript
- MUI for the component and theme foundation
- React Router for routing
- TanStack Query for all server state and mutations
- Zustand only for in-memory access-token state and small client-only UI preferences
- React Hook Form and Zod for forms and validation
- Framer Motion for restrained, purposeful animation
- Vitest and React Testing Library for tests
- ESLint and Prettier for static checks and formatting
- npm for package management; commit `package-lock.json`

Do not introduce an overlapping state, styling, routing, form, validation, or test library without an explicit architectural decision.

## Architecture and file placement

Use the feature-oriented structure in `docs/frontend-architecture.md`.

- Keep app composition, providers, and route definitions in `src/app/`.
- Put reusable domain behavior in `src/features/<feature>/`.
- Put route-level composition in `src/pages/`; pages should stay thin.
- Put broadly reusable presentational components in `src/components/`.
- Put HTTP transport and cross-cutting API behavior in `src/services/`.
- Put client-only Zustand stores in `src/stores/`.
- Put shared domain and transport types in `src/types/`, but prefer feature-local types when they are not shared.
- Avoid barrel files that create circular dependencies or obscure ownership.
- Use the `@/` alias for `src/` once the app is scaffolded.

## State and data rules

- TanStack Query owns teams, the current user, and all other backend data.
- Do not copy query data into Zustand or component-level caches.
- Zustand may hold the access token in memory. Never persist access or refresh tokens.
- The refresh token is an HTTP-only cookie; frontend code must not try to inspect it.
- Theme/navigation preferences may be persisted locally, but must contain no credentials or sensitive user data.
- Centralize query keys as factories near their owning feature.
- Mutations must update or invalidate the smallest relevant query set.
- The active team catalog uses the stable `['teams', 'list']` query key and a 24-hour stale time.
- A successful favorite-team mutation writes the returned user directly to `['users', 'me']`; do not issue a duplicate current-user request.
- Administrative roles come only from the current-user response. `EDITOR` and `ADMIN` may enter schedule administration; full audit access and override deletion are `ADMIN`-only. A frontend guard is a navigation aid, never the authorization boundary.
- Administrative game lists use deterministic `['admin', 'games', 'list', filters]` keys; detail writes update the matching detail cache and invalidate affected list/audit families plus the public game family.
- Public game lists, details, and bounded team schedules use the `['games', ...]` query family with normalized filters. Administrative schedule writes also invalidate this public family.
- Public and administrative article query families remain separate. Article mutations use `expectedVersion`, write returned detail data, and invalidate the affected admin list/revision and public article families.
- News-source and candidate query families remain separate under `src/features/newsInbox/`. Source changes invalidate only source lists/detail and audit; candidate actions update detail and invalidate candidate lists/audit. Conversion additionally seeds the returned article detail and invalidates administrative article lists.
- Public player reads use separate normalized list/search/detail/stats/seasons families under `src/features/players/`. They are historical data with no polling and must never be copied into Zustand or browser persistence.
- Public Stats Hub reads use separate metadata/season/weekly/recent families under `src/features/statsHub/`. Metadata is the source of seasons, metrics, availability, positions, precision, ranking notes, and limits. Stats URL state is normalized before requests; opaque cursors remain query state and are never decoded or persisted.

## Authentication and API rules

Follow `docs/api-integration.md`.

- Send the access token as `Authorization: Bearer <token>`.
- Include credentials on refresh and logout requests, and on any endpoint whose cookie behavior requires them.
- On startup, attempt one silent refresh and seed both the returned access token and current-user query from the verified refresh response.
- A failed startup refresh is a normal signed-out outcome, not a fatal application error.
- Deduplicate concurrent refresh attempts. Avoid refresh loops and retry the original request at most once after a successful refresh.
- Clear in-memory authentication state when refresh fails or logout completes.
- Never log credentials, reset tokens, authorization headers, or sensitive response bodies.
- Keep backend DTOs at the API boundary. Map them to view models only when the UI needs a different shape.
- Follow `docs/auth-contract.md` for the verified request and response shapes. Passwords are 12â€“128 characters with no frontend-only composition rules.
- Accept password-reset credentials only from the `token` query parameter. Never persist them, and remove the token from the visible URL after a successful reset.
- Preserve only validated same-origin relative destinations after authentication; reject absolute, protocol-relative, backslash, and authentication-route redirects.
- Follow `docs/team-personalization-contract.md` for team and favorite-team shapes. Submit only internal team UUIDs and never depend on provider mappings.
- Treat backend team colors and logo URLs as untrusted display data. Validate color syntax and use the shared abbreviation fallback when a logo is absent or fails.
- Follow `docs/admin-usage.md` for schedule administration. Never expose provider mappings, add provider configuration UI, or accept arbitrary server file paths.
- Follow `docs/public-games-usage.md` for public schedule behavior. Treat `startTime: string | null` as authoritative, display `Time TBD`, and never invent a kickoff or infer a public correction.
- Follow `docs/editorial-cms-usage.md` for articles. Render Markdown without raw HTML, keep curated sources clearly attributed, use public DTOs on public routes, and never implement client-side publication visibility rules.
- Follow `docs/news-inbox-usage.md` for source and candidate administration. Never scrape pages, fetch source images, copy publisher descriptions into original summaries, schedule ingestion, or imply that ingestion/conversion publishes content.
- Follow `docs/player-statistics-usage.md` for public player data. Preserve internal UUIDs and nullable values, use only the four public player endpoints, display backend attribution, and never invent appearances, contact nflverse directly, calculate an overall comparison winner, or add imports/predictions/fantasy recommendations.
- Follow `docs/stats-hub-usage.md` for public leaderboards and recent performance. Display backend ranks and aggregates directly, preserve team-split and missing-value semantics, and do not add live statistics, rates, fantasy metrics, AI analysis, or predictions.

## UI and design rules

Follow `docs/design-system.md`.

- Support both dark and light themes from the beginning; dark is the initial cinematic direction, not the only supported palette.
- Use theme tokens instead of one-off colors, radii, shadows, or breakpoints.
- Design mobile-first. Use desktop top navigation and mobile bottom navigation at documented breakpoints.
- Every loading experience needs an intentional pending state; every request surface needs empty and error states where applicable.
- Preserve visible keyboard focus, sufficient contrast, semantic landmarks, logical heading order, and reduced-motion behavior.
- Scores and other changing data must not be communicated by color alone.
- Prefer CSS and MUI responsive primitives over JavaScript viewport checks.

## TypeScript and code quality

- Enable strict TypeScript settings. Do not use `any` to bypass an unknown API shape; use `unknown` and validate or narrow it.
- Keep components focused. Extract behavior into feature hooks only when it improves reuse or testability.
- Favor named exports for application modules; route modules may use defaults if lazy loading benefits from them.
- Validate user-controlled form data with Zod and share schemas with React Hook Form.
- Handle expected failures explicitly. Do not swallow errors in empty `catch` blocks.
- Comments should explain decisions or constraints, not restate the code.

## Verification expectations

Once scripts exist, run the relevant subset before handing off changes:

1. Formatting or format check.
2. ESLint.
3. TypeScript typecheck.
4. Vitest for changed behavior.
5. Production build for changes affecting bundling, routing, or configuration.

Test behavior from the user's perspective. Prioritize auth restoration, refresh deduplication, protected-route transitions, forms, favorite-team changes, responsive navigation, and abbreviation fallbacks. Mock at the HTTP boundary rather than mocking TanStack Query internals.

Do not claim a check passed if the corresponding script or scaffold does not yet exist.

## Change discipline

- Keep changes scoped to the requested milestone.
- Preserve unrelated user changes in a dirty worktree.
- Update the relevant document when changing an API assumption, state boundary, design token, or MVP scope.
- Record a short architectural decision in `docs/` before adopting a materially different foundation.
- Never commit secrets. Public Vite environment variables are shipped to browsers and must not contain secrets.
