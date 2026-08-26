# News content types (M30C)

## Purpose

M30A/M30B built official NFL team media coverage into the private admin ingestion pipeline (`NewsSource`/`NewsCandidate`), classifying each source deterministically as `ARTICLE`, `VIDEO`, or `HIGHLIGHT` — never inferred per item from a title or URL. M30C carries that same `contentType` (plus a feed-provided `mediaThumbnailUrl`) onto the published `Article` model and its public API, and updates the public News page, the homepage news panels, and the Admin candidate inbox to present all three content types distinctly, on top of the existing article experience rather than a parallel one.

## Content types

`ArticleContentType` is `'ARTICLE' | 'VIDEO' | 'HIGHLIGHT'`, always taken from the backend field — the frontend never infers it. `ArticleCard` (`src/features/articles/components/ArticleCard.tsx`) renders `ARTICLE` exactly as before: a hero image, the existing `type` chip (Original/Curated/Announcement), and an absolute "Published …" timestamp. `VIDEO` and `HIGHLIGHT` branch to a media-forward layout: a 16:9 `MediaThumbnail`, a `VIDEO`/`HIGHLIGHT` chip, a relative "Xh ago"-style timestamp (`formatPublishedAgo` in `src/features/articles/presentation.ts`), and a "Watch on {source} →" / "Watch Highlight →" call to action.

## No in-app playback

Official-team media feeds provide title, description, publication time, a canonical content page URL, team association, source, and a thumbnail image — never a direct video file, embed URL, duration, or HLS/MP4 stream. Accordingly the frontend never fetches a video stream, scrapes a source page, inspects hidden HTML for a playback URL, proxies external media, or converts a thumbnail into a playback URL. The VIDEO/HIGHLIGHT call-to-action is always a plain external anchor to the article's existing `sourceUrl` (`target="_blank" rel="noopener noreferrer"`) — the same canonical-destination field curated articles already used, not a new video-specific URL.

## Thumbnails

`MediaThumbnail` (`src/features/articles/components/MediaThumbnail.tsx`) shows the backend's `mediaThumbnailUrl` when present. When it's missing, or the image fails to load, it falls back to the article's first team's helmet and colors (`TeamHelmet`, `getTeamVisualConfig`) with the content-type icon and badge — never a broken-image icon, and never a layout collapse, since the container keeps a fixed 16:9 aspect ratio regardless of which branch renders. With no team at all, it falls back to a neutral gradient and a generic icon. The content-type badge is always real text, not a color- or icon-only signal, both on the thumbnail overlay and in the card's own chip row.

## Filters and mixed feed

`/news` keeps its existing `Article type` filter (Original/Curated/Announcement) and adds an independent `Content type` filter (All/Articles/Videos/Highlights), both plain query params (`type`, `contentType`) forwarded as part of the same `PublicArticleFilters` object `usePublicArticlesQuery` already used — so they combine freely with the existing team filter and each other without any new query architecture. The feed itself stays a single mixed list; there is no separate videos/highlights page in this phase.

## Team and favorite-team behavior

Official-team content is not a separate silo: filtering by team returns national articles, official team articles, official team video, and official highlights together, the same way curated ESPN content already did. Favorite-team personalization (the border highlight and "My team" chip) is unchanged and applies identically to VIDEO/HIGHLIGHT cards.

## Admin candidate preview

The backend's candidate DTO (`toNewsCandidateListDto`) has returned `contentType`, `thumbnailUrl`, and `source.isOfficialTeam` since M30A; the admin candidate inbox (`CandidateCard`, `AdminNewsCandidateDetailPage`) now actually renders them — a content-type chip, an "Official Team" chip where applicable, and, for VIDEO/HIGHLIGHT, the same `MediaThumbnail` component the public cards use. This matters because most official-team sources are currently `PAUSED`, so operator review of exactly this content is the primary way to verify the pipeline before any source is activated.

## Official Team provenance

`sourceIsOfficialTeam` is a boolean snapshotted onto the `Article` model at conversion time from the originating `NewsCandidate.source.isOfficialTeam` — the same denormalization pattern already used for `sourceName`/`sourceUrl`, not a live join. `ArticleCard` shows a small outlined "Official Team" chip whenever it's true, for any content type (official-team sources produce ARTICLE content too — 31 of 32 teams have it). This indicates provenance only: which entity supplied the content, not an editorial quality or independent-verification claim. Articles created directly (ORIGINAL/ANNOUNCEMENT, or CURATED from a non-official or manual source) simply don't show the chip.

## Known limitations

- No dedicated Videos/Highlights page yet — mixed feed only.
- 60 of the 61 official NFL team sources are `PAUSED` by design; enabling them is a separate, deliberate operational decision, not something this milestone or its tests do automatically.
