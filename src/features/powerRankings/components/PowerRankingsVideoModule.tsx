import { Stack, Typography } from '@mui/material';

import { GameHighlightPlayer } from '@/features/games/components/GameHighlightPlayer';
import type { PowerRankingVideo } from '@/features/powerRankings/types';

/** Renders nothing when there is no video -- the backend does not yet expose
 * a media field for Power Rankings, so this stays dormant until it does. */
export const PowerRankingsVideoModule = ({
  video,
}: {
  readonly video: PowerRankingVideo | null | undefined;
}) => {
  if (!video) return null;
  return (
    <Stack spacing={1.5} component="section" aria-label="Power Rankings video">
      <Typography component="h2" variant="h5">
        {video.title}
      </Typography>
      <GameHighlightPlayer embedUrl={video.embedUrl} title={video.title} />
    </Stack>
  );
};
