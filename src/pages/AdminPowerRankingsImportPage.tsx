import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { getPowerRankingsErrorMessage } from '@/features/powerRankings/errors';
import {
  MAX_POWER_RANKINGS_IMPORT_BYTES,
  parsePowerRankingsImportJson,
  PowerRankingsImportError,
} from '@/features/powerRankings/importParsing';
import { useImportPowerRankingsMutation } from '@/features/powerRankings/queries';
import type { PowerRankingImportResult } from '@/features/powerRankings/types';

const ResultSummary = ({
  result,
  title,
}: {
  readonly result: PowerRankingImportResult;
  readonly title: string;
}) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="h5">{title}</Typography>
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ mt: 1, mb: 1, flexWrap: 'wrap' }}
    >
      <Typography>
        Season: <strong>{result.season ?? '—'}</strong>
      </Typography>
      <Typography>
        Edition: <strong>{result.edition ?? '—'}</strong>
      </Typography>
      <Typography>
        As of: <strong>{result.asOf ?? '—'}</strong>
      </Typography>
      <Typography>
        Found: <strong>{result.foundCount}</strong>
      </Typography>
      <Typography>
        Matched teams: <strong>{result.matchedTeams}</strong>
      </Typography>
    </Stack>
    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
      <Chip
        size="small"
        color={result.errors.length ? 'error' : 'success'}
        label={`${String(result.errors.length)} error(s)`}
      />
      <Chip
        size="small"
        color={result.warnings.length ? 'warning' : 'default'}
        label={`${String(result.warnings.length)} warning(s)`}
      />
    </Stack>
    {result.errors.length ? (
      <Table size="small" aria-label="Import errors" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell>Path</TableCell>
            <TableCell>Problem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.errors.map((issue, index) => (
            <TableRow key={`${issue.path ?? ''}-${String(index)}`}>
              <TableCell>{issue.path ?? '—'}</TableCell>
              <TableCell>{issue.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : null}
    {result.warnings.length ? (
      <Table size="small" aria-label="Import warnings" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell>Path</TableCell>
            <TableCell>Warning</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.warnings.map((issue, index) => (
            <TableRow key={`${issue.path ?? ''}-${String(index)}`}>
              <TableCell>{issue.path ?? '—'}</TableCell>
              <TableCell>{issue.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : null}
  </Paper>
);

export const AdminPowerRankingsImportPage = () => {
  const [content, setContent] = useState('');
  const [payload, setPayload] = useState<unknown>(null);
  const [validatedContent, setValidatedContent] = useState<string | null>(null);
  const [parseError, setParseError] = useState<PowerRankingsImportError | null>(
    null,
  );
  const [confirmApply, setConfirmApply] = useState(false);
  const previewMutation = useImportPowerRankingsMutation();
  const applyMutation = useImportPowerRankingsMutation();

  const updateContent = (value: string) => {
    setContent(value);
    setPayload(null);
    setValidatedContent(null);
    setParseError(null);
    previewMutation.reset();
    applyMutation.reset();
  };

  const validate = async () => {
    try {
      const parsed = parsePowerRankingsImportJson(content);
      setParseError(null);
      setPayload(parsed);
      const result = await previewMutation.mutateAsync({
        mode: 'PREVIEW',
        payload: parsed,
      });
      if (result.errors.length === 0) setValidatedContent(content);
    } catch (error: unknown) {
      if (error instanceof PowerRankingsImportError) setParseError(error);
      else throw error;
    }
  };

  const canApply =
    validatedContent === content &&
    payload !== null &&
    previewMutation.data?.errors.length === 0 &&
    !applyMutation.isPending;

  const apply = async () => {
    if (payload === null) return;
    await applyMutation.mutateAsync({
      mode: 'UPSERT',
      payload,
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Import Power Rankings"
        description="Paste or select JSON, preview it without writing, then explicitly confirm the import. This never publishes an edition."
      />
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Alert severity="info">
              JSON only, up to 1 MiB. Preview validates against the backend
              without writing anything.
            </Alert>
            <Button
              component="label"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            >
              Select JSON file
              <input
                hidden
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_POWER_RANKINGS_IMPORT_BYTES) {
                    setParseError(
                      new PowerRankingsImportError(
                        'Power Rankings imports may not exceed 1 MiB.',
                      ),
                    );
                    return;
                  }
                  void file.text().then(updateContent);
                }}
              />
            </Button>
            <TextField
              label="Power Rankings JSON"
              multiline
              minRows={12}
              value={content}
              onChange={(event) => updateContent(event.target.value)}
              slotProps={{ htmlInput: { 'aria-describedby': 'json-help' } }}
            />
            <Typography id="json-help" variant="caption" color="text.secondary">
              Changing this content invalidates any prior preview.
            </Typography>
            <Button
              variant="contained"
              disabled={content.trim() === '' || previewMutation.isPending}
              onClick={() => void validate()}
              sx={{ alignSelf: 'flex-start' }}
            >
              {previewMutation.isPending ? 'Validating…' : 'Preview import'}
            </Button>
          </Stack>
        </Paper>
        {parseError ? (
          <Alert severity="error">{parseError.message}</Alert>
        ) : null}
        {previewMutation.error ? (
          <Alert severity="error">
            {getPowerRankingsErrorMessage(previewMutation.error)}
          </Alert>
        ) : null}
        {previewMutation.data ? (
          <ResultSummary result={previewMutation.data} title="Preview result" />
        ) : null}
        {previewMutation.data ? (
          <Button
            variant="contained"
            color="warning"
            disabled={!canApply}
            onClick={() => setConfirmApply(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Apply validated import
          </Button>
        ) : null}
        {applyMutation.error ? (
          <Alert severity="error">
            {getPowerRankingsErrorMessage(applyMutation.error)}
          </Alert>
        ) : null}
        {applyMutation.data ? (
          <ResultSummary
            result={applyMutation.data}
            title="Final import result"
          />
        ) : null}
      </Stack>
      <Dialog
        open={confirmApply}
        onClose={() => setConfirmApply(false)}
        aria-labelledby="confirm-power-rankings-import-title"
      >
        <DialogTitle id="confirm-power-rankings-import-title">
          Apply validated import?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This creates or updates the Power Rankings edition and its entries.
            It does not publish the edition -- publish it separately once
            you&apos;ve reviewed it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmApply(false)}>Cancel</Button>
          <Button
            color="warning"
            disabled={applyMutation.isPending}
            onClick={async () => {
              if (!canApply) return;
              setConfirmApply(false);
              await apply();
            }}
          >
            Confirm import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
