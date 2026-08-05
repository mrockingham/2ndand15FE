import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { useState } from 'react';
import { MarkdownContent } from '@/features/articles/components/MarkdownContent';
import {
  useArticleRevisionQuery,
  useArticleRevisionsQuery,
} from '@/features/articles/queries';

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export const RevisionHistory = ({
  articleId,
}: {
  readonly articleId: string;
}) => {
  const [cursor, setCursor] = useState<string>();
  const [selected, setSelected] = useState('');
  const query = useArticleRevisionsQuery(articleId, cursor);
  const detail = useArticleRevisionQuery(articleId, selected);
  return (
    <Stack spacing={1}>
      <Typography variant="h4">Revision history</Typography>
      {query.isPending ? (
        <Typography role="status">Loading revisions…</Typography>
      ) : null}
      {query.data?.revisions.map((revision) => {
        const snapshot = record(revision.snapshot);
        return (
          <Accordion key={revision.id} variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Chip
                  size="small"
                  label={`Revision ${revision.revisionNumber}`}
                />
                <Typography>
                  {new Date(revision.createdAt).toLocaleString()}
                </Typography>
                <Typography color="text.secondary">
                  {revision.editorSnapshot}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Status:</strong> {String(snapshot.status ?? 'Unknown')}
              </Typography>
              <Typography>
                <strong>Change summary:</strong>{' '}
                {revision.changeSummary ?? 'None supplied'}
              </Typography>
              <Typography>
                <strong>Title:</strong> {String(snapshot.title ?? '—')}
              </Typography>
              <Button onClick={() => setSelected(revision.id)}>
                Open revision
              </Button>
            </AccordionDetails>
          </Accordion>
        );
      })}
      {query.data?.nextCursor ? (
        <Button onClick={() => setCursor(query.data.nextCursor ?? undefined)}>
          Older revisions
        </Button>
      ) : null}
      <Dialog
        open={selected !== ''}
        onClose={() => setSelected('')}
        fullWidth
        maxWidth="md"
        aria-labelledby="revision-title"
      >
        <DialogTitle id="revision-title">
          Revision {detail.data?.revisionNumber ?? ''}
        </DialogTitle>
        <DialogContent dividers>
          {detail.isPending ? (
            <Typography role="status">Loading revision…</Typography>
          ) : null}
          {detail.data
            ? (() => {
                const snapshot = record(detail.data.snapshot);
                return (
                  <Stack spacing={2}>
                    <Typography>
                      <strong>Editor:</strong> {detail.data.editorSnapshot}
                    </Typography>
                    <Typography>
                      <strong>Change summary:</strong>{' '}
                      {detail.data.changeSummary ?? 'None'}
                    </Typography>
                    <Typography>
                      <strong>Status:</strong> {String(snapshot.status ?? '—')}
                    </Typography>
                    <Typography>
                      <strong>Title:</strong> {String(snapshot.title ?? '—')}
                    </Typography>
                    <Typography>
                      <strong>Summary:</strong>{' '}
                      {String(snapshot.summary ?? '—')}
                    </Typography>
                    {typeof snapshot.body === 'string' ? (
                      <MarkdownContent markdown={snapshot.body} draft />
                    ) : null}
                  </Stack>
                );
              })()
            : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected('')}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
