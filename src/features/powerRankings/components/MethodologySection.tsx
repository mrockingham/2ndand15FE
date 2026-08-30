import { Link, Paper, Stack, Typography } from '@mui/material';

export const MethodologySection = ({
  methodology,
  sources,
}: {
  readonly methodology: string;
  readonly sources: readonly string[];
}) => {
  if (methodology.trim() === '' && sources.length === 0) return null;
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Methodology"
      sx={{ p: { xs: 2.5, md: 3 } }}
    >
      <Stack spacing={1.5}>
        <Typography component="h2" variant="h5">
          Methodology
        </Typography>
        {methodology.trim() !== '' ? (
          <Typography color="text.secondary">{methodology}</Typography>
        ) : null}
        {sources.length ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Sources</Typography>
            <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
              {sources.map((source) => (
                <Typography component="li" key={source} variant="body2">
                  {source.startsWith('http') ? (
                    <Link href={source} target="_blank" rel="noreferrer">
                      {source}
                    </Link>
                  ) : (
                    source
                  )}
                </Typography>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};
