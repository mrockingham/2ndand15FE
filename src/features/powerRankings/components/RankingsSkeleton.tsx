import { Paper, Skeleton, Stack } from '@mui/material';

export const RankingsSkeleton = () => (
  <Stack spacing={3} aria-busy="true" aria-label="Loading Power Rankings">
    <Skeleton width={320} height={48} />
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Skeleton variant="rounded" height={160} />
    </Paper>
    <Stack spacing={1.5}>
      {Array.from({ length: 6 }, (_value, index) => (
        <Skeleton key={index} variant="rounded" height={56} />
      ))}
    </Stack>
  </Stack>
);
