import { Box, Link, Typography } from '@mui/material';
import { useState } from 'react';

export const ArticleHero = ({
  url,
  alt,
  attribution,
  attributionUrl,
}: {
  readonly url: string | null;
  readonly alt: string | null;
  readonly attribution?: string | null;
  readonly attributionUrl?: string | null;
}) => {
  const [failed, setFailed] = useState(false);
  if (!url || !alt || failed)
    return url ? (
      <Box sx={{ py: 4, bgcolor: 'action.hover', textAlign: 'center' }}>
        <Typography color="text.secondary">Hero image unavailable</Typography>
      </Box>
    ) : null;
  return (
    <Box>
      <Box
        component="img"
        src={url}
        alt={alt}
        onError={() => setFailed(true)}
        sx={{
          display: 'block',
          width: '100%',
          maxHeight: 520,
          objectFit: 'cover',
          borderRadius: 2,
        }}
      />
      {attribution ? (
        <Typography variant="caption" color="text.secondary">
          Image:{' '}
          {attributionUrl ? (
            <Link
              href={attributionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {attribution}
            </Link>
          ) : (
            attribution
          )}
        </Typography>
      ) : null}
    </Box>
  );
};
