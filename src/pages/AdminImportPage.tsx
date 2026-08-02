import {
  Alert,
  Button,
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
import { getAdminErrorMessage } from '@/features/admin/errorMessages';
import {
  useRefreshRoleOnForbidden,
  useValidateImportMutation,
  useWriteImportMutation,
} from '@/features/admin/queries';
import {
  MAX_IMPORT_BYTES,
  parseScheduleCsv,
  ScheduleCsvError,
} from '@/features/admin/scheduleCsv';
import type {
  ScheduleImportResult,
  ScheduleImportRow,
} from '@/features/admin/types';

const ResultSummary = ({
  result,
  title,
}: {
  readonly result: ScheduleImportResult;
  readonly title: string;
}) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="h5">{title}</Typography>
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ mt: 1, flexWrap: 'wrap' }}
    >
      <Typography>
        Received: <strong>{result.received}</strong>
      </Typography>
      <Typography>
        Created: <strong>{result.created}</strong>
      </Typography>
      <Typography>
        Updated: <strong>{result.updated}</strong>
      </Typography>
      <Typography>
        Skipped: <strong>{result.skipped}</strong>
      </Typography>
      <Typography>
        Warnings: <strong>{result.warnings}</strong>
      </Typography>
      <Typography>
        Failed: <strong>{result.failed}</strong>
      </Typography>
    </Stack>
    {result.failures.length ? (
      <Table size="small" aria-label="Import row failures" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>CSV row</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Problem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.failures.map((failure) => (
            <TableRow key={`${failure.row}-${failure.code}`}>
              <TableCell>{failure.row}</TableCell>
              <TableCell>{failure.code}</TableCell>
              <TableCell>{failure.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : null}
  </Paper>
);

export const AdminImportPage = () => {
  const [content, setContent] = useState('');
  const [rows, setRows] = useState<readonly ScheduleImportRow[]>([]);
  const [validatedContent, setValidatedContent] = useState<string | null>(null);
  const [parseError, setParseError] = useState<ScheduleCsvError | null>(null);
  const [confirmWrite, setConfirmWrite] = useState(false);
  const validateMutation = useValidateImportMutation();
  const writeMutation = useWriteImportMutation();
  useRefreshRoleOnForbidden(validateMutation.error ?? writeMutation.error);
  const updateContent = (value: string) => {
    setContent(value);
    setRows([]);
    setValidatedContent(null);
    setParseError(null);
    validateMutation.reset();
    writeMutation.reset();
  };
  const validate = async () => {
    try {
      const parsed = parseScheduleCsv(content);
      setParseError(null);
      setRows(parsed);
      const result = await validateMutation.mutateAsync(parsed);
      if (result.failed === 0) setValidatedContent(content);
    } catch (error: unknown) {
      if (error instanceof ScheduleCsvError) setParseError(error);
      else throw error;
    }
  };
  const canWrite =
    validatedContent === content &&
    rows.length > 0 &&
    validateMutation.data?.failed === 0 &&
    !writeMutation.isPending;
  return (
    <>
      <AdminPageHeader
        title="Import schedule"
        description="Paste or select a CSV, validate it without writing, then explicitly confirm the import."
      />
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Alert severity="info">
              CSV only, up to 1 MiB and 500 data rows. The exact documented
              header is required. Spreadsheet formulas are rejected and never
              executed.
            </Alert>
            <Button
              component="label"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            >
              Select CSV file
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_IMPORT_BYTES) {
                    setParseError(
                      new ScheduleCsvError(
                        'Schedule imports may not exceed 1 MiB.',
                      ),
                    );
                    return;
                  }
                  void file.text().then(updateContent);
                }}
              />
            </Button>
            <TextField
              label="Schedule CSV"
              multiline
              minRows={12}
              value={content}
              onChange={(event) => updateContent(event.target.value)}
              slotProps={{ htmlInput: { 'aria-describedby': 'csv-help' } }}
            />
            <Typography id="csv-help" variant="caption" color="text.secondary">
              Changing this content invalidates any prior validation.
            </Typography>
            <Button
              variant="contained"
              disabled={content.trim() === '' || validateMutation.isPending}
              onClick={() => void validate()}
              sx={{ alignSelf: 'flex-start' }}
            >
              {validateMutation.isPending
                ? 'Validating…'
                : 'Validate without writing'}
            </Button>
          </Stack>
        </Paper>
        {parseError ? (
          <Alert severity="error">
            <Typography>{parseError.message}</Typography>
            {parseError.issues.slice(0, 50).map((issue) => (
              <Typography key={`${issue.row}-${issue.field}`} variant="body2">
                Row {issue.row}, {issue.field}: {issue.message}
              </Typography>
            ))}
          </Alert>
        ) : null}
        {validateMutation.error ? (
          <Alert severity="error">
            {getAdminErrorMessage(validateMutation.error)}
          </Alert>
        ) : null}
        {validateMutation.data ? (
          <ResultSummary
            result={validateMutation.data}
            title="Validation result"
          />
        ) : null}
        {validateMutation.data ? (
          <Button
            variant="contained"
            color="warning"
            disabled={!canWrite}
            onClick={() => setConfirmWrite(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Write validated schedule
          </Button>
        ) : null}
        {writeMutation.error ? (
          <Alert severity="error">
            {getAdminErrorMessage(writeMutation.error)}
          </Alert>
        ) : null}
        {writeMutation.data ? (
          <ResultSummary
            result={writeMutation.data}
            title="Final import result"
          />
        ) : null}
      </Stack>
      <Dialog
        open={confirmWrite}
        onClose={() => setConfirmWrite(false)}
        aria-labelledby="confirm-import-title"
      >
        <DialogTitle id="confirm-import-title">
          Write validated schedule?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create or update schedule records for the exact{' '}
            {rows.length} validated rows. Provider-backed changes may become
            editorial overrides.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmWrite(false)}>Cancel</Button>
          <Button
            color="warning"
            disabled={writeMutation.isPending}
            onClick={async () => {
              if (!canWrite) return;
              setConfirmWrite(false);
              await writeMutation.mutateAsync(rows);
            }}
          >
            Confirm import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
