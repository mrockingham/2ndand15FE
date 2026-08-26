import LaunchRounded from '@mui/icons-material/LaunchRounded';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { CuratedMediaSelectorList } from '@/features/gameMedia/components/CuratedMediaSelectorList';
import { sortByPosition } from '@/features/gameMedia/presentation';
import type { CuratedVideo } from '@/features/gameMedia/types';
import { GameHighlightPlayer } from '@/features/games/components/GameHighlightPlayer';

export const CuratedMediaPlayer = ({
  videos,
}: {
  readonly videos: readonly CuratedVideo[];
}) => {
  const sorted = useMemo(() => sortByPosition(videos), [videos]);

  // Entirely local viewer selection: switching videos never calls the
  // backend, never reorders, and never changes the admin-configured primary.
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    sorted[0]?.id ?? null,
  );
  const [previousVideos, setPreviousVideos] = useState(videos);
  if (videos !== previousVideos) {
    setPreviousVideos(videos);
    if (!sorted.some((video) => video.id === selectedVideoId)) {
      setSelectedVideoId(sorted[0]?.id ?? null);
    }
  }

  const selectedVideo =
    sorted.find((video) => video.id === selectedVideoId) ?? sorted[0] ?? null;
  const otherVideos = sorted.filter((video) => video.id !== selectedVideo?.id);

  if (selectedVideo === null) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns:
          otherVideos.length > 0 ? { xs: '1fr', md: '2fr 1fr' } : '1fr',
      }}
    >
      <Stack spacing={1.5}>
        <GameHighlightPlayer
          embedUrl={selectedVideo.embedUrl}
          title={selectedVideo.title}
        />
        <Typography component="h2" variant="h6">
          {selectedVideo.title}
        </Typography>
        {selectedVideo.sourceLabel ? (
          <Typography color="text.secondary">
            {selectedVideo.sourceLabel}
          </Typography>
        ) : null}
        {selectedVideo.canonicalUrl ? (
          <Link
            href={selectedVideo.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 700,
              alignSelf: 'flex-start',
            }}
          >
            Watch externally
            <LaunchRounded fontSize="inherit" />
          </Link>
        ) : null}
      </Stack>
      {otherVideos.length > 0 ? (
        <CuratedMediaSelectorList
          videos={otherVideos}
          selectedVideoId={selectedVideo.id}
          onSelect={setSelectedVideoId}
        />
      ) : null}
    </Box>
  );
};
