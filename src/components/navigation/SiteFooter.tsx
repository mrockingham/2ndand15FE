import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { BrandLogo } from '@/components/branding/BrandLogo';
import {
  isAnalyticsConfigured,
  requestAnalyticsChoices,
} from '@/features/analytics/analytics';

const footerLinks = [
  { label: 'News', path: '/news' },
  { label: 'Games', path: '/games' },
  { label: 'Stats', path: '/stats' },
  { label: 'Standings', path: '/standings' },
  { label: 'Power Rankings', path: '/power-rankings' },
  { label: 'Teams', path: '/teams' },
  { label: 'Contact', path: '/contact' },
];

export const SiteFooter = () => (
  <Box
    component="footer"
    sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 6 }}
  >
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 4 }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
        }}
      >
        <BrandLogo size="footer" />
        <Stack
          component="nav"
          aria-label="Footer"
          direction="row"
          spacing={3}
          sx={{ flexWrap: 'wrap' }}
        >
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              component={RouterLink}
              to={link.path}
              color="text.secondary"
              underline="hover"
            >
              {link.label}
            </Link>
          ))}
          {isAnalyticsConfigured() ? (
            <Link
              component="button"
              type="button"
              color="text.secondary"
              underline="hover"
              onClick={requestAnalyticsChoices}
              sx={{
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                p: 0,
              }}
            >
              Analytics choices
            </Link>
          ) : null}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          © 2026 2nd &amp; 15
        </Typography>
      </Stack>
    </Container>
  </Box>
);
