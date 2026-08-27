import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { MediaThumbnail } from '@/features/articles/components/MediaThumbnail';
import { contentTypeLabel } from '@/features/articles/presentation';
import { CandidateConversionForm } from '@/features/newsInbox/components/CandidateConversionForm';
import { DismissCandidateDialog } from '@/features/newsInbox/components/DismissCandidateDialog';
import { CandidateStatusChip } from '@/features/newsInbox/components/NewsStatusChip';
import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';
import { formatInboxDate } from '@/features/newsInbox/presentation';
import {
  useCandidateTransitionMutation,
  useConvertCandidateMutation,
  useDismissCandidateMutation,
  useNewsCandidateQuery,
} from '@/features/newsInbox/queries';

export const AdminNewsCandidateDetailPage = () => {
  const candidateId = useParams().candidateId ?? '';
  const query = useNewsCandidateQuery(candidateId);
  const review = useCandidateTransitionMutation(candidateId, 'review');
  const save = useCandidateTransitionMutation(candidateId, 'save');
  const dismiss = useDismissCandidateMutation(candidateId);
  const convert = useConvertCandidateMutation(candidateId);
  const [dismissOpen, setDismissOpen] = useState(false);
  const navigate = useNavigate();
  if (query.isPending) return <AdminLoading label="Loading candidate" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );
  const candidate = query.data;
  const actionable = ['NEW', 'REVIEWING', 'SAVED'].includes(candidate.status);
  const mediaContentType = contentTypeLabel(candidate.contentType);
  const transitionError = review.error ?? save.error;
  return (
    <>
      <AdminPageHeader
        title={candidate.headline}
        description={`${candidate.sourceName} · Discovered ${formatInboxDate(candidate.discoveredAt)}`}
        action={
          <Button component={RouterLink} to="/admin/news-candidates">
            Candidate inbox
          </Button>
        }
      />
      {transitionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getNewsInboxErrorMessage(transitionError)}
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { sm: 'center' },
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CandidateStatusChip status={candidate.status} />
              {mediaContentType ? (
                <Chip size="small" label={mediaContentType} />
              ) : null}
              {candidate.source?.isOfficialTeam ? (
                <Chip size="small" variant="outlined" label="Official Team" />
              ) : null}
            </Stack>
            {actionable ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {candidate.status !== 'REVIEWING' ? (
                  <Button
                    variant="outlined"
                    disabled={review.isPending}
                    onClick={() => review.mutate()}
                  >
                    Begin review
                  </Button>
                ) : null}
                {candidate.status !== 'SAVED' ? (
                  <Button
                    variant="outlined"
                    disabled={save.isPending}
                    onClick={() => save.mutate()}
                  >
                    Save for later
                  </Button>
                ) : null}
                <Button color="error" onClick={() => setDismissOpen(true)}>
                  Dismiss
                </Button>
              </Stack>
            ) : null}
          </Stack>
          <Link
            href={candidate.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              alignSelf: 'flex-start',
            }}
          >
            Open publisher article
            <OpenInNewRounded fontSize="inherit" />
          </Link>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            }}
          >
            <Info
              label="Source author"
              value={candidate.sourceAuthor ?? 'Not provided'}
            />
            <Info
              label="Source publication"
              value={formatInboxDate(candidate.sourcePublishedAt)}
            />
            <Info
              label="Reviewed by"
              value={candidate.reviewedBySnapshot ?? 'Not reviewed'}
            />
            <Info
              label="Reviewed at"
              value={formatInboxDate(candidate.reviewedAt)}
            />
          </Box>
          {mediaContentType ? (
            <div>
              <Typography component="h2" variant="h5">
                Media preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The feed-provided thumbnail; no video is fetched or embedded.
              </Typography>
              <Box sx={{ mt: 1, maxWidth: 480 }}>
                <MediaThumbnail
                  thumbnailUrl={candidate.thumbnailUrl}
                  alt={candidate.headline}
                  contentType={mediaContentType}
                  team={candidate.suggestedTeams[0]}
                />
              </Box>
            </div>
          ) : null}
          <div>
            <Typography component="h2" variant="h5">
              Publisher-provided description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Read-only source metadata; it is not automatically approved for
              publication.
            </Typography>
            <Typography
              color={
                candidate.sourceDescription ? 'text.primary' : 'text.secondary'
              }
              sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
            >
              {candidate.sourceDescription ??
                'No publisher description was supplied.'}
            </Typography>
          </div>
          <div>
            <Typography component="h2" variant="h5">
              Suggested teams
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These deterministic suggestions are starting points, not final
              article tags.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}
            >
              {candidate.suggestedTeams.length ? (
                candidate.suggestedTeams.map((team) => (
                  <Chip
                    key={team.id}
                    label={`${team.abbreviation} · ${team.rule}`}
                    title={team.fullName}
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No team suggestions; treat as league-wide unless editorial
                  review finds otherwise.
                </Typography>
              )}
            </Stack>
          </div>
          {candidate.dismissalReason ? (
            <Alert severity="info">
              Dismissal reason: {candidate.dismissalReason}
            </Alert>
          ) : null}
          {candidate.convertedArticleId ? (
            <Alert
              severity="success"
              action={
                <Button
                  component={RouterLink}
                  to={`/admin/articles/${candidate.convertedArticleId}`}
                >
                  Open draft
                </Button>
              }
            >
              This candidate has been converted into a curated draft.
            </Alert>
          ) : null}
        </Stack>
      </Paper>
      {actionable ? (
        <CandidateConversionForm
          candidate={candidate}
          error={convert.error}
          isSubmitting={convert.isPending}
          onSubmit={async (input) => {
            const result = await convert.mutateAsync(input);
            return result.article.id;
          }}
          onSuccess={(articleId) => {
            void navigate(`/admin/articles/${articleId}`, {
              replace: true,
              state: { convertedCandidateHeadline: candidate.headline },
            });
          }}
        />
      ) : null}
      <DismissCandidateDialog
        open={dismissOpen}
        error={dismiss.error}
        isPending={dismiss.isPending}
        onClose={() => setDismissOpen(false)}
        onDismiss={async (reason) => {
          await dismiss.mutateAsync(reason);
          setDismissOpen(false);
        }}
      />
    </>
  );
};

const Info = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <div>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography>{value}</Typography>
  </div>
);
