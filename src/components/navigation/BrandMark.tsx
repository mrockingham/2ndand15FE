import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const BrandMark = () => (
  <Box
    component={RouterLink}
    to="/"
    aria-label="2nd & 15 home"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1.25,
      color: 'text.primary',
      textDecoration: 'none',
      borderRadius: 1,
      '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'secondary.main',
        outlineOffset: 3,
      },
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        display: 'grid',
        width: 34,
        height: 34,
        placeItems: 'center',
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: '11px 6px 11px 6px',
        color: '#FFFFFF',
        background: 'linear-gradient(145deg, #8A6AFF, #4A1BCB)',
        boxShadow: '0 0 24px rgba(112, 73, 255, 0.3)',
        fontSize: '0.95rem',
        fontWeight: 900,
        letterSpacing: '-0.06em',
        transform: 'rotate(-2deg)',
      }}
    >
      2
    </Box>
    <Typography
      component="span"
      sx={{
        fontSize: { xs: '1rem', sm: '1.12rem' },
        fontWeight: 900,
        letterSpacing: '-0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      2nd &amp; 15
    </Typography>
  </Box>
);
