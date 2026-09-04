import { Alert } from '@mui/material';
import { Component, Suspense, lazy } from 'react';
import type { ReactNode } from 'react';

import type { GamePlay, GameTeam } from '@/features/games/types';

const LazyPlay3DField = lazy(() =>
  import('@/features/games/three/Play3DField').then((module) => ({
    default: module.Play3DField,
  })),
);

interface Play3DBoundaryProps {
  readonly play: GamePlay;
  readonly offense: GameTeam | null;
  readonly defense: GameTeam | null;
  readonly replayVersion: number;
  readonly expanded?: boolean;
  readonly reduceMotion: boolean;
  readonly onUnavailable: () => void;
}

interface Play3DBoundaryState {
  readonly failed: boolean;
}

class Play3DErrorBoundary extends Component<
  { readonly onUnavailable: () => void; readonly children: ReactNode },
  Play3DBoundaryState
> {
  state: Play3DBoundaryState = { failed: false };

  static getDerivedStateFromError(): Play3DBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: { readonly componentStack: string }) {
    console.error(
      '[Play3D] renderer failed, falling back to 2D:',
      error,
      info.componentStack,
    );
    this.props.onUnavailable();
  }

  render() {
    if (this.state.failed) {
      return (
        <Alert severity="warning" data-testid="play-3d-fallback-notice">
          3D visualization is unavailable in this browser. Showing the 2D
          tactical view instead.
        </Alert>
      );
    }
    return this.props.children;
  }
}

/**
 * Isolates the three.js/@react-three bundle behind React.lazy so it is only
 * fetched once a user opts into the 3D view, and falls back to 2D if WebGL
 * cannot initialize.
 */
export const Play3DBoundary = ({
  play,
  offense,
  defense,
  replayVersion,
  expanded,
  reduceMotion,
  onUnavailable,
}: Play3DBoundaryProps) => (
  <Play3DErrorBoundary onUnavailable={onUnavailable}>
    <Suspense fallback={<div data-testid="play-3d-loading" />}>
      <LazyPlay3DField
        play={play}
        offense={offense}
        defense={defense}
        replayVersion={replayVersion}
        expanded={expanded}
        reduceMotion={reduceMotion}
      />
    </Suspense>
  </Play3DErrorBoundary>
);
