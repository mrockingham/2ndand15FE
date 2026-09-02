import { useEffect } from 'react';

import { OFFICIAL_BRAND_LOGO_URL } from '@/components/branding/BrandLogo';

export const SITE_NAME = '2nd & 15';
export const DEFAULT_SEO_DESCRIPTION =
  'NFL scores, schedules, standings, power rankings, news, historical player stats, and responsible AI-powered weekly predictions from 2nd & 15.';

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly imageUrl?: string | null;
  readonly noIndex?: boolean;
  readonly type?: 'website' | 'article';
  readonly publishedAt?: string | null;
  readonly structuredData?: Readonly<Record<string, unknown>>;
}

const ensureMeta = (
  selector: string,
  attribute: 'name' | 'property',
  key: string,
) => {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) return existing;
  const element = document.createElement('meta');
  element.setAttribute(attribute, key);
  document.head.append(element);
  return element;
};

const setNamedMeta = (name: string, content: string) => {
  ensureMeta(`meta[name="${name}"]`, 'name', name).content = content;
};

const setPropertyMeta = (property: string, content: string) => {
  ensureMeta(`meta[property="${property}"]`, 'property', property).content =
    content;
};

const removePropertyMeta = (property: string) => {
  document.head
    .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    ?.remove();
};

const configuredSiteOrigin = () => {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (!configured) return window.location.origin;
  try {
    const parsed = new URL(configured);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:')
      return parsed.origin;
  } catch {
    // Environment validation and the production checklist surface bad values.
  }
  return window.location.origin;
};

export const buildPageTitle = (pageName: string) =>
  pageName === SITE_NAME ? SITE_NAME : `${pageName} | ${SITE_NAME}`;

export const getCanonicalUrl = (canonicalPath: string) =>
  new URL(canonicalPath, configuredSiteOrigin()).toString();

export const applySeoMetadata = (metadata: SeoMetadata) => {
  const canonicalUrl = getCanonicalUrl(metadata.canonicalPath);
  const robots = metadata.noIndex
    ? 'noindex,nofollow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  document.title = metadata.title;
  setNamedMeta('description', metadata.description);
  setNamedMeta('robots', robots);
  setNamedMeta('googlebot', robots);
  setPropertyMeta('og:site_name', SITE_NAME);
  setPropertyMeta('og:locale', 'en_US');
  setPropertyMeta('og:type', metadata.type ?? 'website');
  setPropertyMeta('og:title', metadata.title);
  setPropertyMeta('og:description', metadata.description);
  setPropertyMeta('og:url', canonicalUrl);
  setNamedMeta(
    'twitter:card',
    metadata.imageUrl ? 'summary_large_image' : 'summary',
  );
  setNamedMeta('twitter:title', metadata.title);
  setNamedMeta('twitter:description', metadata.description);

  if (metadata.imageUrl) {
    setPropertyMeta('og:image', metadata.imageUrl);
    setNamedMeta('twitter:image', metadata.imageUrl);
  } else {
    removePropertyMeta('og:image');
    document.head.querySelector('meta[name="twitter:image"]')?.remove();
  }

  if (metadata.type === 'article' && metadata.publishedAt)
    setPropertyMeta('article:published_time', metadata.publishedAt);
  else removePropertyMeta('article:published_time');

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  const structuredData = metadata.structuredData ?? {
    '@context': 'https://schema.org',
    '@type': metadata.canonicalPath === '/' ? 'WebSite' : 'WebPage',
    name: metadata.title,
    description: metadata.description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: configuredSiteOrigin(),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: OFFICIAL_BRAND_LOGO_URL,
      },
    },
  };
  let script = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-structured-data="true"]',
  );
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoStructuredData = 'true';
    document.head.append(script);
  }
  script.textContent = JSON.stringify(structuredData).replaceAll(
    '<',
    '\\u003c',
  );
};

export const useSeoMetadata = (
  metadata: SeoMetadata,
  enabled: boolean = true,
) => {
  useEffect(() => {
    if (enabled) applySeoMetadata(metadata);
  }, [enabled, metadata]);
};
