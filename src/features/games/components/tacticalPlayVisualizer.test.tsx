import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import {
  ExpandedPlayVisualizerDialog,
  TacticalPlayVisualizer,
} from '@/features/games/components/TacticalPlayVisualizer';
import { gameFixture } from '@/test/gameFixtures';
import {
  gamePlaysFixture,
  penaltyPlayFixture,
  scoringPlayFixture,
  turnoverPlayFixture,
} from '@/test/gamePlaysFixtures';

const noop = () => undefined;

const PlaybackHarness = ({
  initialPlayId,
}: {
  readonly initialPlayId: string;
}) => {
  const [playId, setPlayId] = useState(initialPlayId);
  const play = gamePlaysFixture.find((item) => item.id === playId)!;
  return (
    <TacticalPlayVisualizer
      game={{ ...gameFixture, status: 'IN_PROGRESS' }}
      play={play}
      plays={gamePlaysFixture}
      replayMode={false}
      replayVersion={0}
      onReplay={noop}
      onExpand={noop}
      onReturnToLive={noop}
      onSelectPlay={setPlayId}
    />
  );
};

describe('TacticalPlayVisualizer', () => {
  it('renders factual field markers, a pass trajectory, and exactly 11 schematic markers per side', () => {
    render(
      <TacticalPlayVisualizer
        game={{ ...gameFixture, status: 'FINAL' }}
        play={scoringPlayFixture}
        plays={gamePlaysFixture}
        replayMode={false}
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
        onSelectPlay={noop}
      />,
    );

    const field = screen.getByTestId('tactical-field');
    expect(field.querySelectorAll('[data-marker-side="offense"]')).toHaveLength(
      11,
    );
    expect(field.querySelectorAll('[data-marker-side="defense"]')).toHaveLength(
      11,
    );
    expect(screen.getByTestId('line-of-scrimmage')).toBeInTheDocument();
    expect(screen.getByTestId('first-down-marker')).toBeInTheDocument();
    expect(screen.getByTestId('starting-ball-location')).toBeInTheDocument();
    expect(screen.getByTestId('ending-ball-location')).toBeInTheDocument();
    expect(screen.getByTestId('ball-trajectory')).toBeInTheDocument();
    expect(
      screen.getByText(/Formation and player movement are schematic/),
    ).toBeInTheDocument();
    expect(field.querySelector('animateMotion')).toBeInTheDocument();
  });

  it('shows no-play state without animating official field advancement', () => {
    render(
      <TacticalPlayVisualizer
        game={{ ...gameFixture, status: 'FINAL' }}
        play={{
          ...penaltyPlayFixture,
          description: `${penaltyPlayFixture.description} - No Play.`,
        }}
        plays={gamePlaysFixture}
        replayMode
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
        onSelectPlay={noop}
      />,
    );
    expect(screen.getByTestId('play-result-overlay')).toHaveTextContent(
      'NO PLAY',
    );
    expect(
      screen.getByTestId('tactical-field').querySelector('animateMotion'),
    ).not.toBeInTheDocument();
  });

  it('renders final information immediately when reduced motion is preferred', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(
      <TacticalPlayVisualizer
        game={{ ...gameFixture, status: 'FINAL' }}
        play={scoringPlayFixture}
        plays={gamePlaysFixture}
        replayMode={false}
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
        onSelectPlay={noop}
      />,
    );
    const field = screen.getByTestId('tactical-field');
    expect(field.querySelector('animateMotion')).not.toBeInTheDocument();
    expect(field.querySelector('animate')).not.toBeInTheDocument();
    expect(screen.getByTestId('ending-ball-location')).toBeInTheDocument();
  });

  it('provides replay, return-to-live, and expanded two-pane controls', async () => {
    const user = userEvent.setup();
    const onReplay = vi.fn();
    const onReturnToLive = vi.fn();
    const { rerender } = render(
      <TacticalPlayVisualizer
        game={{ ...gameFixture, status: 'IN_PROGRESS' }}
        play={scoringPlayFixture}
        plays={gamePlaysFixture}
        replayMode
        replayVersion={0}
        onReplay={onReplay}
        onExpand={noop}
        onReturnToLive={onReturnToLive}
        onSelectPlay={noop}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Replay' }));
    await user.click(screen.getByRole('button', { name: 'Return to Live' }));
    expect(onReplay).toHaveBeenCalledOnce();
    expect(onReturnToLive).toHaveBeenCalledOnce();

    rerender(
      <ExpandedPlayVisualizerDialog
        open
        game={{ ...gameFixture, status: 'IN_PROGRESS' }}
        play={scoringPlayFixture}
        plays={gamePlaysFixture}
        selectedPlayId={scoringPlayFixture.id}
        replayMode
        replayVersion={1}
        onClose={noop}
        onSelectPlay={noop}
        onReplay={noop}
        onReturnToLive={noop}
      />,
    );
    expect(
      screen.getByRole('dialog', { name: /Q1 · 12:34/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Play-by-play, newest first' }),
    ).toBeInTheDocument();
  });

  it('steps through plays with the playback controls, including jumping back to the first play', async () => {
    const user = userEvent.setup();
    render(<PlaybackHarness initialPlayId={gamePlaysFixture.at(-1)!.id} />);

    const controls = screen.getByTestId('play-playback-controls');
    expect(within(controls).getByText('Play 5 of 5')).toBeInTheDocument();

    await user.click(
      within(controls).getByRole('button', { name: 'Previous play' }),
    );
    expect(screen.getByText('Play 4 of 5')).toBeInTheDocument();

    await user.click(
      within(controls).getByRole('button', {
        name: 'Start from the beginning',
      }),
    );
    expect(screen.getByText('Play 1 of 5')).toBeInTheDocument();
    expect(
      within(controls).getByRole('button', { name: 'Previous play' }),
    ).toBeDisabled();
    expect(
      within(controls).getByRole('button', {
        name: 'Start from the beginning',
      }),
    ).toBeDisabled();
  });

  it('renders a play deck under the schematic caption with the current play on top', async () => {
    const user = userEvent.setup();
    render(<PlaybackHarness initialPlayId={scoringPlayFixture.id} />);

    const deck = screen.getByTestId('play-deck');
    expect(
      within(deck).getByText(scoringPlayFixture.description),
    ).toBeInTheDocument();
    expect(
      within(deck).getByText(turnoverPlayFixture.description),
    ).toBeInTheDocument();

    const backgroundCard = within(deck)
      .getByText(turnoverPlayFixture.description)
      .closest('[data-testid="play-deck-card"]')!;
    await user.click(backgroundCard);

    expect(screen.getByText('Play 2 of 5')).toBeInTheDocument();
  });
});
