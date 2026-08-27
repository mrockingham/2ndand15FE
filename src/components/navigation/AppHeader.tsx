import LoginRounded from '@mui/icons-material/LoginRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { isNavigationPathActive, navigationItems } from '@/app/navigation';
import { BrandMark } from '@/components/navigation/BrandMark';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { TeamHelmet } from '@/components/team/TeamHelmet';
import { useCurrentUserQuery } from '@/features/users/queries';
import { useAuthStore } from '@/stores/authStore';

export const AppHeader = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore(
    (state) =>
      state.restorationStatus === 'authenticated' && state.accessToken !== null,
  );
  const currentUserQuery = useCurrentUserQuery();
  const favoriteTeam = currentUserQuery.data?.favoriteTeam ?? null;
  const hasAdminAccess =
    currentUserQuery.data?.role === 'EDITOR' ||
    currentUserQuery.data?.role === 'ADMIN';

  return (
    <AppBar component="header" position="sticky">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 72 },
            gap: { xs: 1, md: 3 },
          }}
        >
          <BrandMark />

          <Box
            component="nav"
            aria-label="Primary navigation"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignSelf: 'stretch',
              alignItems: 'stretch',
              gap: 0.25,
              ml: 'auto',
            }}
          >
            {navigationItems.map((item) => {
              const isActive = isNavigationPathActive(
                location.pathname,
                item.path,
              );
              const futureDestination =
                item.path === '/ai' || item.path === '/fantasy';

              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  color={isActive ? 'primary' : 'inherit'}
                  sx={{
                    position: 'relative',
                    display: {
                      md: futureDestination ? 'none' : 'inline-flex',
                      lg: 'inline-flex',
                    },
                    minWidth: 0,
                    px: { md: 1.25, lg: 1.75 },
                    borderRadius: 0,
                    color: isActive ? 'var(--team-primary)' : 'text.secondary',
                    fontSize: { md: '0.78rem', lg: '0.86rem' },
                    '&::after': {
                      position: 'absolute',
                      right: 12,
                      bottom: 0,
                      left: 12,
                      height: 2,
                      borderRadius: 4,
                      backgroundColor: 'var(--team-primary)',
                      content: isActive ? '""' : 'none',
                    },
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.25, sm: 1 },
              ml: { xs: 'auto', md: 0 },
            }}
          >
            {hasAdminAccess ? (
              <Button
                component={RouterLink}
                to="/admin/games"
                color="inherit"
                startIcon={<AdminPanelSettingsRounded />}
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              >
                Admin
              </Button>
            ) : null}
            <ThemeToggle />
            {hasAdminAccess ? (
              <IconButton
                component={RouterLink}
                to="/admin/games"
                color="inherit"
                aria-label="Open schedule administration"
                sx={{ display: { lg: 'none' } }}
              >
                <AdminPanelSettingsRounded />
              </IconButton>
            ) : null}
            <IconButton
              component={RouterLink}
              to={isAuthenticated ? '/account' : '/login'}
              color="inherit"
              aria-label={isAuthenticated ? 'Open account' : 'Sign in'}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              {isAuthenticated && favoriteTeam !== null ? (
                <TeamHelmet
                  decorative
                  team={favoriteTeam.abbreviation}
                  size="xs"
                />
              ) : isAuthenticated ? (
                <PersonRounded />
              ) : (
                <LoginRounded />
              )}
            </IconButton>
            <Button
              component={RouterLink}
              to={isAuthenticated ? '/account' : '/login'}
              variant="contained"
              size="small"
              startIcon={
                isAuthenticated && favoriteTeam !== null ? (
                  <TeamHelmet
                    decorative
                    team={favoriteTeam.abbreviation}
                    size="xs"
                  />
                ) : isAuthenticated ? (
                  <PersonRounded />
                ) : (
                  <LoginRounded />
                )
              }
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {isAuthenticated ? 'Account' : 'Sign in'}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
