import { render, screen } from '@testing-library/react';
import type { UseQueryResult } from '@tanstack/react-query';

import { CurrentSituation } from '@/features/games/components/CurrentSituation';
import { FieldProgress } from '@/features/games/components/FieldProgress';
import { TeamStatsPanel } from '@/features/games/components/TeamStatsPanel';
import { awayGameTeamFixture, homeGameTeamFixture } from '@/test/gameFixtures';
import {
  awayTeamStatsFixture,
  homeTeamStatsFixture,
  missingDownDistancePlayFixture,
  missingFieldPositionPlayFixture,
  scoringPlayFixture,
} from '@/test/gamePlaysFixtures';
import type { GameStatsResult } from '@/features/games/types';

describe('FieldProgress', () => {
  it('prompts for a selection when no play is chosen', () => {
    render(<FieldProgress play={null} />);
    expect(
      screen.getByText('Select a play to see field position.'),
    ).toBeInTheDocument();
  });

  it('renders a graceful message when yard line data is missing entirely', () => {
    render(<FieldProgress play={missingFieldPositionPlayFixture} />);
    expect(
      screen.getByText('Field position unavailable for this play.'),
    ).toBeInTheDocument();
  });

  it('summarizes offense-relative start and end without naming a physical endzone', () => {
    render(<FieldProgress play={scoringPlayFixture} />);
    expect(screen.getByText('Opp 12 → Opp 0')).toBeInTheDocument();
  });
});

describe('CurrentSituation', () => {
  it('renders nothing when there is no play', () => {
    const { container } = render(<CurrentSituation play={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides down/distance when the backend did not provide it', () => {
    render(<CurrentSituation play={missingDownDistancePlayFixture} />);
    expect(screen.getByText(/BALL/)).toBeInTheDocument();
    expect(screen.queryByText(/&/)).not.toBeInTheDocument();
  });
});

describe('TeamStatsPanel', () => {
  const baseQuery = {
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  it('shows a loading indicator while pending', () => {
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="IN_PROGRESS"
        query={
          {
            ...baseQuery,
            isPending: true,
            data: undefined,
          } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(
      screen.getByLabelText('Loading team statistics'),
    ).toBeInTheDocument();
  });

  it('explains that stats will appear later for a game still in progress', () => {
    const data: GameStatsResult = {
      gameId: 'game-1',
      coverage: 'UNAVAILABLE',
      teamStats: { home: null, away: null },
      limitations: [],
    };
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="IN_PROGRESS"
        query={
          { ...baseQuery, data } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(
      screen.getByText(
        'Team statistics will appear when game data is available.',
      ),
    ).toBeInTheDocument();
  });

  it('reports unavailable stats for a finished game without fabricating zeros', () => {
    const data: GameStatsResult = {
      gameId: 'game-1',
      coverage: 'UNAVAILABLE',
      teamStats: { home: null, away: null },
      limitations: [],
    };
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="FINAL"
        query={
          { ...baseQuery, data } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(
      screen.getByText('Team statistics unavailable for this game.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders the comparison rows when stats are available', () => {
    const data: GameStatsResult = {
      gameId: 'game-1',
      coverage: 'AVAILABLE',
      teamStats: { home: homeTeamStatsFixture, away: awayTeamStatsFixture },
      limitations: [],
    };
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="FINAL"
        query={
          { ...baseQuery, data } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(screen.getByText('Total yards')).toBeInTheDocument();
    expect(screen.getByText('389')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
  });

  it('shows a retry action on failure', () => {
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="FINAL"
        query={
          {
            ...baseQuery,
            isError: true,
            error: new Error('network'),
            data: undefined,
          } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
