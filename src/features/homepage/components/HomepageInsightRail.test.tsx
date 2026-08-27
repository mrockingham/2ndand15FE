import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { HomepageInsightRail } from '@/features/homepage/components/HomepageInsightRail';
import { homepageInsightRailModuleCount } from '@/features/homepage/presentation';
import {
  aiHubSnapshotFixture,
  emptyHomepageInsightsFixture,
  homepageInsightsFixture,
  leadersFixture,
  weeklyLeadersFixture,
} from '@/test/homepageFixtures';
import type { HomepageLeaders } from '@/features/homepage/types';

const emptyLeadersFixture: HomepageLeaders = {
  season: 2025,
  seasonType: 'REG',
  passing: [],
  rushing: [],
  receiving: [],
};

const renderRail = (
  insights: typeof homepageInsightsFixture,
  leaders: HomepageLeaders = leadersFixture,
  overrides: { readonly isPending?: boolean; readonly isError?: boolean } = {},
) =>
  render(
    <MemoryRouter>
      <HomepageInsightRail
        homepageQuery={{
          data: { insights, leaders },
          isPending: overrides.isPending ?? false,
          isError: overrides.isError ?? false,
        }}
      />
    </MemoryRouter>,
  );

describe('HomepageInsightRail', () => {
  it('renders the AI Hub snapshot and a Quick Leaders fallback when weeklyLeaders is null', () => {
    renderRail({ aiHub: aiHubSnapshotFixture, weeklyLeaders: null });

    expect(
      screen.getByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Week \d+ Leaders/)).not.toBeInTheDocument();
    expect(
      screen.getByText(`${String(leadersFixture.season)} Leaders`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(leadersFixture.passing[0]!.player.displayName),
    ).toBeInTheDocument();
  });

  it('renders both AI Hub snapshot and Weekly Leaders when both are present', () => {
    renderRail(homepageInsightsFixture);

    expect(
      screen.getByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Week ${String(weeklyLeadersFixture.week)} Leaders`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\d{4} Leaders$/)).not.toBeInTheDocument();
    expect(
      screen.getByText(weeklyLeadersFixture.passing!.playerName),
    ).toBeInTheDocument();
  });

  it('hides the AI Hub card content and still shows the Quick Leaders fallback when aiHub is null', () => {
    renderRail(emptyHomepageInsightsFixture);

    expect(
      screen.getByText(/No published weekly insights are available/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${String(leadersFixture.season)} Leaders`),
    ).toBeInTheDocument();
  });

  it('shows a loading skeleton driven by the homepage query state', () => {
    renderRail(emptyHomepageInsightsFixture, leadersFixture, {
      isPending: true,
    });

    expect(
      screen.getByLabelText('Loading AI Hub snapshot'),
    ).toBeInTheDocument();
  });

  it('shows an unavailable message when the homepage query errors', () => {
    renderRail(emptyHomepageInsightsFixture, leadersFixture, {
      isError: true,
    });

    expect(
      screen.getByText(/AI Hub insights are temporarily unavailable/i),
    ).toBeInTheDocument();
  });

  describe('homepageInsightRailModuleCount', () => {
    it('counts 2 modules when AI Hub and either leader source have content', () => {
      expect(
        homepageInsightRailModuleCount({
          data: { insights: homepageInsightsFixture, leaders: leadersFixture },
          isPending: false,
          isError: false,
        }),
      ).toBe(2);
    });

    it('counts 0 modules when nothing resolves, allowing main content to expand', () => {
      expect(
        homepageInsightRailModuleCount({
          data: {
            insights: emptyHomepageInsightsFixture,
            leaders: emptyLeadersFixture,
          },
          isPending: false,
          isError: false,
        }),
      ).toBe(0);
    });

    it('counts 2 modules while pending, matching the default two-card skeleton', () => {
      expect(
        homepageInsightRailModuleCount({
          data: undefined,
          isPending: true,
          isError: false,
        }),
      ).toBe(2);
    });
  });
});
