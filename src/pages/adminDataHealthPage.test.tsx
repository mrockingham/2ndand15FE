import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  dataHealthGameDetailFixture,
  dataHealthGameListRowsFixture,
  dataHealthMissingIngestionGameFixture,
  dataHealthPartialPlayerStatsGameFixture,
  dataHealthProbeRecordFixture,
  dataHealthProbeResultFixture,
  dataHealthProviderUnavailableGameFixture,
  dataHealthSummaryFixture,
} from '@/test/dataHealthFixtures';
import {
  billsFixture,
  currentUserFixture,
  eaglesFixture,
  jsonResponse,
} from '@/test/authFixtures';
import { renderApp } from '@/test/renderApp';

const editor = { ...currentUserFixture, role: 'EDITOR' as const };
const admin = { ...currentUserFixture, role: 'ADMIN' as const };

const listResponse = (rows = dataHealthGameListRowsFixture) =>
  jsonResponse({
    data: rows,
    summary: dataHealthSummaryFixture,
    meta: { nextCursor: null },
  });

interface RouterOptions {
  readonly rows?: typeof dataHealthGameListRowsFixture;
  readonly detail?: typeof dataHealthGameDetailFixture;
  readonly probes?: readonly (typeof dataHealthProbeRecordFixture)[];
  readonly probeResponse?: Response;
  readonly probeCounter?: { count: number };
}

const dataHealthRouter = (options: RouterOptions = {}) =>
  vi.fn<typeof fetch>((input, init) => {
    const url = String(input);
    if (url.includes('/admin/data-health/games?')) {
      return Promise.resolve(listResponse(options.rows));
    }
    if (url.endsWith('/probes')) {
      return Promise.resolve(jsonResponse({ data: options.probes ?? [] }));
    }
    if (init?.method === 'POST' && url.endsWith('/probe')) {
      if (options.probeCounter) options.probeCounter.count += 1;
      return Promise.resolve(
        options.probeResponse ??
          jsonResponse({ data: dataHealthProbeResultFixture }),
      );
    }
    if (url.includes('/admin/data-health/games/')) {
      return Promise.resolve(
        jsonResponse({ data: options.detail ?? dataHealthGameDetailFixture }),
      );
    }
    if (url.endsWith('/teams')) {
      return Promise.resolve(
        jsonResponse({ data: [billsFixture, eaglesFixture] }),
      );
    }
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });

describe('Admin Data Health', () => {
  it('denies a signed-in USER', async () => {
    const deniedRender = renderApp('/admin/data-health', {
      currentUser: { ...currentUserFixture, role: 'USER' },
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    await waitFor(() =>
      expect(deniedRender.router.state.location.pathname).toBe('/'),
    );
  });

  it('allows an EDITOR to view the overview', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    expect(
      await screen.findByRole('heading', { name: 'Data Health' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('table', { name: 'Game data health' }),
    ).toBeInTheDocument();
  });

  it('shows the backend-authoritative summary numbers and a page-scoped partial breakdown', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    expect(
      await screen.findByText(
        `${dataHealthSummaryFixture.playerStatsComplete} complete · ${dataHealthSummaryFixture.playerStatsMissing} missing`,
      ),
    ).toBeInTheDocument();
  });

  it('opens the review drawer via the URL, does not call the probe endpoint on open, and closes cleanly', async () => {
    const probeCounter = { count: 0 };
    const user = userEvent.setup();
    renderApp('/admin/data-health', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter({ probeCounter }),
    });
    await screen.findByRole('heading', { name: 'Data Health' });

    const reviewButtons = await screen.findAllByRole('button', {
      name: 'Review',
    });
    await user.click(reviewButtons[0]!);

    expect(
      await screen.findByRole('button', { name: 'Check Highlightly' }),
    ).toBeInTheDocument();
    expect(probeCounter.count).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Check Highlightly' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('gates the probe action to ADMIN and disables it for EDITOR', async () => {
    const user = userEvent.setup();
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    const reviewButtons = await screen.findAllByRole('button', {
      name: 'Review',
    });
    await user.click(reviewButtons[0]!);

    const probeButton = await screen.findByRole('button', {
      name: 'Check Highlightly',
    });
    expect(probeButton).toBeDisabled();
    expect(
      screen.getByText('Admin role required to run a Highlightly check.'),
    ).toBeInTheDocument();
  });

  it('runs a probe for ADMIN and shows the fresh explanation text and quota', async () => {
    const user = userEvent.setup();
    renderApp('/admin/data-health', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    const reviewButtons = await screen.findAllByRole('button', {
      name: 'Review',
    });
    await user.click(reviewButtons[0]!);

    const probeButton = await screen.findByRole('button', {
      name: 'Check Highlightly',
    });
    expect(probeButton).not.toBeDisabled();
    await user.click(probeButton);

    expect(
      await screen.findByText(
        dataHealthProbeResultFixture.playerStats.explanation,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('6,810 / 7,500 remaining')).toBeInTheDocument();
  });

  it('keeps existing detail data visible and shows a scoped error when a probe fails', async () => {
    const user = userEvent.setup();
    renderApp('/admin/data-health', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter({
        probeResponse: jsonResponse(
          { error: { code: 'INVALID_RESPONSE', message: 'bad' } },
          502,
        ),
      }),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    const reviewButtons = await screen.findAllByRole('button', {
      name: 'Review',
    });
    await user.click(reviewButtons[0]!);
    await screen.findByRole('button', { name: 'Check Highlightly' });

    await user.click(screen.getByRole('button', { name: 'Check Highlightly' }));

    expect(
      await screen.findByText(/Provider check failed/),
    ).toBeInTheDocument();
    // The already-loaded detail sections are still present, not blanked.
    expect(screen.getByText('Editorial fallback')).toBeInTheDocument();
    expect(screen.getByText('Home / Away rows')).toBeInTheDocument();
  });

  it('renders a substantial-partial player-stats game without treating it as missing ingestion', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter({
        rows: [dataHealthPartialPlayerStatsGameFixture],
      }),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    expect((await screen.findAllByText('Partial')).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/unresolved identities/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/missing ingestion/i)).not.toBeInTheDocument();
  });

  it('renders a provider-unavailable game distinctly from a backend failure', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter({
        rows: [dataHealthProviderUnavailableGameFixture],
      }),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    expect((await screen.findAllByText('Unavailable')).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText(/missing ingestion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend failure/i)).not.toBeInTheDocument();
  });

  it('never renders raw provider identifiers or backend enum codes for a diagnosis', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter({
        rows: [dataHealthMissingIngestionGameFixture],
      }),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    expect(
      screen.queryByText('PROVIDER_HAS_PLAYER_STATS_DB_MISSING'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/highlightlyapikey/i)).not.toBeInTheDocument();
  });

  it('Refresh Database Status only refetches the games list, never the probe endpoint', async () => {
    const probeCounter = { count: 0 };
    const user = userEvent.setup();
    const fetchImplementation = dataHealthRouter({ probeCounter });
    renderApp('/admin/data-health', {
      currentUser: admin,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    const callsBefore = fetchImplementation.mock.calls.length;

    await user.click(
      screen.getByRole('button', { name: 'Refresh Database Status' }),
    );

    await waitFor(() =>
      expect(fetchImplementation.mock.calls.length).toBeGreaterThan(
        callsBefore,
      ),
    );
    expect(probeCounter.count).toBe(0);
    const calledUrls = fetchImplementation.mock.calls.map((call) =>
      String(call[0]),
    );
    expect(calledUrls.some((url) => url.endsWith('/probe'))).toBe(false);
  });

  it('applies the Only Problems toggle as an issuesOnly request parameter', async () => {
    const user = userEvent.setup();
    const fetchImplementation = dataHealthRouter();
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation,
    });
    await screen.findByRole('heading', { name: 'Data Health' });

    await user.click(screen.getByRole('switch', { name: 'Only Problems' }));

    await waitFor(() => {
      const calledUrls = fetchImplementation.mock.calls.map((call) =>
        String(call[0]),
      );
      expect(calledUrls.some((url) => url.includes('issuesOnly=true'))).toBe(
        true,
      );
    });
  });

  it('renders mobile stacked cards alongside the desktop table', async () => {
    renderApp('/admin/data-health', {
      currentUser: editor,
      restorationStatus: 'authenticated',
      fetchImplementation: dataHealthRouter(),
    });
    await screen.findByRole('heading', { name: 'Data Health' });
    const reviewButtons = await screen.findAllByRole('button', {
      name: 'Review',
    });
    expect(reviewButtons.length).toBe(dataHealthGameListRowsFixture.length * 2);
  });
});
