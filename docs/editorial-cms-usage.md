# Editorial CMS and Public News

## Access and routes

Public readers use `/news` and `/news/:slug`. Signed-in `EDITOR` and `ADMIN` users may use `/admin/articles`, `/admin/articles/new`, and `/admin/articles/:articleId`. Only `ADMIN` sees archive, restore, and complete article audit controls. Frontend roles guide the experience; backend capability middleware remains authoritative.

Public pages call only public endpoints, so drafts, scheduled-future, unpublished, and archived records are never inferred or filtered in browser code. The backend also derives when scheduled and featured content is visible.

## Editorial workflow

New records always begin as drafts. Editors choose one backend-supported type:

- `ORIGINAL`: requires an original summary and Markdown body.
- `CURATED`: requires original summary/commentary, source name, and HTTP(S) source URL. Optional commentary is limited to 2,000 characters and the public page points readers to the source instead of reproducing it.
- `ANNOUNCEMENT`: requires a Markdown body; a summary is optional.

Slug previews are generated locally, but the backend owns uniqueness and the final slug. Published slugs cannot be edited. Zero team tags means league-wide; selected teams use internal active-team UUIDs.

Every edit, team replacement, publish, schedule, unpublish, archive, and restore request sends the displayed `expectedVersion`. A conflict leaves form content in place and offers explicit reload and copy-Markdown actions. Successful writes cache the returned detail, refresh the relevant list/revision families, and invalidate public article queries when visibility may have changed.

Scheduling requires a future ISO timestamp with an explicit UTC offset. The browser does not guess a timezone. Editors can publish, schedule, and unpublish. Administrators additionally archive or restore. Every lifecycle action asks for confirmation and may include a change summary.

## Revisions and audit

Editors and administrators can inspect immutable revision metadata and a safely rendered snapshot from article detail. There is intentionally no one-click restore because the backend exposes no restore-from-revision operation. Administrators may also inspect compact article audit events; editors are not sent to the admin-only full audit endpoint.

## Content and media safety

- Article bodies use Markdown with GitHub-flavored tables, lists, and links.
- Raw HTML is rejected in the form and skipped again by the renderer.
- `javascript:`, `data:`, and `vbscript:` links are blocked. External links open with `noopener noreferrer`.
- Inline Markdown images are not fetched; the renderer shows an omission marker.
- A hero uses an external HTTP(S) URL only when meaningful alt text is supplied. The browser does not upload, proxy, download, or claim rights to it.
- Editors remain responsible for publication rights and source attribution.

## Public behavior

The News page supports backend-owned type, search, cursor, and favorite-team filters. Search is sent only after two non-space characters. Featured-feed failure does not take down the main feed. Article detail distinguishes curated commentary from original reporting and links to the original source. Missing or non-public slugs share a deliberate not-found state without exposing internal status.

The home page uses a small featured-News query as an enhancement. Its failure leaves the rest of Home useful.

## Performance boundary

News/detail, the admin shell, schedule tools, full audit, and article CMS pages are route-level lazy chunks with an accessible loading fallback. The home and lightweight authentication/account paths stay in the initial application chunk. This keeps editor-only code and the Markdown renderer out of unrelated first-route execution.

The production build before this milestone emitted one 863.08 kB application script (263.80 kB gzip). After route splitting, the initial application script is 448.92 kB (138.63 kB gzip), about 48% smaller raw and 47% smaller compressed. Meaningful deferred chunks include the Markdown renderer at 154.53 kB (46.19 kB gzip), the article form at 53.15 kB (17.51 kB gzip), and separate News, article-detail, admin-shell, schedule, audit, and CMS page chunks.

## Exclusions

This milestone adds no WYSIWYG or raw-HTML editor, media upload/library, remote-image proxy, author directory, revision restore, autosave, collaborative editing, analytics, comments, reactions, notifications, RSS, social automation, or deployment changes.
