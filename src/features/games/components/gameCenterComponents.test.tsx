import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';

import { CurrentSituation } from '@/features/games/components/CurrentSituation';
import { FieldProgress } from '@/features/games/components/FieldProgress';
import { FreshnessIndicator } from '@/features/games/components/FreshnessIndicator';
import { PlayFeed } from '@/features/games/components/PlayFeed';
import { PlayerStatsPanel } from '@/features/games/components/PlayerStatsPanel';
import { TeamStatsPanel } from '@/features/games/components/TeamStatsPanel';
import { awayGameTeamFixture, homeGameTeamFixture } from '@/test/gameFixtures';
import {
  awayPlayerStatsFixture,
  awayTeamStatsFixture,
  gamePlaysFixture,
  homePlayerStatsFixture,
  homeTeamStatsFixture,
  missingDownDistancePlayFixture,
  missingFieldPositionPlayFixture,
  scoringPlayFixture,
} from '@/test/gamePlaysFixtures';
import {
  EMPTY_GAME_PLAYER_STATS,
  type GamePlay,
  type GameStatsResult,
} from '@/features/games/types';

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
      playerStatsAvailable: false,
      playerStats: {
        home: EMPTY_GAME_PLAYER_STATS,
        away: EMPTY_GAME_PLAYER_STATS,
      },
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
      playerStatsAvailable: false,
      playerStats: {
        home: EMPTY_GAME_PLAYER_STATS,
        away: EMPTY_GAME_PLAYER_STATS,
      },
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
      playerStatsAvailable: false,
      playerStats: {
        home: EMPTY_GAME_PLAYER_STATS,
        away: EMPTY_GAME_PLAYER_STATS,
      },
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

  it('keeps showing the last-good stats instead of an error banner when a background poll fails', () => {
    const data: GameStatsResult = {
      gameId: 'game-1',
      coverage: 'AVAILABLE',
      teamStats: { home: homeTeamStatsFixture, away: awayTeamStatsFixture },
      playerStatsAvailable: false,
      playerStats: {
        home: EMPTY_GAME_PLAYER_STATS,
        away: EMPTY_GAME_PLAYER_STATS,
      },
      limitations: [],
    };
    render(
      <TeamStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        gameStatus="IN_PROGRESS"
        query={
          {
            ...baseQuery,
            isError: true,
            error: new Error('network'),
            data,
          } as unknown as UseQueryResult<GameStatsResult>
        }
      />,
    );
    expect(screen.getByText('Total yards')).toBeInTheDocument();
    expect(screen.getByText('389')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
  });
});

describe('PlayerStatsPanel', () => {
  it('shows a factual unavailable message rather than empty tables when the backend has no player data yet', () => {
    render(
      <PlayerStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        playerStatsAvailable={false}
        awayStats={{
          passing: [],
          rushing: [],
          receiving: [],
          defense: [],
          kicking: [],
          punting: [],
          returns: [],
        }}
        homeStats={{
          passing: [],
          rushing: [],
          receiving: [],
          defense: [],
          kicking: [],
          punting: [],
          returns: [],
        }}
      />,
    );
    expect(
      screen.getByText(
        'Player statistics are not yet available for this game.',
      ),
    ).toBeInTheDocument();
  });

  it('separates populated categories by team and omits categories with no rows for either team', () => {
    render(
      <PlayerStatsPanel
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
        playerStatsAvailable
        awayStats={awayPlayerStatsFixture}
        homeStats={homePlayerStatsFixture}
      />,
    );
    expect(screen.getByText('Passing')).toBeInTheDocument();
    expect(screen.getByText('Rushing')).toBeInTheDocument();
    expect(screen.getByText('Receiving')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
    expect(screen.getByText('Kicking')).toBeInTheDocument();
    expect(screen.queryByText('Punting')).not.toBeInTheDocument();
    expect(screen.queryByText('Returns')).not.toBeInTheDocument();

    expect(screen.getByText('Alex Away')).toBeInTheDocument();
    expect(screen.getByText('Jordan Home')).toBeInTheDocument();
    expect(screen.getByText('Sam Runner')).toBeInTheDocument();
    expect(screen.getByText('Pat Tackler')).toBeInTheDocument();
    expect(screen.getByText('Kelly Kicker')).toBeInTheDocument();

    expect(
      screen.getAllByRole('table', {
        name: `${awayGameTeamFixture.abbreviation} stats table`,
      }),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole('table', {
        name: `${homeGameTeamFixture.abbreviation} stats table`,
      }),
    ).toHaveLength(3);
  });
});

describe('FreshnessIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T00:00:10.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Updating…" while a fetch is in flight', () => {
    render(
      <FreshnessIndicator
        label="LIVE"
        updatedAt={Date.now() - 8_000}
        isFetching
        hasError={false}
      />,
    );
    expect(screen.getByText('LIVE · Updating…')).toBeInTheDocument();
  });

  it('shows a relative "Updated X ago" and advances it locally without new fetches', () => {
    render(
      <FreshnessIndicator
        label="LIVE"
        updatedAt={Date.now() - 8_000}
        isFetching={false}
        hasError={false}
      />,
    );
    expect(screen.getByText('LIVE · Updated 8 sec ago')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByText('LIVE · Updated 13 sec ago')).toBeInTheDocument();
  });

  it('shows "Last updated" phrasing when a refresh has failed', () => {
    render(
      <FreshnessIndicator
        label="LIVE"
        updatedAt={Date.now() - 60_000}
        isFetching={false}
        hasError
      />,
    );
    expect(
      screen.getByText('LIVE · Last updated 1 min ago'),
    ).toBeInTheDocument();
  });

  it('does not use an aria-live region that would announce every tick', () => {
    const { container } = render(
      <FreshnessIndicator
        label="LIVE"
        updatedAt={Date.now()}
        isFetching={false}
        hasError={false}
      />,
    );
    expect(container.querySelector('[aria-live]')).not.toBeInTheDocument();
  });
});

describe('PlayFeed', () => {
  it('renders plays newest-first regardless of backend sequence order', () => {
    render(
      <PlayFeed
        plays={gamePlaysFixture}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    const list = screen.getByRole('list', {
      name: 'Play-by-play, newest first',
    });
    const rows = within(list).getAllByRole('listitem');
    expect(
      within(rows[0]!).getByText(missingFieldPositionPlayFixture.description),
    ).toBeInTheDocument();
  });

  it('does not show a new-plays indicator on first render', () => {
    render(
      <PlayFeed
        plays={gamePlaysFixture}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /new play/ }),
    ).not.toBeInTheDocument();
  });

  it('shows a keyboard-accessible "N new plays" indicator instead of forcing a jump when the user has scrolled away and more plays arrive', () => {
    const { rerender } = render(
      <PlayFeed
        plays={gamePlaysFixture}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    const list = screen.getByRole('list', {
      name: 'Play-by-play, newest first',
    });
    fireEvent.scroll(list, { target: { scrollTop: 400 } });

    const newPlay: GamePlay = {
      ...scoringPlayFixture,
      id: 'brand-new-play',
      sequence: gamePlaysFixture.length + 1,
    };
    rerender(
      <PlayFeed
        plays={[...gamePlaysFixture, newPlay]}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );

    const banner = screen.getByRole('button', { name: '1 new play' });
    expect(banner).toBeInTheDocument();
    expect(banner.tagName).toBe('BUTTON');
  });

  it('clears the indicator when the user clicks it', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PlayFeed
        plays={gamePlaysFixture}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    const list = screen.getByRole('list', {
      name: 'Play-by-play, newest first',
    });
    fireEvent.scroll(list, { target: { scrollTop: 400 } });
    const newPlay: GamePlay = {
      ...scoringPlayFixture,
      id: 'brand-new-play-2',
      sequence: gamePlaysFixture.length + 1,
    };
    rerender(
      <PlayFeed
        plays={[...gamePlaysFixture, newPlay]}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '1 new play' }));
    expect(
      screen.queryByRole('button', { name: /new play/ }),
    ).not.toBeInTheDocument();
  });

  it('does not show an indicator for new plays while the user stays near the top', () => {
    const { rerender } = render(
      <PlayFeed
        plays={gamePlaysFixture}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    const newPlay: GamePlay = {
      ...scoringPlayFixture,
      id: 'brand-new-play-3',
      sequence: gamePlaysFixture.length + 1,
    };
    rerender(
      <PlayFeed
        plays={[...gamePlaysFixture, newPlay]}
        selectedPlayId={null}
        onSelectPlay={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /new play/ }),
    ).not.toBeInTheDocument();
  });
});
