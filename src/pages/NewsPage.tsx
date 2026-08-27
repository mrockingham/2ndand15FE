import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import {
  useFeaturedArticlesQuery,
  usePublicArticlesQuery,
} from '@/features/articles/queries';
import type {
  ArticleContentType,
  ArticleType,
} from '@/features/articles/types';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

export const NewsPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const authenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );
  const currentUser = useCurrentUserQuery().data;
  const favorite = currentUser?.favoriteTeam ?? null;
  const type = (parameters.get('type') || undefined) as ArticleType | undefined;
  const contentType = (parameters.get('contentType') || undefined) as
    ArticleContentType | undefined;
  const searchValue = parameters.get('search') ?? '';
  const search =
    searchValue.trim().length >= 2 ? searchValue.trim() : undefined;
  const myTeam = parameters.get('team') === 'mine' && favorite !== null;
  const cursor = parameters.get('cursor') || undefined;
  const filters = {
    limit: 20,
    type,
    contentType,
    search,
    cursor,
    ...(myTeam ? { teamId: favorite.id } : {}),
  };
  const articles = usePublicArticlesQuery(filters);
  const featured = useFeaturedArticlesQuery({ limit: 3 });
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('cursor');
    setParameters(next);
  };
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" color="primary.light">
            AROUND THE LEAGUE
          </Typography>
          <Typography component="h1" variant="h2">
            News
          </Typography>
          <Typography color="text.secondary">
            Original reporting, site announcements, and clearly attributed
            curated coverage.
          </Typography>
        </Box>
        {featured.data?.articles.length ? (
          <Box component="section" aria-labelledby="featured-news">
            <Typography id="featured-news" variant="h3" sx={{ mb: 2 }}>
              Featured
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
              }}
            >
              {featured.data.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  favoriteTeamId={favorite?.id}
                />
              ))}
            </Box>
          </Box>
        ) : null}
        {featured.isError ? (
          <Alert severity="info">
            Featured stories are unavailable. The main News feed is still
            available.
          </Alert>
        ) : null}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search news"
              value={parameters.get('search') ?? ''}
              onChange={(event) => update('search', event.target.value)}
              helperText="Search starts at two characters."
            />
            <TextField
              fullWidth
              select
              label="Article type"
              value={type ?? ''}
              onChange={(event) => update('type', event.target.value)}
            >
              <MenuItem value="">All types</MenuItem>
              <MenuItem value="ORIGINAL">Original</MenuItem>
              <MenuItem value="CURATED">Curated</MenuItem>
              <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Content type"
              value={contentType ?? ''}
              onChange={(event) => update('contentType', event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ARTICLE">Articles</MenuItem>
              <MenuItem value="VIDEO">Videos</MenuItem>
              <MenuItem value="HIGHLIGHT">Highlights</MenuItem>
            </TextField>
            {authenticated && favorite ? (
              <Button
                variant={myTeam ? 'contained' : 'outlined'}
                onClick={() => update('team', myTeam ? '' : 'mine')}
              >
                My team: {favorite.abbreviation}
              </Button>
            ) : null}
          </Stack>
        </Paper>
        <Box component="section" aria-labelledby="latest-news">
          <Typography id="latest-news" variant="h3" sx={{ mb: 2 }}>
            Latest stories
          </Typography>
          {articles.isPending ? (
            <Typography role="status">Loading news…</Typography>
          ) : null}
          {articles.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => void articles.refetch()}>
                  Retry
                </Button>
              }
            >
              News could not be loaded. Try again.
            </Alert>
          ) : null}
          {articles.data?.articles.length === 0 ? (
            <Typography color="text.secondary">
              No published stories match these filters.
            </Typography>
          ) : null}
          {articles.data?.articles.length ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  xl: 'repeat(3, 1fr)',
                },
              }}
            >
              {articles.data.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  favoriteTeamId={favorite?.id}
                />
              ))}
            </Box>
          ) : null}
          {articles.data?.nextCursor ? (
            <Button
              sx={{ mt: 2 }}
              onClick={() => {
                const next = new URLSearchParams(parameters);
                next.set('cursor', articles.data.nextCursor ?? '');
                setParameters(next);
              }}
            >
              Load more
            </Button>
          ) : null}
        </Box>
      </Stack>
    </Container>
  );
};
