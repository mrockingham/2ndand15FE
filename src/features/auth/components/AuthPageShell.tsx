import { Box, Card, Container, Stack, Typography } from '@mui/material';
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
  <Box
    sx={{
      minHeight: '100%',
      py: { xs: 4, sm: 6, md: 8 },
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at 50% 0%, rgba(109,74,255,0.12), transparent 55%)'
          : 'radial-gradient(circle at 50% 0%, rgba(109,74,255,0.06), transparent 55%)',
    }}
  >
    <Container maxWidth="sm">
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 2.5, md: 3 },
          bgcolor: 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 28px 90px rgba(0,0,0,0.32)'
              : '0 28px 90px rgba(35,46,78,0.1)',
          p: { xs: 3, sm: 5, md: 6 },
        }}
      >
        <Stack sx={{ alignItems: 'center', textAlign: 'center', mb: 3 }}>
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
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
        {children}
        {footer === undefined ? null : <Box sx={{ mt: 3 }}>{footer}</Box>}
      </Card>
    </Container>
  </Box>
);
