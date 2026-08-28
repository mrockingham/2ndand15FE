import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ExpandedPlayVisualizerDialog,
  TacticalPlayVisualizer,
} from '@/features/games/components/TacticalPlayVisualizer';
import { gameFixture } from '@/test/gameFixtures';
import {
  gamePlaysFixture,
  penaltyPlayFixture,
  scoringPlayFixture,
} from '@/test/gamePlaysFixtures';

const noop = () => undefined;

describe('TacticalPlayVisualizer', () => {
  it('renders factual field markers, a pass trajectory, and exactly 11 schematic markers per side', () => {
    render(
      <TacticalPlayVisualizer
        game={{ ...gameFixture, status: 'FINAL' }}
        play={scoringPlayFixture}
        replayMode={false}
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
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
        replayMode
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
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
        replayMode={false}
        replayVersion={0}
        onReplay={noop}
        onExpand={noop}
        onReturnToLive={noop}
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
        replayMode
        replayVersion={0}
        onReplay={onReplay}
        onExpand={noop}
        onReturnToLive={onReturnToLive}
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
});
