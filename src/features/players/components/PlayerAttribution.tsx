import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { Alert, Link } from '@mui/material';

import type { PlayerAttribution as Attribution } from '@/features/players/types';

export const PlayerAttribution = ({
  attribution,
}: {
  readonly attribution: Attribution;
}) => {
  const href = safeAttributionUrl(attribution.url);
  return (
    <Alert severity="info">
      Historical player and statistics data is sourced from{' '}
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}
        >
          {attribution.source} ({attribution.license}){' '}
          <OpenInNewRounded fontSize="inherit" />
        </Link>
      ) : (
        `${attribution.source} (${attribution.license})`
      )}
      . 2nd &amp; 15 serves locally stored normalized records and does not call
      nflverse during public requests.
    </Alert>
  );
};

const safeAttributionUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
