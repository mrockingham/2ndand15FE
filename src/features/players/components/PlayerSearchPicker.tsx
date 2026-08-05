import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { usePlayerSearchQuery } from '@/features/players/queries';
import { useDebouncedValue } from '@/features/players/useDebouncedValue';
import type { Player } from '@/features/players/types';

export const PlayerSearchPicker = ({
  label,
  selected,
  excludedId,
  onSelect,
}: {
  readonly label: string;
  readonly selected: Player | null;
  readonly excludedId?: string;
  readonly onSelect: (player: Player | null) => void;
}) => {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 350);
  const query = usePlayerSearchQuery(
    { search: debounced, limit: 8 },
    debounced.length >= 2,
  );
  if (selected)
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <PlayerAvatar
            name={selected.displayName}
            headshotUrl={selected.headshotUrl}
            width={60}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="overline">{label}</Typography>
            <Typography variant="h5">{selected.displayName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selected.position ?? 'Position unavailable'} ·{' '}
              {selected.latestTeam?.abbreviation ?? 'No latest team'}
            </Typography>
          </Box>
          <Button onClick={() => onSelect(null)}>Change</Button>
        </Stack>
      </Paper>
    );
  const players =
    query.data?.players.filter((player) => player.id !== excludedId) ?? [];
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <TextField
        fullWidth
        label={label}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        helperText="Enter at least two characters. Search is sent after a short pause."
        autoComplete="off"
      />
      {query.isFetching ? (
        <Stack
          role="status"
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', mt: 2 }}
        >
          <CircularProgress size={18} />
          <Typography variant="body2">Searching players…</Typography>
        </Stack>
      ) : null}
      {query.isError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          Player search is unavailable. Try again.
        </Alert>
      ) : null}
      {!query.isFetching &&
      debounced.length >= 2 &&
      query.data &&
      players.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No selectable players match this search.
        </Typography>
      ) : null}
      {players.length ? (
        <List aria-label={`${label} results`}>
          <Paper variant="outlined">
            {players.map((player) => (
              <ListItemButton key={player.id} onClick={() => onSelect(player)}>
                <ListItemText
                  primary={player.displayName}
                  secondary={`${player.position ?? 'Position unavailable'} · ${player.latestTeam?.abbreviation ?? 'No latest team'}`}
                />
              </ListItemButton>
            ))}
          </Paper>
        </List>
      ) : null}
    </Paper>
  );
};
