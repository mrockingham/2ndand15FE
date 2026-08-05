import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { teamKeys } from '@/features/teams/queryKeys';
import { userKeys } from '@/features/users/queryKeys';
import {
  apiErrorResponse,
  billsFixture,
  currentUserFixture,
  eaglesFixture,
  jsonResponse,
  userWithFavoriteFixture,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const teamListResponse = () =>
  jsonResponse({ data: [billsFixture, eaglesFixture] });

const createTeamRequestRouter = (favoriteUser = userWithFavoriteFixture) =>
  vi.fn<typeof fetch>((input, init) => {
    const url = String(input);
    if (url.endsWith('/teams')) return Promise.resolve(teamListResponse());
    if (url.endsWith('/users/me/favorite-team') && init?.method === 'PATCH') {
      return Promise.resolve(jsonResponse({ data: { user: favoriteUser } }));
    }
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });

describe('team catalog and selection', () => {
  it('shows a deliberate loading state', () => {
    const fetchImplementation = vi.fn<typeof fetch>(
      () => new Promise<Response>(() => undefined),
    );
    renderApp('/choose-team', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    expect(screen.getByLabelText('Loading teams')).toBeInTheDocument();
  });

  it('loads teams and supports full-name, abbreviation, and conference filtering', async () => {
    const user = userEvent.setup();
    renderApp('/choose-team', {
      fetchImplementation: createTeamRequestRouter(),
      restorationStatus: 'authenticated',
    });

    expect(await screen.findByText('Buffalo Bills')).toBeInTheDocument();
    expect(screen.getByText('Philadelphia Eagles')).toBeInTheDocument();

    const search = screen.getByLabelText('Search teams');
    await user.type(search, 'Philadelphia Eagles');
    expect(screen.queryByText('Buffalo Bills')).not.toBeInTheDocument();
    expect(screen.getByText('Philadelphia Eagles')).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'BUF');
    expect(screen.getByText('Buffalo Bills')).toBeInTheDocument();
    expect(screen.queryByText('Philadelphia Eagles')).not.toBeInTheDocument();

    await user.clear(search);
    await user.click(screen.getByRole('button', { name: 'NFC' }));
    expect(screen.queryByText('Buffalo Bills')).not.toBeInTheDocument();
    expect(screen.getByText('Philadelphia Eagles')).toBeInTheDocument();
  });

  it('shows empty-search and empty-catalog states', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp('/choose-team', {
      fetchImplementation: createTeamRequestRouter(),
      restorationStatus: 'authenticated',
    });
    await screen.findByText('Buffalo Bills');
    await user.type(screen.getByLabelText('Search teams'), 'no such team');
    expect(
      screen.getByRole('heading', { name: /no teams match/i }),
    ).toBeInTheDocument();
    unmount();

    renderApp('/choose-team', {
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ data: [] })),
      restorationStatus: 'authenticated',
    });
    expect(
      await screen.findByText(/no active nfl teams are available/i),
    ).toBeInTheDocument();
  });

  it('shows a catalog error and retries successfully', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        apiErrorResponse('INTERNAL_SERVER_ERROR', 'No', 500),
      )
      .mockResolvedValueOnce(
        apiErrorResponse('INTERNAL_SERVER_ERROR', 'No', 500),
      )
      .mockResolvedValueOnce(teamListResponse());
    renderApp('/choose-team', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    expect(
      await screen.findByText(
        /load the nfl team catalog/i,
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Buffalo Bills')).toBeInTheDocument();
  });

  it('selects and saves a first favorite using only the internal UUID', async () => {
    const user = userEvent.setup();
    const fetchImplementation = createTeamRequestRouter();
    const { queryClient } = renderApp('/choose-team', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    const teamOption = await screen.findByRole('radio', {
      name: 'Select Buffalo Bills',
    });
    await user.click(teamOption);
    expect(teamOption).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(
      await screen.findByRole('heading', { name: 'Buffalo Bills' }),
    ).toBeInTheDocument();
    expect(queryClient.getQueryData(userKeys.me)).toEqual(
      userWithFavoriteFixture,
    );
    const patchCall = fetchImplementation.mock.calls.find(([input]) =>
      String(input).endsWith('/users/me/favorite-team'),
    );
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({
      favoriteTeamId: billsFixture.id,
    });
  });

  it('replaces an existing favorite and updates the current-user cache', async () => {
    const user = userEvent.setup();
    const updatedUser = { ...currentUserFixture, favoriteTeam: eaglesFixture };
    const { queryClient } = renderApp(
      { pathname: '/choose-team', state: { from: '/account' } },
      {
        currentUser: userWithFavoriteFixture,
        fetchImplementation: createTeamRequestRouter(updatedUser),
        restorationStatus: 'authenticated',
      },
    );

    await user.click(
      await screen.findByRole('radio', { name: 'Select Philadelphia Eagles' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findByText('Philadelphia Eagles')).toBeInTheDocument();
    expect(queryClient.getQueryData(userKeys.me)).toEqual(updatedUser);
  });

  it('prevents duplicate submissions while a favorite update is pending', async () => {
    const user = userEvent.setup();
    let resolvePatch: ((response: Response) => void) | undefined;
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      if (String(input).endsWith('/teams'))
        return Promise.resolve(teamListResponse());
      return new Promise<Response>((resolve) => {
        resolvePatch = resolve;
      });
    });
    renderApp('/choose-team', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    await user.click(
      await screen.findByRole('radio', { name: 'Select Buffalo Bills' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('button', { name: 'Savingâ€¦' })).toBeDisabled();
    expect(
      fetchImplementation.mock.calls.filter(([input]) =>
        String(input).endsWith('/users/me/favorite-team'),
      ),
    ).toHaveLength(1);
    resolvePatch?.(jsonResponse({ data: { user: userWithFavoriteFixture } }));
  });

  it.each([
    ['TEAM_NOT_FOUND', 404, /no longer available/i],
    ['TEAM_INACTIVE', 409, /currently inactive/i],
  ])('handles %s favorite errors', async (code, status, expectedMessage) => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      if (String(input).endsWith('/teams'))
        return Promise.resolve(teamListResponse());
      return Promise.resolve(apiErrorResponse(code, 'Backend detail', status));
    });
    renderApp('/choose-team', {
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    await user.click(
      await screen.findByRole('radio', { name: 'Select Buffalo Bills' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
  });
});

describe('onboarding and personalized routes', () => {
  it('protects team selection from signed-out visitors', async () => {
    renderApp('/choose-team');
    expect(
      await screen.findByRole('heading', { name: /sign in to your huddle/i }),
    ).toBeInTheDocument();
  });

  it('allows an authenticated user to skip without a redirect loop', async () => {
    const user = userEvent.setup();
    renderApp('/choose-team', {
      fetchImplementation: createTeamRequestRouter(),
      restorationStatus: 'authenticated',
    });
    await screen.findByText('Buffalo Bills');
    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pick your team/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /choose your favorite/i }),
    ).not.toBeInTheDocument();
  });

  it('personalizes home with a favorite and preserves the signed-out landing page', () => {
    const { unmount } = renderApp('/', {
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
    });
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Buffalo Bills' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /your next kickoff/i }),
    ).toBeInTheDocument();
    unmount();

    renderApp('/');
    expect(
      screen.getByRole('heading', { name: /see the game/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create your huddle/i }),
    ).toHaveAttribute('href', '/register');
  });
});

describe('account favorite controls and identity fallback', () => {
  it('clears a favorite after confirmation and updates the cache', async () => {
    const user = userEvent.setup();
    const clearedUser = { ...currentUserFixture, favoriteTeam: null };
    const fetchImplementation = createTeamRequestRouter(clearedUser);
    const { queryClient } = renderApp('/account', {
      currentUser: userWithFavoriteFixture,
      fetchImplementation,
      restorationStatus: 'authenticated',
    });

    await user.click(
      screen.getByRole('button', { name: 'Clear favorite team' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Clear favorite team?' });
    await user.click(
      within(dialog).getByRole('button', { name: 'Clear favorite' }),
    );

    expect(
      await screen.findByText('No favorite team selected'),
    ).toBeInTheDocument();
    expect(queryClient.getQueryData(userKeys.me)).toEqual(clearedUser);
    const patchCall = fetchImplementation.mock.calls.find(([input]) =>
      String(input).endsWith('/users/me/favorite-team'),
    );
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({
      favoriteTeamId: null,
    });
  });

  it('renders an abbreviation when a logo is null or fails to load', () => {
    const { unmount } = renderApp('/account', {
      currentUser: userWithFavoriteFixture,
      restorationStatus: 'authenticated',
    });
    expect(
      screen.getAllByRole('img', { name: /buffalo bills abbreviation/i })[0],
    ).toHaveTextContent('BUF');
    unmount();

    const teamWithLogo = {
      ...billsFixture,
      logoUrl: 'https://approved-assets.example/buf.svg',
      logoSource: 'Approved provider',
    };
    renderApp('/account', {
      currentUser: { ...currentUserFixture, favoriteTeam: teamWithLogo },
      restorationStatus: 'authenticated',
    });
    const logo = screen.getAllByRole('img', { name: /buffalo bills logo/i })[0];
    fireEvent.error(logo);
    expect(
      screen.getAllByRole('img', { name: /buffalo bills abbreviation/i })[0],
    ).toHaveTextContent('BUF');
  });

  it('keeps the public team catalog in its own stable cache key', async () => {
    const { queryClient } = renderApp('/choose-team', {
      fetchImplementation: createTeamRequestRouter(),
      restorationStatus: 'authenticated',
    });
    await screen.findByText('Buffalo Bills');
    await waitFor(() =>
      expect(queryClient.getQueryData(teamKeys.lists())).toEqual([
        billsFixture,
        eaglesFixture,
      ]),
    );
  });
});
