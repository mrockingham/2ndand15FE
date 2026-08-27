import { render, screen, within } from '@testing-library/react';

import { DataHealthGamesTable } from '@/features/dataHealth/components/DataHealthGamesTable';
import { DataHealthStateChip } from '@/features/dataHealth/components/DataHealthStateChip';
import { DataHealthSummaryCards } from '@/features/dataHealth/components/DataHealthSummaryCards';
import { PlayerStatsCell } from '@/features/dataHealth/components/PlayerStatsCell';
import type { DataHealthCoverageState } from '@/features/dataHealth/types';
import {
  dataHealthCompleteGameFixture,
  dataHealthGameListRowsFixture,
  dataHealthMissingIngestionGameFixture,
  dataHealthPartialPlayerStatsGameFixture,
  dataHealthProviderUnavailableGameFixture,
  dataHealthSummaryFixture,
} from '@/test/dataHealthFixtures';

describe('DataHealthStateChip', () => {
  const states: readonly DataHealthCoverageState[] = [
    'COMPLETE',
    'PARTIAL',
    'MISSING',
    'PENDING',
    'UNAVAILABLE',
    'UNKNOWN',
  ];

  it.each(states)('renders visible text for %s, not color alone', (state) => {
    render(<DataHealthStateChip state={state} />);
    expect(screen.getByText(new RegExp(state, 'i'))).toBeInTheDocument();
  });
});

describe('PlayerStatsCell', () => {
  it('shows row count for a complete game', () => {
    render(<PlayerStatsCell row={dataHealthCompleteGameFixture} />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('77 rows')).toBeInTheDocument();
  });

  it('surfaces unresolved-identity detail for a partial game without a raw code', () => {
    render(<PlayerStatsCell row={dataHealthPartialPlayerStatsGameFixture} />);
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText(/unresolved identities/i)).toBeInTheDocument();
    expect(
      screen.queryByText('PLAYER_IDENTITY_UNRESOLVED'),
    ).not.toBeInTheDocument();
  });

  it('distinguishes an ingestion gap from "provider not checked" for missing rows', () => {
    render(<PlayerStatsCell row={dataHealthMissingIngestionGameFixture} />);
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByText('Provider has data')).toBeInTheDocument();
  });

  it('shows unavailable without implying a backend bug', () => {
    render(<PlayerStatsCell row={dataHealthProviderUnavailableGameFixture} />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/no player stats from provider/i),
    ).toBeInTheDocument();
  });
});

describe('DataHealthSummaryCards', () => {
  it('shows the backend-authoritative complete/missing numbers and a labeled page-scoped breakdown', () => {
    render(
      <DataHealthSummaryCards
        summary={dataHealthSummaryFixture}
        rows={dataHealthGameListRowsFixture}
      />,
    );
    expect(
      screen.getByText(
        `${dataHealthSummaryFixture.playerStatsComplete} complete · ${dataHealthSummaryFixture.playerStatsMissing} missing`,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/On this page:/).length).toBeGreaterThan(0);
  });

  it('never labels a partial count as missing', () => {
    render(
      <DataHealthSummaryCards
        summary={dataHealthSummaryFixture}
        rows={dataHealthGameListRowsFixture}
      />,
    );
    const playerStatsHeadline = screen.getByText('1 complete · 1 missing');
    const card = playerStatsHeadline.closest<HTMLElement>('.MuiCard-root')!;
    expect(within(card).getByText(/1 partial/)).toBeInTheDocument();
  });
});

describe('DataHealthGamesTable', () => {
  it('renders both the desktop table and mobile cards for accessibility/responsive coverage', () => {
    render(
      <DataHealthGamesTable
        rows={dataHealthGameListRowsFixture}
        onReview={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('table', { name: 'Game data health' }),
    ).toBeInTheDocument();
    // Each game renders once in the table and once in the mobile card list.
    expect(screen.getAllByRole('button', { name: 'Review' })).toHaveLength(
      dataHealthGameListRowsFixture.length * 2,
    );
  });

  it('calls onReview with the game id when Review is clicked', async () => {
    const onReview = vi.fn();
    render(
      <DataHealthGamesTable
        rows={[dataHealthCompleteGameFixture]}
        onReview={onReview}
      />,
    );
    const buttons = screen.getAllByRole('button', { name: 'Review' });
    buttons[0]!.click();
    expect(onReview).toHaveBeenCalledWith(dataHealthCompleteGameFixture.gameId);
  });
});
