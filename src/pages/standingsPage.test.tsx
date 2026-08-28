import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { StandingsView } from '@/features/standings/types';
import { apiErrorResponse, jsonResponse } from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';
import { standingsResponseFixture } from '@/test/standingsFixtures';

const standingsRouter = ({ notFound = false } = {}) =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/games'))
      return Promise.resolve(
        jsonResponse({ data: [], meta: { nextCursor: null } }),
      );
    if (url.pathname.endsWith('/standings')) {
      if (notFound)
        return Promise.resolve(
          apiErrorResponse(
            'STANDINGS_NOT_FOUND',
            'Standings are not available.',
            404,
          ),
        );
      const season = Number(url.searchParams.get('season'));
      const type = url.searchParams.get('seasonType') === 'REG' ? 'REG' : 'PRE';
      const requestedView = url.searchParams.get('view');
      const view: StandingsView =
        requestedView === 'conference' || requestedView === 'league'
          ? requestedView
          : 'division';
      return Promise.resolve(
        jsonResponse(standingsResponseFixture(view, season, type)),
      );
    }
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });

describe('public Standings page', () => {
  it('renders the default division hierarchy and preserves backend team order', async () => {
    renderApp('/standings', { fetchImplementation: standingsRouter() });

    expect(
      await screen.findByRole('heading', {
        name: 'NFL Preseason Standings 2026',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: 'American Football Conference',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: 'National Football Conference',
      }),
    ).toBeInTheDocument();
    const afcEast = screen
      .getByRole('heading', { name: 'AFC East' })
      .closest('section');
    expect(afcEast).not.toBeNull();
    const rows = within(afcEast as HTMLElement)
      .getAllByRole('row')
      .slice(1);
    expect(
      rows.map((row) => within(row).getByRole('link').textContent),
    ).toEqual([
      'Buffalo BillsBUF',
      'New York JetsNYJ',
      'New England PatriotsNE',
      'Miami DolphinsMIA',
    ]);
    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toHaveTextContent('Standings');
    expect(
      screen.getByRole('tab', { name: 'Division', selected: true }),
    ).toBeInTheDocument();
  });

  it('renders backend fields, missing values, responsive scrolling, and no preseason seeds', async () => {
    renderApp('/standings', { fetchImplementation: standingsRouter() });
    const table = await screen.findByRole('table', {
      name: 'AFC East standings',
    });
    const scrollContainer = table.parentElement;
    expect(scrollContainer).toHaveAttribute('tabindex', '0');
    expect(scrollContainer).toHaveStyle({ overflowX: 'auto' });

    const bills = within(table).getByRole('row', { name: /Buffalo Bills/ });
    expect(bills).toHaveTextContent('3');
    expect(bills).toHaveTextContent('1.000');
    expect(bills).toHaveTextContent('1-0');
    expect(bills).toHaveTextContent('88');
    expect(bills).toHaveTextContent('48');
    expect(bills).toHaveTextContent('+40');
    expect(bills).toHaveTextContent('W3');
    expect(within(bills).queryByText(/Seed/)).not.toBeInTheDocument();

    const jets = within(table).getByRole('row', { name: /New York Jets/ });
    expect(jets).toHaveTextContent('.500');
    expect(jets).toHaveTextContent('-21');

    const patriots = within(table).getByRole('row', {
      name: /New England Patriots/,
    });
    expect(patriots).toHaveTextContent('1-0-1');
    expect(patriots).toHaveTextContent('—');
    expect(patriots).toHaveTextContent('0');
  });

  it('supports conference and league URL views without client reordering', async () => {
    const first = renderApp(
      '/standings?season=2025&seasonType=REG&view=conference',
      { fetchImplementation: standingsRouter() },
    );
    expect(
      await screen.findByRole('heading', { name: 'NFL Standings 2025' }),
    ).toBeInTheDocument();
    expect(await screen.findAllByRole('table')).toHaveLength(2);
    for (const table of screen.getAllByRole('table'))
      expect(within(table).getAllByRole('row')).toHaveLength(17);
    expect(screen.getAllByText(/Seed 1/).length).toBeGreaterThan(0);
    first.unmount();

    renderApp('/standings?season=2026&seasonType=PRE&view=league', {
      fetchImplementation: standingsRouter(),
    });
    const league = await screen.findByRole('table', {
      name: 'National Football League standings',
    });
    expect(within(league).getAllByRole('row')).toHaveLength(33);
  });

  it('updates and normalizes URL state through the view controls', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(
      '/standings?season=nope&seasonType=POST&view=invalid',
      { fetchImplementation: standingsRouter() },
    );
    await screen.findByRole('heading', {
      name: 'NFL Preseason Standings 2026',
    });
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        '?season=2026&seasonType=PRE&view=division',
      ),
    );
    await user.click(screen.getByRole('tab', { name: 'Conference' }));
    await waitFor(() =>
      expect(router.state.location.search).toContain('view=conference'),
    );
    expect(await screen.findAllByRole('table')).toHaveLength(2);
  });

  it('treats expected missing standings as a contained empty state', async () => {
    renderApp('/standings', {
      fetchImplementation: standingsRouter({ notFound: true }),
    });
    expect(
      await screen.findByRole('heading', {
        name: "Standings aren't available for this season yet.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toHaveTextContent(
      'Standings could not be loaded',
    );
  });

  it('places Standings in the mobile More destination without crowding the bottom bar', async () => {
    const user = userEvent.setup();
    renderApp('/standings', { fetchImplementation: standingsRouter() });
    await screen.findByRole('heading', {
      name: 'NFL Preseason Standings 2026',
    });
    const mobileNavigation = screen.getByTestId('mobile-navigation');
    expect(
      within(mobileNavigation).queryByText('Standings'),
    ).not.toBeInTheDocument();
    await user.click(
      within(mobileNavigation).getByRole('button', { name: 'More' }),
    );
    expect(
      await screen.findByRole('link', { name: 'Standings' }),
    ).toHaveAttribute('href', '/standings');
  });
});
