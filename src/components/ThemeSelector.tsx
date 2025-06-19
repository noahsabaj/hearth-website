import { Palette } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Tooltip, Typography, Box, Fade } from '@mui/material';
import React, { useState, useCallback, memo } from 'react';

import { syntaxThemes, SyntaxTheme } from '../themes/syntaxThemes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

/**
 * Theme selector component for syntax highlighting
 * Provides a dropdown menu with theme previews
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = memo(({ currentTheme, onThemeChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setHoveredTheme(null);
  }, []);

  const handleThemeSelect = useCallback(
    (themeName: string) => {
      onThemeChange(themeName);
      handleClose();
    },
    [onThemeChange, handleClose]
  );

  const renderThemePreview = useCallback(
    (theme: SyntaxTheme) => (
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre',
        }}
      >
        <span style={{ color: theme.colors.keyword }}>const</span>{' '}
        <span style={{ color: theme.colors.variable }}>example</span>{' '}
        <span style={{ color: theme.foreground }}>=</span>{' '}
        <span style={{ color: theme.colors.string }}>"Hello"</span>
        <span style={{ color: theme.foreground }}>;</span>
      </Box>
    ),
    []
  );

  return (
    <>
      <Tooltip title='Change syntax theme'>
        <IconButton
          onClick={handleClick}
          size='small'
          aria-label='Change syntax highlighting theme'
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          sx={{
            color: '#999',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
            },
            '&:focus': {
              outline: '2px solid #ff4500',
              outlineOffset: '2px',
            },
          }}
        >
          <Palette fontSize='small' />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade as any}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            maxHeight: 400,
            '& .MuiList-root': {
              py: 1,
            },
          },
        }}
      >
        {Object.entries(syntaxThemes).map(([key, theme]) => (
          <MenuItem
            key={key}
            onClick={() => handleThemeSelect(key)}
            onMouseEnter={() => setHoveredTheme(key)}
            onMouseLeave={() => setHoveredTheme(null)}
            selected={currentTheme === key}
            sx={{
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 69, 0, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 69, 0, 0.2)',
                },
              },
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography
                variant='body2'
                sx={{
                  mb: hoveredTheme === key ? 1 : 0,
                  fontWeight: currentTheme === key ? 600 : 400,
                  color: currentTheme === key ? '#ff4500' : 'inherit',
                }}
              >
                {theme.displayName}
              </Typography>
              {hoveredTheme === key && (
                <Fade in timeout={200}>
                  <Box>{renderThemePreview(theme)}</Box>
                </Fade>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

ThemeSelector.displayName = 'ThemeSelector';

export default ThemeSelector;
