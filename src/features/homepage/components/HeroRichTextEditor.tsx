import AddRounded from '@mui/icons-material/AddRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FormatAlignCenterRounded from '@mui/icons-material/FormatAlignCenterRounded';
import FormatAlignLeftRounded from '@mui/icons-material/FormatAlignLeftRounded';
import FormatAlignRightRounded from '@mui/icons-material/FormatAlignRightRounded';
import FormatBoldRounded from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRounded from '@mui/icons-material/FormatItalicRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import type {
  HeroRichTextAlign,
  HeroRichTextBlockNode,
  HeroRichTextDocument,
  HeroRichTextInlineNode,
  HeroRichTextMark,
} from '@/features/homepage/types';

const MAX_BLOCKS = 20;

const emptyTextRun: HeroRichTextInlineNode = { type: 'text', text: '' };

const blockKind = (block: HeroRichTextBlockNode) =>
  block.type === 'heading'
    ? (`h${String(block.level)}` as const)
    : ('paragraph' as const);

const blockFromKind = (
  kind: 'paragraph' | 'h1' | 'h2' | 'h3',
  previous: HeroRichTextBlockNode,
): HeroRichTextBlockNode =>
  kind === 'paragraph'
    ? { type: 'paragraph', align: previous.align, children: previous.children }
    : {
        type: 'heading',
        level: Number(kind.slice(1)) as 1 | 2 | 3,
        align: previous.align,
        children: previous.children,
      };

const replaceAt = <T,>(items: readonly T[], index: number, value: T): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? value : item));

const removeAt = <T,>(items: readonly T[], index: number): T[] =>
  items.filter((_, itemIndex) => itemIndex !== index);

const RunEditor = ({
  run,
  onChange,
  onRemove,
  canRemove,
}: {
  readonly run: HeroRichTextInlineNode;
  readonly onChange: (next: HeroRichTextInlineNode) => void;
  readonly onRemove: () => void;
  readonly canRemove: boolean;
}) => {
  if (run.type === 'link') {
    const text = run.children[0]?.text ?? '';
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <LinkRounded fontSize="small" color="action" aria-hidden="true" />
        <TextField
          size="small"
          label="Link text"
          value={text}
          onChange={(event) =>
            onChange({
              ...run,
              children: [{ type: 'text', text: event.target.value }],
            })
          }
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label="Link URL"
          placeholder="/news/slug or https://…"
          value={run.href}
          onChange={(event) => onChange({ ...run, href: event.target.value })}
          sx={{ flex: 1 }}
        />
        {canRemove ? (
          <IconButton aria-label="Remove link" onClick={onRemove} size="small">
            <DeleteRounded fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>
    );
  }

  const marks = run.marks ?? [];
  const toggleMark = (mark: HeroRichTextMark) => {
    const next = marks.includes(mark)
      ? marks.filter((value) => value !== mark)
      : [...marks, mark];
    onChange({ ...run, marks: next });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <TextField
        size="small"
        label="Text"
        value={run.text}
        onChange={(event) => onChange({ ...run, text: event.target.value })}
        sx={{ flex: 1 }}
      />
      <ToggleButtonGroup size="small" aria-label="Text formatting">
        <ToggleButton
          value="bold"
          selected={marks.includes('bold')}
          onClick={() => toggleMark('bold')}
          aria-label="Bold"
        >
          <FormatBoldRounded fontSize="small" />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={marks.includes('italic')}
          onClick={() => toggleMark('italic')}
          aria-label="Italic"
        >
          <FormatItalicRounded fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      {canRemove ? (
        <IconButton aria-label="Remove text" onClick={onRemove} size="small">
          <DeleteRounded fontSize="small" />
        </IconButton>
      ) : null}
    </Stack>
  );
};

const BlockEditor = ({
  block,
  onChange,
  onRemove,
}: {
  readonly block: HeroRichTextBlockNode;
  readonly onChange: (next: HeroRichTextBlockNode) => void;
  readonly onRemove: () => void;
}) => {
  const setChildren = (children: readonly HeroRichTextInlineNode[]) => {
    onChange({ ...block, children } as HeroRichTextBlockNode);
  };

  return (
    <Stack
      spacing={1.25}
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={blockKind(block)}
            onChange={(event) =>
              onChange(
                blockFromKind(
                  event.target.value as 'paragraph' | 'h1' | 'h2' | 'h3',
                  block,
                ),
              )
            }
          >
            <MenuItem value="paragraph">Paragraph</MenuItem>
            <MenuItem value="h1">Heading 1</MenuItem>
            <MenuItem value="h2">Heading 2</MenuItem>
            <MenuItem value="h3">Heading 3</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={block.align ?? 'left'}
          onChange={(_, value: HeroRichTextAlign | null) => {
            if (value !== null) onChange({ ...block, align: value });
          }}
          aria-label="Alignment"
        >
          <ToggleButton value="left" aria-label="Align left">
            <FormatAlignLeftRounded fontSize="small" />
          </ToggleButton>
          <ToggleButton value="center" aria-label="Align center">
            <FormatAlignCenterRounded fontSize="small" />
          </ToggleButton>
          <ToggleButton value="right" aria-label="Align right">
            <FormatAlignRightRounded fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <IconButton aria-label="Remove block" onClick={onRemove} size="small">
          <DeleteRounded fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1}>
        {block.children.map((run, index) => (
          <RunEditor
            key={index}
            run={run}
            canRemove={block.children.length > 1}
            onChange={(next) =>
              setChildren(replaceAt(block.children, index, next))
            }
            onRemove={() => setChildren(removeAt(block.children, index))}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          startIcon={<AddRounded />}
          onClick={() => setChildren([...block.children, { ...emptyTextRun }])}
        >
          Add text
        </Button>
        <Button
          size="small"
          startIcon={<LinkRounded />}
          onClick={() =>
            setChildren([
              ...block.children,
              {
                type: 'link',
                href: '/',
                children: [{ type: 'text', text: 'Link text' }],
              },
            ])
          }
        >
          Add link
        </Button>
      </Stack>
    </Stack>
  );
};

/**
 * Structured composer for the backend's closed Hero rich-text JSON --
 * serializes directly to `HeroRichTextDocument`, never through HTML or
 * Markdown. There's no drag-and-type WYSIWYG surface here (no existing
 * rich-text editor library in this codebase, and pulling one in for a
 * 9-slot, marks-only document felt disproportionate); instead each block's
 * inline runs are edited as discrete rows, which keeps the model
 * unambiguous and fully keyboard/testable.
 */
export const HeroRichTextEditor = ({
  document,
  onChange,
}: {
  readonly document: HeroRichTextDocument;
  readonly onChange: (next: HeroRichTextDocument) => void;
}) => {
  const setBlocks = (children: readonly HeroRichTextBlockNode[]) => {
    onChange({ type: 'doc', children });
  };

  return (
    <Stack spacing={1.5}>
      {document.children.map((block, index) => (
        <BlockEditor
          key={index}
          block={block}
          onChange={(next) =>
            setBlocks(replaceAt(document.children, index, next))
          }
          onRemove={() => setBlocks(removeAt(document.children, index))}
        />
      ))}
      {document.children.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No content yet. Add a paragraph or heading.
        </Typography>
      ) : null}
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddRounded />}
          disabled={document.children.length >= MAX_BLOCKS}
          onClick={() =>
            setBlocks([
              ...document.children,
              {
                type: 'paragraph',
                align: 'left',
                children: [{ ...emptyTextRun }],
              },
            ])
          }
        >
          Add block
        </Button>
      </Stack>
    </Stack>
  );
};
