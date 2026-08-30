import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EditionHeader } from '@/features/powerRankings/components/EditionHeader';
import { MethodologySection } from '@/features/powerRankings/components/MethodologySection';
import { PowerRankingsVideoModule } from '@/features/powerRankings/components/PowerRankingsVideoModule';
import { RankingFiltersBar } from '@/features/powerRankings/components/RankingFiltersBar';
import { RankingRow } from '@/features/powerRankings/components/RankingRow';
import { RankingsSkeleton } from '@/features/powerRankings/components/RankingsSkeleton';
import { Top5Feature } from '@/features/powerRankings/components/Top5Feature';
import {
  getPowerRankingsErrorMessage,
  isPowerRankingsNotFound,
} from '@/features/powerRankings/errors';
import {
  filterRankings,
  uniqueTiers,
  type PowerRankingsFilterState,
} from '@/features/powerRankings/presentation';
import {
  usePowerRankingEditionsQuery,
  usePowerRankingsQuery,
} from '@/features/powerRankings/queries';
import { useDebouncedValue } from '@/features/players/useDebouncedValue';
import type { PowerRankingEditionSummary } from '@/features/powerRankings/types';

export const PowerRankingsPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const seasonParameter = parameters.get('season');
  const season = seasonParameter ? Number(seasonParameter) : undefined;
  const editionParameter = parameters.get('edition') ?? undefined;
  const urlSearch = parameters.get('search') ?? '';
  const conference = (parameters.get('conference') ??
    '') as PowerRankingsFilterState['conference'];
  const division = (parameters.get('division') ??
    '') as PowerRankingsFilterState['division'];
  const tier = parameters.get('tier') ?? '';

  const [searchEdit, setSearchEdit] = useState<{
    readonly source: string;
    readonly value: string;
  } | null>(null);
  const searchDraft =
    searchEdit?.source === urlSearch ? searchEdit.value : urlSearch;
  const debouncedSearch = useDebouncedValue(searchDraft, 300);

  useEffect(() => {
    const current = parameters.get('search') ?? '';
    const nextValue = debouncedSearch.trim();
    if (current === nextValue) return;
    const next = new URLSearchParams(parameters);
    if (nextValue) next.set('search', nextValue);
    else next.delete('search');
    setParameters(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to debounced search changes
  }, [debouncedSearch]);

  const editionsQuery = usePowerRankingEditionsQuery(season);
  const rankingsQuery = usePowerRankingsQuery({
    season,
    edition: editionParameter,
  });

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(parameters);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParameters(next);
  };

  const selectEdition = (candidate: PowerRankingEditionSummary) => {
    update({ season: String(candidate.season), edition: candidate.edition });
  };

  const data = rankingsQuery.data;
  const rankings = data?.rankings ?? [];
  const topFive = rankings
    .filter((entry) => entry.rank <= 5)
    .sort((a, b) => a.rank - b.rank);
  const rest = rankings
    .filter((entry) => entry.rank > 5)
    .sort((a, b) => a.rank - b.rank);
  const filters: PowerRankingsFilterState = {
    search: searchDraft,
    conference,
    division,
    tier,
  };
  const filteredRest = filterRankings(rest, filters);
  const tiers = uniqueTiers(rankings);
  const editions = editionsQuery.data ?? [];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}>
        {rankingsQuery.isPending ? <RankingsSkeleton /> : null}

        {rankingsQuery.isError &&
        isPowerRankingsNotFound(rankingsQuery.error) ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography component="h1" variant="h4">
              Power Rankings aren&apos;t published yet.
            </Typography>
            <Typography color="text.secondary">
              Check back soon for the next edition.
            </Typography>
          </Paper>
        ) : null}
        {rankingsQuery.isError &&
        !isPowerRankingsNotFound(rankingsQuery.error) ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => void rankingsQuery.refetch()}
              >
                Retry
              </Button>
            }
          >
            {getPowerRankingsErrorMessage(rankingsQuery.error)}
          </Alert>
        ) : null}

        {data ? (
          <>
            <EditionHeader
              edition={data.edition}
              editions={editions}
              onSelectEdition={selectEdition}
            />
            {rankings.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography component="h2" variant="h5">
                  No rankings yet for this edition
                </Typography>
                <Typography color="text.secondary">
                  This edition doesn&apos;t have any published rankings.
                </Typography>
              </Paper>
            ) : (
              <>
                <Top5Feature entries={topFive} />
                <PowerRankingsVideoModule video={data.edition.video} />
                <RankingFiltersBar
                  filters={filters}
                  tiers={tiers}
                  onChange={(changes) => {
                    if (changes.search !== undefined) {
                      setSearchEdit({
                        source: urlSearch,
                        value: changes.search,
                      });
                      return;
                    }
                    const urlChanges: Record<string, string> = {};
                    if (changes.conference !== undefined)
                      urlChanges.conference = changes.conference;
                    if (changes.division !== undefined)
                      urlChanges.division = changes.division;
                    if (changes.tier !== undefined)
                      urlChanges.tier = changes.tier;
                    update(urlChanges);
                  }}
                />
                {filteredRest.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    sx={{ py: 4, textAlign: 'center' }}
                  >
                    No teams match these filters.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {filteredRest.map((entry) => (
                      <RankingRow key={entry.team.id} entry={entry} />
                    ))}
                  </Stack>
                )}
                <MethodologySection
                  methodology={data.edition.methodology}
                  sources={data.edition.sources}
                />
              </>
            )}
          </>
        ) : null}
      </Stack>
    </Container>
  );
};
