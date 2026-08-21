import { createAppTheme } from '@/theme/createAppTheme';

describe('team accent semantic boundaries', () => {
  it('keeps status palettes semantic and scopes button accents to primary controls', () => {
    const theme = createAppTheme('dark');
    const buttonOverrides = theme.components?.MuiButton?.styleOverrides;

    expect(theme.palette.error.main).toBe('#FF6577');
    expect(theme.palette.warning.main).toBe('#F9B44E');
    expect(theme.palette.success.main).toBe('#42D39B');
    expect(JSON.stringify(buttonOverrides)).toContain(
      'MuiButton-containedPrimary',
    );
    expect(JSON.stringify(buttonOverrides)).not.toContain(
      'MuiButton-containedError',
    );
  });
});
