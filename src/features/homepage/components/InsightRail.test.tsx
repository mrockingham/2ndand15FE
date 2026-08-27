import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { InsightRail } from '@/features/homepage/components/InsightRail';
import {
  aiHubSnapshotFixture,
  emptyHomepageInsightsFixture,
  homepageInsightsFixture,
  weeklyLeadersFixture,
} from '@/test/homepageFixtures';

const renderRail = (
  insights: typeof homepageInsightsFixture,
  overrides: { readonly isPending?: boolean; readonly isError?: boolean } = {},
) =>
  render(
    <MemoryRouter>
      <InsightRail
        homepageQuery={{
          data: { insights },
          isPending: overrides.isPending ?? false,
          isError: overrides.isError ?? false,
        }}
      />
    </MemoryRouter>,
  );

describe('InsightRail', () => {
  it('renders the AI Hub snapshot only when weeklyLeaders is null', () => {
    renderRail({ aiHub: aiHubSnapshotFixture, weeklyLeaders: null });

    expect(
      screen.getByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Week \d+ Leaders/)).not.toBeInTheDocument();
  });

  it('renders both AI Hub snapshot and Weekly Leaders when both are present', () => {
    renderRail(homepageInsightsFixture);

    expect(
      screen.getByRole('heading', { name: /AI Hub snapshot/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Week ${String(weeklyLeadersFixture.week)} Leaders`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(weeklyLeadersFixture.passing!.playerName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(weeklyLeadersFixture.rushing!.playerName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(weeklyLeadersFixture.receiving!.playerName),
    ).toBeInTheDocument();
  });

  it('hides the AI Hub card content and shows an info state when aiHub is null', () => {
    renderRail(emptyHomepageInsightsFixture);

    expect(
      screen.getByText(/No published weekly insights are available/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Week \d+ Leaders/)).not.toBeInTheDocument();
  });

  it('shows a loading skeleton driven by the homepage query state', () => {
    renderRail(emptyHomepageInsightsFixture, { isPending: true });

    expect(
      screen.getByLabelText('Loading AI Hub snapshot'),
    ).toBeInTheDocument();
  });

  it('shows an unavailable message when the homepage query errors', () => {
    renderRail(emptyHomepageInsightsFixture, { isError: true });

    expect(
      screen.getByText(/AI Hub insights are temporarily unavailable/i),
    ).toBeInTheDocument();
  });
});
