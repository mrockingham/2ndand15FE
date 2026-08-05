import { screen } from '@testing-library/react';

import { renderApp } from '@/test/renderApp';

describe('application routing', () => {
  it('renders the application shell and home route', () => {
    renderApp('/');

    expect(
      screen.getByRole('link', { name: '2nd & 15 home' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /see the game/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('lazy-loads the real News route without fake product data', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: [], meta: { nextCursor: null } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    renderApp('/news', { fetchImplementation });

    expect(screen.getByRole('status')).toHaveTextContent('Loading page…');
    expect(
      await screen.findByRole('heading', { name: 'News' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Foundation preview')).not.toBeInTheDocument();
    expect(fetchImplementation).toHaveBeenCalled();
  });

  it('renders not-found content for an unknown route', () => {
    renderApp('/definitely-not-a-route');

    expect(
      screen.getByRole('heading', { name: /missed the mark/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
