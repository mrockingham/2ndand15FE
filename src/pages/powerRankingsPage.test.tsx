import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { jsonResponse } from '@/test/authFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import {
  powerRankingEditionSummaryFixture,
  powerRankingEntryFixtures,
  powerRankingsDataFixture,
} from '@/test/powerRankingsFixtures';
import { renderApp } from '@/test/renderApp';
import type { PowerRankingEditionSummary } from '@/features/powerRankings/types';

// Top5Feature only shows the mascot (e.g. "Eagles") as the linked team name
// in its light panel -- the city (e.g. "Philadelphia") is rendered
// separately over the banner photo -- since a team's full `name` is always
// "<City> <Mascot>".
const mascotOf = (name: string) => name.trim().split(/\s+/).pop()!;

// Top5Feature reads each featured team's banner from the same public Team
// Hub overview endpoint the real Team Hub page uses, so every render of the
// page triggers a handful of `/teams/:id/hub` requests -- stub them out with
// a minimal overview shape (only `homepage.banner` matters to the card).
const teamHubResponse = (imageUrl: string | null = null) =>
  jsonResponse({
    data: {
      team: {},
      schedule: { season: 2026, upcoming: [], recent: [] },
      news: { articles: [] },
      homepage: {
        banner: { imageUrl, focalX: 50, focalY: 50, overlayOpacity: 35 },
        editorial: { featuredItem: null, supportingItems: [] },
        highlights: [],
      },
      historicalData: {
        defaultSeason: null,
        rosterSeasons: [],
        statSeasons: [],
        positions: [],
        positionGroups: [],
        coverageNotes: [],
      },
    },
    meta: { attribution: playerAttributionFixture },
  });

const buildRouter = ({
  rankings = powerRankingEntryFixtures,
  editions = [powerRankingEditionSummaryFixture],
  rankingsStatus,
}: {
  readonly rankings?: typeof powerRankingEntryFixtures;
  readonly editions?: readonly PowerRankingEditionSummary[];
  readonly rankingsStatus?: number;
} = {}) =>
  vi.fn<typeof fetch>((input) => {
    const url = String(input);
    if (/\/teams\/[^/]+\/hub$/.test(url))
      return Promise.resolve(teamHubResponse());
    if (url.includes('/power-rankings/editions'))
      return Promise.resolve(jsonResponse({ data: editions }));
    if (url.includes('/power-rankings')) {
      if (rankingsStatus)
        return Promise.resolve(
          jsonResponse(
            { error: { code: 'NOT_FOUND', message: 'not found' } },
            rankingsStatus,
          ),
        );
      return Promise.resolve(
        jsonResponse({
          data: { edition: powerRankingsDataFixture.edition, rankings },
        }),
      );
    }
    return Promise.reject(new TypeError(`Unexpected request: ${url}`));
  });

describe('PowerRankingsPage', () => {
  it('renders the edition header, Top 5 feature, and all 32 rankings', async () => {
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });

    expect(
      await screen.findByRole('heading', { name: '2026 NFL Power Rankings' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2nd & 15 Preseason Edition')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is independent 2nd & 15 editorial analysis, not an official NFL ranking.',
      ),
    ).toBeInTheDocument();

    // Top 5 feature: rank 1 mascot rendered as a Team Hub link, city
    // rendered separately over the banner photo.
    const topTeam = powerRankingEntryFixtures[0]!.team;
    expect(
      screen.getByRole('link', { name: mascotOf(topTeam.name) }),
    ).toBeInTheDocument();

    // Ranks 6-32 render as rows (27 rows).
    for (const entry of powerRankingEntryFixtures.slice(5)) {
      expect(screen.getByText(entry.team.name)).toBeInTheDocument();
    }

    // All 32 teams appear somewhere in the page (Top 5 splits city/mascot).
    for (const entry of powerRankingEntryFixtures.slice(5)) {
      expect(screen.getAllByText(entry.team.name).length).toBeGreaterThan(0);
    }
    for (const entry of powerRankingEntryFixtures.slice(0, 5)) {
      expect(
        screen.getAllByText(mascotOf(entry.team.name)).length,
      ).toBeGreaterThan(0);
    }
  });

  it('shows full editorial content for all of ranks 1-5 without expanding', async () => {
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    for (const entry of powerRankingEntryFixtures.slice(0, 5)) {
      expect(
        screen.getByRole('link', { name: mascotOf(entry.team.name) }),
      ).toBeInTheDocument();
      expect(screen.getByText(entry.headline)).toBeInTheDocument();
      expect(screen.getByText(entry.summary)).toBeInTheDocument();
      expect(screen.getByText(entry.strengths[0]!)).toBeInTheDocument();
      expect(screen.getByText(entry.concerns[0]!)).toBeInTheDocument();
    }
  });

  it('renders a team banner image as the Top 5 card background when available', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (/\/teams\/[^/]+\/hub$/.test(url))
        return Promise.resolve(
          teamHubResponse('https://res.cloudinary.com/example/banner.jpg'),
        );
      if (url.includes('/power-rankings/editions'))
        return Promise.resolve(
          jsonResponse({ data: [powerRankingEditionSummaryFixture] }),
        );
      if (url.includes('/power-rankings'))
        return Promise.resolve(
          jsonResponse({
            data: {
              edition: powerRankingsDataFixture.edition,
              rankings: powerRankingEntryFixtures,
            },
          }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const topTeam = powerRankingEntryFixtures[0]!.team;
    const card = screen
      .getByRole('link', { name: mascotOf(topTeam.name) })
      .closest('.MuiPaper-root') as HTMLElement;
    await waitFor(() =>
      expect(
        card.querySelector(
          'img[src="https://res.cloudinary.com/example/banner.jpg"]',
        ),
      ).not.toBeNull(),
    );
  });

  it('falls back to the team-color treatment when a banner image fails to load', async () => {
    const fetchImplementation = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (/\/teams\/[^/]+\/hub$/.test(url))
        return Promise.resolve(
          teamHubResponse('https://res.cloudinary.com/example/broken.jpg'),
        );
      if (url.includes('/power-rankings/editions'))
        return Promise.resolve(
          jsonResponse({ data: [powerRankingEditionSummaryFixture] }),
        );
      if (url.includes('/power-rankings'))
        return Promise.resolve(
          jsonResponse({
            data: {
              edition: powerRankingsDataFixture.edition,
              rankings: powerRankingEntryFixtures,
            },
          }),
        );
      return Promise.reject(new TypeError(`Unexpected request: ${url}`));
    });
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const topTeam = powerRankingEntryFixtures[0]!.team;
    const card = screen
      .getByRole('link', { name: mascotOf(topTeam.name) })
      .closest('.MuiPaper-root') as HTMLElement;
    const image = await waitFor(() => {
      const found = card.querySelector(
        'img[src="https://res.cloudinary.com/example/broken.jpg"]',
      );
      if (!found) throw new Error('banner image not rendered yet');
      return found as HTMLElement;
    });
    fireEvent.error(image);

    await waitFor(() =>
      expect(
        card.querySelector(
          'img[src="https://res.cloudinary.com/example/broken.jpg"]',
        ),
      ).toBeNull(),
    );
  });

  it('links each team to its Team Hub page', async () => {
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const topTeam = powerRankingEntryFixtures[0]!.team;
    const link = screen.getByRole('link', { name: mascotOf(topTeam.name) });
    expect(link).toHaveAttribute('href', `/teams/${topTeam.id}`);
  });

  it('shows NEW for an entry with no previous rank and a delta otherwise', async () => {
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    expect(screen.getAllByText('NEW').length).toBeGreaterThan(0);
    expect(screen.getAllByText('▲ 1').length).toBeGreaterThan(0);
  });

  it('expands a ranking row to reveal summary, strengths, and concerns', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const sixthEntry = powerRankingEntryFixtures[5]!;
    const summaryText = sixthEntry.summary;
    expect(screen.queryByText(summaryText)).not.toBeInTheDocument();

    const rowButton = screen.getByRole('button', {
      name: new RegExp(sixthEntry.team.name),
    });
    await user.click(rowButton);

    expect(await screen.findByText(summaryText)).toBeInTheDocument();
    expect(screen.getByText(sixthEntry.strengths[0]!)).toBeInTheDocument();
    expect(screen.getByText(sixthEntry.concerns[0]!)).toBeInTheDocument();

    await user.click(rowButton);
    await waitFor(() =>
      expect(screen.queryByText(summaryText)).not.toBeInTheDocument(),
    );
  });

  it('filters by search text without renumbering ranks', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const target = powerRankingEntryFixtures[10]!;
    const searchField = screen.getByLabelText('Search teams or headlines');
    await user.type(searchField, target.team.name);

    await waitFor(() => {
      expect(screen.getByText(target.team.name)).toBeInTheDocument();
      expect(screen.getByText(String(target.rank))).toBeInTheDocument();
    });
    const otherEntry = powerRankingEntryFixtures[15]!;
    expect(screen.queryByText(otherEntry.team.name)).not.toBeInTheDocument();
  });

  it('filters by conference', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    await user.click(screen.getByLabelText('Conference'));
    await user.click(await screen.findByRole('option', { name: 'NFC' }));

    await waitFor(() => {
      const afcEntry = powerRankingEntryFixtures
        .slice(5)
        .find((entry) => entry.team.conference === 'AFC');
      if (afcEntry)
        expect(screen.queryByText(afcEntry.team.name)).not.toBeInTheDocument();
    });
  });

  it('filters by division', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    await user.click(screen.getByLabelText('Division'));
    await user.click(await screen.findByRole('option', { name: 'North' }));

    await waitFor(() => {
      const southEntry = powerRankingEntryFixtures
        .slice(5)
        .find((entry) => entry.team.division === 'South');
      if (southEntry)
        expect(
          screen.queryByText(southEntry.team.name),
        ).not.toBeInTheDocument();
    });
  });

  it('filters by tier while preserving the original rank number', async () => {
    const user = userEvent.setup();
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    await user.click(screen.getByLabelText('Tier'));
    await user.click(await screen.findByRole('option', { name: 'Long shots' }));

    const lastEntry = powerRankingEntryFixtures[31]!;
    await waitFor(() => {
      expect(screen.getByText(lastEntry.team.name)).toBeInTheDocument();
      expect(screen.getByText(String(lastEntry.rank))).toBeInTheDocument();
    });
  });

  it('renders methodology text and sources', async () => {
    const fetchImplementation = buildRouter();
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: 'Methodology' });

    expect(
      screen.getByText(powerRankingsDataFixture.edition.methodology),
    ).toBeInTheDocument();
    expect(
      screen.getByText(powerRankingsDataFixture.edition.sources[0]!),
    ).toBeInTheDocument();
  });

  it('shows an empty state when the edition has no rankings', async () => {
    const fetchImplementation = buildRouter({ rankings: [] });
    renderApp('/power-rankings', { fetchImplementation });

    expect(
      await screen.findByText('No rankings yet for this edition'),
    ).toBeInTheDocument();
  });

  it('shows a not-published empty state on 404', async () => {
    const fetchImplementation = buildRouter({ rankingsStatus: 404 });
    renderApp('/power-rankings', { fetchImplementation });

    expect(
      await screen.findByText("Power Rankings aren't published yet."),
    ).toBeInTheDocument();
  });

  it('shows an error alert with retry on a server error', async () => {
    const fetchImplementation = buildRouter({ rankingsStatus: 500 });
    renderApp('/power-rankings', { fetchImplementation });

    expect(
      await screen.findByRole('button', { name: 'Retry' }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('shows an edition selector and switches editions when more than one is published', async () => {
    const user = userEvent.setup();
    const secondEdition = {
      ...powerRankingEditionSummaryFixture,
      id: 'edition-2026-week-1',
      title: 'Week 1 Power Rankings',
      edition: 'week-1',
    };
    const fetchImplementation = buildRouter({
      editions: [powerRankingEditionSummaryFixture, secondEdition],
    });
    renderApp('/power-rankings', { fetchImplementation });
    await screen.findByRole('heading', { name: '2026 NFL Power Rankings' });

    const select = screen.getByLabelText('Edition');
    await user.click(select);
    const option = await within(document.body).findByRole('option', {
      name: new RegExp('Week 1 Power Rankings'),
    });
    await user.click(option);

    await waitFor(() =>
      expect(
        fetchImplementation.mock.calls.some(([reqInput]) =>
          String(reqInput).includes('edition=week-1'),
        ),
      ).toBe(true),
    );
  });
});
