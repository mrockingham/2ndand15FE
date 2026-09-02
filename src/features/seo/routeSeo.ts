import {
  buildPageTitle,
  DEFAULT_SEO_DESCRIPTION,
  type SeoMetadata,
} from '@/features/seo/seo';

const PUBLIC_ROUTES: Readonly<
  Record<string, Omit<SeoMetadata, 'canonicalPath'>>
> = {
  '/': {
    title: '2nd & 15 | NFL Scores, News, Stats & Power Rankings',
    description: DEFAULT_SEO_DESCRIPTION,
  },
  '/games': {
    title: buildPageTitle('NFL Schedule & Game Center'),
    description:
      'Follow the NFL schedule, game status, scores, matchup details, and game-day coverage from 2nd & 15.',
  },
  '/news': {
    title: buildPageTitle('NFL News & Analysis'),
    description:
      'Read original NFL reporting, curated team news, highlights, and independent analysis from 2nd & 15.',
  },
  '/contact': {
    title: buildPageTitle('Contact'),
    description: 'Contact the 2nd & 15 team with feedback or questions.',
  },
  '/players': {
    title: buildPageTitle('NFL Player Profiles & Historical Stats'),
    description:
      'Explore NFL player profiles, historical season summaries, and game-by-game statistics.',
  },
  '/players/compare': {
    title: buildPageTitle('Compare NFL Players'),
    description:
      'Compare two NFL players using factual historical season statistics and game logs.',
  },
  '/stats': {
    title: buildPageTitle('NFL Stats & Leaderboards'),
    description:
      'Explore NFL statistical leaderboards, weekly performance, and historical player results.',
  },
  '/standings': {
    title: buildPageTitle('NFL Standings'),
    description:
      'View NFL conference and division standings with records and postseason context.',
  },
  '/power-rankings': {
    title: buildPageTitle('NFL Power Rankings'),
    description:
      'See the latest independent 2nd & 15 NFL power rankings, team strengths, concerns, and weekly movement.',
  },
  '/teams': {
    title: buildPageTitle('NFL Teams Directory'),
    description:
      'Browse every NFL team and explore schedules, news, historical rosters, and statistical leaders.',
  },
  '/ai': {
    title: buildPageTitle('NFL AI Predictions & Model Performance'),
    description:
      'Review clearly labeled NFL model predictions, confidence, weekly insights, and historical performance.',
  },
};

const PRIVATE_ROUTE =
  /^\/(?:admin|account|choose-team|login|register|forgot-password|reset-password)(?:\/|$)/;

export const resolveRouteSeo = (pathname: string): SeoMetadata => {
  const staticMetadata = PUBLIC_ROUTES[pathname];
  if (staticMetadata)
    return { ...staticMetadata, canonicalPath: pathname, type: 'website' };

  if (/^\/games\/[^/]+$/.test(pathname))
    return {
      title: buildPageTitle('NFL Game Center'),
      description:
        'Follow NFL game status, scores, team statistics, play context, and available highlights.',
      canonicalPath: pathname,
      type: 'website',
    };
  if (/^\/news\/[^/]+$/.test(pathname))
    return {
      title: buildPageTitle('NFL News & Analysis'),
      description: 'Read NFL news and independent analysis from 2nd & 15.',
      canonicalPath: pathname,
      type: 'article',
    };
  if (/^\/players\/[^/]+$/.test(pathname))
    return {
      title: buildPageTitle('NFL Player Profile'),
      description:
        'Explore an NFL player profile with historical season summaries and game logs.',
      canonicalPath: pathname,
      type: 'website',
    };
  if (/^\/teams\/[^/]+$/.test(pathname))
    return {
      title: buildPageTitle('NFL Team Hub'),
      description:
        'Explore an NFL team hub with schedule, news, historical roster evidence, and statistical leaders.',
      canonicalPath: pathname,
      type: 'website',
    };

  return {
    title: buildPageTitle(
      PRIVATE_ROUTE.test(pathname) ? 'Account' : 'Page Not Found',
    ),
    description: DEFAULT_SEO_DESCRIPTION,
    canonicalPath: pathname,
    noIndex: true,
    type: 'website',
  };
};
