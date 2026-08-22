import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { Button, CircularProgress } from '@mui/material';

export const GameCenterRefreshButton = ({
  onRefresh,
  isRefreshing,
}: {
  readonly onRefresh: () => void;
  readonly isRefreshing: boolean;
}) => (
  <Button
    onClick={onRefresh}
    disabled={isRefreshing}
    size="small"
    variant="text"
    color="inherit"
    startIcon={
      isRefreshing ? (
        <CircularProgress size={14} color="inherit" />
      ) : (
        <RefreshRounded fontSize="small" />
      )
    }
    sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
  >
    Refresh
  </Button>
);
