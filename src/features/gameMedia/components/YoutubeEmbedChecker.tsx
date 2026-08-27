import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  checkYoutubeEmbeddable,
  type YoutubeOembedCheckResult,
} from '@/features/gameMedia/youtubeOembed';

export interface YoutubeEmbedCheckerUseResult {
  readonly embedUrl: string;
  readonly canonicalUrl: string;
  readonly title: string | null;
  readonly thumbnailUrl: string | null;
}

export const YoutubeEmbedChecker = ({
  onUseVideo,
}: {
  readonly onUseVideo: (result: YoutubeEmbedCheckerUseResult) => void;
}) => {
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'checked'>('idle');
  const [result, setResult] = useState<YoutubeOembedCheckResult | null>(null);

  const check = async () => {
    setStatus('checking');
    const checked = await checkYoutubeEmbeddable(link.trim());
    setResult(checked);
    setStatus('checked');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">
          Check a YouTube link (optional)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Paste a normal YouTube watch link to confirm it allows embedding
          before filling in the fields below.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="YouTube link"
            placeholder="https://www.youtube.com/watch?v=..."
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setStatus('idle');
              setResult(null);
            }}
          />
          <Button
            variant="outlined"
            disabled={link.trim() === '' || status === 'checking'}
            onClick={() => void check()}
            sx={{ flexShrink: 0 }}
          >
            {status === 'checking' ? 'Checking…' : 'Check embeddability'}
          </Button>
        </Stack>
        {status === 'checked' && result?.embeddable ? (
          <Alert
            severity="success"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  onUseVideo({
                    embedUrl: result.embedUrl!,
                    canonicalUrl: link.trim(),
                    title: result.title,
                    thumbnailUrl: result.thumbnailUrl,
                  })
                }
              >
                Use this video
              </Button>
            }
          >
            {result.title ?? 'This video'} can be embedded.
          </Alert>
        ) : null}
        {status === 'checked' && result && !result.embeddable ? (
          <Alert severity="warning">
            {result.videoId === null
              ? 'That does not look like a YouTube link.'
              : 'This video cannot be embedded elsewhere (the uploader disabled it, or it does not exist). Try another link.'}
          </Alert>
        ) : null}
      </Stack>
    </Paper>
  );
};
