# Homepage CMS Usage

Milestone 35B replaces the static public Hero and adds a curated Top Stories
section, a Highlights section, and a three-category League Leaders view to
the generic (non-personalized) Home, backed by the backend's Homepage CMS.
It also adds Admin management for the Hero carousel and Top Stories.

## Single public payload

The generic Home consumes exactly one endpoint, `GET /homepage`, via
`useHomepageQuery` (`src/features/homepage/queries.ts`). Hero slides, Top
Stories, Highlights, and League Leaders are never fetched separately — the
backend composes all four in one response specifically to avoid frontend
fan-out. The query does not retry on failure and is cached briefly
(`staleTime: 60s`); a failed request is treated as "no CMS content" rather
than an error banner, so Home always stays usable (see "Fallback behavior"
below).

## Hero fallback

If `heroSlides` is empty (no slides configured yet) or the `/homepage`
request fails, Home renders the original static Hall of Fame Game hero
(`PublicHero` in `src/features/home/components/PublicHome.tsx`) unchanged.
The CMS carousel (`HomepageHeroCarousel`) only renders once at least one
active slide exists. This makes the CMS rollout safe: Home is never blank
because content hasn't been configured yet.

## Hero carousel

`HomepageHeroCarousel` (`src/features/homepage/components/`) supports 1 to
10 slides. With more than one slide it shows previous/next arrow buttons and
pagination dots (`role="tablist"`/`role="tab"`), plus a slow (7s) autoplay
that pauses on hover/focus and is skipped entirely when the browser reports
`prefers-reduced-motion: reduce`. There is no drag/swipe gesture library —
this is a small hand-rolled component, matching this codebase's existing
convention of no carousel dependency.

Each slide (`HomepageHeroSlide`) renders:

- The backend image URL only (no upload, no proxy, no base64) with
  non-destructive presentation controls applied via CSS — `imageBrightness`/
  `imageContrast`/`imageSaturation` become a CSS `filter`, `focalPointX`/
  `focalPointY` becomes `object-position`, `imageScale` becomes a CSS
  `transform: scale(...)`, and `overlayOpacity` renders as a separate flat
  dark layer on top of the existing gradient (the source image itself is
  never modified).
- Up to nine rich-text content blocks positioned in a 3×3 grid
  (`TOP_LEFT` … `BOTTOM_RIGHT`). Desktop renders the literal 3×3 grid;
  narrower viewports use the same DOM nodes reflowed into a single stacked
  column (top-to-bottom, left-to-right reading order) via responsive CSS
  grid placement — there is deliberately only one copy of each block in the
  DOM, not a separate duplicated mobile layout, so there's nothing to keep
  in sync and no double-announcement to screen readers.
- Up to two CTA buttons (`PRIMARY`/`SECONDARY`), each pointing at an internal
  path (`react-router` navigation) or an `https://` URL (`target="_blank"`,
  `rel="noopener noreferrer"`). A slide with no CTAs renders none.

## Rich-text rendering

The backend's Hero content is a small closed JSON document (`doc` →
`paragraph`/`heading` blocks → `text`/`link` inline nodes with optional
`bold`/`italic` marks and block `align`) — never HTML, never Markdown.
`HeroRichText` (`src/features/homepage/components/HeroRichText.tsx`) renders
it directly to semantic markup (`h1`–`h3`, `p`, `a`, `strong`, `em`) with no
`dangerouslySetInnerHTML` and no HTML parsing anywhere. Internal link hrefs
(starting with `/`) use `react-router-dom`'s `Link`; external `https://`
hrefs get `target="_blank" rel="noopener noreferrer"`.

## Top Stories

When `homepage.topStories` is non-empty, `TopStoriesSection` renders in the
same Home slot that the pre-existing featured-articles panel
(`HomePublicNews`, headed "Top stories") used to occupy — the two are
alternatives, never both rendered, so there is only ever one "Top stories"
heading on the page. Position 0 renders as a larger lead card; the remaining
(up to five) render as compact rows below it. Every story card reuses the
existing article image-fallback logic (`MediaThumbnail` for video/highlight
content, `ArticleHero` otherwise) and links to the existing `/news/:slug`
article route — there is no separate Top Story detail page. When
`topStories` is empty (nothing curated yet, or the request failed), Home
falls back to the original featured-articles panel unchanged.

## Highlights

`HomepageHighlightsSection` renders directly beneath the schedule grid using
`homepage.highlights` — up to eight recent game highlights/videos, each
using the existing `GameHighlightThumbnail` component. The section renders
nothing when there are no highlights (no "no highlights yet" placeholder).
Every card's primary action opens Game Center (`/games/:gameId`) using the
internal game ID; there is no second inline video player on Home, and the
excluded global Game Center video is never client-side re-added (the
backend's `PublicHomepageHighlightDto.mediaType` is typed to exclude
`'GLOBAL'` entirely). No per-highlight media requests are made — the section
renders only fields already present on the `/homepage` payload.

## League Leaders

`HomepageLeadersSection` replaces the generic Home's previous
`HomeStatsLeaders` leaderboard (the personalized/team Home's team-scoped
`HomeStatsLeaders` is untouched — see "Personalized Home" below). It shows
the backend's season/season-type metadata (e.g. "2025 Regular Season") and a
tab selector for Passing / Rushing / Receiving, each showing up to the top
three players. Rank 1 is visually larger; rank is also stated in each row's
accessible label so it is never conveyed by size/color alone
(`leaderAccessibleLabel` in `src/features/homepage/presentation.ts`). Player
headshots reuse the existing `PlayerAvatar` component and its initials
fallback. A `team: null` leader (a stat aggregated across multiple teams)
renders without a team abbreviation rather than inventing one.

## Personalized Home

Authenticated users with a favorite team still see the `Home` / `{ABBR}
{Team}` tab switcher added in M34.5 (`AuthenticatedHome`). Only the generic
`Home` tab uses the CMS payload described above; the team tab keeps
rendering the existing personalized Home (`PersonalizedHomeContent`)
unchanged, including its own team-scoped historical leaders. Switching tabs
never re-fetches `/homepage` unnecessarily — the query result is cached
under a stable `['homepage', 'public']` key independent of which tab is
active.

## Admin: Hero carousel

`/admin/homepage` (`AdminHomepagePage`) lists every Hero slide (active and
inactive) with a thumbnail, a first-line text preview, Edit/Move Up/Move
Down/Delete controls, and an inline Active/Inactive switch. `meta.
readyForPublish` (advisory only — at least 3 active slides) is shown as
"Ready to publish" or "Needs N more active slides"; it never blocks editing
or saving. Adding a slide is disabled once 10 exist; the backend remains
authoritative and a `HOMEPAGE_HERO_SLIDE_LIMIT_REACHED` (409) is still
handled if the client-side check is ever stale.

`/admin/homepage/hero/new` and `/admin/homepage/hero/:slideId`
(`AdminHeroSlideEditorPage`) provide the full slide editor: a live preview
(reusing the exact same `HomepageHeroSlide` component the public Home
renders, so the preview never drifts from production), an Image URL field
(HTTPS only — there is no image upload; paste a URL), a 3×3 "Text Positions"
grid for adding/editing/removing a content block per slot, a CTA editor (up
to two buttons), and image-adjustment sliders (Brightness/Contrast/
Saturation/Dark Overlay/Horizontal & Vertical Focal Point/Zoom) with a
"Reset Image Adjustments" button that restores the backend's documented
defaults (100/100/100/0/50/50/100). Unsaved changes are guarded by the
existing `UnsavedChangesDialog` navigation blocker.

Rich-text editing (`HeroRichTextEditor`) is a structured composer, not a
WYSIWYG surface: each block has a type (Paragraph/Heading 1–3) and alignment
selector, plus an ordered list of inline "runs" — each run is either plain
text (with Bold/Italic toggles) or a link (text + URL) — added/removed
individually. This serializes directly to the backend's closed JSON schema
with no HTML/Markdown round-trip. There is no existing rich-text editor
library in this codebase, and the backend's document model is intentionally
minimal (no images, embeds, tables, arbitrary fonts/colors, or raw HTML), so
a small purpose-built composer was used instead of adding a dependency.

## Admin: Top Stories

Marking an article as a Top Story happens from the existing Articles admin
list (`/admin/articles`), not a separate picker — each row has a "Top Story"
checkbox. Checking it calls `PUT /admin/homepage/top-stories/:articleId`;
unchecking calls `DELETE`. The checkbox disables (with a tooltip) for any
unmarked article once six Top Stories already exist; the backend's
`HOMEPAGE_TOP_STORY_LIMIT_REACHED` (409) remains authoritative. Unmarking a
story never calls any article delete/unpublish endpoint — it only removes
the curation row, and the Admin copy on `/admin/homepage` says so
explicitly.

`/admin/homepage`'s Top Stories section shows the current order (position 0
labeled "Lead") with Move Up/Down controls and a per-story Remove action,
reusing the exact reorder pattern (`moveOrder` + a single "reorder" mutation
carrying the full ordered ID array) already established by Game Media's
curated-video reordering.

## Query keys and cache invalidation

```ts
homepageKeys.all; // ['homepage', 'public']
adminHomepageKeys.hero(); // ['homepage', 'admin', 'hero']
adminHomepageKeys.heroDetail(slideId);
adminHomepageKeys.topStories(); // ['homepage', 'admin', 'top-stories']
```

Every Hero admin mutation (create/update/delete/reorder) invalidates both
the admin Hero list and the public `/homepage` cache. Every Top Story
mutation (mark/unmark/reorder) invalidates the admin Top Stories list, the
public `/homepage` cache, and the public Articles cache (since marking an
article as a Top Story doesn't change the article itself, but keeps the two
surfaces consistent within one session). This lets an Admin/Editor mark a
story or edit a Hero slide and see Home update without a hard reload.

## Exclusions

This milestone does not add image upload/storage (the backend is URL-only
by design; a future milestone may add real storage), a second inline-video
player on Home, drag-and-drop reordering (Move Up/Down only, matching the
existing Game Media convention), or any new third-party carousel/rich-text
dependency.
