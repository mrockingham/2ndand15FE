import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import hallOfFameHero from '@/images/hall-of-fame-game-hero.jpg';
import { useFeaturedArticlesQuery } from '@/features/articles/queries';
import {
  HALL_OF_FAME_GAME_ID,
  gameStatusLabel,
  isScoreStatus,
} from '@/features/games/presentation';
import { useGameQuery, useGamesQuery } from '@/features/games/queries';
import { HomeGamesGrid } from '@/features/home/components/HomeGamesPanels';
import { HomePublicNews } from '@/features/home/components/HomeNewsPanels';
import { HomepageHeroCarousel } from '@/features/homepage/components/HomepageHeroCarousel';
import { HomepageHighlightsSection } from '@/features/homepage/components/HomepageHighlightsSection';
import { HomepageInsightRail } from '@/features/homepage/components/HomepageInsightRail';
import { HomepageLeadersSection } from '@/features/homepage/components/HomepageLeadersSection';
import {
  FeaturedTopStorySection,
  TopStoriesList,
} from '@/features/homepage/components/TopStoriesSection';
import { useHomepageQuery } from '@/features/homepage/queries';

const PublicHero = ({ chooseTeam }: { readonly chooseTeam: boolean }) => {
  const gameQuery = useGameQuery(HALL_OF_FAME_GAME_ID);
  const game = gameQuery.data;
  const showScore =
    game !== undefined &&
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;

  return (
    <Box component="section" aria-labelledby="public-home-heading">
      <Card
        sx={{
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          borderColor: 'appSurfaces.borderStrong',
          bgcolor: '#050914',
          minHeight: { xs: 390, sm: 500, lg: 620 },
        }}
      >
        <Box
          component="img"
          src={hallOfFameHero}
          alt="Hall of Fame Game promotion featuring the Carolina Panthers and Arizona Cardinals in Canton, Ohio"
          width={2048}
          height={1152}
          loading="eager"
          fetchPriority="high"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -2,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            background: {
              xs: 'linear-gradient(180deg, rgba(5,9,20,0.05) 38%, rgba(5,9,20,0.96) 100%)',
              md: 'linear-gradient(90deg, rgba(5,9,20,0.74) 0%, rgba(5,9,20,0.04) 38%, rgba(5,9,20,0.06) 72%, rgba(5,9,20,0.76) 100%), linear-gradient(180deg, transparent 55%, rgba(5,9,20,0.9) 100%)',
            },
          }}
        />
        <Stack
          spacing={2}
          sx={{
            minHeight: 'inherit',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            color: '#FFFFFF',
          }}
        >
          <Chip
            label={
              game
                ? showScore
                  ? `${gameStatusLabel[game.status]} · ${game.awayTeam.abbreviation} ${game.awayScore}–${game.homeScore} ${game.homeTeam.abbreviation}`
                  : gameStatusLabel[game.status]
                : 'Featured event'
            }
            sx={{
              color: '#FFFFFF',
              bgcolor: alpha('#050914', 0.78),
              border: '1px solid rgba(255,255,255,0.35)',
              fontWeight: 800,
            }}
          />
          <Box sx={{ maxWidth: 520 }}>
            <Typography id="public-home-heading" component="h1" variant="h2">
              {chooseTeam
                ? 'Choose your team. Make Home yours.'
                : 'Your front row to football.'}
            </Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.82)' }}>
              {chooseTeam
                ? 'Add a favorite for a team-first matchup, news, historical leaders, and weekly model context.'
                : 'Follow the schedule, published stories, historical leaders, and clearly labeled model insights in one place.'}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              component={RouterLink}
              to={
                chooseTeam ? '/choose-team' : `/games/${HALL_OF_FAME_GAME_ID}`
              }
              variant="contained"
              endIcon={<ArrowForwardRounded />}
            >
              {chooseTeam ? 'Choose your team' : 'View Hall of Fame Game'}
            </Button>
            <Button
              component={RouterLink}
              to="/games"
              variant="outlined"
              sx={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.55)' }}
            >
              View Games
            </Button>
            <Button component={RouterLink} to="/news" sx={{ color: '#FFFFFF' }}>
              Latest News
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

const PersonalizationCallout = ({
  chooseTeam,
}: {
  readonly chooseTeam: boolean;
}) => (
  <Card
    component="section"
    sx={{
      p: { xs: 2.5, md: 3.5 },
      borderColor: 'var(--team-border)',
      backgroundImage:
        'linear-gradient(115deg, var(--team-subtle-strong), transparent 70%)',
    }}
  >
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2.5}
      sx={{ alignItems: { md: 'center' } }}
    >
      <SportsFootballRounded
        color="primary"
        sx={{ fontSize: 44 }}
        aria-hidden="true"
      />
      <Box sx={{ flex: 1 }}>
        <Typography component="h2" variant="h3">
          {chooseTeam
            ? 'Unlock your team-first Home'
            : 'Personalize your 2nd & 15 Home'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
          {chooseTeam
            ? 'Pick one favorite team for a personalized matchup, team news, historical leader context, and weekly prediction view.'
            : 'Sign in and choose a favorite team to bring its next matchup, published coverage, and weekly model view to the top.'}
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          component={RouterLink}
          to={chooseTeam ? '/choose-team' : '/login'}
          variant="contained"
        >
          {chooseTeam ? 'Choose Your Team' : 'Sign in'}
        </Button>
        {chooseTeam ? null : (
          <Button component={RouterLink} to="/register" variant="outlined">
            Create account
          </Button>
        )}
      </Stack>
    </Stack>
  </Card>
);

const ExploreTeamsCard = () => (
  <Card component="section" sx={{ p: { xs: 2.5, md: 3 }, alignSelf: 'end' }}>
    <Stack spacing={1.5}>
      <AutoAwesomeRounded color="primary" aria-hidden="true" />
      <Typography component="h2" variant="h3">
        Explore every team
      </Typography>
      <Typography color="text.secondary">
        Browse all 32 team hubs for schedules, published news, and clearly
        labeled historical coverage.
      </Typography>
      <Button component={RouterLink} to="/teams" variant="outlined">
        Explore Teams
      </Button>
      <Typography variant="caption" color="text.secondary">
        Current 2026 standings are not available, so Home does not invent them.
      </Typography>
    </Stack>
  </Card>
);

export const PublicHomeContent = ({
  chooseTeam = false,
  showPersonalizationCallout = true,
}: {
  readonly chooseTeam?: boolean;
  readonly showPersonalizationCallout?: boolean;
}) => {
  const gamesQuery = useGamesQuery({ limit: 4 });
  const newsQuery = useFeaturedArticlesQuery({ limit: 3 });
  // `GET /homepage` composes Hero slides, Top Stories, Highlights, and
  // League Leaders in one request -- never fetched separately. A request
  // failure falls back to the pre-CMS static Hero and simply omits the
  // other CMS sections rather than breaking Home.
  const homepageQuery = useHomepageQuery();
  const homepage = homepageQuery.data;
  const activeHeroSlides = homepage?.heroSlides ?? [];
  const featuredTopStory = homepage?.topStories[0];
  const supportingTopStories = homepage?.topStories.slice(1) ?? [];

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      {activeHeroSlides.length > 0 ? (
        <HomepageHeroCarousel slides={activeHeroSlides} />
      ) : (
        <PublicHero chooseTeam={chooseTeam} />
      )}
      {chooseTeam ? <PersonalizationCallout chooseTeam /> : null}
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 4, lg: 3 },
          alignItems: 'start',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1.45fr) minmax(360px, 0.7fr)',
          },
        }}
      >
        <Stack
          spacing={{ xs: 4, md: 5 }}
          sx={{
            minWidth: 0,
            gridColumn: { lg: 1 },
            gridRow: { lg: 1 },
          }}
        >
          {featuredTopStory ? (
            <FeaturedTopStorySection story={featuredTopStory} />
          ) : (
            <HomePublicNews query={newsQuery} mode="featured" />
          )}
          {homepage ? (
            <HomepageHighlightsSection highlights={homepage.highlights} />
          ) : null}
          <HomeGamesGrid query={gamesQuery} />
          {homepage ? (
            <HomepageLeadersSection leaders={homepage.leaders} />
          ) : null}
          <ExploreTeamsCard />
        </Stack>
        <Stack
          component="aside"
          aria-label="Homepage news and insights"
          spacing={{ xs: 4, md: 5 }}
          sx={{
            minWidth: 0,
            gridColumn: { lg: 2 },
            gridRow: { lg: 1 },
          }}
        >
          {featuredTopStory ? (
            <TopStoriesList stories={supportingTopStories} />
          ) : (
            <HomePublicNews query={newsQuery} mode="supporting" />
          )}
          <HomepageInsightRail homepageQuery={homepageQuery} />
        </Stack>
      </Box>
      {chooseTeam || !showPersonalizationCallout ? null : (
        <PersonalizationCallout chooseTeam={false} />
      )}
    </Stack>
  );
};

export const PublicHome = ({
  chooseTeam = false,
}: {
  readonly chooseTeam?: boolean;
}) => (
  <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <PublicHomeContent chooseTeam={chooseTeam} />
  </Container>
);
