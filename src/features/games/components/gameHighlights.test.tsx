import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';

import { GameHighlightCard } from '@/features/games/components/GameHighlightCard';
import { GameHighlightThumbnail } from '@/features/games/components/GameHighlightThumbnail';
import { GameHighlightsSection } from '@/features/games/components/GameHighlightsSection';
import type { GameHighlightsResult } from '@/features/games/types';
import {
  awayGameTeamFixture,
  embeddableWithoutEmbedUrlFixture,
  gameFixture,
  gameHighlightFixture,
  gameHighlightsAvailableFixture,
  gameHighlightsPendingFixture,
  gameHighlightsProviderErrorFixture,
  gameHighlightsUnavailableFixture,
  gameHighlightsUnknownFixture,
  homeGameTeamFixture,
  nonEmbeddableGameHighlightFixture,
  secondGameHighlightFixture,
  thirdGameHighlightFixture,
} from '@/test/gameFixtures';

const baseQuery = {
  isPending: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const queryWith = (
  overrides: Partial<UseQueryResult<GameHighlightsResult>>,
): UseQueryResult<GameHighlightsResult> =>
  ({
    ...baseQuery,
    ...overrides,
  }) as unknown as UseQueryResult<GameHighlightsResult>;

const renderCard = (
  overrides: Partial<Parameters<typeof GameHighlightCard>[0]> = {},
) => {
  const onPlay = vi.fn();
  const result = render(
    <GameHighlightCard
      highlight={gameHighlightFixture}
      awayTeam={awayGameTeamFixture}
      homeTeam={homeGameTeamFixture}
      isPlaying={false}
      onPlay={onPlay}
      {...overrides}
    />,
  );
  return { ...result, onPlay };
};

describe('GameHighlightThumbnail', () => {
  it('renders the image when a thumbnail exists', () => {
    render(
      <GameHighlightThumbnail
        thumbnailUrl="https://example.com/thumb.jpg"
        alt="Bills vs. Dolphins highlight"
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Bills vs. Dolphins highlight' }),
    ).toHaveAttribute('src', 'https://example.com/thumb.jpg');
  });

  it('falls back to a team matchup, never a broken image, when the thumbnail is missing', () => {
    render(
      <GameHighlightThumbnail
        thumbnailUrl={null}
        alt="Bills vs. Dolphins highlight"
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('HIGHLIGHT')).toBeInTheDocument();
  });

  it('falls back to the matchup after the image fails to load', () => {
    render(
      <GameHighlightThumbnail
        thumbnailUrl="https://example.com/broken.jpg"
        alt="Bills vs. Dolphins highlight"
        awayTeam={awayGameTeamFixture}
        homeTeam={homeGameTeamFixture}
      />,
    );
    const img = screen.getByRole('img', {
      name: 'Bills vs. Dolphins highlight',
    });
    fireEvent.error(img);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('GameHighlightCard — not embeddable (M31B behavior preserved)', () => {
  it('uses only the canonical URL, never the embed URL, and never renders a player', () => {
    const { container } = renderCard({
      highlight: nonEmbeddableGameHighlightFixture,
    });
    const link = screen.getByRole('link', {
      name: `Watch highlight: ${nonEmbeddableGameHighlightFixture.title}`,
    });
    expect(link).toHaveAttribute(
      'href',
      nonEmbeddableGameHighlightFixture.canonicalUrl,
    );
    expect(link.getAttribute('href')).not.toBe(
      nonEmbeddableGameHighlightFixture.embedUrl,
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.innerHTML).not.toContain(
      nonEmbeddableGameHighlightFixture.embedUrl!,
    );
  });

  it('is reachable by keyboard as a single focusable element, not nested targets', async () => {
    const user = userEvent.setup();
    renderCard({ highlight: nonEmbeddableGameHighlightFixture });
    await user.tab();
    expect(
      screen.getByRole('link', {
        name: `Watch highlight: ${nonEmbeddableGameHighlightFixture.title}`,
      }),
    ).toHaveFocus();
  });

  it('shows the title, HIGHLIGHT label, and Watch Highlight action, with no Play trigger', () => {
    renderCard({ highlight: nonEmbeddableGameHighlightFixture });
    expect(
      screen.getByText(nonEmbeddableGameHighlightFixture.title),
    ).toBeInTheDocument();
    expect(screen.getByText('HIGHLIGHT')).toBeInTheDocument();
    expect(screen.getByText('Watch Highlight')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Play highlight/ }),
    ).not.toBeInTheDocument();
  });

  it('renders as a non-interactive card, with no Watch Highlight action, when canonicalUrl is missing', () => {
    renderCard({
      highlight: { ...nonEmbeddableGameHighlightFixture, canonicalUrl: null },
    });
    expect(
      screen.getByText(nonEmbeddableGameHighlightFixture.title),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Watch Highlight')).not.toBeInTheDocument();
  });

  it('shows the description when the non-embeddable highlight has one', () => {
    renderCard({
      highlight: {
        ...nonEmbeddableGameHighlightFixture,
        description: 'A late defensive stop sealed the win.',
      },
    });
    expect(
      screen.getByText('A late defensive stop sealed the win.'),
    ).toBeInTheDocument();
  });

  it('fails safe to canonical-only when canEmbed is true but embedUrl is missing', () => {
    renderCard({ highlight: embeddableWithoutEmbedUrlFixture });
    expect(document.querySelector('iframe')).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Play highlight/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: `Watch highlight: ${embeddableWithoutEmbedUrlFixture.title}`,
      }),
    ).toHaveAttribute('href', embeddableWithoutEmbedUrlFixture.canonicalUrl);
  });
});

describe('GameHighlightCard — embeddable inline playback', () => {
  it('initial state: shows the thumbnail, Play trigger, and Watch on YouTube fallback, with no iframe', () => {
    renderCard();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    expect(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    ).toBeInTheDocument();
    const externalLink = screen.getByRole('link', {
      name: `Watch on YouTube: ${gameHighlightFixture.title}`,
    });
    expect(externalLink).toHaveAttribute(
      'href',
      gameHighlightFixture.canonicalUrl,
    );
  });

  it('omits the external link but keeps the Play trigger when an embeddable highlight has no canonicalUrl', () => {
    renderCard({ highlight: { ...gameHighlightFixture, canonicalUrl: null } });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    ).toBeInTheDocument();
  });

  it('clicking Play calls onPlay rather than mounting the iframe itself', async () => {
    const user = userEvent.setup();
    const { onPlay } = renderCard();
    await user.click(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    );
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('when isPlaying, mounts the iframe using embedUrl (never canonicalUrl) with the highlight title, and keeps the canonical fallback visible', () => {
    renderCard({ isPlaying: true });
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', gameHighlightFixture.embedUrl);
    expect(iframe?.getAttribute('src')).not.toBe(
      gameHighlightFixture.canonicalUrl,
    );
    expect(iframe).toHaveAttribute('title', gameHighlightFixture.title);
    expect(
      screen.queryByRole('button', { name: /Play highlight/ }),
    ).not.toBeInTheDocument();
    const externalLink = screen.getByRole('link', {
      name: `Watch on YouTube: ${gameHighlightFixture.title}`,
    });
    expect(externalLink).toHaveAttribute(
      'href',
      gameHighlightFixture.canonicalUrl,
    );
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    );
  });

  it('keeps the Play trigger keyboard-focusable and activatable, with no nested interactive elements', async () => {
    const user = userEvent.setup();
    const { onPlay } = renderCard();
    await user.tab();
    const playButton = screen.getByRole('button', {
      name: `Play highlight: ${gameHighlightFixture.title}`,
    });
    expect(playButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onPlay).toHaveBeenCalledTimes(1);
    // The play trigger and the external link are siblings, not nested.
    expect(playButton.closest('a')).toBeNull();
  });

  it('renders description and published time only when present, reserving no empty space', () => {
    renderCard({
      highlight: {
        ...gameHighlightFixture,
        description: null,
        publishedAt: null,
      },
    });
    expect(screen.queryByText(/Published/)).not.toBeInTheDocument();

    renderCard({
      highlight: {
        ...gameHighlightFixture,
        id: 'described',
        description: 'A clutch fourth-quarter drive.',
      },
    });
    expect(
      screen.getByText('A clutch fourth-quarter drive.'),
    ).toBeInTheDocument();
  });

  it('remains playable through the missing/failed thumbnail fallback', async () => {
    const user = userEvent.setup();
    const { onPlay } = renderCard({
      highlight: { ...gameHighlightFixture, thumbnailUrl: null },
    });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    );
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('never renders a <video> element or references HLS for embeddable content', () => {
    const { container } = renderCard({ isPlaying: true });
    expect(container.querySelector('video')).toBeNull();
    expect(container.innerHTML).not.toMatch(/\.m3u8/i);
  });
});

describe('GameHighlightsSection — one-at-a-time playback', () => {
  it('starts with no player mounted for any highlight', () => {
    const data: GameHighlightsResult = {
      gameId: gameFixture.id,
      coverage: 'AVAILABLE',
      highlights: [gameHighlightFixture, secondGameHighlightFixture],
    };
    render(
      <GameHighlightsSection game={gameFixture} query={queryWith({ data })} />,
    );
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('playing a second highlight unmounts the first, so only one iframe ever exists', async () => {
    const user = userEvent.setup();
    const data: GameHighlightsResult = {
      gameId: gameFixture.id,
      coverage: 'AVAILABLE',
      highlights: [gameHighlightFixture, secondGameHighlightFixture],
    };
    render(
      <GameHighlightsSection game={gameFixture} query={queryWith({ data })} />,
    );
    await user.click(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      gameHighlightFixture.embedUrl,
    );

    await user.click(
      screen.getByRole('button', {
        name: `Play highlight: ${secondGameHighlightFixture.title}`,
      }),
    );
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toHaveAttribute(
      'src',
      secondGameHighlightFixture.embedUrl,
    );
    expect(
      screen.getByRole('button', {
        name: `Play highlight: ${gameHighlightFixture.title}`,
      }),
    ).toBeInTheDocument();
  });
});

describe('GameHighlightsSection — coverage states', () => {
  it('AVAILABLE: renders the section and one highlight card', () => {
    render(
      <GameHighlightsSection
        game={gameFixture}
        query={queryWith({ data: gameHighlightsAvailableFixture })}
      />,
    );
    expect(screen.getByText('Highlights')).toBeInTheDocument();
    expect(screen.getByText(gameHighlightFixture.title)).toBeInTheDocument();
  });

  it('AVAILABLE: renders multiple highlights in backend order without assuming exactly one', () => {
    const data: GameHighlightsResult = {
      gameId: gameFixture.id,
      coverage: 'AVAILABLE',
      highlights: [
        gameHighlightFixture,
        secondGameHighlightFixture,
        thirdGameHighlightFixture,
      ],
    };
    render(
      <GameHighlightsSection game={gameFixture} query={queryWith({ data })} />,
    );
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles.map((node) => node.textContent)).toEqual([
      gameHighlightFixture.title,
      secondGameHighlightFixture.title,
      thirdGameHighlightFixture.title,
    ]);
  });

  it('FINAL + PENDING: shows a subtle checking state, not an error', () => {
    render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({ data: gameHighlightsPendingFixture })}
      />,
    );
    expect(
      screen.getByText('Highlights are being checked.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('FINAL + UNAVAILABLE: hides the section rather than showing a large empty panel', () => {
    const { container } = render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({ data: gameHighlightsUnavailableFixture })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('non-FINAL + UNKNOWN: hides the module entirely', () => {
    const { container } = render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'SCHEDULED' }}
        query={queryWith({ data: gameHighlightsUnknownFixture })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('FINAL + PROVIDER_ERROR: shows a sanitized message with no provider name or status code', () => {
    render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({ data: gameHighlightsProviderErrorFixture })}
      />,
    );
    const message = screen.getByText('Highlights are temporarily unavailable.');
    expect(message).toBeInTheDocument();
    expect(screen.queryByText(/highlightly/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\b\d{3}\b/)).not.toBeInTheDocument();
  });

  it('LIVE with no available highlight: section is absent', () => {
    const { container } = render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'IN_PROGRESS' }}
        query={queryWith({ data: gameHighlightsUnknownFixture })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('a non-FINAL game with an early AVAILABLE result still shows it (backend coverage is authoritative)', () => {
    render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'IN_PROGRESS' }}
        query={queryWith({ data: gameHighlightsAvailableFixture })}
      />,
    );
    expect(screen.getByText(gameHighlightFixture.title)).toBeInTheDocument();
  });

  it('a query failure with no data stays subtle and never breaks the rest of the page', () => {
    const { container } = render(
      <GameHighlightsSection
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
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('a pending fetch with no data yet renders nothing rather than a forever spinner', () => {
    const { container } = render(
      <GameHighlightsSection
        game={{ ...gameFixture, status: 'FINAL' }}
        query={queryWith({ isPending: true, data: undefined })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
