import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';

export const PlayerCard = ({ player }: { readonly player: Player }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardActionArea
      component={RouterLink}
      to={`/players/${player.id}`}
      sx={{ height: '100%', alignItems: 'stretch' }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <PlayerAvatar
            name={player.displayName}
            headshotUrl={player.headshotUrl}
            width={72}
          />
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="h5">
              {player.displayName}
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: 'wrap', gap: 0.75 }}
            >
              {player.position ? (
                <Chip size="small" label={player.position} color="primary" />
              ) : null}
              {player.latestTeam ? (
                <Chip
                  size="small"
                  label={`Latest: ${player.latestTeam.abbreviation}`}
                  variant="outlined"
                />
              ) : null}
              {player.jerseyNumber === null ? null : (
                <Chip
                  size="small"
                  label={`#${player.jerseyNumber}`}
                  variant="outlined"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {player.college ?? 'College unavailable'}
              {player.lastSeason === null
                ? ''
                : ` · Last season ${player.lastSeason}`}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);
