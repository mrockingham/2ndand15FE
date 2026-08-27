import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  GameMediaFilters,
  type GameMediaFilterValue,
} from '@/features/gameMedia/components/GameMediaFilters';
import { GameMediaGameCard } from '@/features/gameMedia/components/GameMediaGameCard';
import { GlobalVideoPanel } from '@/features/gameMedia/components/GlobalVideoPanel';
import { useAdminGameMediaListQuery } from '@/features/gameMedia/queries';
import type { SeasonType } from '@/features/games/types';
import { useCurrentUserQuery } from '@/features/users/queries';

const CURRENT_SEASON = 2026;
const seasonTypes: readonly SeasonType[] = ['PRE', 'REG', 'POST'];

export const AdminGameMediaPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const seasonParam = parameters.get('season');
  const seasonTypeParam = parameters.get('seasonType');
  const weekParam = parameters.get('week');

  const value: GameMediaFilterValue = {
    season: seasonParam === null ? undefined : Number(seasonParam),
    seasonType: seasonTypes.includes(seasonTypeParam as SeasonType)
      ? (seasonTypeParam as SeasonType)
      : undefined,
    week: weekParam === null ? undefined : Number(weekParam),
  };

  const onChange = (patch: Partial<GameMediaFilterValue>) => {
    const next = new URLSearchParams(parameters);
    const merged = { ...value, ...patch };
    for (const [key, entry] of Object.entries(merged)) {
      if (entry === undefined) next.delete(key);
      else next.set(key, String(entry));
    }
    setParameters(next);
  };

  const query = useAdminGameMediaListQuery(value);
  const games = query.data?.games ?? [];
  const isAdmin = useCurrentUserQuery().data?.role === 'ADMIN';

  return (
    <>
      <AdminPageHeader
        title="Game Media"
        description="Curate embedded video content shown inside Game Center."
      />
      <GlobalVideoPanel isAdmin={isAdmin} />
      <GameMediaFilters
        value={value}
        onChange={onChange}
        currentSeason={CURRENT_SEASON}
      />
      {query.isPending ? <AdminLoading label="Loading games" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {!query.isPending && !query.isError && games.length === 0 ? (
        <AdminEmpty
          title="No games found"
          description="Adjust the season, season type, or week filters."
        />
      ) : null}
      {games.length ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {games.map((game) => (
            <GameMediaGameCard key={game.gameId} game={game} />
          ))}
        </Box>
      ) : null}
    </>
  );
};
