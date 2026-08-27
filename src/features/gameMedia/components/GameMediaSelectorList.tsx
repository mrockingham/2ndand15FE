import MovieRounded from '@mui/icons-material/MovieRounded';
import { Box, ButtonBase, Card, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { mediaTypeLabel } from '@/features/gameMedia/presentation';
import type { GameDisplayVideo } from '@/features/gameMedia/types';

const SelectorThumbnail = ({ video }: { readonly video: GameDisplayVideo }) => {
  const [failed, setFailed] = useState(false);
  const showImage = video.thumbnailUrl !== null && !failed;
  return (
    <Box
      sx={{
        width: 96,
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
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <MovieRounded aria-hidden color="disabled" />
      )}
    </Box>
  );
};

// Every item after the primary/selected one in the backend's displayVideos
// order becomes a selector, regardless of whether it originated as a
// curated, automatic, or global video -- the rail doesn't care.
export const GameMediaSelectorList = ({
  videos,
  selectedVideoId,
  onSelect,
}: {
  readonly videos: readonly GameDisplayVideo[];
  readonly selectedVideoId: string | null;
  readonly onSelect: (videoId: string) => void;
}) => (
  <Stack
    direction={{ xs: 'row', md: 'column' }}
    spacing={1.5}
    sx={{
      flexWrap: { xs: 'nowrap', md: 'nowrap' },
      overflowX: { xs: 'auto', md: 'visible' },
      overflowY: { xs: 'visible', md: 'auto' },
      maxHeight: { md: 420 },
      pb: { xs: 1, md: 0 },
    }}
  >
    {videos.map((video) => {
      const selected = video.id === selectedVideoId;
      return (
        <Card
          key={video.id}
          variant="outlined"
          sx={{
            borderColor: selected ? 'primary.main' : undefined,
            borderWidth: selected ? 2 : 1,
            flexShrink: 0,
          }}
        >
          <ButtonBase
            onClick={() => onSelect(video.id)}
            aria-label={`Play video: ${video.title}`}
            aria-pressed={selected}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              textAlign: 'left',
            }}
          >
            <SelectorThumbnail video={video} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {mediaTypeLabel[video.mediaType]}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {video.title}
              </Typography>
            </Box>
          </ButtonBase>
        </Card>
      );
    })}
  </Stack>
);
