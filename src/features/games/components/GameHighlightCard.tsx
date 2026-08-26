import LaunchRounded from '@mui/icons-material/LaunchRounded';
import {
  ButtonBase,
  Card,
  CardActionArea,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import { formatPublishedAgo } from '@/features/articles/presentation';
import { GameHighlightPlayer } from '@/features/games/components/GameHighlightPlayer';
import { GameHighlightThumbnail } from '@/features/games/components/GameHighlightThumbnail';
import type { GameHighlight, GameTeam } from '@/features/games/types';

export const GameHighlightCard = ({
  highlight,
  awayTeam,
  homeTeam,
  isPlaying,
  onPlay,
}: {
  readonly highlight: GameHighlight;
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly isPlaying: boolean;
  readonly onPlay: () => void;
}) => {
  const embedUrl = highlight.canEmbed ? highlight.embedUrl : null;

  const thumbnail = (
    <GameHighlightThumbnail
      thumbnailUrl={highlight.thumbnailUrl}
      alt={highlight.title}
      awayTeam={awayTeam}
      homeTeam={homeTeam}
    />
  );

  if (embedUrl !== null) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        {isPlaying ? (
          <GameHighlightPlayer embedUrl={embedUrl} title={highlight.title} />
        ) : (
          <ButtonBase
            onClick={onPlay}
            aria-label={`Play highlight: ${highlight.title}`}
            sx={{ width: '100%', display: 'block' }}
          >
            {thumbnail}
          </ButtonBase>
        )}
        <CardContent>
          <Stack spacing={1}>
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ fontWeight: 800 }}
            >
              {highlight.title}
            </Typography>
            {highlight.description ? (
              <Typography variant="body2" color="text.secondary">
                {highlight.description}
              </Typography>
            ) : null}
            {highlight.publishedAt ? (
              <Typography variant="caption" color="text.secondary">
                Published {formatPublishedAgo(highlight.publishedAt)}
              </Typography>
            ) : null}
            {highlight.canonicalUrl ? (
              <Link
                href={highlight.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch on YouTube: ${highlight.title}`}
                variant="body2"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 700,
                  alignSelf: 'flex-start',
                }}
              >
                Watch on YouTube
                <LaunchRounded fontSize="inherit" />
              </Link>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const body = (
    <CardContent>
      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800 }}>
          {highlight.title}
        </Typography>
        {highlight.description ? (
          <Typography variant="body2" color="text.secondary">
            {highlight.description}
          </Typography>
        ) : null}
        {highlight.publishedAt ? (
          <Typography variant="caption" color="text.secondary">
            Published {formatPublishedAgo(highlight.publishedAt)}
          </Typography>
        ) : null}
        {highlight.canonicalUrl ? (
          <Typography
            variant="body2"
            color="primary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 700,
            }}
          >
            Watch Highlight
            <LaunchRounded fontSize="inherit" />
          </Typography>
        ) : null}
      </Stack>
    </CardContent>
  );

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      {highlight.canonicalUrl ? (
        <CardActionArea
          component="a"
          href={highlight.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch highlight: ${highlight.title}`}
        >
          {thumbnail}
          {body}
        </CardActionArea>
      ) : (
        <>
          {thumbnail}
          {body}
        </>
      )}
    </Card>
  );
};
