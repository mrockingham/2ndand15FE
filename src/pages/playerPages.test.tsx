import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  Player,
  PlayerSeasonStat,
  PlayerSummaryType,
} from '@/features/players/types';
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

const listResponse = (
  data: readonly unknown[],
  nextCursor: string | null = null,
) =>
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
    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('left')).toBe(quarterbackFixture.id);
      expect(search.get('right')).toBe(receiverFixture.id);
      expect(search.get('season')).toBe('2025');
      expect(search.get('type')).toBe('REG_POST');
    });
  });

  it.each([
    ['REG', 'Regular season'],
    ['POST', 'Postseason'],
  ] as const)(
    'uses the shared %s summary when it is the only equivalent type',
    async (type, label) => {
      const fetchImplementation = comparisonFetch({
        seasons: {
          [quarterbackFixture.id]: [summary(quarterbackSeasonFixture, type)],
          [receiverFixture.id]: [summary(receiverSeasonFixture, type)],
        },
      });
      const { router } = renderApp(comparisonRoute(), {
        fetchImplementation,
      });

      expect(
        await screen.findByRole('heading', { name: '2025 comparison' }),
      ).toBeInTheDocument();
      expect(document.body).toHaveTextContent(label);
      expect(
        screen.queryByRole('combobox', { name: 'Summary type' }),
      ).not.toBeInTheDocument();
      await waitFor(() =>
        expect(
          new URLSearchParams(router.state.location.search).get('type'),
        ).toBe(type),
      );
    },
  );

  it('does not compare REG_POST against a REG fallback', async () => {
    const fetchImplementation = comparisonFetch({
      seasons: {
        [quarterbackFixture.id]: [
          summary(quarterbackSeasonFixture, 'REG_POST'),
        ],
        [receiverFixture.id]: [summary(receiverSeasonFixture, 'REG')],
      },
    });
    const { router } = renderApp(`${comparisonRoute()}&type=REG_POST`, {
      fetchImplementation,
    });

    expect(
      await screen.findByText(
        /do not share a directly equivalent summary type/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).has('type'),
      ).toBe(false),
    );
  });

  it('shows the equivalent-summary message for a shared season with no shared type', async () => {
    const fetchImplementation = comparisonFetch({
      seasons: {
        [quarterbackFixture.id]: [summary(quarterbackSeasonFixture, 'REG')],
        [receiverFixture.id]: [summary(receiverSeasonFixture, 'POST')],
      },
    });
    renderApp(comparisonRoute(), { fetchImplementation });

    expect(
      await screen.findByText(/comparison is not available for this season/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('offers multiple shared types and keeps the selected type in the URL', async () => {
    const sharedRows = sharedTypeRows();
    const fetchImplementation = comparisonFetch({ seasons: sharedRows });
    const { router } = renderApp(comparisonRoute(), { fetchImplementation });

    expect(
      await screen.findByRole('heading', { name: '2025 comparison' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).get('type'),
      ).toBe('REG_POST'),
    );
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Summary type' }),
    );
    await userEvent.click(
      screen.getByRole('option', { name: 'Regular season' }),
    );
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).get('type'),
      ).toBe('REG'),
    );
  });

  it('replaces an invalid URL summary type with the preferred shared type', async () => {
    const fetchImplementation = comparisonFetch({ seasons: sharedTypeRows() });
    const { router } = renderApp(`${comparisonRoute()}&type=UNKNOWN`, {
      fetchImplementation,
    });

    await screen.findByRole('heading', { name: '2025 comparison' });
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).get('type'),
      ).toBe('REG_POST'),
    );
  });

  it('revalidates the type when a selected player changes', async () => {
    const thirdPlayer: Player = {
      ...receiverFixture,
      id: '77777777-7777-4777-8777-777777777777',
      displayName: 'Casey Runner',
      position: 'RB',
      positionGroup: 'RB',
    };
    const fetchImplementation = comparisonFetch({
      players: [quarterbackFixture, receiverFixture, thirdPlayer],
      seasons: {
        ...sharedTypeRows(),
        [thirdPlayer.id]: [summary(receiverSeasonFixture, 'REG')],
      },
    });
    const { router } = renderApp(`${comparisonRoute()}&type=POST`, {
      fetchImplementation,
    });
    await screen.findByRole('heading', { name: '2025 comparison' });

    await act(() =>
      router.navigate(
        `/players/compare?left=${quarterbackFixture.id}&right=${thirdPlayer.id}&season=2025&type=POST`,
      ),
    );
    expect(await screen.findAllByText('Casey Runner')).not.toHaveLength(0);
    await waitFor(() =>
      expect(
        new URLSearchParams(router.state.location.search).get('type'),
      ).toBe('REG'),
    );
  });

  it('resets and revalidates the type when the season changes', async () => {
    const fetchImplementation = comparisonFetch({
      seasons: {
        [quarterbackFixture.id]: [
          ...sharedTypeRows()[quarterbackFixture.id],
          summary(quarterbackSeasonFixture, 'REG', 2024),
        ],
        [receiverFixture.id]: [
          ...sharedTypeRows()[receiverFixture.id],
          summary(receiverSeasonFixture, 'REG', 2024),
        ],
      },
    });
    const { router } = renderApp(`${comparisonRoute()}&type=POST`, {
      fetchImplementation,
    });
    await screen.findByRole('heading', { name: '2025 comparison' });

    await userEvent.click(
      screen.getByRole('combobox', { name: 'Comparison season' }),
    );
    await userEvent.click(screen.getByRole('option', { name: '2024' }));
    expect(
      await screen.findByRole('heading', { name: '2024 comparison' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      const search = new URLSearchParams(router.state.location.search);
      expect(search.get('season')).toBe('2024');
      expect(search.get('type')).toBe('REG');
    });
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

interface ComparisonFetchOptions {
  readonly players?: readonly Player[];
  readonly seasons?: Readonly<Record<string, readonly PlayerSeasonStat[]>>;
}

const comparisonFetch = (options: ComparisonFetchOptions = {}) => {
  const players = options.players ?? [quarterbackFixture, receiverFixture];
  const seasons = options.seasons ?? {
    [quarterbackFixture.id]: [quarterbackSeasonFixture],
    [receiverFixture.id]: [receiverSeasonFixture],
  };
  return vi.fn<typeof fetch>((input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/players')) {
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';
      return Promise.resolve(
        listResponse(
          players.filter((player) =>
            player.displayName.toLowerCase().includes(search),
          ),
        ),
      );
    }
    const segments = url.pathname.split('/');
    if (url.pathname.endsWith('/seasons')) {
      const playerId = segments.at(-2) ?? '';
      return Promise.resolve(detailResponse(seasons[playerId] ?? []));
    }
    const playerId = segments.at(-1) ?? '';
    const player = players.find((candidate) => candidate.id === playerId);
    if (player) return Promise.resolve(detailResponse(player));
    return Promise.reject(new TypeError(`Unexpected request: ${url.pathname}`));
  });
};

const comparisonRoute = () =>
  `/players/compare?left=${quarterbackFixture.id}&right=${receiverFixture.id}&season=2025`;

const summary = (
  base: PlayerSeasonStat,
  summaryType: PlayerSummaryType,
  season = 2025,
): PlayerSeasonStat => ({ ...base, season, summaryType });

const sharedTypeRows = (): Readonly<
  Record<string, readonly PlayerSeasonStat[]>
> => ({
  [quarterbackFixture.id]: [
    summary(quarterbackSeasonFixture, 'REG_POST'),
    summary(quarterbackSeasonFixture, 'REG'),
    summary(quarterbackSeasonFixture, 'POST'),
  ],
  [receiverFixture.id]: [
    summary(receiverSeasonFixture, 'REG_POST'),
    summary(receiverSeasonFixture, 'REG'),
    summary(receiverSeasonFixture, 'POST'),
  ],
});
