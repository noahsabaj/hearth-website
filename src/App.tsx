import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Documentation from './pages/Documentation';
import Downloads from './pages/Downloads';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#f7931e',
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
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
