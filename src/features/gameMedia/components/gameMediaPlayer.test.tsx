import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';

import { GameMediaPlayer } from '@/features/gameMedia/components/GameMediaPlayer';
import { GameMediaSection } from '@/features/gameMedia/components/GameMediaSection';
import type { GameMediaResult } from '@/features/gameMedia/types';
import { gameFixture, tbdGameFixture } from '@/test/gameFixtures';
import {
  automaticDisplayVideoFixture,
  curatedDisplayVideoFixture,
  fourthCuratedDisplayVideoFixture,
  gameMediaAutomaticWithGlobalResultFixture,
  gameMediaCuratedResultFixture,
  gameMediaCuratedWithGlobalResultFixture,
  gameMediaFourCuratedWithGlobalResultFixture,
  gameMediaGlobalOnlyResultFixture,
  gameMediaNoneResultFixture,
  gameMediaSingleCuratedResultFixture,
  globalDisplayVideoFixture,
  secondCuratedDisplayVideoFixture,
  thirdCuratedDisplayVideoFixture,
} from '@/test/gameMediaFixtures';

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

describe('GameMediaPlayer — ordering', () => {
  it('global-only: renders G as primary with no selector rail', () => {
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={[globalDisplayVideoFixture]}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      globalDisplayVideoFixture.embedUrl,
    );
    expect(
      screen.queryByRole('button', { name: /Play video/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Featured Video')).toBeInTheDocument();
  });

  it('automatic + global: A0 initially selected, G appears as a selector', () => {
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={[automaticDisplayVideoFixture, globalDisplayVideoFixture]}
      />,
    );
    // automaticDisplayVideoFixture.canEmbed is false -- non-embeddable main
    // presentation (thumbnail, not iframe) for the initially-selected item.
    expect(document.querySelector('iframe')).toBeNull();
    expect(
      screen.getByText(automaticDisplayVideoFixture.title),
    ).toBeInTheDocument();
    expect(screen.getByText('Game Highlight')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play video: ${globalDisplayVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
  });

  it('curated + global: order is C0, then G as a selector, then C1', () => {
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedWithGlobalResultFixture.displayVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
    const selectors = screen.getAllByRole('button', { name: /Play video/ });
    expect(selectors.map((el) => el.getAttribute('aria-label'))).toEqual([
      `Play video: ${globalDisplayVideoFixture.title}`,
      `Play video: ${secondCuratedDisplayVideoFixture.title}`,
    ]);
  });

  it('four curated + global: all five items render/select (C0 G C1 C2 C3)', async () => {
    const user = userEvent.setup();
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaFourCuratedWithGlobalResultFixture.displayVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
    const selectors = screen.getAllByRole('button', { name: /Play video/ });
    expect(selectors).toHaveLength(4);
    expect(selectors.map((el) => el.getAttribute('aria-label'))).toEqual([
      `Play video: ${globalDisplayVideoFixture.title}`,
      `Play video: ${secondCuratedDisplayVideoFixture.title}`,
      `Play video: ${thirdCuratedDisplayVideoFixture.title}`,
      `Play video: ${fourthCuratedDisplayVideoFixture.title}`,
    ]);
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${fourthCuratedDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      fourthCuratedDisplayVideoFixture.embedUrl,
    );
  });
});

describe('GameMediaPlayer — local selection', () => {
  it('switching videos swaps the main media and never calls the network', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedResultFixture.displayVideos}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      thirdCuratedDisplayVideoFixture.embedUrl,
    );
    expect(
      screen.getByRole('button', {
        name: `Play video: ${curatedDisplayVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('an automatic item selected via the rail shows its non-embeddable presentation, unmounting the previous iframe', async () => {
    const user = userEvent.setup();
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={[globalDisplayVideoFixture, automaticDisplayVideoFixture]}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      globalDisplayVideoFixture.embedUrl,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${automaticDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelector('iframe')).toBeNull();
    expect(
      screen.getByText(automaticDisplayVideoFixture.title),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: `Watch highlight: ${automaticDisplayVideoFixture.title}`,
      }),
    ).toHaveAttribute('href', automaticDisplayVideoFixture.canonicalUrl);

    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${globalDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      globalDisplayVideoFixture.embedUrl,
    );
  });
});

describe('GameMediaPlayer — one video', () => {
  it('renders no selector rail with exactly one video', () => {
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaSingleCuratedResultFixture.displayVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
    expect(
      screen.queryByRole('button', { name: /Play video/ }),
    ).not.toBeInTheDocument();
  });
});

describe('GameMediaPlayer — security and accessibility', () => {
  it('the iframe src always equals the backend embedUrl verbatim, before and after switching', async () => {
    const user = userEvent.setup();
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedWithGlobalResultFixture.displayVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${globalDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      globalDisplayVideoFixture.embedUrl,
    );
  });

  it('the iframe has an accessible title matching the video title', () => {
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaSingleCuratedResultFixture.displayVideos}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'title',
      curatedDisplayVideoFixture.title,
    );
  });

  it('selector buttons are keyboard reachable and activatable', async () => {
    const user = userEvent.setup();
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedResultFixture.displayVideos}
      />,
    );
    const secondButton = screen.getByRole('button', {
      name: `Play video: ${secondCuratedDisplayVideoFixture.title}`,
    });
    secondButton.focus();
    expect(secondButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      secondCuratedDisplayVideoFixture.embedUrl,
    );
  });

  it('the selected item is never duplicated into the selector rail (the rail always reflects the "other" videos)', async () => {
    const user = userEvent.setup();
    render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedResultFixture.displayVideos}
      />,
    );
    const secondButton = screen.getByRole('button', {
      name: `Play video: ${secondCuratedDisplayVideoFixture.title}`,
    });
    expect(secondButton).toHaveAttribute('aria-pressed', 'false');
    await user.click(secondButton);
    // The clicked item is now primary, so it no longer appears as a
    // selector; the previous primary joins the rail in its place.
    expect(
      screen.queryByRole('button', {
        name: `Play video: ${secondCuratedDisplayVideoFixture.title}`,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play video: ${curatedDisplayVideoFixture.title}`,
      }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('GameMediaPlayer — refetch and game-change behavior', () => {
  it('keeps the current selection across a refetch (new array reference) when the selected item still exists', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedResultFixture.displayVideos}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      thirdCuratedDisplayVideoFixture.embedUrl,
    );
    // Simulate a refetch: a brand-new array with the same items.
    rerender(
      <GameMediaPlayer
        game={gameFixture}
        videos={[...gameMediaCuratedResultFixture.displayVideos]}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      thirdCuratedDisplayVideoFixture.embedUrl,
    );
  });

  it('falls back to the first item when a refetch no longer includes the selected item', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <GameMediaPlayer
        game={gameFixture}
        videos={gameMediaCuratedResultFixture.displayVideos}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedDisplayVideoFixture.title}`,
      }),
    );
    rerender(
      <GameMediaPlayer
        game={gameFixture}
        videos={[curatedDisplayVideoFixture, globalDisplayVideoFixture]}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
  });

  it("resets selection to the new list's first item when the game changes (key remount)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <GameMediaSection
        key={gameFixture.id}
        game={gameFixture}
        query={queryWith({ data: gameMediaCuratedResultFixture })}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play video: ${thirdCuratedDisplayVideoFixture.title}`,
      }),
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      thirdCuratedDisplayVideoFixture.embedUrl,
    );
    const otherGame = { ...gameFixture, id: 'another-game-id' };
    rerender(
      <GameMediaSection
        key={otherGame.id}
        game={otherGame}
        query={queryWith({
          data: { ...gameMediaCuratedResultFixture, gameId: otherGame.id },
        })}
      />,
    );
    // Never carries over the stale selection from the previous game.
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      curatedDisplayVideoFixture.embedUrl,
    );
  });
});

describe('GameMediaSection — mode branching', () => {
  it('renders the unified player for CURATED, AUTOMATIC, and GLOBAL modes alike', () => {
    render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaGlobalOnlyResultFixture })}
      />,
    );
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      globalDisplayVideoFixture.embedUrl,
    );
  });

  it('AUTOMATIC + GLOBAL: renders via the unified player, never a separate highlights section', () => {
    render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaAutomaticWithGlobalResultFixture })}
      />,
    );
    expect(
      screen.getByText(automaticDisplayVideoFixture.title),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play video: ${globalDisplayVideoFixture.title}`,
      }),
    ).toBeInTheDocument();
  });

  it('NONE with no coverage info renders nothing', () => {
    const { container } = render(
      <GameMediaSection
        game={gameFixture}
        query={queryWith({ data: gameMediaNoneResultFixture })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('FINAL + PENDING coverage with no display videos: shows a checking message', () => {
    render(
      <GameMediaSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({
          data: { ...gameMediaNoneResultFixture, coverage: 'PENDING' },
        })}
      />,
    );
    expect(
      screen.getByText('Highlights are being checked.'),
    ).toBeInTheDocument();
  });

  it('a query failure with no data stays subtle', () => {
    render(
      <GameMediaSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({
          isError: true,
          error: new Error('network'),
          data: undefined,
        })}
      />,
    );
    expect(
      screen.getByText('Highlights are temporarily unavailable.'),
    ).toBeInTheDocument();
  });

  it('a pending fetch with no data yet renders nothing', () => {
    const { container } = render(
      <GameMediaSection
        game={tbdGameFixture}
        query={queryWith({ isPending: true, data: undefined })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
