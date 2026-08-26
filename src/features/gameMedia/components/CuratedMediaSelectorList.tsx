import MovieRounded from '@mui/icons-material/MovieRounded';
import { Box, ButtonBase, Card, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import type { CuratedVideo } from '@/features/gameMedia/types';

const SelectorThumbnail = ({ video }: { readonly video: CuratedVideo }) => {
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

export const CuratedMediaSelectorList = ({
  videos,
  selectedVideoId,
  onSelect,
}: {
  readonly videos: readonly CuratedVideo[];
  readonly selectedVideoId: string | null;
  readonly onSelect: (videoId: string) => void;
}) => (
  <Stack
    direction={{ xs: 'row', md: 'column' }}
    spacing={1.5}
    sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}
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
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {video.title}
              </Typography>
              {video.sourceLabel ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {video.sourceLabel}
                </Typography>
              ) : null}
            </Box>
          </ButtonBase>
        </Card>
      );
    })}
  </Stack>
);
