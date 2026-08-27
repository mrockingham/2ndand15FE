import { render, screen } from '@testing-library/react';

import { CuratedVideoCard } from '@/features/gameMedia/components/CuratedVideoCard';
import { DisplayModeBadge } from '@/features/gameMedia/components/DisplayModeBadge';
import { RemoveCuratedVideoDialog } from '@/features/gameMedia/components/RemoveCuratedVideoDialog';
import {
  curatedVideoFixture,
  secondCuratedVideoFixture,
} from '@/test/gameMediaFixtures';

describe('DisplayModeBadge', () => {
  it('shows the friendly label for each mode, never the raw backend enum', () => {
    render(<DisplayModeBadge displayMode="CURATED" />);
    expect(screen.getByText('Curated media')).toBeInTheDocument();
    render(<DisplayModeBadge displayMode="AUTOMATIC" />);
    expect(screen.getByText('Automatic highlight')).toBeInTheDocument();
    render(<DisplayModeBadge displayMode="NONE" />);
    expect(screen.getByText('No media')).toBeInTheDocument();
  });
});

describe('CuratedVideoCard', () => {
  const noop = () => {};

  it('marks the first item Primary and numbers the rest', () => {
    render(
      <CuratedVideoCard
        video={curatedVideoFixture}
        index={0}
        total={2}
        isAdmin
        isReordering={false}
        onEdit={noop}
        onRemove={noop}
        onMoveUp={noop}
        onMoveDown={noop}
      />,
    );
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('disables Move Up at the first position and Move Down at the last', () => {
    render(
      <CuratedVideoCard
        video={curatedVideoFixture}
        index={0}
        total={2}
        isAdmin
        isReordering={false}
        onEdit={noop}
        onRemove={noop}
        onMoveUp={noop}
        onMoveDown={noop}
      />,
    );
    expect(
      screen.getByRole('button', {
        name: `Move ${curatedVideoFixture.title} up`,
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: `Move ${curatedVideoFixture.title} down`,
      }),
    ).not.toBeDisabled();

    render(
      <CuratedVideoCard
        video={secondCuratedVideoFixture}
        index={1}
        total={2}
        isAdmin
        isReordering={false}
        onEdit={noop}
        onRemove={noop}
        onMoveUp={noop}
        onMoveDown={noop}
      />,
    );
    expect(
      screen.getByRole('button', {
        name: `Move ${secondCuratedVideoFixture.title} down`,
      }),
    ).toBeDisabled();
  });

  it('hides mutating controls for non-admin viewers', () => {
    render(
      <CuratedVideoCard
        video={curatedVideoFixture}
        index={0}
        total={1}
        isAdmin={false}
        isReordering={false}
        onEdit={noop}
        onRemove={noop}
        onMoveUp={noop}
        onMoveDown={noop}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: `Move ${curatedVideoFixture.title} up`,
      }),
    ).not.toBeInTheDocument();
  });
});

describe('RemoveCuratedVideoDialog', () => {
  it('explains that automatic highlights are preserved', () => {
    render(
      <RemoveCuratedVideoDialog
        video={curatedVideoFixture}
        isPending={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(
      screen.getByText(/Automatic Highlightly media will not be deleted/),
    ).toBeInTheDocument();
  });

  it('disables Cancel and Remove while pending', () => {
    render(
      <RemoveCuratedVideoDialog
        video={curatedVideoFixture}
        isPending
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Removing…' })).toBeDisabled();
  });
});
