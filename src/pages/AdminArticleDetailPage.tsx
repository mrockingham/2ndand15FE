import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AuditEventList } from '@/features/admin/components/AuditEventList';
import { useAuditEventsQuery } from '@/features/admin/queries';
import { toEditorialFields } from '@/features/articles/articleFormMapping';
import { ArticleForm } from '@/features/articles/components/ArticleForm';
import { ArticleLifecycle } from '@/features/articles/components/ArticleLifecycle';
import { ArticleStatusChip } from '@/features/articles/components/ArticleStatusChip';
import { RevisionHistory } from '@/features/articles/components/RevisionHistory';
import {
  useAdminArticleQuery,
  useReplaceArticleTeamsMutation,
  useUpdateArticleMutation,
} from '@/features/articles/queries';
import type { ArticleFormValues } from '@/features/articles/schemas';
import { useCurrentUserQuery } from '@/features/users/queries';

export const AdminArticleDetailPage = () => {
  const { articleId = '' } = useParams();
  const query = useAdminArticleQuery(articleId);
  const update = useUpdateArticleMutation(articleId);
  const teams = useReplaceArticleTeamsMutation(articleId);
  const role = useCurrentUserQuery().data?.role ?? 'USER';
  const location = useLocation();
  const conversionHeadline = (
    location.state as { convertedCandidateHeadline?: unknown } | null
  )?.convertedCandidateHeadline;
  if (query.isPending) return <AdminLoading label="Loading article" />;
  if (query.isError)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );
  const article = query.data;
  return (
    <>
      {typeof conversionHeadline === 'string' ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          “{conversionHeadline}” was converted into this private curated draft.
          Review it before publishing or scheduling.
        </Alert>
      ) : null}
      <Button component={RouterLink} to="/admin/articles" sx={{ mb: 2 }}>
        Back to articles
      </Button>
      <AdminPageHeader
        title={article.title}
        description={`Version ${article.version} · Updated ${new Date(article.updatedAt).toLocaleString()}`}
        action={
          <Stack direction="row" spacing={1}>
            <ArticleStatusChip status={article.status} />
            <Chip label={article.type} />
          </Stack>
        }
      />
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 2fr) minmax(320px, .8fr)',
          },
        }}
      >
        <Box>
          <ArticleForm
            key={article.version}
            article={article}
            error={update.error ?? teams.error}
            isSubmitting={update.isPending || teams.isPending}
            onReload={() => void query.refetch()}
            onSubmit={async (values: ArticleFormValues) => {
              await update.mutateAsync({
                ...toEditorialFields(values),
                expectedVersion: article.version,
                changeSummary: values.changeSummary.trim() || null,
              });
            }}
            onSaveTeams={async (teamIds, changeSummary) => {
              await teams.mutateAsync({
                expectedVersion: article.version,
                teamIds,
                changeSummary: changeSummary.trim() || null,
              });
            }}
          />
        </Box>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <ArticleLifecycle article={article} role={role} />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="h4">Current placement</Typography>
            <Typography>Status: {article.status}</Typography>
            <Typography>Version: {article.version}</Typography>
            <Typography>
              Teams:{' '}
              {article.teams.map((team) => team.abbreviation).join(', ') ||
                'League-wide'}
            </Typography>
            <Typography>
              Featured:{' '}
              {article.isFeatured
                ? `Yes, priority ${article.featuredPriority ?? 'default'}`
                : 'No'}
            </Typography>
            {article.scheduledFor ? (
              <Typography>
                Scheduled: {new Date(article.scheduledFor).toLocaleString()}
              </Typography>
            ) : null}
          </Paper>
        </Stack>
      </Box>
      <Paper variant="outlined" sx={{ p: 2.5, mt: 3 }}>
        <RevisionHistory articleId={article.id} />
      </Paper>
      {role === 'ADMIN' ? <ArticleAudit articleId={article.id} /> : null}
    </>
  );
};

const ArticleAudit = ({ articleId }: { readonly articleId: string }) => {
  const audit = useAuditEventsQuery({
    entityType: 'ARTICLE',
    entityId: articleId,
    limit: 20,
  });
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Article audit events
      </Typography>
      {audit.data?.events.length ? (
        <AuditEventList events={audit.data.events} />
      ) : audit.isError ? (
        <Alert severity="info">Article audit events are unavailable.</Alert>
      ) : (
        <Typography color="text.secondary">No article audit events.</Typography>
      )}
    </Paper>
  );
};
