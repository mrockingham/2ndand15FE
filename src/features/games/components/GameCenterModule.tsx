import { Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const GameCenterModule = ({
  title,
  eyebrow,
  children,
  id,
}: {
  readonly title: string;
  readonly eyebrow?: string;
  readonly children: ReactNode;
  readonly id?: string;
}) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={id === undefined ? undefined : `${id}-heading`}
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper',
      overflow: 'hidden',
    }}
  >
    <Stack spacing={0.25} sx={{ px: 2, py: 1.5 }}>
      {eyebrow === undefined ? null : (
        <Typography variant="overline" color="primary.main">
          {eyebrow}
        </Typography>
      )}
      <Typography
        id={id === undefined ? undefined : `${id}-heading`}
        component="h2"
        variant="subtitle1"
        sx={{ fontWeight: 900, letterSpacing: '0.02em' }}
      >
        {title}
      </Typography>
    </Stack>
    <Divider />
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);
