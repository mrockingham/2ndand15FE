import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  movementDisplay,
  movementToneColor,
} from '@/features/powerRankings/presentation';
import type { PowerRankingEntry } from '@/features/powerRankings/types';

export const RankingRow = ({
  entry,
}: {
  readonly entry: PowerRankingEntry;
}) => {
  const movement = movementDisplay(entry.movement, entry.previousRank);
  return (
    <Accordion
      disableGutters
      variant="outlined"
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ width: 32, flexShrink: 0 }}
          >
            {entry.rank}
          </Typography>
          <TeamHelmet team={entry.team.abbreviation} size="sm" decorative />
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Link
              component={RouterLink}
              to={`/teams/${entry.team.id}`}
              color="inherit"
              underline="hover"
              onClick={(event) => event.stopPropagation()}
              sx={{ fontWeight: 700 }}
            >
              {entry.team.name}
            </Link>
            <Typography noWrap color="text.secondary" variant="body2">
              {entry.headline}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={movement.label}
            sx={{
              color: movementToneColor[movement.tone],
              borderColor: movementToneColor[movement.tone],
              fontWeight: 700,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
            variant="outlined"
          />
          <Chip
            size="small"
            label={entry.tier}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5} sx={{ pl: { sm: 6 } }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { sm: 'none' }, flexWrap: 'wrap' }}
          >
            <Chip
              size="small"
              label={movement.label}
              sx={{
                color: movementToneColor[movement.tone],
                borderColor: movementToneColor[movement.tone],
              }}
              variant="outlined"
            />
            <Chip size="small" label={entry.tier} />
          </Stack>
          <Typography>{entry.summary}</Typography>
          {entry.strengths.length ? (
            <Box>
              <Typography variant="subtitle2" color="success.main">
                Strengths
              </Typography>
              <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
                {entry.strengths.map((strength) => (
                  <Typography component="li" key={strength}>
                    {strength}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ) : null}
          {entry.concerns.length ? (
            <Box>
              <Typography variant="subtitle2" color="error.main">
                Concerns
              </Typography>
              <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
                {entry.concerns.map((concern) => (
                  <Typography component="li" key={concern}>
                    {concern}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
