import { GitHub, Download, MenuBook, Home, Help, Keyboard } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import SearchBar from './SearchBar';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';

interface NavigationBarProps {
  variant?: 'home' | 'docs' | 'downloads' | 'faq';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ variant = 'home' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { showToast } = useKeyboardShortcutsContext();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
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
              src={`/hearth-website/logo.png?v=${Date.now()}`}
              alt='Hearth Engine'
              style={{
                height: 40,
                marginRight: 12,
                backgroundColor: 'transparent',
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
        <SearchBar />

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
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Keyboard />
          </IconButton>
          
          <IconButton
            color='inherit'
            href='https://github.com/noahsabaj/hearth-engine'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View Hearth Engine on GitHub (opens in new tab)'
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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