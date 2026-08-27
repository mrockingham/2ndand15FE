import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { HeroRichText } from '@/features/homepage/components/HeroRichText';
import type { HeroRichTextDocument } from '@/features/homepage/types';

const renderDoc = (document: HeroRichTextDocument) =>
  render(
    <MemoryRouter>
      <HeroRichText document={document} />
    </MemoryRouter>,
  );

describe('HeroRichText', () => {
  it('renders a paragraph as a semantic <p>', () => {
    renderDoc({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Hello there' }],
        },
      ],
    });
    const paragraph = screen.getByText('Hello there');
    expect(paragraph.closest('p')).toBeInTheDocument();
  });

  it('renders headings 1-3 as semantic h1/h2/h3', () => {
    renderDoc({
      type: 'doc',
      children: [
        {
          type: 'heading',
          level: 1,
          children: [{ type: 'text', text: 'One' }],
        },
        {
          type: 'heading',
          level: 2,
          children: [{ type: 'text', text: 'Two' }],
        },
        {
          type: 'heading',
          level: 3,
          children: [{ type: 'text', text: 'Three' }],
        },
      ],
    });
    expect(
      screen.getByRole('heading', { level: 1, name: 'One' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Two' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Three' }),
    ).toBeInTheDocument();
  });

  it('applies bold and italic marks as strong/em', () => {
    renderDoc({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'Strong italic', marks: ['bold', 'italic'] },
          ],
        },
      ],
    });
    const text = screen.getByText('Strong italic');
    expect(text.closest('strong')).toBeInTheDocument();
    expect(text.closest('em')).toBeInTheDocument();
  });

  it('renders alignment via text-align style', () => {
    renderDoc({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          align: 'right',
          children: [{ type: 'text', text: 'Right aligned' }],
        },
      ],
    });
    const paragraph = screen.getByText('Right aligned').closest('p');
    expect(paragraph).toHaveStyle({ textAlign: 'right' });
  });

  it('renders an internal link with react-router navigation, external link with target=_blank', () => {
    renderDoc({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              href: '/news/story',
              children: [{ type: 'text', text: 'Read more' }],
            },
            { type: 'text', text: ' ' },
            {
              type: 'link',
              href: 'https://example.com',
              children: [{ type: 'text', text: 'External' }],
            },
          ],
        },
      ],
    });
    const internal = screen.getByRole('link', { name: 'Read more' });
    expect(internal).toHaveAttribute('href', '/news/story');
    const external = screen.getByRole('link', { name: 'External' });
    expect(external).toHaveAttribute('href', 'https://example.com');
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('never uses dangerouslySetInnerHTML anywhere in its output', () => {
    const { container } = renderDoc({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: '<script>alert(1)</script>' }],
        },
      ],
    });
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
  });
});
