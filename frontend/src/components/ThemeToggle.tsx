import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
      <IconButton
        onClick={toggleTheme}
        aria-label="Changer le thème"
        sx={{ color: 'inherit' }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
