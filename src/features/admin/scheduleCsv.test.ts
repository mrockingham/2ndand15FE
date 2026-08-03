import {
  MAX_IMPORT_BYTES,
  parseScheduleCsv,
  ScheduleCsvError,
  SCHEDULE_COLUMNS,
} from '@/features/admin/scheduleCsv';

const row =
  '2026,REG,1,2026-09-11T00:20:00Z,PHI,BUF,SCHEDULED,Highmark Stadium,Orchard Park,NBC,false,Official schedule,OFFICIAL_WEB,https://example.com/schedule,game-1,Verified source';
const csv = `${SCHEDULE_COLUMNS.join(',')}\n${row}`;

describe('schedule CSV parsing', () => {
  it('parses the exact documented format into JSON rows', () => {
    expect(parseScheduleCsv(csv)).toEqual([
      expect.objectContaining({
        season: 2026,
        week: 1,
        awayTeam: 'PHI',
        homeTeam: 'BUF',
        isNeutralSite: false,
      }),
    ]);
  });

  it('preserves the backend-supported TBD kickoff literal', () => {
    const [parsed] = parseScheduleCsv(
      csv.replace('2026-09-11T00:20:00Z', 'TBD'),
    );
    expect(parsed?.startTime).toBe('TBD');
  });

  it('rejects an altered header, same-team row, and spreadsheet formula markers', () => {
    expect(() =>
      parseScheduleCsv(csv.replace('season,seasonType', 'seasonType,season')),
    ).toThrow(/header must exactly match/i);
    expect(() =>
      parseScheduleCsv(csv.replace(',PHI,BUF,', ',BUF,BUF,')),
    ).toThrow(ScheduleCsvError);
    expect(() =>
      parseScheduleCsv(csv.replace('Verified source', '=HYPERLINK("bad")')),
    ).toThrow(/invalid/i);
  });

  it('enforces the backend file-size and row limits', () => {
    expect(() =>
      parseScheduleCsv(
        `${SCHEDULE_COLUMNS.join(',')}\n${'x'.repeat(MAX_IMPORT_BYTES)}`,
      ),
    ).toThrow(/1 MiB/i);
    expect(() =>
      parseScheduleCsv(
        `${SCHEDULE_COLUMNS.join(',')}\n${Array.from({ length: 501 }, () => row).join('\n')}`,
      ),
    ).toThrow(/500 rows/i);
  });
});
