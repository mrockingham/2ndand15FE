import { Component, type PropsWithChildren } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ApplicationErrorBoundaryState {
  hasError: boolean;
}

export class ApplicationErrorBoundary extends Component<
  PropsWithChildren,
  ApplicationErrorBoundaryState
> {
  state: ApplicationErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Production error reporting can be connected here once a provider is chosen.
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          component="main"
          sx={{
            display: 'grid',
            minHeight: '100vh',
            placeItems: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              The huddle broke unexpectedly.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Reload the page to get back to the application.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload application
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
