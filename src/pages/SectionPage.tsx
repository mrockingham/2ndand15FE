import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ConstructionRounded from '@mui/icons-material/ConstructionRounded';
import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

interface SectionPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export const SectionPage = ({
  eyebrow,
  title,
  description,
}: SectionPageProps) => (
  <Container maxWidth="xl" sx={{ py: { xs: 5, sm: 7, md: 9 } }}>
    <Stack spacing={4}>
      <Box sx={{ maxWidth: 760 }}>
        <Typography variant="overline" color="primary.light">
          {eyebrow}
        </Typography>
        <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
          {title}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 450 }}
        >
          {description}
        </Typography>
      </Box>

      <Card
        sx={{
          position: 'relative',
          display: 'grid',
          minHeight: { xs: 280, md: 360 },
          overflow: 'hidden',
          placeItems: 'center',
          p: 4,
          textAlign: 'center',
          background: (theme) =>
            `linear-gradient(145deg, ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'dark' ? 0.12 : 0.06,
            )}, transparent 55%)`,
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 520, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              width: 56,
              height: 56,
              placeItems: 'center',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              color: 'primary.light',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ConstructionRounded />
          </Box>
          <Typography variant="h3" component="h2">
            Foundation preview
          </Typography>
          <Typography color="text.secondary">
            The route and responsive shell are ready. Product data and feature
            workflows will be connected in a later milestone.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            startIcon={<ArrowBackRounded />}
          >
            Back to home
          </Button>
        </Stack>
      </Card>
    </Stack>
  </Container>
);
