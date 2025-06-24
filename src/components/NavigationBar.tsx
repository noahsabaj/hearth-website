import {
  GitHub,
  Download,
  MenuBook,
  Home,
  Help,
  Keyboard,
  Engineering,
  Contrast,
  CollectionsBookmark,
  Speed,
  Newspaper,
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import SearchBar, { SearchBarRef } from './SearchBar';
import { COLORS, SPACING, LAYOUT, MISC, HIGH_CONTRAST_COLORS } from '../constants';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';
import { useThemeContext } from '../contexts/ThemeContext';

interface NavigationBarProps {
  variant?: 'home' | 'docs' | 'downloads' | 'showcase' | 'faq';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ variant = 'home' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { showToast, setSearchFocusCallback } = useKeyboardShortcutsContext();
  const { highContrastMode, toggleHighContrastMode } = useThemeContext();
  const searchBarRef = useRef<SearchBarRef>(null);

  // Connect search bar focus to keyboard shortcuts
  useEffect(() => {
    setSearchFocusCallback(() => {
      searchBarRef.current?.focus();
    });
  }, [setSearchFocusCallback]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        background: COLORS.background.overlayLight,
        backdropFilter: LAYOUT.backdropFilter.blur,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
      component='nav'
      role='navigation'
      aria-label='Main navigation'
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link
            to='/'
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src={MISC.logo.path}
              alt='Hearth Engine'
              style={{
                height: SPACING.navbar.logoHeight,
                marginRight: SPACING.navbar.logoMargin,
                backgroundColor: COLORS.utils.transparent,
              }}
            />
            {!isMobile && (
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                Hearth Engine
              </Typography>
            )}
          </Link>
        </Box>

        {/* Search Bar */}
        <SearchBar ref={searchBarRef} />

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {variant !== 'home' && !isMobile && (
            <Button
              color='inherit'
              component={Link}
              to='/'
              startIcon={<Home />}
              sx={{
                borderBottom: isActive('/') ? '2px solid' : '2px solid transparent',
                borderColor: theme.palette.primary.main,
                borderRadius: 0,
                '&:hover': {
                  borderBottom: '2px solid',
                  borderColor: theme.palette.primary.light,
                },
              }}
            >
              Home
            </Button>
          )}

          <Button
            color='inherit'
            component={Link}
            to='/docs'
            startIcon={!isMobile && <MenuBook />}
            sx={{
              borderBottom: isActive('/docs') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            {isMobile ? 'Docs' : 'Documentation'}
          </Button>

          <Button
            color='inherit'
            component={Link}
            to='/engine'
            startIcon={!isMobile && <Engineering />}
            sx={{
              borderBottom: isActive('/engine') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            Engine
          </Button>

          <Button
            color='inherit'
            component={Link}
            to='/downloads'
            startIcon={!isMobile && <Download />}
            sx={{
              borderBottom: isActive('/downloads') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            Downloads
          </Button>

          <Button
            color='inherit'
            component={Link}
            to='/showcase'
            startIcon={!isMobile && <CollectionsBookmark />}
            sx={{
              borderBottom: isActive('/showcase') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            Showcase
          </Button>

          <Button
            color='inherit'
            component={Link}
            to='/benchmarks'
            startIcon={!isMobile && <Speed />}
            sx={{
              borderBottom: isActive('/benchmarks') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            {isMobile ? 'Bench' : 'Benchmarks'}
          </Button>

          <Button
            color='inherit'
            component={Link}
            to='/updates'
            startIcon={!isMobile && <Newspaper />}
            sx={{
              borderBottom: isActive('/updates') ? '2px solid' : '2px solid transparent',
              borderColor: theme.palette.primary.main,
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid',
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            Updates
          </Button>

          {!isMobile && (
            <Button
              color='inherit'
              component={Link}
              to='/faq'
              startIcon={<Help />}
              sx={{
                borderBottom: isActive('/faq') ? '2px solid' : '2px solid transparent',
                borderColor: theme.palette.primary.main,
                borderRadius: 0,
                '&:hover': {
                  borderBottom: '2px solid',
                  borderColor: theme.palette.primary.light,
                },
              }}
            >
              FAQ
            </Button>
          )}

          <IconButton
            color='inherit'
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: '?' });
              window.dispatchEvent(event);
              showToast('Keyboard shortcuts help opened');
            }}
            aria-label='Show keyboard shortcuts (?)'
            sx={{
              '&:hover': {
                backgroundColor: highContrastMode
                  ? HIGH_CONTRAST_COLORS.utils.shimmer
                  : COLORS.utils.shimmer,
              },
            }}
          >
            <Keyboard />
          </IconButton>

          <Tooltip
            title={highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
          >
            <IconButton
              color='inherit'
              onClick={() => {
                toggleHighContrastMode();
                showToast(
                  highContrastMode ? 'High contrast mode disabled' : 'High contrast mode enabled',
                );
              }}
              aria-label={
                highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'
              }
              sx={{
                '&:hover': {
                  backgroundColor: highContrastMode
                    ? HIGH_CONTRAST_COLORS.utils.shimmer
                    : COLORS.utils.shimmer,
                },
              }}
            >
              <Contrast />
            </IconButton>
          </Tooltip>

          <IconButton
            color='inherit'
            href={MISC.github.repoUrl}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View Hearth Engine on GitHub (opens in new tab)'
            sx={{
              '&:hover': {
                backgroundColor: COLORS.utils.shimmer,
              },
            }}
          >
            <GitHub />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
