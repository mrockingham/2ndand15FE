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
import { MediaThumbnail } from '@/features/articles/components/MediaThumbnail';
import {
  contentTypeChipColor,
  contentTypeLabel,
  formatPublishedAgo,
  watchActionLabel,
} from '@/features/articles/presentation';
import type { PublicArticleListItem } from '@/features/articles/types';

export const ArticleCard = ({
  article,
  favoriteTeamId,
  headingComponent = 'h2',
}: {
  readonly article: PublicArticleListItem;
  readonly favoriteTeamId?: string;
  readonly headingComponent?: 'h2' | 'h3';
}) => {
  const favorite = favoriteTeamId
    ? article.teams.some((team) => team.id === favoriteTeamId)
    : false;
  const mediaContentType = contentTypeLabel(article.contentType);
  const isMedia = mediaContentType !== null;
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: favorite ? 'primary.main' : undefined,
      }}
    >
      {isMedia ? (
        <MediaThumbnail
          thumbnailUrl={article.mediaThumbnailUrl}
          alt={article.title}
          contentType={mediaContentType}
          team={article.teams[0]}
        />
      ) : (
        <ArticleHero url={article.heroImageUrl} alt={article.heroImageAlt} />
      )}
      <CardContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            {isMedia ? (
              <Chip
                size="small"
                color={contentTypeChipColor(article.contentType)}
                label={mediaContentType}
              />
            ) : (
              <Chip size="small" label={article.type} />
            )}
            {article.sourceIsOfficialTeam ? (
              <Chip size="small" variant="outlined" label="Official Team" />
            ) : null}
            {article.isFeatured ? (
              <Chip size="small" color="primary" label="Featured" />
            ) : null}
            {favorite ? (
              <Chip size="small" color="secondary" label="My team" />
            ) : null}
          </Stack>
          <Typography component={headingComponent} variant="h4">
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
            {isMedia
              ? formatPublishedAgo(article.publishedAt)
              : `Published ${new Date(article.publishedAt).toLocaleString()}`}
          </Typography>
          {article.teams.length ? (
            <Typography variant="body2">
              {article.teams.map((team) => team.abbreviation).join(' · ')}
            </Typography>
          ) : (
            <Typography variant="body2">League-wide</Typography>
          )}
          {isMedia && article.sourceUrl ? (
            <Button
              component="a"
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              endIcon={<LaunchRounded />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {watchActionLabel(mediaContentType, article.sourceName)}
            </Button>
          ) : null}
          {!isMedia && article.type === 'CURATED' && article.sourceUrl ? (
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
