import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

// Create a test theme with complete configuration
const testTheme = createTheme({
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
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Working minimal providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider theme={testTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Common test data
export const mockSearchData = [
  {
    title: 'Test Page',
    path: '/test',
    content: 'Test content for searching',
    type: 'page' as const,
    keywords: ['test', 'search'],
    priority: 100,
  },
];

export const mockBenchmarkData = {
  fps: [
    { voxels: 1000, hearth: 120, unity: 60, unreal: 45, godot: 50 },
    { voxels: 10000, hearth: 110, unity: 45, unreal: 35, godot: 40 },
  ],
  memory: [
    { category: 'Base', hearth: 50, unity: 80, unreal: 120, godot: 70 },
    { category: '1M Voxels', hearth: 200, unity: 400, unreal: 600, godot: 350 },
  ],
};

export const mockShowcaseData = [
  {
    id: 'test-project',
    title: 'Test Project',
    description: 'A test project for showcase',
    category: 'games' as const,
    image: '/test-image.jpg',
    author: 'Test Author',
    githubUrl: 'https://github.com/test/project',
    demoUrl: 'https://test-demo.com',
    featured: false,
  },
];

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock intersection observer
export const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

// Helper to wait for async operations (custom implementation for non-DOM cases)
export const waitForCondition = (fn: () => void, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      try {
        fn();
        resolve(true);
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };
    check();
  });
};

// Mock router functions
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// Setup and teardown helpers
export const setupTest = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  window.IntersectionObserver = mockIntersectionObserver;

  // Reset mocks
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockNavigate.mockClear();
};

export const teardownTest = () => {
  jest.clearAllMocks();
};
