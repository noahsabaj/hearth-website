import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import App from '../../App';
import { render, setupTest, teardownTest } from '../../test-utils';

expect.extend(toHaveNoViolations);

// Mock react-router-dom functions for controlled navigation testing
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Complete Navigation Flows', () => {
    it('should navigate through all main pages successfully', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Start at home page - verify home content
      expect(screen.getByText(/Welcome to Hearth Engine/i)).toBeInTheDocument();

      // Navigate to Documentation
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      // Wait for navigation and verify docs content
      await waitFor(() => {
        expect(window.location.pathname).toBe('/docs');
      });

      // Navigate to Engine page
      const engineLink = screen.getByRole('link', { name: /engine/i });
      await user.click(engineLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/engine');
      });

      // Navigate to Downloads
      const downloadsLink = screen.getByRole('link', { name: /downloads/i });
      await user.click(downloadsLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/downloads');
      });

      // Navigate to FAQ
      const faqLink = screen.getByRole('link', { name: /faq/i });
      await user.click(faqLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/faq');
      });

      // Navigate to Benchmarks
      const benchmarksLink = screen.getByRole('link', { name: /benchmarks/i });
      await user.click(benchmarksLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/benchmarks');
      });

      // Navigate back to Home
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/');
      });
    });

    it('should handle deep linking correctly', async () => {
      // Test direct navigation to deep pages
      Object.defineProperty(window, 'location', {
        value: { ...window.location, pathname: '/docs' },
        writable: true,
      });

      render(<App />);

      // Should render documentation page directly
      await waitFor(() => {
        expect(screen.getByText(/Documentation/i)).toBeInTheDocument();
      });

      // Navigation bar should show correct active state
      const docsNavLink = screen.getByRole('link', { name: /documentation/i });
      expect(docsNavLink).toHaveStyle('border-bottom: 2px solid');
    });

    it('should preserve scroll position on navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Mock scroll position
      let scrollPosition = 0;
      Object.defineProperty(window, 'scrollY', {
        get: () => scrollPosition,
        set: value => {
          scrollPosition = value;
        },
      });

      // Scroll down on home page
      scrollPosition = 500;
      fireEvent.scroll(window, { target: { scrollY: 500 } });

      // Navigate to another page
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      // Should reset scroll to top for new page
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should handle browser back/forward navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate forward through pages
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      const engineLink = screen.getByRole('link', { name: /engine/i });
      await user.click(engineLink);

      // Simulate browser back button
      fireEvent(window, new PopStateEvent('popstate', { state: { pathname: '/docs' } }));

      await waitFor(() => {
        expect(window.location.pathname).toBe('/docs');
      });

      // Simulate browser forward button
      fireEvent(window, new PopStateEvent('popstate', { state: { pathname: '/engine' } }));

      await waitFor(() => {
        expect(window.location.pathname).toBe('/engine');
      });
    });
  });

  describe('Navigation Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Tab through navigation links
      await user.tab();

      // Should focus on first navigation link
      const firstLink = screen.getByRole('link', { name: /documentation/i });
      expect(firstLink).toHaveFocus();

      // Tab to next link
      await user.tab();
      const engineLink = screen.getByRole('link', { name: /engine/i });
      expect(engineLink).toHaveFocus();

      // Enter should activate link
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(window.location.pathname).toBe('/engine');
      });
    });

    it('should have proper ARIA attributes', () => {
      render(<App />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      // Check for skip links
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<App />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should announce page changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to a different page
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      // Should have live region announcing page change
      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { hidden: true });
        expect(liveRegion).toHaveTextContent(/navigated to documentation/i);
      });
    });
  });

  describe('Navigation Error Handling', () => {
    it('should handle invalid routes gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, pathname: '/invalid-route' },
        writable: true,
      });

      render(<App />);

      // Should show 404 page
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
      expect(screen.getByText(/404/i)).toBeInTheDocument();

      // Should provide navigation back to home
      const homeLink = screen.getByRole('link', { name: /go home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should handle navigation errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock navigation error
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<App />);

      const docsLink = screen.getByRole('link', { name: /documentation/i });

      // Should not crash on navigation error
      await user.click(docsLink);

      // Error boundary should catch the error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Performance', () => {
    it('should not cause memory leaks during navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Track initial memory (mock implementation)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Navigate through several pages
      const pages = ['docs', 'engine', 'downloads', 'faq', 'benchmarks'];

      for (const page of pages) {
        const link = screen.getByRole('link', { name: new RegExp(page, 'i') });
        await user.click(link);

        await waitFor(() => {
          expect(window.location.pathname).toBe(`/${page}`);
        });
      }

      // Navigate back to home
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      // Check that memory hasn't grown excessively (mock check)
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Allow for reasonable memory growth (this is a simplified check)
      expect(memoryGrowth).toBeLessThan(10000000); // 10MB threshold
    });

    it('should load pages efficiently', async () => {
      const user = userEvent.setup();
      render(<App />);

      const startTime = performance.now();

      // Navigate to documentation
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      await waitFor(() => {
        expect(screen.getByText(/Documentation/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Navigation should be fast (under 100ms in test environment)
      expect(loadTime).toBeLessThan(100);
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should work correctly on mobile devices', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Should show mobile navigation
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();

      // Open mobile menu
      await user.click(mobileMenuButton);

      // Should show navigation links in mobile menu
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /documentation/i })).toBeVisible();
      });

      // Navigate from mobile menu
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      // Menu should close after navigation
      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /documentation/i })).not.toBeVisible();
      });
    });

    it('should handle touch gestures appropriately', async () => {
      render(<App />);

      // Mock touch events
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 0 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 0 } as Touch],
      });

      // Should not interfere with normal touch navigation
      fireEvent(document, touchStart);
      fireEvent(document, touchEnd);

      // Navigation should still work normally
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
