import { z } from 'zod';

import type { ScheduleImportRow } from '@/features/admin/types';

export const MAX_IMPORT_BYTES = 1_048_576;
export const MAX_IMPORT_ROWS = 500;
export const SCHEDULE_COLUMNS = [
  'season',
  'seasonType',
  'week',
  'startTime',
  'awayTeam',
  'homeTeam',
  'status',
  'venueName',
  'venueCity',
  'broadcastNetwork',
  'isNeutralSite',
  'sourceName',
  'sourceType',
  'sourceUrl',
  'externalReference',
  'notes',
] as const;

const rowSchema = z.object({
  season: z.number().int().min(1920).max(2100),
  seasonType: z.enum(['PRE', 'REG', 'POST']),
  week: z.number().int().min(1).max(22).nullable(),
  startTime: z.iso.datetime({ offset: true }),
  awayTeam: z.string().min(2).max(8),
  homeTeam: z.string().min(2).max(8),
  status: z.enum([
    'SCHEDULED',
    'PREGAME',
    'IN_PROGRESS',
    'HALFTIME',
    'FINAL',
    'POSTPONED',
    'CANCELED',
    'SUSPENDED',
  ]),
  venueName: z.string().min(1).max(160).nullable(),
  venueCity: z.string().min(1).max(128).nullable(),
  broadcastNetwork: z.string().min(1).max(64).nullable(),
  isNeutralSite: z.boolean(),
  sourceName: z.string().min(1).max(160),
  sourceType: z.enum(['MANUAL_IMPORT', 'OFFICIAL_WEB', 'DEVELOPMENT_FIXTURE']),
  sourceUrl: z.url().max(2048).nullable(),
  externalReference: z.string().min(1).max(256).nullable(),
  notes: z.string().min(1).max(1000).nullable(),
});

export class ScheduleCsvError extends Error {
  constructor(
    message: string,
    readonly issues: readonly {
      row: number;
      field: string;
      message: string;
    }[] = [],
  ) {
    super(message);
    this.name = 'ScheduleCsvError';
  }
}

const parseRecords = (text: string) => {
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let rowCharacters = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] ?? '';
    rowCharacters += 1;
    if (rowCharacters > 16_384)
      throw new ScheduleCsvError('A CSV row exceeds 16,384 characters.');
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"' && field.length === 0) quoted = true;
    else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = '';
      rowCharacters = 0;
    } else field += character;
  }
  if (quoted)
    throw new ScheduleCsvError(
      'The CSV contains an unterminated quoted field.',
    );
  row.push(field.replace(/\r$/, ''));
  if (row.some(Boolean)) records.push(row);
  return records;
};

export const parseScheduleCsv = (
  rawText: string,
): readonly ScheduleImportRow[] => {
  const text = rawText.replace(/^\uFEFF/, '');
  if (new Blob([text]).size > MAX_IMPORT_BYTES)
    throw new ScheduleCsvError('Schedule imports may not exceed 1 MiB.');
  const records = parseRecords(text);
  const header = records.shift();
  if (
    !header ||
    header.length !== SCHEDULE_COLUMNS.length ||
    !header.every((value, index) => value.trim() === SCHEDULE_COLUMNS[index])
  ) {
    throw new ScheduleCsvError(
      `The CSV header must exactly match: ${SCHEDULE_COLUMNS.join(',')}.`,
    );
  }
  if (records.length === 0)
    throw new ScheduleCsvError('The schedule import has no data rows.');
  if (records.length > MAX_IMPORT_ROWS)
    throw new ScheduleCsvError(
      'Schedule imports may contain at most 500 rows.',
    );
  const issues: { row: number; field: string; message: string }[] = [];
  const rows: ScheduleImportRow[] = [];
  records.forEach((record, index) => {
    const rowNumber = index + 2;
    if (record.length !== SCHEDULE_COLUMNS.length) {
      issues.push({
        row: rowNumber,
        field: 'row',
        message: 'Column count does not match the header.',
      });
      return;
    }
    const value = (position: number) => record[position]?.trim() ?? '';
    const nullable = (position: number) => value(position) || null;
    const neutral = value(10).toLowerCase();
    const candidate = {
      season: Number(value(0)),
      seasonType: value(1).toUpperCase(),
      week: value(2) ? Number(value(2)) : null,
      startTime: value(3),
      awayTeam: value(4).toUpperCase(),
      homeTeam: value(5).toUpperCase(),
      status: value(6).toUpperCase(),
      venueName: nullable(7),
      venueCity: nullable(8),
      broadcastNetwork: nullable(9),
      isNeutralSite:
        neutral === 'true' ? true : neutral === 'false' ? false : neutral,
      sourceName: value(11),
      sourceType: value(12).toUpperCase(),
      sourceUrl: nullable(13),
      externalReference: nullable(14),
      notes: nullable(15),
    };
    const unsafe = [7, 8, 9, 11, 12, 14, 15].find((position) =>
      /^[=+\-@]/.test(value(position)),
    );
    if (unsafe !== undefined) {
      issues.push({
        row: rowNumber,
        field: SCHEDULE_COLUMNS[unsafe],
        message: 'Value begins with a spreadsheet formula marker.',
      });
      return;
    }
    const parsed = rowSchema.safeParse(candidate);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        issues.push({
          row: rowNumber,
          field: issue.path.join('.'),
          message: issue.message,
        }),
      );
      return;
    }
    if (parsed.data.homeTeam === parsed.data.awayTeam) {
      issues.push({
        row: rowNumber,
        field: 'awayTeam',
        message: 'Home and away teams must differ.',
      });
      return;
    }
    rows.push(parsed.data);
  });
  if (issues.length > 0)
    throw new ScheduleCsvError(
      'One or more schedule rows are invalid.',
      issues,
    );
  return rows;
};
