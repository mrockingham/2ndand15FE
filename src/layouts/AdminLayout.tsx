import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import FactCheckRounded from '@mui/icons-material/FactCheckRounded';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import UploadFileRounded from '@mui/icons-material/UploadFileRounded';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

import { BrandMark } from '@/components/navigation/BrandMark';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { useCurrentUserQuery } from '@/features/users/queries';

const drawerWidth = 264;

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const role = useCurrentUserQuery().data?.role ?? 'USER';
  const items = [
    { label: 'Games', path: '/admin/games', icon: SportsFootballRounded },
    {
      label: 'Import schedule',
      path: '/admin/import',
      icon: UploadFileRounded,
    },
    { label: 'Articles', path: '/admin/articles', icon: ArticleRounded },
    ...(role === 'ADMIN'
      ? [{ label: 'Audit log', path: '/admin/audit', icon: HistoryRounded }]
      : []),
  ];
  const navigation = (
    <>
      <Toolbar sx={{ px: 2 }}>
        <BrandMark />
      </Toolbar>
      <Divider />
      <Stack
        direction="row"
        spacing={1}
        sx={{ px: 2, py: 2, alignItems: 'center' }}
      >
        <FactCheckRounded color="primary" />
        <Box>
          <Typography variant="overline">Content and schedule</Typography>
          <Chip
            size="small"
            label={role}
            color={role === 'ADMIN' ? 'primary' : 'default'}
          />
        </Box>
      </Stack>
      <List component="nav" aria-label="Administration sections" sx={{ px: 1 }}>
        {items.map((item) => {
          const selected =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={selected}
              aria-current={selected ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List sx={{ px: 1, pb: 2 }}>
        <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <ArrowBackRounded />
          </ListItemIcon>
          <ListItemText primary="Back to public site" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AppBar position="fixed" sx={{ display: { md: 'none' } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            aria-label="Open administration navigation"
          >
            <MenuRounded />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Administration
          </Typography>
          <Chip size="small" label={role} sx={{ mr: 1 }} />
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="Administration">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {navigation}
        </Drawer>
      </Box>
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 9, md: 0 },
          p: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
