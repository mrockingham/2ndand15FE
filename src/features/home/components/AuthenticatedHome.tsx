import { Container, Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { PersonalizedHomeContent } from '@/features/home/components/PersonalizedHome';
import { PublicHomeContent } from '@/features/home/components/PublicHome';
import type { Team } from '@/features/teams/types';

type HomeView = 'home' | 'team';

export const AuthenticatedHome = ({
  displayName,
  favoriteTeam,
}: {
  readonly displayName: string;
  readonly favoriteTeam: Team;
}) => {
  const [view, setView] = useState<HomeView>('team');

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Tabs
          value={view}
          onChange={(_, next: HomeView) => setView(next)}
          aria-label="Home view"
          sx={{ minHeight: 0, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="home" label="Home" sx={{ minHeight: 0, py: 1.25 }} />
          <Tab
            value="team"
            label={`${favoriteTeam.abbreviation} ${favoriteTeam.name}`}
            sx={{ minHeight: 0, py: 1.25 }}
          />
        </Tabs>
        {view === 'home' ? (
          <PublicHomeContent showPersonalizationCallout={false} />
        ) : (
          <PersonalizedHomeContent
            displayName={displayName}
            favoriteTeam={favoriteTeam}
          />
        )}
      </Stack>
    </Container>
  );
};
