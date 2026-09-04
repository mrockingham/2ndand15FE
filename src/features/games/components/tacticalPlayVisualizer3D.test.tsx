import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { TacticalPlayVisualizer3D } from '@/features/games/components/TacticalPlayVisualizer3D';
import { gameFixture } from '@/test/gameFixtures';
import {
  gamePlaysFixture,
  scoringPlayFixture,
  turnoverPlayFixture,
} from '@/test/gamePlaysFixtures';
import type { GamePlay } from '@/features/games/types';
import { isWebglAvailable } from '@/features/games/three/webgl';

vi.mock('@/features/games/three/webgl', () => ({
  isWebglAvailable: vi.fn(() => true),
}));

vi.mock('@/features/games/three/Play3DField', () => ({
  Play3DField: ({ play }: { readonly play: GamePlay }) => (
    <div data-testid="play-3d-field-stub" data-play-id={play.id} />
  ),
}));

const noop = () => undefined;

const Harness = ({ initialPlayId }: { readonly initialPlayId: string }) => {
  const [playId, setPlayId] = useState(initialPlayId);
  const play = gamePlaysFixture.find((item) => item.id === playId)!;
  return (
    <TacticalPlayVisualizer3D
      game={{ ...gameFixture, status: 'IN_PROGRESS' }}
      play={play}
      plays={gamePlaysFixture}
      replayMode={false}
      replayVersion={0}
      onReplay={noop}
      onExpand={noop}
      onReturnToLive={noop}
      onSelectPlay={setPlayId}
      onUnavailable={noop}
    />
  );
};

describe('TacticalPlayVisualizer3D playback controls', () => {
  beforeEach(() => {
    vi.mocked(isWebglAvailable).mockReturnValue(true);
  });

  it('shows the current position and disables Previous at the first play', async () => {
    render(<Harness initialPlayId={scoringPlayFixture.id} />);
    await screen.findByTestId('play-3d-field-stub');

    const controls = screen.getByTestId('play-playback-controls');
    expect(within(controls).getByText('Play 1 of 5')).toBeInTheDocument();
    expect(
      within(controls).getByRole('button', { name: 'Previous play' }),
    ).toBeDisabled();
    expect(
      within(controls).getByRole('button', { name: 'Next play' }),
    ).toBeEnabled();
  });

  it('disables Next and the play button at the last play', async () => {
    const last = gamePlaysFixture.at(-1)!;
    render(<Harness initialPlayId={last.id} />);
    await screen.findByTestId('play-3d-field-stub');

    const controls = screen.getByTestId('play-playback-controls');
    expect(within(controls).getByText('Play 5 of 5')).toBeInTheDocument();
    expect(
      within(controls).getByRole('button', { name: 'Next play' }),
    ).toBeDisabled();
    expect(
      within(controls).getByRole('button', { name: 'Play plays' }),
    ).toBeDisabled();
  });

  it('steps forward and backward through plays via the controls', async () => {
    const user = userEvent.setup();
    render(<Harness initialPlayId={scoringPlayFixture.id} />);
    await screen.findByTestId('play-3d-field-stub');

    await user.click(screen.getByRole('button', { name: 'Next play' }));
    expect(
      (await screen.findByTestId('play-3d-field-stub')).getAttribute(
        'data-play-id',
      ),
    ).toBe(turnoverPlayFixture.id);
    expect(screen.getByText('Play 2 of 5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous play' }));
    expect(
      (await screen.findByTestId('play-3d-field-stub')).getAttribute(
        'data-play-id',
      ),
    ).toBe(scoringPlayFixture.id);
    expect(screen.getByText('Play 1 of 5')).toBeInTheDocument();
  });

  it('jumps back to the first play from anywhere in the list', async () => {
    const user = userEvent.setup();
    render(<Harness initialPlayId={gamePlaysFixture.at(-1)!.id} />);
    await screen.findByTestId('play-3d-field-stub');

    await user.click(
      screen.getByRole('button', { name: 'Start from the beginning' }),
    );

    expect(
      (await screen.findByTestId('play-3d-field-stub')).getAttribute(
        'data-play-id',
      ),
    ).toBe(scoringPlayFixture.id);
    expect(screen.getByText('Play 1 of 5')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start from the beginning' }),
    ).toBeDisabled();
  });

  it('auto-advances through plays while playing and stops at the end', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
      });
      render(<Harness initialPlayId={gamePlaysFixture.at(-2)!.id} />);
      await screen.findByTestId('play-3d-field-stub');

      await user.click(screen.getByRole('button', { name: 'Play plays' }));
      expect(
        screen.getByRole('button', { name: 'Pause plays' }),
      ).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6000);
      });

      expect(screen.getByText('Play 5 of 5')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play plays' })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders a play deck showing the current play description with upcoming plays stacked behind it', async () => {
    const user = userEvent.setup();
    render(<Harness initialPlayId={scoringPlayFixture.id} />);
    await screen.findByTestId('play-3d-field-stub');

    const deck = screen.getByTestId('play-deck');
    expect(
      within(deck).getAllByTestId('play-deck-card').length,
    ).toBeGreaterThan(1);
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

    await waitFor(() =>
      expect(screen.getByTestId('play-3d-field-stub')).toHaveAttribute(
        'data-play-id',
        turnoverPlayFixture.id,
      ),
    );
  });
});
