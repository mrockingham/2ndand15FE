import { Box, Stack, Typography } from '@mui/material';

import { StandingsTable } from '@/features/standings/components/StandingsTable';
import type { StandingsData, StandingsGroup } from '@/features/standings/types';

const GroupTable = ({
  group,
  seasonType,
}: {
  readonly group: StandingsGroup;
  readonly seasonType: StandingsData['seasonType'];
}) => {
  if (!group.teams) return null;
  return (
    <Stack
      component="section"
      spacing={1.25}
      aria-labelledby={`standings-${group.key}`}
    >
      <Typography id={`standings-${group.key}`} component="h3" variant="h5">
        {group.label}
      </Typography>
      <StandingsTable
        label={group.label}
        teams={group.teams}
        seasonType={seasonType}
      />
    </Stack>
  );
};

export const StandingsGroups = ({ data }: { readonly data: StandingsData }) =>
  data.view === 'division' ? (
    <Stack spacing={4}>
      {data.groups.map((conference) => (
        <Box
          component="section"
          key={conference.key}
          aria-labelledby={`standings-conference-${conference.key}`}
        >
          <Typography
            id={`standings-conference-${conference.key}`}
            component="h2"
            variant="h4"
            sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.035em' }}
          >
            {conference.label}
          </Typography>
          <Stack spacing={3}>
            {conference.children?.map((division) => (
              <GroupTable
                key={division.key}
                group={division}
                seasonType={data.seasonType}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  ) : (
    <Stack spacing={4}>
      {data.groups.map((group) => (
        <Box key={group.key}>
          <Typography component="h2" variant="h4" sx={{ mb: 2 }}>
            {group.label}
          </Typography>
          <StandingsTable
            label={group.label}
            teams={group.teams ?? []}
            seasonType={data.seasonType}
          />
        </Box>
      ))}
    </Stack>
  );
