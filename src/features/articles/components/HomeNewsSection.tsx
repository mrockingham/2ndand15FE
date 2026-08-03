import { Alert, Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import { useFeaturedArticlesQuery } from '@/features/articles/queries';
import { useCurrentUserQuery } from '@/features/users/queries';

export const HomeNewsSection = () => {
  const query = useFeaturedArticlesQuery({ limit: 3 });
  const favoriteId = useCurrentUserQuery().data?.favoriteTeam?.id;
  if (query.isPending)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography role="status">Loading featured news…</Typography>
      </Container>
    );
  if (query.isError)
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="info">
          News is temporarily unavailable. The rest of your home is ready.
        </Alert>
      </Container>
    );
  if (!query.data.articles.length) return null;
  return (
    <Container
      component="section"
      maxWidth="xl"
      sx={{ py: 5 }}
      aria-labelledby="home-news"
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography id="home-news" variant="h3">
          Featured news
        </Typography>
        <Button component={RouterLink} to="/news">
          All news
        </Button>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
        }}
      >
        {query.data.articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            favoriteTeamId={favoriteId}
          />
        ))}
      </Box>
    </Container>
  );
};
