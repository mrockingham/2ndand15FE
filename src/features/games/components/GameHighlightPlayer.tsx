import { Box } from '@mui/material';

export const GameHighlightPlayer = ({
  embedUrl,
  title,
}: {
  readonly embedUrl: string;
  readonly title: string;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 9',
      overflow: 'hidden',
      borderRadius: 1,
      bgcolor: 'common.black',
    }}
  >
    <Box
      component="iframe"
      src={embedUrl}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
      }}
    />
  </Box>
);
