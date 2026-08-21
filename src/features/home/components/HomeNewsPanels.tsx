import {
  Alert,
  Box,
  Button,
  Card,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import type { PublicArticleListItem } from '@/features/articles/types';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';

interface NewsQueryState {
  readonly data?: { readonly articles: readonly PublicArticleListItem[] };
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly refetch: () => Promise<unknown>;
}

export const HomePublicNews = ({
  query,
}: {
  readonly query: NewsQueryState;
}) => {
  const articles = query.data?.articles ?? [];
  return (
    <Stack component="section" spacing={2} aria-labelledby="home-news-heading">
      <HomeSectionHeader
        eyebrow="PUBLISHED COVERAGE"
        title="Top stories"
        actionLabel="Latest news"
        actionTo="/news"
      />
      {query.isPending ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
          aria-busy="true"
          aria-label="Loading top stories"
        >
          {Array.from({ length: 3 }, (_value, index) => (
            <Skeleton key={index} variant="rounded" height={270} />
          ))}
        </Box>
      ) : query.isError ? (
        <Alert
          severity="info"
          action={
            <Button color="inherit" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        >
          News is temporarily unavailable. Games, Stats, and AI Hub remain
          ready.
        </Alert>
      ) : articles.length === 0 ? (
        <Alert severity="info">
          No published featured stories are available right now.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {articles.slice(0, 3).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              headingComponent="h3"
            />
          ))}
        </Box>
      )}
    </Stack>
  );
};

const CompactArticle = ({
  article,
}: {
  readonly article: PublicArticleListItem;
}) => (
  <Box>
    <Typography component="h3" variant="h4">
      <Link
        component={RouterLink}
        to={`/news/${article.slug}`}
        color="inherit"
        underline="hover"
      >
        {article.title}
      </Link>
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {article.sourceName ?? '2nd & 15'} ·{' '}
      {new Date(article.publishedAt).toLocaleDateString()}
    </Typography>
  </Box>
);

export const HomeTeamNews = ({
  articles,
  favoriteTeamId,
  teamName,
}: {
  readonly articles: readonly PublicArticleListItem[];
  readonly favoriteTeamId: string;
  readonly teamName: string;
}) => (
  <Stack
    component="section"
    spacing={2}
    aria-labelledby="home-team-news-heading"
  >
    <HomeSectionHeader
      eyebrow="MY TEAM"
      title={`${teamName} news`}
      actionLabel="View all news"
      actionTo="/news"
    />
    {articles.length === 0 ? (
      <Alert severity="info">
        No published {teamName} stories are available yet. League-wide coverage
        is still available in News.
      </Alert>
    ) : (
      <Card sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1.3fr) minmax(240px, 0.7fr)',
            },
          }}
        >
          <ArticleCard
            article={articles[0]}
            favoriteTeamId={favoriteTeamId}
            headingComponent="h3"
          />
          <Stack spacing={2} sx={{ justifyContent: 'center' }}>
            {articles.slice(1, 4).map((article) => (
              <CompactArticle key={article.id} article={article} />
            ))}
            {articles.length === 1 ? (
              <Typography color="text.secondary">
                More team coverage will appear here as it is published.
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </Card>
    )}
  </Stack>
);

export const HomeTeamNewsSkeleton = () => (
  <Stack spacing={2} aria-busy="true" aria-label="Loading favorite team news">
    <Skeleton width="45%" height={48} />
    <Skeleton variant="rounded" height={280} />
  </Stack>
);
