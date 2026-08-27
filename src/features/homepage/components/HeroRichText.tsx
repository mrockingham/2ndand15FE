import { Box, Link, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import type {
  HeroRichTextBlockNode,
  HeroRichTextDocument,
  HeroRichTextInlineNode,
  HeroRichTextTextNode,
} from '@/features/homepage/types';

const isInternalHref = (href: string) => href.startsWith('/');

const renderTextNode = (node: HeroRichTextTextNode, key: number): ReactNode => {
  const marks = node.marks ?? [];
  let content: ReactNode = node.text;
  if (marks.includes('italic')) content = <em>{content}</em>;
  if (marks.includes('bold')) content = <strong>{content}</strong>;
  return <span key={key}>{content}</span>;
};

const renderInlineNode = (
  node: HeroRichTextInlineNode,
  key: number,
): ReactNode => {
  if (node.type === 'text') return renderTextNode(node, key);
  return isInternalHref(node.href) ? (
    <Link key={key} component={RouterLink} to={node.href} color="inherit">
      {node.children.map((child, index) => renderTextNode(child, index))}
    </Link>
  ) : (
    <Link
      key={key}
      href={node.href}
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
    >
      {node.children.map((child, index) => renderTextNode(child, index))}
    </Link>
  );
};

const headingVariant: Readonly<Record<1 | 2 | 3, 'h3' | 'h4' | 'h5'>> = {
  1: 'h3',
  2: 'h4',
  3: 'h5',
};

const renderBlock = (block: HeroRichTextBlockNode, key: number): ReactNode => {
  const align = block.align ?? 'left';
  const children = block.children.map((child, index) =>
    renderInlineNode(child, index),
  );
  if (block.type === 'heading') {
    return (
      <Typography
        key={key}
        component={`h${block.level}`}
        variant={headingVariant[block.level]}
        sx={{ textAlign: align }}
      >
        {children}
      </Typography>
    );
  }
  return (
    <Typography key={key} component="p" sx={{ textAlign: align }}>
      {children}
    </Typography>
  );
};

/**
 * Renders the backend's closed hero rich-text JSON document to semantic
 * markup (h1-h3/p/a) -- never `dangerouslySetInnerHTML`, never HTML parsing.
 * The document model has no script/iframe/raw-HTML node type at all, so
 * there is nothing to sanitize here beyond the link-href safety already
 * enforced by the schema (internal path or https:// only).
 */
export const HeroRichText = ({
  document,
}: {
  readonly document: HeroRichTextDocument;
}) => (
  <Box>
    {document.children.map((block, index) => renderBlock(block, index))}
  </Box>
);
