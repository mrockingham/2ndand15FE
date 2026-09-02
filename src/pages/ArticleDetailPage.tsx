import LaunchRounded from '@mui/icons-material/LaunchRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { OFFICIAL_BRAND_LOGO_URL } from '@/components/branding/BrandLogo';
import { ArticleHero } from '@/features/articles/components/ArticleHero';
import { MarkdownContent } from '@/features/articles/components/MarkdownContent';
import { usePublicArticleQuery } from '@/features/articles/queries';
import {
  buildPageTitle,
  getCanonicalUrl,
  SITE_NAME,
  useSeoMetadata,
} from '@/features/seo/seo';
import { ApiError } from '@/services/api/apiClient';

export const ArticleDetailPage = () => {
  const { slug = '' } = useParams();
  const query = usePublicArticleQuery(slug);
  const metadata = useMemo(() => {
    const article = query.data;
    const canonicalPath = `/news/${slug}`;
    const description =
      article?.seoDescription ??
      article?.summary ??
      'Read NFL news and independent analysis from 2nd & 15.';
    return {
      title: buildPageTitle(article?.seoTitle ?? article?.title ?? 'NFL News'),
      description,
      canonicalPath,
      imageUrl: article?.heroImageUrl,
      type: 'article' as const,
      publishedAt: article?.publishedAt,
      structuredData: article
        ? {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description,
            datePublished: article.publishedAt,
            mainEntityOfPage: getCanonicalUrl(canonicalPath),
            ...(article.heroImageUrl ? { image: article.heroImageUrl } : {}),
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              logo: {
                '@type': 'ImageObject',
                url: OFFICIAL_BRAND_LOGO_URL,
              },
            },
          }
        : undefined,
    };
  }, [query.data, slug]);
  useSeoMetadata(metadata, query.data !== undefined);
  if (query.isPending)
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography role="status">Loading article…</Typography>
      </Container>
    );
  if (query.error instanceof ApiError && query.error.status === 404)
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography component="h1" variant="h3">
          Article not found
        </Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          This story is unavailable, unpublished, archived, or scheduled for
          later.
        </Typography>
        <Button component={RouterLink} to="/news">
          Back to News
        </Button>
      </Container>
    );
  if (query.isError)
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        >
          The article could not be loaded.
        </Alert>
      </Container>
    );
  const article = query.data;
  return (
    <Container component="article" maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          to="/news"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to News
        </Button>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip label={article.type} />
          {article.teams.map((team) => (
            <Chip key={team.id} variant="outlined" label={team.abbreviation} />
          ))}
        </Stack>
        <Typography component="h1" variant="h2">
          {article.title}
        </Typography>
        {article.summary ? (
          <Typography variant="h5" color="text.secondary">
            {article.summary}
          </Typography>
        ) : null}
        <Typography variant="body2">
          Published {new Date(article.publishedAt).toLocaleString()}
        </Typography>
        <ArticleHero
          url={article.heroImageUrl}
          alt={article.heroImageAlt}
          attribution={article.heroImageAttribution}
          attributionUrl={article.heroImageAttributionUrl}
        />
        {article.type === 'CURATED' ? (
          <Alert severity="info">
            <strong>2nd &amp; 15 summary/commentary.</strong> This is not the
            full source article.
            {article.sourceUrl ? (
              <Box sx={{ mt: 1 }}>
                <Link
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the original at{' '}
                  {article.sourceName ?? 'the external source'}{' '}
                  <LaunchRounded fontSize="inherit" />
                </Link>
              </Box>
            ) : null}
          </Alert>
        ) : null}
        {article.body ? <MarkdownContent markdown={article.body} /> : null}
      </Stack>
    </Container>
  );
};
