import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { Keyboard } from '@mui/icons-material';

interface ShortcutIndicatorProps {
  shortcuts: string[];
  description?: string;
}

const ShortcutIndicator: React.FC<ShortcutIndicatorProps> = ({ shortcuts, description }) => {
  const theme = useTheme();
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  const formatKey = (key: string): string => {
    const replacements: Record<string, string> = {
      'cmd': isMac ? '⌘' : 'Ctrl',
      'ctrl': isMac ? '⌃' : 'Ctrl',
      'alt': isMac ? '⌥' : 'Alt',
      'shift': isMac ? '⇧' : 'Shift',
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→',
    };
    return replacements[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.5,
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <Keyboard sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
      <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
        {shortcuts.map((shortcut, index) => (
          <React.Fragment key={index}>
            <Chip
              label={formatKey(shortcut)}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
            {index < shortcuts.length - 1 && (
              <Typography variant="caption" sx={{ mx: 0.25, color: theme.palette.text.secondary }}>
                +
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
      {description && (
        <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default ShortcutIndicator;