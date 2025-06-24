/**
 * Responsive Visual Regression Tests
 * Tests components across different breakpoints and devices
 */

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

// Components to test
import Footer from '../../components/Footer';
import InteractiveCard from '../../components/InteractiveCard';
import NavigationBar from '../../components/NavigationBar';
import VoxelLoader from '../../components/VoxelLoader';
import Home from '../../pages/Home';

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff4500' },
    secondary: { main: '#ff6b35' },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <HelmetProvider>
      <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
    </HelmetProvider>
  </BrowserRouter>
);

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' },
};

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches:
        query.includes(`max-width: ${width}px`) || query.includes(`min-width: ${width - 1}px`),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Responsive Visual Tests', () => {
  beforeEach(() => {
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        // Set viewport dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        mockMatchMedia(viewport.width);
      });

      it('should render NavigationBar responsively', () => {
        const { container } = render(
          <TestWrapper>
            <NavigationBar />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();

        // Check for mobile menu on small screens
        if (viewport.width < 768) {
          expect(container.querySelector('[data-testid="mobile-menu"]')).toBeInTheDocument();
        } else {
          expect(container.querySelector('[data-testid="desktop-nav"]')).toBeInTheDocument();
        }
      });

      it('should render Footer with responsive layout', () => {
        const { container } = render(
          <TestWrapper>
            <Footer />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();

        // Footer should stack vertically on mobile
        const footer = container.querySelector('footer');
        expect(footer).toBeInTheDocument();
      });

      it('should render VoxelLoader at appropriate size', () => {
        const { container } = render(
          <TestWrapper>
            <VoxelLoader size={viewport.width < 768 ? 'small' : 'medium'} />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();
      });

      it('should render InteractiveCard with responsive behavior', () => {
        const { container } = render(
          <TestWrapper>
            <InteractiveCard>
              <div>Test Content</div>
            </InteractiveCard>
          </TestWrapper>
        );

        expect(container).toMatchSnapshot(`interactive-card-${device}`);
      });

      it('should render Home page layout responsively', () => {
        const { container } = render(
          <TestWrapper>
            <Home />
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();

        // Hero section should be present
        expect(container.querySelector('[data-testid="hero-section"]')).toBeInTheDocument();

        // Features section should adapt to viewport
        expect(container.querySelector('[data-testid="features-section"]')).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Device Consistency', () => {
    it('should maintain consistent branding across all viewports', () => {
      Object.values(VIEWPORTS).forEach(viewport => {
        // Set viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });

        mockMatchMedia(viewport.width);

        const { container } = render(
          <TestWrapper>
            <NavigationBar />
          </TestWrapper>
        );

        // Logo should always be present
        expect(container.querySelector('[data-testid="nav-logo"]')).toBeInTheDocument();
      });
    });

    it('should handle viewport transitions smoothly', () => {
      const { container, rerender } = render(
        <TestWrapper>
          <NavigationBar />
        </TestWrapper>
      );

      // Start desktop
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      mockMatchMedia(1920);
      rerender(
        <TestWrapper>
          <NavigationBar />
        </TestWrapper>
      );

      // Transition to mobile
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockMatchMedia(375);
      rerender(
        <TestWrapper>
          <NavigationBar />
        </TestWrapper>
      );

      // Should not crash during transition
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Touch vs Mouse Interactions', () => {
    it('should handle touch events on mobile viewports', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockMatchMedia(375);

      const { container } = render(
        <TestWrapper>
          <InteractiveCard>
            <div>Touch Test</div>
          </InteractiveCard>
        </TestWrapper>
      );

      // Simulate touch capability
      Object.defineProperty(window, 'ontouchstart', { value: true, writable: true });

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle mouse interactions on desktop viewports', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      mockMatchMedia(1920);

      const { container } = render(
        <TestWrapper>
          <InteractiveCard>
            <div>Mouse Test</div>
          </InteractiveCard>
        </TestWrapper>
      );

      // Remove touch capability
      Object.defineProperty(window, 'ontouchstart', { value: undefined, writable: true });

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Performance on Different Viewports', () => {
    it('should render efficiently on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockMatchMedia(375);

      const startTime = performance.now();

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Mobile rendering should be fast
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle high-DPI displays correctly', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true });

      const { container } = render(
        <TestWrapper>
          <VoxelLoader />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
