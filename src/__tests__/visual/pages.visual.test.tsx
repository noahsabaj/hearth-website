import { percySnapshot } from '@percy/puppeteer';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Import pages to test
import Benchmarks from '../../pages/Benchmarks';
import Documentation from '../../pages/Documentation';
import Downloads from '../../pages/Downloads';
import Engine from '../../pages/Engine';
import FAQ from '../../pages/FAQ';
import Home from '../../pages/Home';
import NotFound from '../../pages/NotFound';
import Showcase from '../../pages/Showcase';

// Test wrapper with all necessary providers
const TestWrapper: React.FC<{
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'high-contrast';
  route?: string;
}> = ({ children, theme = 'light', route = '/' }) => (
  <BrowserRouter>
    <ThemeProvider initialTheme={theme}>
      <KeyboardShortcutsProvider>
        <div data-testid='app-root'>{children}</div>
      </KeyboardShortcutsProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Page Visual Tests', () => {
  // Mock IntersectionObserver for lazy loading components
  beforeAll(() => {
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        // Immediately trigger callback with mock entry
        setTimeout(() => {
          callback(
            [
              {
                isIntersecting: true,
                target: document.createElement('div'),
                boundingClientRect: {} as DOMRectReadOnly,
                intersectionRatio: 1,
                intersectionRect: {} as DOMRectReadOnly,
                rootBounds: {} as DOMRectReadOnly,
                time: Date.now(),
              },
            ],
            this,
          );
        }, 100);
      }

      observe() {}

      disconnect() {}

      unobserve() {}
    };
  });

  describe('Home Page', () => {
    it('renders home page in light theme', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/'>
          <Home />
        </TestWrapper>
      );

      // Wait for components to load
      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Home Page - Light Theme');
    });

    it('renders home page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/'>
          <Home />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Home Page - Dark Theme');
    });

    it('renders home page in high contrast mode', async () => {
      const { container } = render(
        <TestWrapper theme='high-contrast' route='/'>
          <Home />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Home Page - High Contrast');
    });
  });

  describe('Documentation Page', () => {
    it('renders documentation page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/docs'>
          <Documentation />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Documentation Page - Light Theme');
    });

    it('renders documentation page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/docs'>
          <Documentation />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Documentation Page - Dark Theme');
    });
  });

  describe('Engine Page', () => {
    it('renders engine page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/engine'>
          <Engine />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Engine Page - Light Theme');
    });

    it('renders engine page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/engine'>
          <Engine />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Engine Page - Dark Theme');
    });
  });

  describe('Downloads Page', () => {
    it('renders downloads page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/downloads'>
          <Downloads />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Downloads Page - Light Theme');
    });

    it('renders downloads page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/downloads'>
          <Downloads />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Downloads Page - Dark Theme');
    });
  });

  describe('Showcase Page', () => {
    it('renders showcase page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/showcase'>
          <Showcase />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Showcase Page - Light Theme');
    });

    it('renders showcase page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/showcase'>
          <Showcase />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Showcase Page - Dark Theme');
    });
  });

  describe('FAQ Page', () => {
    it('renders FAQ page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/faq'>
          <FAQ />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('FAQ Page - Light Theme');
    });

    it('renders FAQ page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/faq'>
          <FAQ />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('FAQ Page - Dark Theme');
    });
  });

  describe('Benchmarks Page', () => {
    it('renders benchmarks page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/benchmarks'>
          <Benchmarks />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Benchmarks Page - Light Theme');
    });

    it('renders benchmarks page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/benchmarks'>
          <Benchmarks />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Benchmarks Page - Dark Theme');
    });
  });

  describe('404 Not Found Page', () => {
    it('renders 404 page', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/not-found'>
          <NotFound />
        </TestWrapper>
      );

      await percySnapshot('404 Page - Light Theme');
    });

    it('renders 404 page in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark' route='/not-found'>
          <NotFound />
        </TestWrapper>
      );

      await percySnapshot('404 Page - Dark Theme');
    });
  });

  describe('Responsive Page Tests', () => {
    it('renders home page on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper theme='light' route='/'>
          <Home />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Home Page - Mobile', { widths: [375] });
    });

    it('renders documentation page on tablet', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <TestWrapper theme='light' route='/docs'>
          <Documentation />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Documentation Page - Tablet', { widths: [768] });
    });

    it('renders engine page on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { container } = render(
        <TestWrapper theme='light' route='/engine'>
          <Engine />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      await percySnapshot('Engine Page - Desktop', { widths: [1440] });
    });
  });

  describe('Page Loading States', () => {
    it('renders pages with loading states', async () => {
      // Mock loading state
      const { container } = render(
        <TestWrapper theme='light' route='/docs'>
          <div data-testid='loading-state'>
            <Documentation />
          </div>
        </TestWrapper>
      );

      // Capture initial loading state
      await percySnapshot('Documentation Page - Loading State');

      // Wait for load completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      await percySnapshot('Documentation Page - Loaded State');
    });
  });

  describe('Interactive States', () => {
    it('captures interactive elements in various states', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/'>
          <Home />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      // Add custom styles to simulate hover/focus states
      const style = document.createElement('style');
      style.textContent = `
        /* Simulate hover states for visual testing */
        .MuiButton-root:first-of-type {
          background-color: rgba(25, 118, 210, 0.08) !important;
          box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2) !important;
        }
        
        /* Simulate focus states */
        .MuiTextField-root input:first-of-type {
          border-color: #1976d2 !important;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2) !important;
        }
      `;
      document.head.appendChild(style);

      await percySnapshot('Home Page - Interactive States');

      document.head.removeChild(style);
    });
  });

  describe('Print Styles', () => {
    it('captures print-friendly versions of pages', async () => {
      const { container } = render(
        <TestWrapper theme='light' route='/docs'>
          <Documentation />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      // Add print media styles
      const printStyle = document.createElement('style');
      printStyle.textContent = `
        @media print {
          .no-print,
          .MuiAppBar-root,
          .MuiFab-root,
          nav {
            display: none !important;
          }
          
          body {
            color: black !important;
            background: white !important;
          }
          
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      await percySnapshot('Documentation Page - Print Style');

      document.head.removeChild(printStyle);
    });
  });
});
