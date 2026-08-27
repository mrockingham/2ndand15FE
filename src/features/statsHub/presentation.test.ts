import {
  formatMetricValue,
  formatTeamContext,
} from '@/features/statsHub/presentation';

describe('Stats Hub presentation', () => {
  it('preserves missing values and recorded zero while using metadata precision', () => {
    expect(formatMetricValue(null, { decimalPlaces: 0 })).toBe('—');
    expect(formatMetricValue(0, { decimalPlaces: 0 })).toBe('0');
    expect(formatMetricValue(12.5, { decimalPlaces: 1 })).toBe('12.5');
    expect(formatMetricValue(4500, { decimalPlaces: 0 })).toBe('4,500');
  });

  it('labels multi-team context without substituting a latest team', () => {
    expect(
      formatTeamContext({
        type: 'MULTI',
        teams: [{ abbreviation: 'BUF' }, { abbreviation: 'PHI' }],
      }),
    ).toBe('Multiple teams (BUF, PHI)');
  });
});
