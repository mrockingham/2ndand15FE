import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { billsFixture, userWithFavoriteFixture } from '@/test/authFixtures';
import {
  playerAttributionFixture,
  quarterbackFixture,
  quarterbackGameFixture,
  quarterbackSeasonFixture,
  receiverFixture,
  receiverSeasonFixture,
} from '@/test/playerFixtures';
import { renderApp } from '@/test/renderApp';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const listResponse = (data: unknown[], nextCursor: string | null = null) =>
  json({
    data,
    meta: { nextCursor, attribution: playerAttributionFixture },
  });

const detailResponse = (data: unknown) =>
  json({ data, meta: { attribution: playerAttributionFixture } });

describe('public player pages', () => {
  it('lazy-loads the directory and sends URL-backed filters', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(json({ data: [billsFixture] }));
      if (url.pathname.endsWith('/players'))
        return Promise.resolve(listResponse([quarterbackFixture]));
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });

    renderApp(
      `/players?search=Alex&teamId=${billsFixture.id}&position=qb&season=2025`,
      { fetchImplementation },
    );

    expect(screen.getByRole('status')).toHaveTextContent(/Loading page/);
    expect(
      await screen.findByRole('heading', { name: 'Players' }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText('Alex Quarterback')).not.toHaveLength(0);
    expect(screen.getByRole('link', { name: /CC BY 4.0/i })).toHaveAttribute(
      'href',
      playerAttributionFixture.url,
    );
    await waitFor(() => {
      const request = fetchImplementation.mock.calls.find((call) =>
        String(call[0]).includes('/players?'),
      );
      const url = new URL(String(request?.[0]));
      expect(Object.fromEntries(url.searchParams)).toEqual({
        limit: '24',
        search: 'Alex',
        teamId: billsFixture.id,
        position: 'QB',
        season: '2025',
      });
    });
  });

  it('supports favorite-team filtering and bounded cursor pagination', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/teams'))
        return Promise.resolve(json({ data: [billsFixture] }));
      if (url.pathname.endsWith('/players')) {
        if (url.searchParams.has('cursor'))
          return Promise.resolve(listResponse([receiverFixture]));
        return Promise.resolve(
          listResponse([quarterbackFixture], quarterbackFixture.id),
        );
      }
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });
    const { router } = renderApp('/players', {
      restorationStatus: 'authenticated',
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
    });

    await screen.findByRole('heading', { name: 'Players' });
    await userEvent.click(
      screen.getByRole('button', { name: 'My team roster history: BUF' }),
    );
    expect(router.state.location.search).toContain(`teamId=${billsFixture.id}`);
    await screen.findByRole('button', { name: 'Load more players' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Load more players' }),
    );
    expect(await screen.findAllByText('Riley Receiver')).not.toHaveLength(0);
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining(`cursor=${quarterbackFixture.id}`),
      expect.anything(),
    );
  });

  it('renders exact profile identity, position-aware summaries, and recorded appearances', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith(`/${quarterbackFixture.id}/seasons`))
        return Promise.resolve(detailResponse([quarterbackSeasonFixture]));
      if (url.pathname.endsWith(`/${quarterbackFixture.id}/stats`))
        return Promise.resolve(listResponse([quarterbackGameFixture]));
      if (url.pathname.endsWith(`/${quarterbackFixture.id}`))
        return Promise.resolve(detailResponse(quarterbackFixture));
      return Promise.reject(
        new TypeError(`Unexpected request: ${url.pathname}`),
      );
    });

    renderApp(`/players/${quarterbackFixture.id}?season=2025&type=REG_POST`, {
      fetchImplementation,
    });

    expect(
      await screen.findByRole('heading', { name: 'Alex Quarterback' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Wyoming')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Passing' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Receiving' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recorded appearances' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(await screen.findAllByText('Date unavailable')).not.toHaveLength(0);
    expect(screen.getByText(/Missing weeks, byes/)).toBeInTheDocument();
    expect(screen.queryByText(/provider id/i)).not.toBeInTheDocument();
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining(
        `/players/${quarterbackFixture.id}/stats?season=2025&limit=100`,
      ),
      expect.anything(),
    );
  });

  it('rejects an invalid player URL without requesting player data', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    renderApp('/players/not-a-uuid', { fetchImplementation });
    expect(
      await screen.findByRole('heading', { name: 'Player not found' }),
    ).toBeInTheDocument();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('compares two URL-selected players without declaring an overall winner', async () => {
    const fetchImplementation = comparisonFetch();
    const { router } = renderApp(
      `/players/compare?left=${quarterbackFixture.id}&right=${receiverFixture.id}&season=2025`,
      { fetchImplementation },
    );

    expect(
      await screen.findByRole('heading', { name: 'Compare two players' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/different positions or position groups/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Passing comparison' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Receiving comparison' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('\u2014').length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Winner:/i)).not.toBeInTheDocument();
    expect(router.state.location.search).toContain('season=2025');
  });

  it('debounces comparison search and prevents selecting the same player twice', async () => {
    const fetchImplementation = comparisonFetch();
    const { router } = renderApp('/players/compare', { fetchImplementation });
    await screen.findByRole('heading', { name: 'Compare two players' });
    await userEvent.type(screen.getByLabelText('Left player'), 'Alex');
    expect(
      fetchImplementation.mock.calls.some((call) =>
        String(call[0]).includes('search=Alex'),
      ),
    ).toBe(false);
    expect(
      await screen.findByRole('button', { name: /Alex Quarterback/ }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /Alex Quarterback/ }),
    );
    await waitFor(() =>
      expect(router.state.location.search).toContain(
        `left=${quarterbackFixture.id}`,
      ),
    );

    await router.navigate(
      `/players/compare?left=${quarterbackFixture.id}&right=${quarterbackFixture.id}`,
    );
    expect(
      await screen.findByText('Choose two different players.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/2025 comparison/i)).not.toBeInTheDocument();
  });
});

const comparisonFetch = () =>
  vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/players')) {
      const search = url.searchParams.get('search');
      return Promise.resolve(
        listResponse(
          search?.toLowerCase().includes('alex') ? [quarterbackFixture] : [],
        ),
      );
    }
    if (url.pathname.endsWith(`/${quarterbackFixture.id}/seasons`))
      return Promise.resolve(detailResponse([quarterbackSeasonFixture]));
    if (url.pathname.endsWith(`/${receiverFixture.id}/seasons`))
      return Promise.resolve(detailResponse([receiverSeasonFixture]));
    if (url.pathname.endsWith(`/${quarterbackFixture.id}`))
      return Promise.resolve(detailResponse(quarterbackFixture));
    if (url.pathname.endsWith(`/${receiverFixture.id}`))
      return Promise.resolve(detailResponse(receiverFixture));
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });
