# Team visual identity

The team visual identity layer adds local, original helmet artwork and restrained favorite-team personalization without changing backend contracts or the core 2nd & 15 product design.

## Source of truth

`src/features/teamVisualIdentity/teamVisualConfigs.ts` is the single reviewed registry for all 32 NFL abbreviations. It owns the colors used by both helmet rendering and derived interface accents. Runtime presentation does not depend on provider IDs or the `primaryColor` and `secondaryColor` fields in backend team DTOs.

Unsupported, empty, or malformed abbreviations safely use the default 2nd & 15 visual treatment.

## Default and personalized contexts

The global application context uses this precedence:

1. The authenticated current user's configured favorite team.
2. The existing 2nd & 15 purple palette.

Logged-out users and authenticated users without a favorite therefore receive the same intentional purple branding. `TeamVisualThemeProvider` reads the existing current-user query and never makes a theming-specific request. The existing favorite-team mutation writes its returned user to that query cache, so active accents change immediately without a reload.

The provider exposes semantic CSS variables including `--team-primary`, `--team-on-primary`, `--team-subtle`, `--team-border`, `--team-focus`, and the selected/hero variants. Components should consume these variables only where personalization is intentional.

## Local entity precedence

Entity identity overrides global personalization inside its own boundary:

- A Team Hub hero uses the viewed team's local tokens.
- A Team Directory card uses the represented team's local tokens.
- A helmet or badge always uses the represented team's configuration.
- Matchup containers remain neutral while each side keeps its own helmet identity.

For example, a Raiders fan viewing Philadelphia keeps Raiders accents in global navigation while the Eagles Team Hub hero remains Philadelphia-specific. Global favorite colors must never recolor an opponent.

## Helmet and badge system

`TeamHelmet` renders one original, generic SVG football-helmet silhouette. Teams vary only by reviewed configuration: shell, facemask, stripe treatment, text color, and abbreviation placement. No official marks, mascot art, logo substitutes, remote images, canvas, or graphics libraries are used.

- `lg` and `md` render the full highlighted/shaded helmet.
- `sm` renders a simplified helmet.
- `xs`, the explicit `badge` variant, and unknown teams render `TeamBadge`.
- Meaningful helmets expose the team name; decorative helmets are hidden from assistive technology.
- Per-instance SVG IDs prevent gradient/filter collisions when many helmets share a page.

Approved backend logo URLs may continue to render in legacy identity surfaces. Missing or failed logos use the local helmet system. Team-focused surfaces added to this milestone use helmets directly.

## Contrast and color modes

`getTeamThemeTokens()` derives semantic light- and dark-mode values from the registry. It selects black or white foreground text by measured contrast and creates mode-appropriate alpha tints for borders, focus rings, selections, and heroes. Results are memoized by team and mode.

Dark mode retains the existing dark canvases and uses restrained tinted accents. Light mode uses light team-tinted surfaces and visible borders. Raw team colors should not be scattered through feature components; use semantic tokens or a local token scope.

## Semantic exclusions

Favorite-team colors may style primary calls to action, active navigation, selected tabs and filters, favorite-team areas, and appropriate progress indicators. They must not replace error, warning, success, destructive, or disabled-state colors. Body copy, general surfaces, ordinary icons, and unrelated cards remain neutral.

Selection continues to use labels, state, shape, or indicators in addition to color. Focus rings remain visible, changes use only short existing transitions, and the global reduced-motion rule remains authoritative.

## Integration guidance

Use global CSS variables for application personalization. For a team-specific card or hero, derive tokens from the entity abbreviation and scope `getTeamVisualCssVariables(tokens)` on the smallest owning container. Use `TeamHelmet` for team-forward displays and `TeamBadge` for compact navigation/table contexts.

The system adds a small TypeScript registry, pure color helpers, a context wrapper, and one reusable SVG. It adds no runtime dependencies, network graphics, or per-team image assets; the expected bundle impact is limited to a few kilobytes of configuration and component code before compression.
