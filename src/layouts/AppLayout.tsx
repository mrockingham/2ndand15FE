import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/navigation/AppHeader';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

export const AppLayout = () => (
  <Box sx={{ minHeight: '100vh' }}>
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
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{ pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 0 } }}
    >
      <Outlet />
    </Box>
    <MobileNavigation />
  </Box>
);
