import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SCHEDULE_COLUMNS } from '@/features/admin/scheduleCsv';
import { userKeys } from '@/features/users/queryKeys';
import { adminGameFixture, auditEventFixture } from '@/test/adminFixtures';
import {
  apiErrorResponse,
  billsFixture,
  currentUserFixture,
  eaglesFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const admin = { ...currentUserFixture, role: 'ADMIN' as const };
const listResponse = (games: readonly unknown[] = [adminGameFixture]) =>
  jsonResponse({ data: games, meta: { nextCursor: null } });

const adminRouter = (
  options: {
    list?: readonly unknown[];
    detail?: typeof adminGameFixture;
    audit?: readonly unknown[];
  } = {},
) =>
  vi.fn<typeof fetch>((input) => {
    const url = String(input);
    if (url.includes('/admin/games?'))
      return Promise.resolve(listResponse(options.list));
    if (url.endsWith(`/admin/games/${adminGameFixture.id}`))
      return Promise.resolve(
        jsonResponse({ data: options.detail ?? adminGameFixture }),
      );
    if (url.includes('/admin/audit-events'))
      return Promise.resolve(
        jsonResponse({
          data: options.audit ?? [auditEventFixture],
          meta: { nextCursor: null },
        }),
      );
    if (url.endsWith('/teams'))
      return Promise.resolve(
        jsonResponse({ data: [billsFixture, eaglesFixture] }),
      );
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });

describe('role-aware administration routes and navigation', () => {
  it('sends anonymous users through the existing login flow', async () => {
    renderApp('/admin/games');
    expect(
      await screen.findByRole('heading', { name: /sign in to your huddle/i }),
    ).toBeInTheDocument();
  });

  it('denies USER, allows EDITOR schedule routes, and restricts full audit to ADMIN', async () => {
    const user = userEvent.setup();
    const userRender = renderApp('/admin/games', {
      currentUser: currentUserFixture,
      restorationStatus: 'authenticated',
    });
    expect(
      await screen.findByRole('heading', {
        name: /choose your team. make home yours/i,
      }),
    ).toBeInTheDocument();
    userRender.unmount();

    const editorRender = renderApp('/admin/games', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter(),
    });
    expect(screen.getByRole('status')).toHaveTextContent('Loading page…');
    expect(
      await screen.findByRole('heading', { name: 'Schedule games' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('EDITOR').length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('link', { name: 'Audit log' }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'Open administration navigation',
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Close administration navigation',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', {
          name: 'Close administration navigation',
        }),
      ).not.toBeInTheDocument(),
    );
    editorRender.unmount();

    const deniedAudit = renderApp('/admin/audit', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter(),
    });
    expect(
      await screen.findByRole('heading', {
        name: /choose your team. make home yours/i,
      }),
    ).toBeInTheDocument();
    deniedAudit.unmount();

    renderApp('/admin/audit', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter(),
    });
    expect(
      await screen.findByRole('heading', { name: 'Audit log' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('GAME VERIFIED')).toBeInTheDocument();
  });

  it('shows public admin navigation only for authorized roles', () => {
    const editorRender = renderApp('/', {
      currentUser: editor,
      restorationStatus: 'authenticated',
    });
    expect(
      screen.getAllByRole('link', { name: /admin|schedule administration/i })
        .length,
    ).toBeGreaterThan(0);
    editorRender.unmount();
    renderApp('/', {
      currentUser: currentUserFixture,
      restorationStatus: 'authenticated',
    });
    expect(
      screen.queryByRole('link', { name: /admin|schedule administration/i }),
    ).not.toBeInTheDocument();
  });
});

describe('administrative games', () => {
  it('loads games and stores supported season filters in the URL', async () => {
    const user = userEvent.setup();
    const fetchImplementation = adminRouter();
    const { router } = renderApp('/admin/games', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(await screen.findByText(/PHI.*at.*BUF/i)).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Season' }));
    await user.click(screen.getByRole('option', { name: '2026' }));
    await waitFor(() =>
      expect(router.state.location.search).toBe('?season=2026'),
    );
    expect(
      fetchImplementation.mock.calls.some(([input]) =>
        String(input).includes('season=2026'),
      ),
    ).toBe(true);
  });

  it('renders empty, error, and retry states', async () => {
    const emptyRender = renderApp('/admin/games', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter({ list: [] }),
    });
    expect(
      await screen.findByRole('heading', { name: 'No games found' }),
    ).toBeInTheDocument();
    emptyRender.unmount();
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        apiErrorResponse('INTERNAL_SERVER_ERROR', 'unsafe backend detail', 500),
      )
      .mockResolvedValueOnce(
        apiErrorResponse('INTERNAL_SERVER_ERROR', 'unsafe backend detail', 500),
      )
      .mockResolvedValueOnce(
        apiErrorResponse('INTERNAL_SERVER_ERROR', 'unsafe backend detail', 500),
      )
      .mockResolvedValueOnce(listResponse());
    const user = userEvent.setup();
    renderApp('/admin/games', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByText(
        /server could not complete/i,
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('unsafe backend detail')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/PHI.*at.*BUF/i)).toBeInTheDocument();
  });

  it('refreshes the current user after a stale role receives 403', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/admin/games?'))
        return Promise.resolve(
          apiErrorResponse('ADMIN_PERMISSION_REQUIRED', 'No', 403),
        );
      if (url.endsWith('/users/me'))
        return Promise.resolve(
          jsonResponse({ data: { user: currentUserFixture } }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    const { queryClient } = renderApp('/admin/games', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    expect(
      await screen.findByText(/does not have permission/i),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(queryClient.getQueryData(userKeys.me)).toEqual(currentUserFixture),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: /choose your team. make home yours/i,
        }),
      ).toBeInTheDocument(),
    );
  });

  it('shows resolved/base/provenance/audit detail and admin-only override deletion', async () => {
    const overridden = {
      ...adminGameFixture,
      override: {
        startTime: null,
        status: 'SCHEDULED' as const,
        week: 2,
        venueName: null,
        venueCity: null,
        broadcastNetwork: null,
        isNeutralSite: null,
        publicCorrectionNote: 'Kickoff confirmed.',
        internalNote: 'Editor review.',
        createdBySnapshot: 'editor@example.com',
        updatedBySnapshot: 'editor@example.com',
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-01T11:00:00Z',
      },
    };
    const editorRender = renderApp(`/admin/games/${adminGameFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter({ detail: overridden }),
    });
    expect(
      await screen.findByRole('heading', { name: 'Resolved values' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Base values' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Checked against the published schedule.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete override' }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('GAME VERIFIED')).toBeInTheDocument();
    editorRender.unmount();
    renderApp(`/admin/games/${adminGameFixture.id}`, {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter({ detail: overridden }),
    });
    expect(
      await screen.findByRole('button', { name: 'Delete override' }),
    ).toBeInTheDocument();
  });

  it('keeps an imported null kickoff visible and optional during eligible base edits', async () => {
    const tbdGame = {
      ...adminGameFixture,
      providerManaged: false,
      resolved: { ...adminGameFixture.resolved, startTime: null },
      base: { ...adminGameFixture.base, startTime: null },
      provenance: {
        ...adminGameFixture.provenance!,
        sourceType: 'OFFICIAL_WEB',
      },
    };
    renderApp(`/admin/games/${adminGameFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: adminRouter({ detail: tbdGame }),
    });
    expect((await screen.findAllByText('Time TBD')).length).toBeGreaterThan(1);
    expect(
      screen.getByText('Leave blank to preserve Time TBD.'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Kickoff local date and time'),
    ).not.toBeRequired();
  });

  it('prevents same-team creation and submits kickoff with the explicitly chosen offset', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/teams'))
        return Promise.resolve(
          jsonResponse({ data: [billsFixture, eaglesFixture] }),
        );
      if (url.endsWith('/admin/games') && init?.method === 'POST')
        return Promise.resolve(jsonResponse({ data: adminGameFixture }, 201));
      if (url.endsWith(`/admin/games/${adminGameFixture.id}`))
        return Promise.resolve(jsonResponse({ data: adminGameFixture }));
      if (url.includes('/admin/audit-events'))
        return Promise.resolve(
          jsonResponse({ data: [], meta: { nextCursor: null } }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/admin/games/new', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Away team' }),
      ).not.toHaveAttribute('aria-disabled', 'true'),
    );
    fireEvent.change(screen.getByLabelText(/Kickoff local date and time/), {
      target: { value: '2026-09-10T20:20' },
    });
    await user.click(
      screen.getByRole('combobox', { name: 'Kickoff UTC offset' }),
    );
    await user.click(screen.getByRole('option', { name: 'UTC -04:00' }));
    await user.click(screen.getByRole('combobox', { name: 'Away team' }));
    await user.click(screen.getByRole('option', { name: /Buffalo Bills/ }));
    await user.click(screen.getByRole('combobox', { name: 'Home team' }));
    await user.click(screen.getByRole('option', { name: /Buffalo Bills/ }));
    await user.type(screen.getByLabelText(/Source name/), 'Manual review');
    await user.click(screen.getByRole('button', { name: 'Create game' }));
    expect(
      await screen.findByText(/Home and away teams must differ/i),
    ).toBeInTheDocument();
    expect(
      fetchImplementation.mock.calls.some(
        ([, init]) => init?.method === 'POST',
      ),
    ).toBe(false);
    await user.click(screen.getByRole('combobox', { name: 'Away team' }));
    await user.click(
      screen.getByRole('option', { name: /Philadelphia Eagles/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Create game' }));
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([, init]) => init?.method === 'POST',
        ),
      ).toBe(true),
    );
    const post = fetchImplementation.mock.calls.find(
      ([, init]) => init?.method === 'POST',
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual(
      expect.objectContaining({
        startTime: '2026-09-11T00:20:00.000Z',
        awayTeamId: eaglesFixture.id,
        homeTeamId: billsFixture.id,
      }),
    );
  });

  it('saves and clears individual overrides, then requires admin confirmation to delete', async () => {
    const user = userEvent.setup();
    const overridden = {
      ...adminGameFixture,
      override: {
        startTime: null,
        status: null,
        week: 2,
        venueName: 'Temporary venue',
        venueCity: null,
        broadcastNetwork: null,
        isNeutralSite: null,
        publicCorrectionNote: null,
        internalNote: null,
        createdBySnapshot: admin.email,
        updatedBySnapshot: admin.email,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-01T11:00:00Z',
      },
    };
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith(`/admin/games/${adminGameFixture.id}`))
        return Promise.resolve(jsonResponse({ data: overridden }));
      if (url.includes('/admin/audit-events'))
        return Promise.resolve(
          jsonResponse({ data: [], meta: { nextCursor: null } }),
        );
      if (url.endsWith('/override') && init?.method === 'PUT')
        return Promise.resolve(jsonResponse({ data: overridden }));
      if (url.endsWith('/override') && init?.method === 'DELETE')
        return Promise.resolve(jsonResponse({ data: adminGameFixture }));
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp(`/admin/games/${adminGameFixture.id}`, {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    const venue = await screen.findByLabelText('Venue name override');
    await user.clear(venue);
    await user.click(screen.getByRole('button', { name: 'Save override' }));
    const put = await waitFor(() =>
      fetchImplementation.mock.calls.find(([, init]) => init?.method === 'PUT'),
    );
    expect(JSON.parse(String(put?.[1]?.body))).toEqual(
      expect.objectContaining({ venueName: null, week: 2 }),
    );
    await user.click(screen.getByRole('button', { name: 'Delete override' }));
    expect(
      fetchImplementation.mock.calls.some(
        ([, init]) => init?.method === 'DELETE',
      ),
    ).toBe(false);
    const dialog = screen.getByRole('dialog', {
      name: 'Delete editorial override?',
    });
    await user.click(
      within(dialog).getByRole('button', { name: 'Delete override' }),
    );
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([, init]) => init?.method === 'DELETE',
        ),
      ).toBe(true),
    );
  });

  it('confirms verification when no source URL is supplied', async () => {
    const user = userEvent.setup();
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith(`/admin/games/${adminGameFixture.id}`))
        return Promise.resolve(jsonResponse({ data: adminGameFixture }));
      if (url.includes('/admin/audit-events'))
        return Promise.resolve(
          jsonResponse({ data: [], meta: { nextCursor: null } }),
        );
      if (url.endsWith('/verification') && init?.method === 'PUT')
        return Promise.resolve(jsonResponse({ data: adminGameFixture }));
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp(`/admin/games/${adminGameFixture.id}`, {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    const sourceUrl = await screen.findByLabelText('Verification source URL');
    await user.clear(sourceUrl);
    await user.click(screen.getByRole('button', { name: 'Mark verified' }));
    expect(
      fetchImplementation.mock.calls.some(([, init]) => init?.method === 'PUT'),
    ).toBe(false);
    const dialog = screen.getByRole('dialog', {
      name: 'Verify without a source URL?',
    });
    await user.click(
      within(dialog).getByRole('button', { name: 'Verify anyway' }),
    );
    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(
          ([, init]) => init?.method === 'PUT',
        ),
      ).toBe(true),
    );
  });
});

describe('schedule import workflow', () => {
  const csv = `${SCHEDULE_COLUMNS.join(',')}\n2026,REG,1,2026-09-11T00:20:00Z,PHI,BUF,SCHEDULED,Highmark Stadium,Orchard Park,NBC,false,Official,OFFICIAL_WEB,https://example.com,ref-1,Checked`;
  it('invalidates validation when content changes and confirms the final write', async () => {
    const user = userEvent.setup();
    const result = {
      received: 1,
      created: 1,
      updated: 0,
      skipped: 0,
      warnings: 0,
      failed: 0,
      failures: [],
    };
    const fetchImplementation = vi.fn<typeof fetch>((input) =>
      Promise.resolve(
        jsonResponse({
          data: { ...result, dryRun: String(input).endsWith('/validate') },
        }),
      ),
    );
    renderApp('/admin/import', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    const input = await screen.findByLabelText('Schedule CSV');
    fireEvent.change(input, { target: { value: csv } });
    await user.click(
      screen.getByRole('button', { name: 'Validate without writing' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Validation result' }),
    ).toBeInTheDocument();
    const writeButton = screen.getByRole('button', {
      name: 'Write validated schedule',
    });
    expect(writeButton).toBeEnabled();
    fireEvent.change(input, { target: { value: `${csv} ` } });
    expect(
      screen.queryByRole('heading', { name: 'Validation result' }),
    ).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: csv } });
    await user.click(
      screen.getByRole('button', { name: 'Validate without writing' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Write validated schedule' }),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Write validated schedule?',
    });
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm import' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Final import result' }),
    ).toBeInTheDocument();
  });
});
