import LoginRounded from '@mui/icons-material/LoginRounded';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { isNavigationPathActive, navigationItems } from '@/app/navigation';
import { BrandMark } from '@/components/navigation/BrandMark';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';

export const AppHeader = () => {
  const location = useLocation();

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

              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  color={isActive ? 'primary' : 'inherit'}
                  sx={{
                    position: 'relative',
                    minWidth: 0,
                    px: { md: 1.25, lg: 1.75 },
                    borderRadius: 0,
                    color: isActive ? 'primary.light' : 'text.secondary',
                    fontSize: { md: '0.78rem', lg: '0.86rem' },
                    '&::after': {
                      position: 'absolute',
                      right: 12,
                      bottom: 0,
                      left: 12,
                      height: 2,
                      borderRadius: 4,
                      backgroundColor: 'primary.main',
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
            <ThemeToggle />
            <Tooltip title="Authentication arrives in a future milestone" arrow>
              <span>
                <Button
                  disabled
                  variant="contained"
                  size="small"
                  startIcon={<LoginRounded />}
                  aria-label="Sign in, coming in a future milestone"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Sign in
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
