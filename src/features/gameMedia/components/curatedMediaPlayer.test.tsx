import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';

import { CuratedMediaPlayer } from '@/features/gameMedia/components/CuratedMediaPlayer';
import { GameMediaSection } from '@/features/gameMedia/components/GameMediaSection';
import type { GameMediaResult } from '@/features/gameMedia/types';
import { gameFixture } from '@/test/gameFixtures';
import {
  curatedVideoFixture,
  fourthCuratedVideoFixture,
  gameMediaAutomaticResultFixture,
  gameMediaCuratedResultFixture,
  gameMediaNoneResultFixture,
  gameMediaSingleCuratedResultFixture,
  secondCuratedVideoFixture,
  thirdCuratedVideoFixture,
} from '@/test/gameMediaFixtures';

vi.mock('@/features/games/queries', () => ({
  useGameHighlightsQuery: vi.fn(() => ({
    isPending: false,
    isError: false,
    error: null,
    data: undefined,
    refetch: vi.fn(),
  })),
}));

const baseQuery = {
  isPending: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const queryWith = (
  overrides: Partial<UseQueryResult<GameMediaResult>>,
): UseQueryResult<GameMediaResult> =>
  ({
    ...baseQuery,
    ...overrides,
  }) as unknown as UseQueryResult<GameMediaResult>;

describe('CuratedMediaPlayer', () => {
  it('renders the primary video and a selector for each other video', () => {
    render(
      <CuratedMediaPlayer
        videos={gameMediaCuratedResultFixture.curatedVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedVideoFixture.embedUrl,
    );
    expect(
      screen.getByRole('button', {
        name: `Play video: ${secondCuratedVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play video: ${fourthCuratedVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
  });

  it('local selection swaps the primary iframe src and never calls the network', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(
      <CuratedMediaPlayer
        videos={gameMediaCuratedResultFixture.curatedVideos}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedVideoFixture.title}`,
      }),
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      thirdCuratedVideoFixture.embedUrl,
    );
    expect(
      screen.getByRole('button', {
        name: `Play video: ${curatedVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('renders no selector rail with exactly one video', () => {
    render(
      <CuratedMediaPlayer
        videos={gameMediaSingleCuratedResultFixture.curatedVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedVideoFixture.embedUrl,
    );
    expect(
      screen.queryByRole('button', { name: /Play video/ }),
    ).not.toBeInTheDocument();
  });

  it('iframe title matches the video title for accessibility', () => {
    render(
      <CuratedMediaPlayer
        videos={gameMediaCuratedResultFixture.curatedVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'title',
      curatedVideoFixture.title,
    );
  });

  it('selector buttons are keyboard reachable and activatable', async () => {
    const user = userEvent.setup();
    render(
      <CuratedMediaPlayer
        videos={gameMediaCuratedResultFixture.curatedVideos}
      />,
    );
    const secondButton = screen.getByRole('button', {
      name: `Play video: ${secondCuratedVideoFixture.title}`,
    });
    secondButton.focus();
    expect(secondButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      secondCuratedVideoFixture.embedUrl,
    );
  });
});

describe('GameMediaSection — mode branching', () => {
  it('CURATED: renders only the curated player, never the automatic section', () => {
    render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaCuratedResultFixture })}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedVideoFixture.embedUrl,
    );
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument();
  });

  it('AUTOMATIC: renders the existing highlights section, not the curated player', () => {
    render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaAutomaticResultFixture })}
      />,
    );
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('NONE: renders nothing', () => {
    const { container } = render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaNoneResultFixture })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('CURATED with an automatic highlight also present in the payload: only curated renders', () => {
    render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaCuratedResultFixture })}
      />,
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument();
  });
});
