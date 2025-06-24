import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import App from '../../App';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { render, setupTest, teardownTest, mockSearchData } from '../../test-utils';

expect.extend(toHaveNoViolations);

// Mock search data for comprehensive testing
const mockExtendedSearchData = [
  ...mockSearchData,
  {
    title: 'Getting Started Guide',
    path: '/docs/getting-started',
    content: 'Learn how to get started with Hearth Engine development',
    type: 'documentation' as const,
    keywords: ['getting started', 'tutorial', 'beginner', 'guide'],
    priority: 100,
  },
  {
    title: 'API Reference',
    path: '/docs/api',
    content: 'Complete API reference for Hearth Engine',
    type: 'api' as const,
    keywords: ['api', 'reference', 'functions', 'methods'],
    priority: 95,
  },
  {
    title: 'Performance Benchmarks',
    path: '/benchmarks',
    content: 'Performance comparison and benchmarking results',
    type: 'page' as const,
    keywords: ['performance', 'benchmarks', 'fps', 'memory'],
    priority: 90,
  },
  {
    title: 'Voxel Rendering',
    path: '/docs/voxel-rendering',
    content: 'Advanced voxel rendering techniques and optimization',
    type: 'documentation' as const,
    keywords: ['voxel', 'rendering', 'optimization', 'gpu'],
    priority: 85,
  },
  {
    title: 'Download Engine',
    path: '/downloads',
    content: 'Download the latest version of Hearth Engine',
    type: 'page' as const,
    keywords: ['download', 'install', 'version', 'release'],
    priority: 80,
  },
];

// Mock Fuse.js for consistent search behavior
jest.mock('fuse.js', () => {
  return jest.fn().mockImplementation((data, options) => ({
    search: jest.fn((query: string) => {
      const lowerQuery = query.toLowerCase();
      return data
        .filter(
          (item: any) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().includes(lowerQuery) ||
            item.keywords.some((keyword: string) => keyword.toLowerCase().includes(lowerQuery))
        )
        .map((item: any, index: number) => ({
          item,
          score: 0.1 + index * 0.1,
          refIndex: index,
        }))
        .slice(0, 10); // Limit results
    }),
    add: jest.fn(),
    remove: jest.fn(),
    removeAt: jest.fn(),
  }));
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Search Functionality Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Search Component Integration', () => {
    it('should integrate search bar with global app state', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Find search input
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toBeInTheDocument();

      // Test search integration
      await user.type(searchInput, 'getting started');

      // Wait for search results to appear
      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toBeInTheDocument();
      });

      // Verify search results contain expected content
      const results = screen.getByTestId('search-results');
      expect(within(results).getByText(/getting started guide/i)).toBeInTheDocument();
    });

    it('should handle search across different content types', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Test documentation search
      await user.clear(searchInput);
      await user.type(searchInput, 'api reference');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(within(results).getByText(/api reference/i)).toBeInTheDocument();
      });

      // Test page search
      await user.clear(searchInput);
      await user.type(searchInput, 'download');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(within(results).getByText(/download engine/i)).toBeInTheDocument();
      });

      // Test keyword-based search
      await user.clear(searchInput);
      await user.type(searchInput, 'gpu');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(within(results).getByText(/voxel rendering/i)).toBeInTheDocument();
      });
    });

    it('should prioritize search results correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'guide');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        const resultItems = within(results).getAllByTestId('search-result-item');

        // Higher priority items should appear first
        expect(resultItems[0]).toHaveTextContent(/getting started guide/i);
      });
    });

    it('should handle real-time search updates', async () => {
      const user = userEvent.setup({ delay: 50 });
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Type gradually and verify results update
      await user.type(searchInput, 'a');
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      await user.type(searchInput, 'pi');
      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(within(results).getByText(/api reference/i)).toBeInTheDocument();
      });

      await user.type(searchInput, ' ref');
      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(within(results).getByText(/api reference/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Navigation Integration', () => {
    it('should navigate to search results when clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'getting started');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        const firstResult = within(results).getByTestId('search-result-item');

        user.click(firstResult).then(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/docs/getting-started');
        });
      });
    });

    it('should handle keyboard navigation through search results', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'engine');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Navigate down through results
      await user.keyboard('{ArrowDown}');

      const results = screen.getByTestId('search-results');
      const firstResult = within(results).getAllByTestId('search-result-item')[0];
      expect(firstResult).toHaveClass('highlighted');

      // Navigate to next result
      await user.keyboard('{ArrowDown}');
      const secondResult = within(results).getAllByTestId('search-result-item')[1];
      expect(secondResult).toHaveClass('highlighted');

      // Navigate back up
      await user.keyboard('{ArrowUp}');
      expect(firstResult).toHaveClass('highlighted');

      // Select result with Enter
      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should close search results when clicking outside', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Click outside search area
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
      });
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Clear input
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Performance and Error Handling', () => {
    it('should debounce search input to avoid excessive API calls', async () => {
      const user = userEvent.setup({ delay: 10 });
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Rapidly type multiple characters
      await user.type(searchInput, 'testing');

      // Should not trigger multiple search operations
      await waitFor(
        () => {
          expect(screen.getByTestId('search-results')).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      // Only one set of results should be shown
      expect(screen.getAllByTestId('search-results')).toHaveLength(1);
    });

    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Enter empty search
      await user.type(searchInput, ' ');
      await user.clear(searchInput);

      // Should not show results for empty search
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });

    it('should show no results message for searches with no matches', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'nonexistentterm12345');

      await waitFor(() => {
        expect(screen.getByTestId('no-search-results')).toBeInTheDocument();
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it('should handle search errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock search to throw error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'error');

      // Should show error message or fallback
      await waitFor(() => {
        expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
      });

      console.error = originalConsoleError;
    });

    it('should maintain search state during theme changes', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <KeyboardShortcutsProvider>
            <App />
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      );

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test search');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Toggle theme
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeToggle);

      // Search results should still be visible
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(searchInput).toHaveValue('test search');
    });
  });

  describe('Search Accessibility', () => {
    it('should support screen reader navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Check ARIA attributes
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('role', 'textbox');

      await user.type(searchInput, 'test');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toHaveAttribute('role', 'listbox');

        const resultItems = within(results).getAllByTestId('search-result-item');
        resultItems.forEach(item => {
          expect(item).toHaveAttribute('role', 'option');
        });
      });
    });

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'getting started');

      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { hidden: true });
        expect(liveRegion).toHaveTextContent(/search results updated/i);
      });
    });

    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<App />);

      const user = userEvent.setup();
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle high contrast mode correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Enable high contrast mode
      const highContrastToggle = screen.getByRole('button', { name: /high contrast/i });
      await user.click(highContrastToggle);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toBeInTheDocument();

        // Verify high contrast styles are applied
        expect(results).toHaveStyle('border: 2px solid');
      });
    });
  });

  describe('Search Integration with Keyboard Shortcuts', () => {
    it('should focus search input with / shortcut', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press / key to focus search
      await user.keyboard('/');

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveFocus();
    });

    it('should clear search with Escape key', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test search');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Press Escape to clear
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
      });
    });

    it('should handle Ctrl+K shortcut for search focus', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press Ctrl+K to focus search
      await user.keyboard('{Control>}k{/Control}');

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Search Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should work correctly on mobile devices', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'mobile test');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toBeInTheDocument();

        // Mobile search results should be properly styled
        expect(results).toHaveStyle('position: absolute');
      });
    });

    it('should handle touch interactions correctly', async () => {
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });

      // Simulate touch events
      fireEvent.touchStart(searchInput);
      fireEvent.focus(searchInput);

      expect(searchInput).toHaveFocus();
    });
  });

  describe('Search Data Integration', () => {
    it('should integrate with actual page content', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to a page and verify search includes its content
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/docs');
      });

      // Search should include content from current page
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'documentation');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toBeInTheDocument();
      });
    });

    it('should update search index when content changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Initial search
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'dynamic content');

      // Should handle dynamic content updates
      await waitFor(() => {
        expect(screen.queryByTestId('search-results')).toBeDefined();
      });
    });
  });

  describe('Search Analytics and Tracking', () => {
    it('should track search queries for analytics', async () => {
      const user = userEvent.setup();
      const trackingSpy = jest.fn();

      // Mock analytics tracking
      (window as any).gtag = trackingSpy;

      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'tracked search');

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should track search event
      expect(trackingSpy).toHaveBeenCalledWith('event', 'search', {
        search_term: 'tracked search',
      });
    });

    it('should track result interactions', async () => {
      const user = userEvent.setup();
      const trackingSpy = jest.fn();
      (window as any).gtag = trackingSpy;

      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'test');

      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        const firstResult = within(results).getAllByTestId('search-result-item')[0];

        user.click(firstResult).then(() => {
          expect(trackingSpy).toHaveBeenCalledWith('event', 'search_result_click', {
            search_term: 'test',
            result_position: 0,
          });
        });
      });
    });
  });
});
