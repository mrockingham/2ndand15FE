import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { MediaThumbnail } from '@/features/articles/components/MediaThumbnail';
import { contentTypeLabel } from '@/features/articles/presentation';
import { CandidateStatusChip } from '@/features/newsInbox/components/NewsStatusChip';
import {
  formatInboxDate,
  safeHostname,
} from '@/features/newsInbox/presentation';
import type { NewsCandidateListItem } from '@/features/newsInbox/types';

export const CandidateCard = ({
  candidate,
}: {
  readonly candidate: NewsCandidateListItem;
}) => {
  const hostname = safeHostname(candidate.canonicalUrl);
  const mediaContentType = contentTypeLabel(candidate.contentType);
  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {mediaContentType ? (
        <MediaThumbnail
          thumbnailUrl={candidate.thumbnailUrl}
          alt={candidate.headline}
          contentType={mediaContentType}
          team={candidate.suggestedTeams[0]}
        />
      ) : null}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
        >
          <CandidateStatusChip status={candidate.status} />
          {mediaContentType ? (
            <Chip size="small" label={mediaContentType} />
          ) : null}
          <Typography variant="overline">{candidate.sourceName}</Typography>
          {candidate.source?.isOfficialTeam ? (
            <Chip size="small" variant="outlined" label="Official Team" />
          ) : null}
        </Stack>
        <Typography component="h2" variant="h5" sx={{ mt: 1.5 }}>
          {candidate.headline}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
          Published {formatInboxDate(candidate.sourcePublishedAt)} · Discovered{' '}
          {formatInboxDate(candidate.discoveredAt)}
        </Typography>
        {candidate.sourceAuthor ? (
          <Typography variant="body2">By {candidate.sourceAuthor}</Typography>
        ) : null}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 2, flexWrap: 'wrap', gap: 0.75 }}
        >
          {candidate.suggestedTeams.map((team) => (
            <Chip key={team.id} size="small" label={team.abbreviation} />
          ))}
          {candidate.suggestedTeams.length === 0 ? (
            <Chip size="small" label="League-wide" variant="outlined" />
          ) : null}
        </Stack>
        {hostname ? (
          <Link
            href={candidate.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
            }}
          >
            {hostname}
            <OpenInNewRounded fontSize="inherit" />
          </Link>
        ) : null}
      </CardContent>
      <CardActions>
        <Button
          component={RouterLink}
          to={`/admin/news-candidates/${candidate.id}`}
        >
          Open candidate
        </Button>
        {candidate.convertedArticleId ? (
          <Button
            component={RouterLink}
            to={`/admin/articles/${candidate.convertedArticleId}`}
          >
            Open draft
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
};
