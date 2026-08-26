import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import LaunchRounded from '@mui/icons-material/LaunchRounded';
import MovieRounded from '@mui/icons-material/MovieRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { CuratedVideo } from '@/features/gameMedia/types';

const VideoThumbnail = ({ video }: { readonly video: CuratedVideo }) => {
  const [failed, setFailed] = useState(false);
  const showImage = video.thumbnailUrl !== null && !failed;
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 160 },
        aspectRatio: '16 / 9',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={video.thumbnailUrl!}
          alt={video.title}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <MovieRounded aria-hidden color="disabled" sx={{ fontSize: 32 }} />
      )}
    </Box>
  );
};

export const CuratedVideoCard = ({
  video,
  index,
  total,
  isAdmin,
  isReordering,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  readonly video: CuratedVideo;
  readonly index: number;
  readonly total: number;
  readonly isAdmin: boolean;
  readonly isReordering: boolean;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
}) => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <VideoThumbnail video={video} />
        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {index === 0 ? (
              <Chip size="small" label="Primary" color="primary" />
            ) : (
              <Chip size="small" label={`#${index + 1}`} variant="outlined" />
            )}
          </Stack>
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 800 }}
          >
            {video.title}
          </Typography>
          {video.sourceLabel ? (
            <Typography variant="body2" color="text.secondary">
              {video.sourceLabel}
            </Typography>
          ) : null}
          {video.canonicalUrl ? (
            <Link
              href={video.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                alignSelf: 'flex-start',
              }}
            >
              Watch on YouTube
              <LaunchRounded fontSize="inherit" />
            </Link>
          ) : null}
          {isAdmin ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, alignItems: 'center' }}
            >
              <IconButton
                size="small"
                aria-label={`Move ${video.title} up`}
                disabled={index === 0 || isReordering}
                onClick={onMoveUp}
              >
                <ArrowUpwardRounded fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`Move ${video.title} down`}
                disabled={index === total - 1 || isReordering}
                onClick={onMoveDown}
              >
                <ArrowDownwardRounded fontSize="small" />
              </IconButton>
              <Button size="small" onClick={onEdit}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={onRemove}>
                Remove
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);
