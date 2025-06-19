import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import './styles/accessibility.css';
import './styles/print.css';

import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Documentation = React.lazy(() => import('./pages/Documentation'));
const Downloads = React.lazy(() => import('./pages/Downloads'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const FeedbackDemo = React.lazy(() => import('./pages/FeedbackDemo'));
const CodeBlockDemo = React.lazy(() => import('./pages/CodeBlockDemo'));
const LoadingDemo = React.lazy(() => import('./pages/LoadingDemo'));

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

// Route-specific loader component
const RouteLoader: React.FC = () => {
  const location = useLocation();
  const [pageName, setPageName] = useState('');

  useEffect(() => {
    // Determine page name based on route
    const path = location.pathname;
    if (path === '/') setPageName('Home');
    else if (path === '/docs') setPageName('Documentation');
    else if (path === '/downloads') setPageName('Downloads');
    else if (path === '/faq') setPageName('FAQ');
    else if (path === '/feedback-demo') setPageName('Feedback Demo');
    else if (path === '/codeblock-demo') setPageName('CodeBlock Demo');
    else if (path === '/loading-demo') setPageName('Loading Demo');
    else setPageName('Page');
  }, [location]);

  return <PageLoader pageName={pageName} estimatedTime={2} />;
};

// Wrapper to provide location context
const AppContent: React.FC = () => {
  return (
    <>
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
          (e.target as HTMLElement).style.left = '16px';
        }}
        onBlur={e => {
          (e.target as HTMLElement).style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>
      <Suspense fallback={<RouteLoader />}>
        <PageTransition variant='fade' duration={0.4}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/docs' element={<Documentation />} />
            <Route path='/downloads' element={<Downloads />} />
            <Route path='/faq' element={<FAQ />} />
            <Route path='/feedback-demo' element={<FeedbackDemo />} />
            <Route path='/loading-demo' element={<LoadingDemo />} />
            <Route path='/codeblock-demo' element={<CodeBlockDemo />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
      <ScrollToTop />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <KeyboardShortcutsProvider>
            <AppContent />
          </KeyboardShortcutsProvider>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
