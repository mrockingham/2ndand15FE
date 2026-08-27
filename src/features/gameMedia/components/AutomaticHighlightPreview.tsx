import { Typography } from '@mui/material';

import type { GameMediaDisplayMode } from '@/features/gameMedia/types';

// The admin detail endpoint only returns a count of automatic highlights,
// not titles/thumbnails, so this stays a factual summary rather than a card
// list -- it never fabricates highlight details the backend didn't send.
export const AutomaticHighlightPreview = ({
  automaticHighlightCount,
  displayMode,
}: {
  readonly automaticHighlightCount: number;
  readonly displayMode: GameMediaDisplayMode;
}) => {
  if (automaticHighlightCount === 0) {
    return (
      <Typography color="text.secondary">
        No automatic highlight has been synced for this game yet.
      </Typography>
    );
  }
  const statusMessage =
    displayMode === 'AUTOMATIC'
      ? 'Currently shown in Game Center.'
      : 'Preserved — currently not the primary Game Center media.';

  return (
    <Typography color="text.secondary">
      {automaticHighlightCount === 1
        ? '1 automatic highlight is synced for this game.'
        : `${automaticHighlightCount} automatic highlights are synced for this game.`}{' '}
      {statusMessage}
    </Typography>
  );
};
