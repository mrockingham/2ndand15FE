import { Box, Chip, Stack, Typography } from '@mui/material';

const sensitiveKey = /password|token|authorization|cookie|secret|api.?key/i;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const flatten = (
  value: unknown,
  prefix = '',
  output: Record<string, string> = {},
) => {
  if (!isRecord(value)) return output;
  Object.entries(value).forEach(([key, child]) => {
    if (sensitiveKey.test(key)) return;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isRecord(child)) flatten(child, path, output);
    else if (Array.isArray(child)) output[path] = `[${child.length} items]`;
    else
      output[path] =
        child === null || child === undefined ? '—' : String(child);
  });
  return output;
};

export const AuditDifference = ({
  before,
  after,
}: {
  readonly before: unknown;
  readonly after: unknown;
}) => {
  const previous = flatten(before);
  const next = flatten(after);
  const keys = [...new Set([...Object.keys(previous), ...Object.keys(next)])]
    .filter((key) => previous[key] !== next[key])
    .slice(0, 30);
  if (keys.length === 0)
    return (
      <Typography color="text.secondary">
        No field differences recorded.
      </Typography>
    );
  return (
    <Stack spacing={1}>
      {keys.map((key) => (
        <Box
          key={key}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'minmax(140px, .6fr) 1fr auto 1fr',
            },
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Chip
            size="small"
            variant="outlined"
            label={key}
            sx={{ justifySelf: 'start' }}
          />
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {previous[key] ?? '—'}
          </Typography>
          <Typography aria-hidden="true">→</Typography>
          <Typography
            variant="body2"
            sx={{ overflowWrap: 'anywhere', fontWeight: 600 }}
          >
            {next[key] ?? '—'}
          </Typography>
        </Box>
      ))}
      {keys.length === 30 ? (
        <Typography variant="caption" color="text.secondary">
          Only the first 30 changed fields are shown.
        </Typography>
      ) : null}
    </Stack>
  );
};
