import AddRounded from '@mui/icons-material/AddRounded';
import DeleteForeverRounded from '@mui/icons-material/DeleteForeverRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import UnpublishedRounded from '@mui/icons-material/UnpublishedRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ArticleStatusChip } from '@/features/articles/components/ArticleStatusChip';
import { getArticleErrorMessage } from '@/features/articles/errors';
import {
  useAdminArticlesQuery,
  useArticleLifecycleMutation,
  useDeleteArticleMutation,
} from '@/features/articles/queries';
import type {
  AdminArticleListItem,
  ArticleStatus,
  ArticleType,
} from '@/features/articles/types';
import {
  useAdminTopStoriesQuery,
  useMarkTopStoryMutation,
  useUnmarkTopStoryMutation,
} from '@/features/homepage/queries';
import { MAX_TOP_STORIES } from '@/features/homepage/types';
import { useTeamsQuery } from '@/features/teams/queries';
import { useCurrentUserQuery } from '@/features/users/queries';
import type { UserRole } from '@/features/users/types';

type PendingArticleAction = {
  readonly type: 'unpublish' | 'delete';
  readonly article: AdminArticleListItem;
} | null;

const ArticleActionsMenu = ({
  article,
  role,
  onAction,
}: {
  readonly article: AdminArticleListItem;
  readonly role: UserRole;
  readonly onAction: (action: NonNullable<PendingArticleAction>) => void;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  return (
    <>
      <IconButton
        aria-label={`Open actions for ${article.title}`}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <MoreVertRounded />
      </IconButton>
      <Menu anchorEl={anchor} open={anchor !== null} onClose={close}>
        <MenuItem
          component={RouterLink}
          to={`/admin/articles/${article.id}`}
          onClick={close}
        >
          <EditRounded fontSize="small" sx={{ mr: 1.25 }} />
          Edit
        </MenuItem>
        {['PUBLISHED', 'SCHEDULED'].includes(article.status) ? (
          <MenuItem
            onClick={() => {
              close();
              onAction({ type: 'unpublish', article });
            }}
          >
            <UnpublishedRounded fontSize="small" sx={{ mr: 1.25 }} />
            Unpublish
          </MenuItem>
        ) : null}
        {role === 'ADMIN' ? (
          <MenuItem
            onClick={() => {
              close();
              onAction({ type: 'delete', article });
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteForeverRounded fontSize="small" sx={{ mr: 1.25 }} />
            Delete permanently
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
};

const TopStoryToggle = ({
  articleId,
  isTopStory,
  atCap,
}: {
  readonly articleId: string;
  readonly isTopStory: boolean;
  readonly atCap: boolean;
}) => {
  const mark = useMarkTopStoryMutation();
  const unmark = useUnmarkTopStoryMutation();
  const isPending = mark.isPending || unmark.isPending;
  const disabled = isPending || (!isTopStory && atCap);
  const checkbox = (
    <Checkbox
      size="small"
      checked={isTopStory}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        if (event.target.checked) mark.mutate(articleId);
        else unmark.mutate(articleId);
      }}
      slotProps={{ input: { 'aria-label': 'Top Story' } }}
    />
  );
  return !isTopStory && atCap ? (
    <Tooltip
      title={`The homepage may have at most ${String(MAX_TOP_STORIES)} Top Stories.`}
    >
      <span>{checkbox}</span>
    </Tooltip>
  ) : (
    checkbox
  );
};

export const AdminArticlesPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const [pendingAction, setPendingAction] =
    useState<PendingArticleAction>(null);
  const [changeSummary, setChangeSummary] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const teams = useTeamsQuery();
  const role = useCurrentUserQuery().data?.role ?? 'USER';
  const unpublish = useArticleLifecycleMutation(
    pendingAction?.article.id ?? '',
    'unpublish',
  );
  const permanentlyDelete = useDeleteArticleMutation(
    pendingAction?.article.id ?? '',
    pendingAction?.article.slug ?? '',
  );
  const searchValue = parameters.get('search') ?? '';
  const filters = {
    limit: 25,
    cursor: parameters.get('cursor') || undefined,
    status: (parameters.get('status') || undefined) as
      ArticleStatus | undefined,
    type: (parameters.get('type') || undefined) as ArticleType | undefined,
    teamId: parameters.get('teamId') || undefined,
    featured: parameters.has('featured')
      ? parameters.get('featured') === 'true'
      : undefined,
    search: searchValue.trim().length >= 2 ? searchValue.trim() : undefined,
  };
  const query = useAdminArticlesQuery(filters);
  const topStoriesQuery = useAdminTopStoriesQuery();
  const topStoryArticleIds = new Set(
    topStoriesQuery.data?.map((story) => story.article.id) ?? [],
  );
  const atTopStoryCap = (topStoriesQuery.data?.length ?? 0) >= MAX_TOP_STORIES;
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('cursor');
    setParameters(next);
  };
  const closeAction = () => {
    setPendingAction(null);
    setChangeSummary('');
    unpublish.reset();
    permanentlyDelete.reset();
  };
  const openAction = (action: NonNullable<PendingArticleAction>) => {
    unpublish.reset();
    permanentlyDelete.reset();
    setChangeSummary('');
    setPendingAction(action);
  };
  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === 'unpublish') {
        await unpublish.mutateAsync({
          expectedVersion: pendingAction.article.version,
          changeSummary: changeSummary.trim() || null,
        });
        setSuccessMessage('Article unpublished.');
      } else {
        const result = await permanentlyDelete.mutateAsync();
        setSuccessMessage(
          result.alreadyGone
            ? 'Article was already permanently deleted.'
            : 'Article permanently deleted.',
        );
      }
      closeAction();
    } catch {
      // The dialog renders the normalized mutation error without leaking API details.
    }
  };
  const actionError = unpublish.error ?? permanentlyDelete.error;
  return (
    <>
      <AdminPageHeader
        title="Articles"
        description="Create, review, feature, and publish editorial coverage."
        action={
          <Button
            component={RouterLink}
            to="/admin/articles/new"
            variant="contained"
            startIcon={<AddRounded />}
          >
            New article
          </Button>
        }
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Search"
            value={parameters.get('search') ?? ''}
            onChange={(event) => update('search', event.target.value)}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={parameters.get('status') ?? ''}
            onChange={(event) => update('status', event.target.value)}
          >
            <MenuItem value="">Active statuses</MenuItem>
            {['DRAFT', 'SCHEDULED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'].map(
              (status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ),
            )}
          </TextField>
          <TextField
            fullWidth
            select
            label="Type"
            value={parameters.get('type') ?? ''}
            onChange={(event) => update('type', event.target.value)}
          >
            <MenuItem value="">All types</MenuItem>
            {['ORIGINAL', 'CURATED', 'ANNOUNCEMENT'].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Team"
            value={parameters.get('teamId') ?? ''}
            onChange={(event) => update('teamId', event.target.value)}
          >
            <MenuItem value="">All teams</MenuItem>
            {teams.data?.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.abbreviation}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Featured"
            value={parameters.get('featured') ?? ''}
            onChange={(event) => update('featured', event.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Featured</MenuItem>
            <MenuItem value="false">Not featured</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      {query.isPending ? <AdminLoading label="Loading articles" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data?.articles.length === 0 ? (
        <AdminEmpty
          title="No articles found"
          description="No editorial articles match these filters."
        />
      ) : null}
      {query.data?.articles.length ? (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <Table aria-label="Editorial articles">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Teams</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Top Story</TableCell>
                  <TableCell>Publication</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.articles.map((article) => (
                  <TableRow key={article.id} hover>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`/admin/articles/${article.id}`}
                        underline="hover"
                        color="inherit"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>{article.type}</TableCell>
                    <TableCell>
                      <ArticleStatusChip status={article.status} />
                    </TableCell>
                    <TableCell>
                      {article.teams
                        .map((team) => team.abbreviation)
                        .join(', ') || 'League-wide'}
                    </TableCell>
                    <TableCell>
                      {article.isFeatured
                        ? `Yes · ${article.featuredPriority ?? 'default'}`
                        : 'No'}
                    </TableCell>
                    <TableCell>
                      <TopStoryToggle
                        articleId={article.id}
                        isTopStory={topStoryArticleIds.has(article.id)}
                        atCap={atTopStoryCap}
                      />
                    </TableCell>
                    <TableCell>
                      {article.scheduledFor
                        ? `Scheduled ${new Date(article.scheduledFor).toLocaleString()}`
                        : article.publishedAt
                          ? new Date(article.publishedAt).toLocaleString()
                          : 'Not published'}
                    </TableCell>
                    <TableCell>
                      {new Date(article.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{article.version}</TableCell>
                    <TableCell align="right">
                      <ArticleActionsMenu
                        article={article}
                        role={role}
                        onAction={openAction}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { lg: 'none' } }}>
            {query.data.articles.map((article) => (
              <Card key={article.id} variant="outlined">
                <CardActionArea
                  component={RouterLink}
                  to={`/admin/articles/${article.id}`}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1}>
                      <ArticleStatusChip status={article.status} />
                      <Typography variant="overline">{article.type}</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ my: 1 }}>
                      {article.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {article.teams
                        .map((team) => team.abbreviation)
                        .join(' · ') || 'League-wide'}{' '}
                      · Version {article.version}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardContent sx={{ pt: 0 }}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <TopStoryToggle
                          articleId={article.id}
                          isTopStory={topStoryArticleIds.has(article.id)}
                          atCap={atTopStoryCap}
                        />
                      }
                      label="Top Story"
                    />
                    <ArticleActionsMenu
                      article={article}
                      role={role}
                      onAction={openAction}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {query.data.nextCursor ? (
              <Button
                onClick={() => {
                  const next = new URLSearchParams(parameters);
                  next.set('cursor', query.data.nextCursor ?? '');
                  setParameters(next);
                }}
              >
                Next page
              </Button>
            ) : null}
          </Box>
        </>
      ) : null}
      <Dialog
        open={pendingAction !== null}
        onClose={closeAction}
        aria-labelledby="article-action-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="article-action-title">
          {pendingAction?.type === 'delete'
            ? 'Permanently delete this article?'
            : 'Unpublish this article?'}
        </DialogTitle>
        <DialogContent>
          {pendingAction?.type === 'delete' ? (
            <>
              <DialogContentText>
                You are about to permanently delete{' '}
                <strong>{pendingAction.article.title}</strong>.
              </DialogContentText>
              <DialogContentText sx={{ mt: 1, fontWeight: 700 }}>
                This cannot be undone.
              </DialogContentText>
            </>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                This uses article version {pendingAction?.article.version} and
                removes the article from public views.
              </DialogContentText>
              <TextField
                fullWidth
                label="Change summary"
                value={changeSummary}
                onChange={(event) => setChangeSummary(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
            </>
          )}
          {actionError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getArticleErrorMessage(actionError)}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAction}>Cancel</Button>
          <Button
            variant="contained"
            color={pendingAction?.type === 'delete' ? 'error' : 'warning'}
            disabled={unpublish.isPending || permanentlyDelete.isPending}
            onClick={() => void confirmAction()}
          >
            {pendingAction?.type === 'delete'
              ? 'Delete permanently'
              : 'Unpublish'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={successMessage !== null}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
