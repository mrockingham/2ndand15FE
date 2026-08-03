import { render, screen } from '@testing-library/react';

import { MarkdownContent } from '@/features/articles/components/MarkdownContent';

describe('safe article Markdown', () => {
  it('renders GFM while dropping raw HTML and inline images', () => {
    const { container } = render(
      <MarkdownContent
        markdown={
          '**Safe**\n\n<script>bad()</script>\n\n![play](https://example.com/a.png)'
        }
      />,
    );

    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('[Image omitted: play]')).toBeInTheDocument();
  });

  it('isolates external links', () => {
    render(<MarkdownContent markdown="[Source](https://example.com/story)" />);

    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });
});
