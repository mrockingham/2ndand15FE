import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const AdminPageHeader = ({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={2}
    sx={{
      mb: 3,
      justifyContent: 'space-between',
      alignItems: { sm: 'flex-start' },
    }}
  >
    <Box>
      <Typography component="h1" variant="h3">
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {action}
  </Stack>
);
