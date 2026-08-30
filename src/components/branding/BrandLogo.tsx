import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const OFFICIAL_BRAND_LOGO_URL =
  'https://res.cloudinary.com/ly8tdokq/image/upload/v1788098094/ChatGPT_Image_Aug_29_2026_05_09_54_PM.png';

type BrandLogoSize = 'compact' | 'header' | 'auth' | 'footer';

const logoSizes = {
  compact: { xs: 40, sm: 44 },
  header: { xs: 44, sm: 48, md: 52 },
  auth: { xs: 72, sm: 88 },
  footer: { xs: 48, sm: 56 },
} as const;

export const BrandLogo = ({
  size = 'header',
  linkToHome = true,
}: {
  readonly size?: BrandLogoSize;
  readonly linkToHome?: boolean;
}) => {
  const dimensions = logoSizes[size];
  const image = (
    <Box
      component="img"
      src={OFFICIAL_BRAND_LOGO_URL}
      alt="2nd & 15"
      width={1254}
      height={1254}
      loading="eager"
      decoding="async"
      draggable={false}
      sx={{
        display: 'block',
        width: dimensions,
        height: dimensions,
        maxWidth: 'none',
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  );

  if (!linkToHome) return image;

  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label="2nd & 15 home"
      sx={{
        display: 'inline-flex',
        flexShrink: 0,
        borderRadius: '50%',
        textDecoration: 'none',
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'secondary.main',
          outlineOffset: 3,
        },
      }}
    >
      {image}
    </Box>
  );
};
