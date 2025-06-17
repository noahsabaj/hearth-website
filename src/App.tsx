import { Box, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import './styles/accessibility.css';

import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Documentation = React.lazy(() => import('./pages/Documentation'));
const Downloads = React.lazy(() => import('./pages/Downloads'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4500',
    },
    secondary: {
      main: '#ff6b35',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 900,
      fontSize: '4rem',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 800,
      fontSize: '3rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:focus': {
            outline: '3px solid #ff4500',
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:focus': {
            outline: '3px solid #ff4500',
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          },
          '&:focus-within': {
            outline: '2px solid #ff4500',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: '3px solid #ff4500',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      },
    },
  },
});

// Loading component for lazy-loaded routes
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
    }}
  >
    <CircularProgress sx={{ color: '#ff4500' }} size={60} />
  </Box>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          {/* Skip to main content link for keyboard users */}
          <a
            href='#main-content'
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '0',
              zIndex: 9999,
              padding: '8px 16px',
              backgroundColor: '#ff4500',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0 0 4px 4px',
              fontWeight: 600,
              transition: 'left 0.3s ease',
            }}
            onFocus={e => {
              e.target.style.left = '16px';
            }}
            onBlur={e => {
              e.target.style.left = '-9999px';
            }}
          >
            Skip to main content
          </a>
          <Suspense fallback={<PageLoader />}>
            <PageTransition variant='fade' duration={0.4}>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/docs' element={<Documentation />} />
                <Route path='/downloads' element={<Downloads />} />
                <Route path='/faq' element={<FAQ />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Suspense>
          <ScrollToTop />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
