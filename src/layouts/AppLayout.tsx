import { Box } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppHeader } from '@/components/navigation/AppHeader';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { AnalyticsConsentBanner } from '@/features/analytics/AnalyticsConsentBanner';
import { AnalyticsRouteTracker } from '@/features/analytics/AnalyticsRouteTracker';
import { GlobalScoreboardBar } from '@/features/games/components/GlobalScoreboardBar';
import { SeoManager } from '@/features/seo/SeoManager';

const focusedAuthRoutes = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

const RouteFocusManager = () => {
  const location = useLocation();

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('#main-content h1');
    if (heading !== null) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  return null;
};

export const AppLayout = () => {
  const location = useLocation();
  const usesFocusedAuthLayout = focusedAuthRoutes.has(location.pathname);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <SeoManager />
      <AnalyticsRouteTracker />
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          color: 'primary.contrastText',
          bgcolor: 'primary.main',
          textDecoration: 'none',
          transform: 'translateY(-150%)',
          '&:focus': { transform: 'translateY(0)' },
        }}
      >
        Skip to content
      </Box>
      <AppHeader />
      {usesFocusedAuthLayout ? null : <GlobalScoreboardBar />}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          pb: usesFocusedAuthLayout
            ? 0
            : { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 0 },
        }}
      >
        <RouteFocusManager />
        <Outlet />
      </Box>
      {usesFocusedAuthLayout ? null : <SiteFooter />}
      {usesFocusedAuthLayout ? null : <MobileNavigation />}
      <AnalyticsConsentBanner />
    </Box>
  );
};
