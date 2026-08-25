import { useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { DataHealthDetailDrawer } from '@/features/dataHealth/components/DataHealthDetailDrawer';
import {
  DataHealthFilters,
  type DataHealthFilterValue,
} from '@/features/dataHealth/components/DataHealthFilters';
import { DataHealthGamesTable } from '@/features/dataHealth/components/DataHealthGamesTable';
import { DataHealthSummaryCards } from '@/features/dataHealth/components/DataHealthSummaryCards';
import {
  filterRowsByIssueType,
  type DataHealthIssueType,
} from '@/features/dataHealth/presentation';
import { useDataHealthGamesQuery } from '@/features/dataHealth/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useTeamsQuery } from '@/features/teams/queries';

const currentSeason = new Date().getUTCFullYear();

const readFilters = (searchParams: URLSearchParams): DataHealthFilterValue => {
  const seasonRaw = searchParams.get('season');
  const weekRaw = searchParams.get('week');
  return {
    season: seasonRaw === null ? currentSeason : Number(seasonRaw),
    seasonType:
      (searchParams.get('seasonType') as DataHealthFilterValue['seasonType']) ??
      undefined,
    week: weekRaw === null ? undefined : Number(weekRaw),
    teamId: searchParams.get('teamId') ?? undefined,
    gameStatus:
      (searchParams.get('gameStatus') as DataHealthFilterValue['gameStatus']) ??
      undefined,
    issuesOnly: searchParams.get('issuesOnly') === 'true',
    issueType: (searchParams.get('issueType') ?? '') as DataHealthIssueType,
  };
};

export const AdminDataHealthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const reviewGameId = searchParams.get('review');
  const role = useCurrentUserQuery().data?.role;
  const teamsQuery = useTeamsQuery();

  const listFilters = {
    season: filters.season,
    seasonType: filters.seasonType,
    week: filters.week,
    teamId: filters.teamId,
    gameStatus: filters.gameStatus,
    issuesOnly: filters.issuesOnly,
    limit: 50,
    cursor: searchParams.get('cursor') ?? undefined,
  };
  const query = useDataHealthGamesQuery(listFilters);

  const visibleRows = useMemo(
    () =>
      query.data === undefined
        ? []
        : filterRowsByIssueType(query.data.games, filters.issueType),
    [query.data, filters.issueType],
  );

  const reviewedRow =
    query.data?.games.find((row) => row.gameId === reviewGameId) ?? null;

  const updateFilters = (patch: Partial<DataHealthFilterValue>) => {
    const next = new URLSearchParams(searchParams);
    const merged = { ...filters, ...patch };
    const setOrDelete = (
      key: string,
      value: string | number | boolean | undefined,
    ) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    };
    setOrDelete('season', merged.season);
    setOrDelete('seasonType', merged.seasonType);
    setOrDelete('week', merged.week);
    setOrDelete('teamId', merged.teamId);
    setOrDelete('gameStatus', merged.gameStatus);
    setOrDelete('issuesOnly', merged.issuesOnly ? 'true' : undefined);
    setOrDelete(
      'issueType',
      merged.issueType === '' ? undefined : merged.issueType,
    );
    next.delete('cursor');
    setSearchParams(next, { replace: true });
  };

  const openReview = (gameId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('review', gameId);
    setSearchParams(next);
  };

  const closeReview = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('review');
    setSearchParams(next);
  };

  return (
    <>
      <AdminPageHeader
        title="Data Health"
        description="See what current-season game data exists, what's complete, partial, missing, or unavailable from the provider, and run an explicit Highlightly check when the database alone can't say why."
        action={
          <Button
            variant="outlined"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh Database Status
          </Button>
        }
      />

      <DataHealthFilters
        value={filters}
        onChange={updateFilters}
        teams={teamsQuery.data ?? []}
        currentSeason={currentSeason}
      />

      {query.isPending ? <AdminLoading label="Loading data health" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data && query.data.games.length === 0 ? (
        <AdminEmpty
          title="No games found"
          description="No games match the selected filters."
        />
      ) : null}

      {query.data ? (
        <>
          <DataHealthSummaryCards
            summary={query.data.summary}
            rows={query.data.games}
          />
          {visibleRows.length === 0 && query.data.games.length > 0 ? (
            <AdminEmpty
              title="No games match this issue type"
              description="Try a different Issue Type filter or clear it to see every game on this page."
            />
          ) : (
            <DataHealthGamesTable rows={visibleRows} onReview={openReview} />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              disabled={!query.data.nextCursor}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (query.data?.nextCursor)
                  next.set('cursor', query.data.nextCursor);
                setSearchParams(next);
              }}
            >
              Next page
            </Button>
          </Box>
        </>
      ) : null}

      <DataHealthDetailDrawer
        row={reviewedRow}
        open={reviewGameId !== null && reviewedRow !== null}
        onClose={closeReview}
        canProbe={role === 'ADMIN'}
      />
    </>
  );
};
