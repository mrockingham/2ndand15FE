import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const HomeSectionHeader = ({
  actionLabel,
  actionTo,
  eyebrow,
  title,
}: {
  readonly actionLabel: string;
  readonly actionTo: string;
  readonly eyebrow?: string;
  readonly title: string;
}) => (
  <Stack
    direction="row"
    spacing={2}
    sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}
  >
    <Box>
      {eyebrow ? (
        <Typography variant="overline" color="var(--team-primary)">
          {eyebrow}
        </Typography>
      ) : null}
      <Typography component="h2" variant="h3">
        {title}
      </Typography>
    </Box>
    <Button component={RouterLink} to={actionTo} size="small">
      {actionLabel}
    </Button>
  </Stack>
);
