import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

import { formatFreshnessAge } from '@/features/games/presentation';

const TICK_MS = 1_000;

/**
 * Owns its own 1-second ticking clock so only this small indicator
 * re-renders every second, not the rest of the Game Center.
 */
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return now;
};

export const FreshnessIndicator = ({
  label,
  updatedAt,
  isFetching,
  hasError,
}: {
  readonly label: string;
  readonly updatedAt: number | null;
  readonly isFetching: boolean;
  readonly hasError: boolean;
}) => {
  const now = useNow();
  const age =
    updatedAt === null
      ? 'just now'
      : formatFreshnessAge(Math.max(0, now - updatedAt));

  const status = isFetching
    ? 'Updating…'
    : hasError
      ? `Last updated ${age}`
      : `Updated ${age}`;

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textAlign: 'center' }}
    >
      {label} · {status}
    </Typography>
  );
};
