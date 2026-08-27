import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { createAppTheme } from '@/theme/createAppTheme';

const renderHelmet = (
  component: React.ReactNode,
  mode: 'light' | 'dark' = 'dark',
) =>
  render(
    <ThemeProvider theme={createAppTheme(mode)}>{component}</ThemeProvider>,
  );

describe('TeamHelmet', () => {
  it.each(['sm', 'md', 'lg'] as const)(
    'renders the reusable helmet at %s',
    (size) => {
      const { container } = renderHelmet(<TeamHelmet team="PHI" size={size} />);
      expect(
        screen.getByRole('img', { name: 'Philadelphia Eagles helmet' }),
      ).toBeInTheDocument();
      expect(container.querySelector('svg')).toHaveAttribute(
        'data-helmet-size',
        size,
      );
    },
  );

  it('uses a compact badge for xs, badge variants, and unknown teams', () => {
    const { rerender } = renderHelmet(<TeamHelmet team="PHI" size="xs" />);
    expect(
      screen.getByRole('img', { name: 'Philadelphia Eagles team badge' }),
    ).toHaveTextContent('PHI');

    rerender(
      <ThemeProvider theme={createAppTheme('light')}>
        <TeamHelmet team="DAL" variant="badge" />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole('img', { name: 'Dallas Cowboys team badge' }),
    ).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={createAppTheme('dark')}>
        <TeamHelmet team="XYZ" />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole('img', { name: 'XYZ team badge' }),
    ).toHaveTextContent('XYZ');
  });

  it('supports meaningful and decorative accessibility in light and dark themes', () => {
    const { container, rerender } = renderHelmet(
      <TeamHelmet team="KC" />,
      'light',
    );
    expect(
      screen.getByRole('img', { name: 'Kansas City Chiefs helmet' }),
    ).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={createAppTheme('dark')}>
        <TeamHelmet team="KC" decorative />
      </ThemeProvider>,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('creates unique SVG definition IDs for every instance', () => {
    const { container } = renderHelmet(
      <>
        <TeamHelmet team="PHI" />
        <TeamHelmet team="DAL" />
      </>,
    );
    const ids = [...container.querySelectorAll('defs [id]')].map(
      (element) => element.id,
    );
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(['KC', 'GB', 'NE', 'NO', 'SF', 'TB', 'LV'])(
    'centers prominent short abbreviation typography for %s',
    (team) => {
      const { container } = renderHelmet(<TeamHelmet team={team} size="md" />);
      const abbreviation = container.querySelector('text');

      expect(abbreviation).toHaveAttribute('x', '63');
      expect(abbreviation).toHaveAttribute('y', '51');
      expect(abbreviation).toHaveAttribute('font-size', '22');
      expect(abbreviation).toHaveAttribute('font-weight', '900');
      expect(abbreviation).toHaveAttribute('letter-spacing', '-1.2');
      expect(abbreviation).toHaveAttribute(
        'font-family',
        'Arial Narrow, Roboto Condensed, Inter Tight, Inter, system-ui, sans-serif',
      );
    },
  );

  it.each(['PHI', 'DAL', 'BUF', 'SEA', 'WAS', 'CIN', 'CLE'])(
    'centers prominent three-letter typography for %s',
    (team) => {
      const { container } = renderHelmet(<TeamHelmet team={team} size="lg" />);
      const abbreviation = container.querySelector('text');

      expect(abbreviation).toHaveTextContent(team);
      expect(abbreviation).toHaveAttribute('x', '63');
      expect(abbreviation).toHaveAttribute('y', '51');
      expect(abbreviation).toHaveAttribute('font-size', '22');
    },
  );

  it('keeps sm typography reduced and xs on the badge fallback', () => {
    const { container, rerender } = renderHelmet(
      <TeamHelmet team="PHI" size="sm" />,
    );
    expect(container.querySelector('text')).toHaveAttribute('font-size', '20');

    rerender(
      <ThemeProvider theme={createAppTheme('dark')}>
        <TeamHelmet team="PHI" size="xs" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('img', { name: /team badge/i })).toHaveTextContent(
      'PHI',
    );
  });
});
