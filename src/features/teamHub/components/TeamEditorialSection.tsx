import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import { ArticleHero } from '@/features/articles/components/ArticleHero';
import { MediaThumbnail } from '@/features/articles/components/MediaThumbnail';
import {
  contentTypeLabel,
  formatPublishedAgo,
} from '@/features/articles/presentation';
import { GameHighlightPlayer } from '@/features/games/components/GameHighlightPlayer';
import type {
  TeamHomepageEditorialItem,
  TeamHomepageVideoItem,
} from '@/features/teamHub/types';

const VideoVisual = ({ video }: { readonly video: TeamHomepageVideoItem }) =>
  video.thumbnailUrl ? (
    <Box
      component="img"
      src={video.thumbnailUrl}
      alt=""
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ) : (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        height: '100%',
        bgcolor: 'action.hover',
      }}
    >
      <PlayCircleRounded sx={{ fontSize: 48 }} aria-hidden="true" />
    </Box>
  );

const FeaturedVideo = ({
  video,
}: {
  readonly video: TeamHomepageVideoItem;
}) => {
  const embeddable = video.canEmbed && video.embedUrl !== null;
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
        {embeddable ? (
          <GameHighlightPlayer embedUrl={video.embedUrl!} title={video.title} />
        ) : (
          <VideoVisual video={video} />
        )}
      </Box>
      <Stack spacing={1} sx={{ p: { xs: 2, md: 2.5 } }}>
        <Chip
          size="small"
          color="primary"
          label="Video"
          sx={{ alignSelf: 'flex-start' }}
        />
        <Typography component="h3" variant="h3">
          {video.canonicalUrl ? (
            <Link
              href={video.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              aria-label={`Watch video: ${video.title}`}
            >
              {video.title}
            </Link>
          ) : (
            <Link
              component={RouterLink}
              to={`/games/${video.gameId}`}
              color="inherit"
              underline="hover"
            >
              {video.title}
            </Link>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {video.publishedAt
            ? formatPublishedAgo(video.publishedAt)
            : 'Game video'}
        </Typography>
      </Stack>
    </Card>
  );
};

const SupportingItem = ({
  item,
}: {
  readonly item: TeamHomepageEditorialItem;
}) => {
  if (item.type === 'VIDEO') {
    const href = item.canonicalUrl ?? `/games/${item.gameId}`;
    const external = item.canonicalUrl !== null;
    return (
      <Stack component="article" direction="row" spacing={1.5}>
        <Box
          sx={{
            width: 112,
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            borderRadius: 1,
            flexShrink: 0,
          }}
        >
          <VideoVisual video={item} />
        </Box>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Chip size="small" label="Video" sx={{ alignSelf: 'flex-start' }} />
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 750 }}
          >
            <Link
              {...(external
                ? { href, target: '_blank', rel: 'noopener noreferrer' }
                : { component: RouterLink, to: href })}
              color="inherit"
              underline="hover"
            >
              {item.title}
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.publishedAt
              ? formatPublishedAgo(item.publishedAt)
              : 'Game video'}
          </Typography>
        </Stack>
      </Stack>
    );
  }

  const article = item.article;
  const mediaLabel = contentTypeLabel(article.contentType);
  return (
    <Stack component="article" direction="row" spacing={1.5}>
      <Box
        sx={{
          width: 112,
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        {mediaLabel ? (
          <MediaThumbnail
            thumbnailUrl={article.mediaThumbnailUrl}
            alt={article.title}
            contentType={mediaLabel}
            team={article.teams[0]}
          />
        ) : (
          <ArticleHero url={article.heroImageUrl} alt={article.heroImageAlt} />
        )}
      </Box>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 750 }}>
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
          {formatPublishedAgo(article.publishedAt)}
          {article.sourceName ? ` · ${article.sourceName}` : ''}
        </Typography>
      </Stack>
    </Stack>
  );
};

export const TeamEditorialSection = ({
  teamId,
  featuredItem,
  supportingItems,
}: {
  readonly teamId: string;
  readonly featuredItem: TeamHomepageEditorialItem | null;
  readonly supportingItems: readonly TeamHomepageEditorialItem[];
}) => {
  if (featuredItem === null && supportingItems.length === 0) return null;
  return (
    <Stack component="section" spacing={2} aria-label="Team News">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h2" variant="h3">
            Team News
          </Typography>
          <Typography color="text.secondary">
            Featured and supporting coverage selected for this team.
          </Typography>
        </Box>
        <Button component={RouterLink} to={`/news?teamId=${teamId}`}>
          All News
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: featuredItem
            ? {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1.9fr) minmax(320px, 1fr)',
              }
            : 'minmax(0, 1fr)',
        }}
      >
        {featuredItem ? (
          featuredItem.type === 'ARTICLE' ? (
            <ArticleCard
              article={featuredItem.article}
              favoriteTeamId={teamId}
              headingComponent="h3"
            />
          ) : (
            <FeaturedVideo video={featuredItem} />
          )
        ) : null}
        {supportingItems.length > 0 ? (
          <Card sx={{ p: { xs: 2.25, md: 2.75 }, minWidth: 0 }}>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {supportingItems.map((item) => (
                <SupportingItem
                  key={
                    item.type === 'ARTICLE'
                      ? `article:${item.article.id}`
                      : `video:${item.id}`
                  }
                  item={item}
                />
              ))}
            </Stack>
          </Card>
        ) : null}
      </Box>
    </Stack>
  );
};
