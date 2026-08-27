import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { isNavigationPathActive, navigationItems } from '@/app/navigation';

const primaryMobileItems = navigationItems.slice(0, 4);
const overflowMobileItems = navigationItems.slice(4);

export const MobileNavigation = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const selectedItem = primaryMobileItems.find((item) =>
    isNavigationPathActive(location.pathname, item.path),
  );
  const hasOverflowSelection = overflowMobileItems.some((item) =>
    isNavigationPathActive(location.pathname, item.path),
  );

  return (
    <>
      <Box
        component="nav"
        aria-label="Mobile navigation"
        data-testid="mobile-navigation"
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          pb: 'env(safe-area-inset-bottom)',
          bgcolor: 'background.paper',
        }}
      >
        <BottomNavigation
          showLabels
          value={selectedItem?.path ?? (hasOverflowSelection ? 'more' : false)}
        >
          {primaryMobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <BottomNavigationAction
                key={item.path}
                component={RouterLink}
                to={item.path}
                value={item.path}
                label={item.label}
                icon={<Icon fontSize="small" />}
              />
            );
          })}
          <BottomNavigationAction
            value="more"
            label="More"
            icon={<MoreHorizRounded fontSize="small" />}
            onClick={() => setIsMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMoreOpen}
          />
        </BottomNavigation>
      </Box>

      <Drawer
        anchor="bottom"
        open={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '18px 18px 0 0',
              borderTop: '1px solid',
              borderColor: 'divider',
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 2.5, pb: 1 }}>
          <Typography variant="h4">More from 2nd &amp; 15</Typography>
          <Typography variant="body2" color="text.secondary">
            Explore Teams and Stats, plus upcoming AI and Fantasy sections.
          </Typography>
        </Box>
        <Divider />
        <List aria-label="More destinations">
          {overflowMobileItems.map((item) => {
            const Icon = item.icon;
            const isSelected = isNavigationPathActive(
              location.pathname,
              item.path,
            );

            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={isSelected}
                onClick={() => setIsMoreOpen(false)}
              >
                <ListItemIcon>
                  <Icon color={isSelected ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
};
