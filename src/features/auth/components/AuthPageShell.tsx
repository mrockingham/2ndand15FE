import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import { Box, Card, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { PropsWithChildren, ReactNode } from 'react';

import { BrandLogo } from '@/components/branding/BrandLogo';

interface AuthPageShellProps extends PropsWithChildren {
  readonly description: string;
  readonly eyebrow: string;
  readonly footer?: ReactNode;
  readonly title: string;
}

export const AuthPageShell = ({
  children,
  description,
  eyebrow,
  footer,
  title,
}: AuthPageShellProps) => (
  <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
    <Box
      sx={{
        display: 'grid',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 2.5, md: 3 },
        bgcolor: 'background.paper',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 28px 90px rgba(0,0,0,0.32)'
            : '0 28px 90px rgba(35,46,78,0.1)',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 0.86fr) minmax(420px, 1fr)',
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          minHeight: 610,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          p: 5,
          color: '#F8FAFF',
          background:
            'radial-gradient(circle at 72% 25%, rgba(42,212,255,0.28), transparent 23%), linear-gradient(145deg, #101A36, #070A16 65%)',
          '&::before': {
            position: 'absolute',
            inset: '30% -30% -36% -10%',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '50%',
            background:
              'repeating-linear-gradient(90deg, transparent 0, transparent 9.7%, rgba(255,255,255,0.13) 10%, transparent 10.3%), #0B3C34',
            boxShadow: '0 -30px 100px rgba(91,55,238,0.34)',
            content: '""',
            transform: 'perspective(650px) rotateX(58deg)',
          },
        }}
      >
        <Stack
          spacing={2}
          sx={{ position: 'relative', zIndex: 1, maxWidth: 430 }}
        >
          <Box
            sx={{
              display: 'grid',
              width: 52,
              height: 52,
              placeItems: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              bgcolor: alpha('#6D4AFF', 0.28),
            }}
          >
            <AutoAwesomeRounded />
          </Box>
          <Typography variant="h3" component="p">
            Your game-day command center starts with a secure huddle.
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', opacity: 0.78 }}
          >
            <LockRounded fontSize="small" />
            <Typography variant="body2">
              Short-lived access. Private refresh session. No token persistence.
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Card
        square
        elevation={0}
        sx={{
          display: 'flex',
          minHeight: { xs: 0, md: 610 },
          flexDirection: 'column',
          justifyContent: 'center',
          border: 0,
          borderRadius: 0,
          boxShadow: 'none',
          p: { xs: 3, sm: 5, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <BrandLogo size="auth" />
          </Box>
          <Typography variant="overline" color="primary.light">
            {eyebrow}
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            tabIndex={-1}
            sx={{ mt: 1, mb: 1.5 }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {description}
          </Typography>
          {children}
          {footer === undefined ? null : <Box sx={{ mt: 3 }}>{footer}</Box>}
        </Box>
      </Card>
    </Box>
  </Container>
);
