import LaunchRounded from '@mui/icons-material/LaunchRounded';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ArticleHero } from '@/features/articles/components/ArticleHero';
import type { PublicArticleListItem } from '@/features/articles/types';

export const ArticleCard = ({
  article,
  favoriteTeamId,
}: {
  readonly article: PublicArticleListItem;
  readonly favoriteTeamId?: string;
}) => {
  const favorite = favoriteTeamId
    ? article.teams.some((team) => team.id === favoriteTeamId)
    : false;
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: favorite ? 'primary.main' : undefined,
      }}
    >
      <ArticleHero url={article.heroImageUrl} alt={article.heroImageAlt} />
      <CardContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip size="small" label={article.type} />
            {article.isFeatured ? (
              <Chip size="small" color="primary" label="Featured" />
            ) : null}
            {favorite ? (
              <Chip size="small" color="secondary" label="My team" />
            ) : null}
          </Stack>
          <Typography component="h2" variant="h4">
            <Link
              component={RouterLink}
              to={`/news/${article.slug}`}
              underline="hover"
              color="inherit"
            >
              {article.title}
            </Link>
          </Typography>
          {article.summary ? (
            <Typography color="text.secondary">{article.summary}</Typography>
          ) : null}
          <Typography variant="caption">
            Published {new Date(article.publishedAt).toLocaleString()}
          </Typography>
          {article.teams.length ? (
            <Typography variant="body2">
              {article.teams.map((team) => team.abbreviation).join(' · ')}
            </Typography>
          ) : (
            <Typography variant="body2">League-wide</Typography>
          )}
          {article.type === 'CURATED' && article.sourceUrl ? (
            <Button
              component="a"
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              endIcon={<LaunchRounded />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Original source: {article.sourceName ?? 'External publication'}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
