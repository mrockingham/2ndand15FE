import LaunchRounded from '@mui/icons-material/LaunchRounded';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { GameMediaSelectorList } from '@/features/gameMedia/components/GameMediaSelectorList';
import { mediaTypeLabel } from '@/features/gameMedia/presentation';
import type { GameDisplayVideo } from '@/features/gameMedia/types';
import { GameHighlightPlayer } from '@/features/games/components/GameHighlightPlayer';
import { GameHighlightThumbnail } from '@/features/games/components/GameHighlightThumbnail';
import type { Game } from '@/features/games/types';

// Renders the backend's authoritative `displayVideos` playlist as a single
// unified player -- curated, automatic, and global items are presented
// identically here; only the subtle `mediaTypeLabel` distinguishes them.
// Mount this with `key={game.id}` so navigating to a different game resets
// selection to the new list's first item (never carries over a stale id).
export const GameMediaPlayer = ({
  game,
  videos,
  compact = false,
}: {
  readonly game: Game;
  readonly videos: readonly GameDisplayVideo[];
  readonly compact?: boolean;
}) => {
  // Entirely local viewer selection: switching videos never calls the
  // backend, never reorders, and never changes the admin-configured order.
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    videos[0]?.id ?? null,
  );
  // If the list refetches while mounted, keep the current selection when it
  // still exists; otherwise fall back to the new first item. This never
  // fires on a game change, since `key={game.id}` at the call site remounts
  // (and thus resets) this component entirely for a different game.
  const [previousVideos, setPreviousVideos] = useState(videos);
  if (videos !== previousVideos) {
    setPreviousVideos(videos);
    if (!videos.some((video) => video.id === selectedVideoId)) {
      setSelectedVideoId(videos[0]?.id ?? null);
    }
  }

  const selected =
    videos.find((video) => video.id === selectedVideoId) ?? videos[0] ?? null;
  const otherVideos = videos.filter((video) => video.id !== selected?.id);

  if (selected === null) return null;

  const embeddable = selected.canEmbed && selected.embedUrl !== null;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns:
          otherVideos.length > 0 && !compact
            ? { xs: '1fr', md: '2fr 1fr' }
            : '1fr',
      }}
    >
      <Stack spacing={1.5}>
        {embeddable ? (
          <GameHighlightPlayer
            embedUrl={selected.embedUrl!}
            title={selected.title}
          />
        ) : (
          <GameHighlightThumbnail
            thumbnailUrl={selected.thumbnailUrl}
            alt={selected.title}
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
          />
        )}
        <Typography variant="overline" color="text.secondary">
          {mediaTypeLabel[selected.mediaType]}
        </Typography>
        <Typography
          component="h3"
          variant={compact ? 'subtitle1' : 'h6'}
          sx={{ fontWeight: 850 }}
        >
          {selected.title}
        </Typography>
        {selected.sourceLabel ? (
          <Typography color="text.secondary">{selected.sourceLabel}</Typography>
        ) : null}
        {selected.canonicalUrl ? (
          <Link
            href={selected.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${embeddable ? 'Watch externally' : 'Watch highlight'}: ${selected.title}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 700,
              alignSelf: 'flex-start',
            }}
          >
            {embeddable ? 'Watch externally' : 'Watch Highlight'}
            <LaunchRounded fontSize="inherit" />
          </Link>
        ) : null}
      </Stack>
      {otherVideos.length > 0 ? (
        <GameMediaSelectorList
          videos={otherVideos}
          selectedVideoId={selected.id}
          onSelect={setSelectedVideoId}
        />
      ) : null}
    </Box>
  );
};
