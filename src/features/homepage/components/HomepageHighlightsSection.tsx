import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { GameHighlightThumbnail } from '@/features/games/components/GameHighlightThumbnail';
import type { HomepageHighlight } from '@/features/homepage/types';

const HighlightCard = ({
  highlight,
}: {
  readonly highlight: HomepageHighlight;
}) => {
  const matchup = `${highlight.awayTeam.abbreviation} vs ${highlight.homeTeam.abbreviation}`;
  return (
    <Card
      sx={{ height: '100%', flexShrink: 0, width: { xs: 240, sm: 'auto' } }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/games/${highlight.gameId}`}
        aria-label={`Open Game Center for ${highlight.awayTeam.fullName} at ${highlight.homeTeam.fullName}`}
        sx={{ height: '100%' }}
      >
        <GameHighlightThumbnail
          thumbnailUrl={highlight.thumbnailUrl}
          alt={highlight.title}
          awayTeam={highlight.awayTeam}
          homeTeam={highlight.homeTeam}
        />
        <Box sx={{ p: 1.5 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {matchup}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {highlight.mediaType === 'CURATED'
              ? 'Game Video'
              : 'Game Highlight'}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export const HomepageHighlightsSection = ({
  highlights,
}: {
  readonly highlights: readonly HomepageHighlight[];
}) => {
  if (highlights.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="highlights-heading">
      <Typography
        id="highlights-heading"
        component="h2"
        variant="h3"
        sx={{ mb: 2 }}
      >
        Highlights
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: { xs: 'auto', sm: 'visible' },
          display: { sm: 'grid' },
          gridTemplateColumns: {
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { sm: 2 },
          pb: { xs: 1, sm: 0 },
        }}
      >
        {highlights.map((highlight) => (
          <HighlightCard key={highlight.gameId} highlight={highlight} />
        ))}
      </Stack>
    </Box>
  );
};
