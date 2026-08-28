import { Paper, Skeleton, Stack } from '@mui/material';

export const StandingsSkeleton = () => (
  <Stack spacing={3} aria-busy="true" aria-label="Loading standings">
    {Array.from({ length: 2 }, (_value, group) => (
      <Stack key={group} spacing={1}>
        <Skeleton width={280} height={38} />
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={0.75}>
            {Array.from({ length: 5 }, (_row, index) => (
              <Skeleton key={index} variant="rounded" height={44} />
            ))}
          </Stack>
        </Paper>
      </Stack>
    ))}
  </Stack>
);
