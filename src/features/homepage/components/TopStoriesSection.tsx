import {
  Box,
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
} from '@/features/articles/presentation';
import type { PublicArticleListItem } from '@/features/articles/types';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { PublicTopStory } from '@/features/homepage/types';

const StoryChips = ({
  article,
}: {
  readonly article: PublicArticleListItem;
}) => {
  const mediaContentType = contentTypeLabel(article.contentType);
  const isMedia = mediaContentType !== null;
  return (
    <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {isMedia ? (
        <Chip
          size="small"
          color={contentTypeChipColor(article.contentType)}
          label={mediaContentType}
        />
      ) : null}
      {article.sourceIsOfficialTeam ? (
        <Chip size="small" variant="outlined" label="Official Team" />
      ) : null}
    </Stack>
  );
};

const StoryThumbnail = ({
  article,
  aspectRatio,
}: {
  readonly article: PublicArticleListItem;
  readonly aspectRatio: string;
}) => {
  const mediaContentType = contentTypeLabel(article.contentType);
  return mediaContentType !== null ? (
    <MediaThumbnail
      thumbnailUrl={article.mediaThumbnailUrl}
      alt={article.title}
      contentType={mediaContentType}
      team={article.teams[0]}
    />
  ) : (
    <Box sx={{ aspectRatio, overflow: 'hidden', borderRadius: 1 }}>
      <ArticleHero url={article.heroImageUrl} alt={article.heroImageAlt} />
    </Box>
  );
};

const LeadStory = ({ story }: { readonly story: PublicTopStory }) => {
  const { article } = story;
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <StoryThumbnail article={article} aspectRatio="16 / 9" />
      <CardContent>
        <Stack spacing={1.25}>
          <StoryChips article={article} />
          <Typography component="h3" variant="h3">
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
          <Typography variant="caption" color="text.secondary">
            {formatPublishedAgo(article.publishedAt)}
            {article.sourceName ? ` · ${article.sourceName}` : ''}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SecondaryStory = ({ story }: { readonly story: PublicTopStory }) => {
  const { article } = story;
  return (
    <Stack direction="row" spacing={1.5} component="article">
      <Box sx={{ width: 108, flexShrink: 0 }}>
        <StoryThumbnail article={article} aspectRatio="4 / 3" />
      </Box>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
          <Link
            component={RouterLink}
            to={`/news/${article.slug}`}
            underline="hover"
            color="inherit"
          >
            {article.title}
          </Link>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatPublishedAgo(article.publishedAt)}
        </Typography>
      </Stack>
    </Stack>
  );
};

/**
 * Occupies the same Home slot as `HomePublicNews` -- the two are
 * alternatives, never both rendered at once (curated Top Stories when
 * available, the existing featured-articles panel as the fallback), so
 * there is only ever one "Top stories" heading on the page.
 */
export const TopStoriesSection = ({
  stories,
}: {
  readonly stories: readonly PublicTopStory[];
}) => {
  if (stories.length === 0) return null;
  const [lead, ...rest] = stories;
  if (lead === undefined) return null;

  return (
    <Stack component="section" spacing={2} aria-labelledby="home-news-heading">
      <HomeSectionHeader
        eyebrow="PUBLISHED COVERAGE"
        title="Top stories"
        actionLabel="Latest news"
        actionTo="/news"
      />
      <LeadStory story={lead} />
      {rest.length > 0 ? (
        <Stack spacing={2}>
          {rest.map((story) => (
            <SecondaryStory key={story.id} story={story} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};
