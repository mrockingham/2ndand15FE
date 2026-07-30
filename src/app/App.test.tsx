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

  it('renders a secondary route without fake product data', () => {
    renderApp('/news');

    expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument();
    expect(screen.getByText('Foundation preview')).toBeInTheDocument();
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
