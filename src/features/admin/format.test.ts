import { formatAdminDateTime } from '@/features/admin/format';

describe('admin schedule formatting', () => {
  it('renders null and invalid kickoffs as Time TBD', () => {
    expect(formatAdminDateTime(null)).toBe('Time TBD');
    expect(formatAdminDateTime('invalid')).toBe('Time TBD');
  });

  it('formats a valid kickoff', () => {
    expect(formatAdminDateTime('2026-09-11T00:20:00.000Z')).not.toBe(
      'Time TBD',
    );
  });
});
