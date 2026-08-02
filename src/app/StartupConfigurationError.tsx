import SettingsSuggestRounded from '@mui/icons-material/SettingsSuggestRounded';
import { Alert, Box, Container, Stack, Typography } from '@mui/material';

import { AppThemeProvider } from '@/theme/ThemeProvider';

interface StartupConfigurationErrorProps {
  readonly message: string;
}

export const StartupConfigurationError = ({
  message,
}: StartupConfigurationErrorProps) => (
  <AppThemeProvider>
    <Box
      component="main"
      sx={{
        display: 'grid',
        minHeight: '100vh',
        placeItems: 'center',
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={2.5} sx={{ textAlign: 'center' }}>
          <SettingsSuggestRounded
            color="primary"
            aria-hidden="true"
            sx={{ alignSelf: 'center', fontSize: 56 }}
          />
          <Typography component="h1" variant="h3">
            Local setup needed
          </Typography>
          <Typography color="text.secondary">
            The application is missing required public configuration.
          </Typography>
          <Alert severity="warning" sx={{ textAlign: 'left' }}>
            {message}
          </Alert>
          <Typography color="text.secondary" variant="body2">
            Restart the development server after updating the environment file.
          </Typography>
        </Stack>
      </Container>
    </Box>
  </AppThemeProvider>
);
