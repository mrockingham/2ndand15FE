import { Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  ANALYTICS_CHOICES_REQUEST_EVENT,
  isAnalyticsConfigured,
  readAnalyticsConsent,
  saveAnalyticsConsent,
} from '@/features/analytics/analytics';

export const AnalyticsConsentBanner = () => {
  const configured = isAnalyticsConfigured();
  const [open, setOpen] = useState(
    () => configured && readAnalyticsConsent() === null,
  );

  useEffect(() => {
    const showChoices = () => setOpen(true);
    window.addEventListener(ANALYTICS_CHOICES_REQUEST_EVENT, showChoices);
    return () =>
      window.removeEventListener(ANALYTICS_CHOICES_REQUEST_EVENT, showChoices);
  }, []);

  if (!configured || !open) return null;

  return (
    <Paper
      role="dialog"
      aria-label="Analytics choices"
      elevation={10}
      sx={{
        position: 'fixed',
        zIndex: (theme) => theme.zIndex.snackbar,
        right: { xs: 16, sm: 24 },
        bottom: {
          xs: 'calc(80px + env(safe-area-inset-bottom))',
          md: 24,
        },
        left: { xs: 16, sm: 'auto' },
        width: { sm: 440 },
        maxWidth: 'calc(100vw - 32px)',
        border: '1px solid',
        borderColor: 'divider',
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" component="h2">
          Help us improve 2nd &amp; 15
        </Typography>
        <Typography color="text.secondary">
          We use Google Analytics to understand which public pages people find
          useful. It only loads if you allow it, and we do not send account
          identifiers or activity from private pages.
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end' }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              saveAnalyticsConsent('denied');
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              saveAnalyticsConsent('granted');
              setOpen(false);
            }}
          >
            Allow analytics
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
