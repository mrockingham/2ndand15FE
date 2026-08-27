# News Sources and Editorial Candidate Inbox

## Access and purpose

`EDITOR` and `ADMIN` accounts can view sources, run backend-permitted tests and manual ingestion, and work with candidates. Only `ADMIN` can create or edit source definitions or pause/resume a source. These UI checks are navigation aids; backend capabilities are authoritative, and a stale-role `403` refreshes the current-user query.

The workflow stores publisher metadata for private editorial review. It does not scrape article pages, extract bodies, fetch images, run AI writing, publish articles, or schedule recurring ingestion.

## Source registry and operations

`/admin/news-sources` lists only backend-returned source configuration and sanitized health data. Full validators, response bodies, raw XML, DNS detail, and arbitrary headers or credentials are never exposed. RSS/Atom sources require an explicit public HTTP(S) feed URL; localhost, private-network addresses, credentials, and “ignore SSL” options are rejected. `MANUAL_ONLY` sources have no fetchable feed.

Source detail distinguishes two operations:

- **Test source** fetches and parses according to backend test semantics and creates no candidates.
- **Run ingestion** requires confirmation and may create/update private candidates; it never creates or publishes a public article.

Both actions show only exact bounded result fields and sanitized failures. Duplicate pending requests are disabled. Changing a live feed URL requires explicit confirmation and should be followed by a test.

## Candidate workflow

The inbox preserves status, source, team, publication-date, and search filters in the URL and uses backend cursors. Candidate states are `New`, `Reviewing`, `Saved`, `Converted`, and `Dismissed`. The client offers only backend-supported transitions. Dismissal requires a recorded reason; converted and dismissed candidates remain visible through filters.

Publisher descriptions are rendered as read-only plain text. They are source metadata, not approved 2nd & 15 copy. External pages open with `noopener noreferrer`; the browser does not fetch, embed, or inspect them. Team suggestions are deterministic backend suggestions, not confidence scores or final tags; their returned rule is shown and editors confirm tags during conversion.

Manual submission stores an HTTP(S) URL, headline, source identity, optional description/author/publication timestamp, and internal team UUIDs. It does not fetch the URL. Publication timestamps are converted to an explicit UTC ISO timestamp. Backend canonical-URL deduplication remains authoritative and duplicate conflicts are shown safely.

## Conversion to a curated draft

The candidate headline is an editable title starting point and suggested teams are editable selections. The original-summary field always starts empty. The publisher description remains separately visible for reference and is never copied or offered through a copy shortcut.

Conversion requires an original summary and may include original Markdown commentary, confirmed team UUIDs, independently entered hero metadata, and a change summary. The backend rejects a summary that duplicates the source description and transactionally returns the converted candidate plus a `CURATED` `DRAFT`. The frontend updates candidate detail, invalidates candidate and administrative article lists, seeds the returned article detail, refreshes audit data, and navigates to the existing editor with a success notice. No publish or schedule request is made.

## Source evaluation and exclusions

Backend evaluation found the ESPN NFL RSS feed technically parseable. ESPN is not hardcoded and no default source is inserted. The proposed NFL.com `?format=rss` URL returned oversized HTML and was rejected; no team-feed URL is inferred.

There is no cron job, scheduler, queue, Redis worker, webhook, automatic ingestion, automatic publication, scraping, headless browser, article-body extraction, social ingestion, AI summary/writing, image fetching, or image upload in this milestone.

## Content type and thumbnail preview (M30C)

Each source and candidate carries a deterministic `contentType` (`ARTICLE`/`VIDEO`/`HIGHLIGHT`, set on the source configuration, never inferred per item) and, for VIDEO/HIGHLIGHT, a feed-provided `mediaThumbnailUrl`. The candidate list and detail pages now show both: a content-type chip next to the status chip, an "Official Team" chip when `candidate.source.isOfficialTeam` is true, and — where a thumbnail exists — the same thumbnail-with-fallback component the public news cards use, so operators reviewing the mostly-`PAUSED` official-team sources can see exactly what a converted article would look like before it's published. Converting a candidate carries its `contentType`, `mediaThumbnailUrl`, and source official-team provenance onto the resulting curated article; see `docs/news-usage.md` for the public-facing presentation.
