import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';

import { AuditDifference } from '@/features/admin/components/AuditDifference';
import { formatAdminDateTime } from '@/features/admin/format';
import type { AuditEvent } from '@/features/admin/types';

export const AuditEventList = ({
  events,
}: {
  readonly events: readonly AuditEvent[];
}) => (
  <Stack spacing={1}>
    {events.map((event) => (
      <Accordion key={event.id} variant="outlined" disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <Chip size="small" label={event.action.replaceAll('_', ' ')} />
            <Typography>{formatAdminDateTime(event.createdAt)}</Typography>
            <Typography color="text.secondary">
              by {event.actorEmailSnapshot}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {event.reason ? (
            <Typography sx={{ mb: 2 }}>
              <strong>Reason:</strong> {event.reason}
            </Typography>
          ) : null}
          <AuditDifference
            before={event.beforeSnapshot}
            after={event.afterSnapshot}
          />
        </AccordionDetails>
      </Accordion>
    ))}
  </Stack>
);
