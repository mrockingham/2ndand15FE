import { Box, Link } from '@mui/material';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const safeUrl = (url: string) => {
  if (/^(?:javascript|data|vbscript):/i.test(url.trim())) return '';
  return defaultUrlTransform(url);
};

export const MarkdownContent = ({
  markdown,
  draft = false,
}: {
  readonly markdown: string;
  readonly draft?: boolean;
}) => (
  <Box
    data-testid={draft ? 'draft-markdown-preview' : 'markdown-content'}
    sx={{
      '& pre': {
        overflowX: 'auto',
        p: 2,
        borderRadius: 1,
        bgcolor: 'action.hover',
      },
      '& code': { overflowWrap: 'anywhere' },
      '& blockquote': {
        m: 0,
        pl: 2,
        borderLeft: 3,
        borderColor: 'divider',
        color: 'text.secondary',
      },
      '& img': { maxWidth: '100%' },
    }}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      urlTransform={safeUrl}
      components={{
        a: ({ href, children }) => {
          const external = /^https?:\/\//i.test(href ?? '');
          return (
            <Link
              href={href}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {children}
            </Link>
          );
        },
        img: ({ alt }) => (
          <Box component="span">[Image omitted{alt ? `: ${alt}` : ''}]</Box>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  </Box>
);
