import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const footerLinks = [
  { label: 'News', path: '/news' },
  { label: 'Games', path: '/games' },
  { label: 'Stats', path: '/stats' },
  { label: 'Standings', path: '/standings' },
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
        <Typography sx={{ fontWeight: 800 }}>2nd &amp; 15</Typography>
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
        </Stack>
        <Typography variant="body2" color="text.secondary">
          © 2026 2nd &amp; 15
        </Typography>
      </Stack>
    </Container>
  </Box>
);
