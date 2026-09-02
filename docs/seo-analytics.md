# SEO and Analytics

This document records the initial launch configuration for search discovery and
traffic measurement.

## Architecture decision

Google Analytics 4 is the selected product-analytics provider. The integration
uses the Google tag directly instead of Google Tag Manager. The application
sends one manual `page_view` for each public React Router pathname and disables
the tag's automatic initial page view. This keeps SPA navigation deterministic
and prevents query parameters from entering analytics.

Analytics has a consent-first privacy boundary:

- The Google script is loaded only in a production build with a valid
  `VITE_GA_MEASUREMENT_ID` and after the visitor selects **Allow analytics**.
- Declining prevents the tag from loading. A visitor can reopen Analytics
  choices from the footer and change the decision.
- Account, authentication, password-reset, team-selection, Admin, and Fantasy
  placeholder routes are never tracked.
- Page locations contain only the pathname. Search parameters, reset tokens,
  user IDs, access tokens, API payloads, and current-user properties are never
  sent.
- Advertising storage, Google signals, and ad-personalization signals are
  disabled.

This is product configuration, not a substitute for a reviewed privacy policy
or jurisdiction-specific legal advice.

## Production environment

Set these public values in the Vercel **Production** environment:

```env
VITE_SITE_URL=https://your-canonical-domain.example
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`VITE_SITE_URL` must be the single HTTPS origin that should appear in Google
results, including the intentional `www` or non-`www` choice. It controls
canonical URLs and build-generated crawl assets. These values are public
browser configuration, not secrets.

## GA4 account setup

1. Create a GA4 property and Web data stream for the canonical production URL.
2. Copy its `G-...` measurement ID into `VITE_GA_MEASUREMENT_ID` in Vercel.
3. In the stream's Enhanced Measurement settings, open Page views advanced
   settings and disable browser-history page-change tracking. The frontend
   already sends SPA page views manually; enabling both can double-count.
4. Deploy, allow analytics in the site prompt, navigate between several public
   routes, and verify the events in GA4 DebugView/Realtime.
5. Confirm that `page_location` contains no query string and that private route
   visits do not create page views.

## Search setup

Each public route receives a specific title, description, self-referencing
canonical URL, robots directive, Open Graph/X metadata, and JSON-LD WebPage or
WebSite data. Published article pages additionally use their editorial SEO
title/description, hero image, publication time, and NewsArticle structured
data. Unknown, placeholder, private, authentication, and administrative routes
use `noindex`.

Production builds with `VITE_SITE_URL` generate root-level `robots.txt` and
`sitemap.xml`. The initial sitemap contains stable public routes. Crawlable
links from those routes expose team, player, game, and article detail pages;
the next SEO iteration should add an API-backed dynamic sitemap (and a News
sitemap if publication volume warrants it) so every published detail URL is
submitted explicitly.

## Google Search Console launch checklist

1. Add a Domain property for the production domain and verify it with the DNS
   record Google provides. A Domain property covers HTTPS, HTTP, `www`, and
   other subdomains.
2. Deploy with `VITE_SITE_URL` configured.
3. Open `https://your-domain.example/robots.txt` and `/sitemap.xml` to verify
   both are publicly reachable and contain the canonical domain.
4. Submit `sitemap.xml` in Search Console's Sitemaps report.
5. Inspect the home page, News, Games, Power Rankings, and one published article
   with URL Inspection, then request indexing for the most time-sensitive
   pages.
6. Monitor Page indexing, Core Web Vitals, HTTPS, rich-result eligibility, and
   search queries after launch. Indexing is not immediate or guaranteed.

## Current rendering boundary

Google can render the application's JavaScript and read the route metadata.
Some social preview crawlers do not execute JavaScript, so article-specific
Open Graph previews may fall back to the default site metadata. Server-side
rendering or build-time prerendering of published routes is the durable follow-up
if article sharing and faster indexing become high priorities.
