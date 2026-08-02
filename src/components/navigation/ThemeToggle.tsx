import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import { IconButton, Tooltip } from '@mui/material';

import { useThemePreferences } from '@/stores/themePreferences';

export const ThemeToggle = () => {
  const mode = useThemePreferences((state) => state.mode);
  const toggleMode = useThemePreferences((state) => state.toggleMode);
  const targetMode = mode === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${targetMode} mode`;

  return (
    <Tooltip title={label} arrow>
      <IconButton aria-label={label} onClick={toggleMode} color="inherit">
        {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  );
};
