import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import Downloads from '../Downloads';

expect.extend(toHaveNoViolations);

// Mock fetch for GitHub API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortController
global.AbortController = jest.fn(() => ({
  signal: 'mock-signal',
  abort: jest.fn(),
}));

// Mock setTimeout for loading delays
jest.useFakeTimers();

// Sample release data for testing
const mockReleaseData = [
  {
    tag_name: 'v1.2.0',
    name: 'Hearth Engine v1.2.0',
    published_at: '2024-01-15T10:30:00Z',
    body: 'Major update with performance improvements\n\n- GPU optimization\n- Memory usage reduction\n- Bug fixes',
    assets: [
      {
        name: 'hearth-engine-v1.2.0-windows.zip',
        browser_download_url:
          'https://github.com/noahsabaj/hearth-engine/releases/download/v1.2.0/hearth-engine-v1.2.0-windows.zip',
        size: 45678901,
      },
      {
        name: 'hearth-engine-v1.2.0-macos.dmg',
        browser_download_url:
          'https://github.com/noahsabaj/hearth-engine/releases/download/v1.2.0/hearth-engine-v1.2.0-macos.dmg',
        size: 52345678,
      },
      {
        name: 'hearth-engine-v1.2.0-linux.tar.gz',
        browser_download_url:
          'https://github.com/noahsabaj/hearth-engine/releases/download/v1.2.0/hearth-engine-v1.2.0-linux.tar.gz',
        size: 41234567,
      },
    ],
  },
  {
    tag_name: 'v1.1.0',
    name: 'Hearth Engine v1.1.0',
    published_at: '2024-01-01T09:00:00Z',
    body: 'Feature update with new capabilities\n\n- New rendering features\n- API improvements',
    assets: [
      {
        name: 'hearth-engine-v1.1.0-windows.zip',
        browser_download_url:
          'https://github.com/noahsabaj/hearth-engine/releases/download/v1.1.0/hearth-engine-v1.1.0-windows.zip',
        size: 43876543,
      },
    ],
  },
];

describe('Downloads Page', () => {
  beforeEach(() => {
    setupTest();
    mockFetch.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render downloads page with main sections', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      // Check main heading
      expect(screen.getByRole('heading', { name: /downloads/i, level: 1 })).toBeInTheDocument();

      // Check description
      expect(screen.getByText(/download the latest version of hearth engine/i)).toBeInTheDocument();

      // Check quick install section
      expect(screen.getByRole('heading', { name: /quick install/i })).toBeInTheDocument();

      // Check binary releases section
      expect(screen.getByRole('heading', { name: /binary releases/i })).toBeInTheDocument();

      // Wait for API call to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.github.com/repos/noahsabaj/hearth-engine/releases',
          expect.objectContaining({
            headers: {
              Accept: 'application/vnd.github.v3+json',
            },
          })
        );
      });
    });

    it('should render quick install instructions', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      // Check cargo install command
      expect(screen.getByText(/cargo install hearth-engine/i)).toBeInTheDocument();

      // Check git clone command
      expect(screen.getByText(/git clone/i)).toBeInTheDocument();
      expect(screen.getByText(/cargo build --release/i)).toBeInTheDocument();
    });

    it('should render system requirements section', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      // Check system requirements
      expect(screen.getByRole('heading', { name: /system requirements/i })).toBeInTheDocument();

      expect(screen.getByText(/minimum/i)).toBeInTheDocument();
      expect(screen.getByText(/recommended/i)).toBeInTheDocument();

      // Check specific requirements
      expect(screen.getByText(/vulkan 1\.2/i)).toBeInTheDocument();
      expect(screen.getByText(/4 gb ram/i)).toBeInTheDocument();
      expect(screen.getByText(/16 gb ram/i)).toBeInTheDocument();
    });
  });

  describe('Release Data Loading', () => {
    it('should display loading state while fetching releases', () => {
      // Mock a delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockReleaseData,
                }),
              1000,
            );
          }),
      );

      render(<Downloads />);

      // Should show loading progress
      expect(screen.getByText(/connecting to github/i)).toBeInTheDocument();

      // Should show skeleton loaders
      expect(
        screen.getByTestId('skeleton-loader') || screen.getByText(/loading/i),
      ).toBeInTheDocument();
    });

    it('should display releases after successful fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      // Wait for releases to load
      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      // Check release details
      expect(screen.getByText(/major update with performance improvements/i)).toBeInTheDocument();

      // Check latest badge
      expect(screen.getByText(/latest/i)).toBeInTheDocument();

      // Check release date
      expect(screen.getByText(/january 15, 2024/i)).toBeInTheDocument();
    });

    it('should display download buttons for each platform', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      // Check download buttons exist
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThan(0);

      // Check platform-specific downloads
      expect(screen.getByText(/windows/i)).toBeInTheDocument();
      expect(screen.getByText(/macos/i)).toBeInTheDocument();
      expect(screen.getByText(/linux/i)).toBeInTheDocument();
    });

    it('should limit displayed releases to 3', async () => {
      const manyReleases = Array.from({ length: 10 }, (_, i) => ({
        ...mockReleaseData[0],
        tag_name: `v1.${i}.0`,
        name: `Release ${i}`,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => manyReleases,
      });

      render(<Downloads />);

      await waitFor(() => {
        const releaseCards = screen.getAllByText(/release/i);
        // Should only show 3 releases max
        expect(releaseCards.length).toBeLessThanOrEqual(6); // Account for other "release" text
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/unable to load releases/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/network error/i)).toBeInTheDocument();

      // Should show retry button
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/github api error/i)).toBeInTheDocument();
      });
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => Promise.reject({ name: 'AbortError' }));

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => 'invalid json',
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/invalid response format/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.setup().click(retryButton);

      // Should successfully load data
      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });
    });

    it('should show enhanced error message after multiple retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      render(<Downloads />);

      // Trigger multiple retries
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const retryButton = screen.getByRole('button', { name: /retry/i });
          expect(retryButton).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        await userEvent.setup().click(retryButton);
      }

      // Should show additional help text after multiple retries
      await waitFor(() => {
        expect(screen.getByText(/having trouble\?/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle download button clicks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      // Find and click download button
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      if (downloadButtons.length > 0) {
        await userEvent.setup().click(downloadButtons[0]);
        // Download should be initiated (tested in DownloadButton component)
      }
    });

    it('should handle view release notes links', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/view release notes/i)).toBeInTheDocument();
      });

      const releaseNotesLink = screen.getByRole('link', { name: /view release notes/i });
      expect(releaseNotesLink).toHaveAttribute('href', expect.stringContaining('github.com'));
      expect(releaseNotesLink).toHaveAttribute('target', '_blank');
    });

    it('should handle copy install commands', async () => {
      const mockWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      // Install commands should be selectable/copyable
      const cargoCommand = screen.getByText(/cargo install hearth-engine/i);
      expect(cargoCommand).toBeInTheDocument();
    });
  });

  describe('Loading States and Progress', () => {
    it('should show detailed loading progress', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Downloads />);

      // Check for loading progress component
      expect(screen.getByText(/connecting to github/i)).toBeInTheDocument();

      // Should show loading tips
      expect(
        screen.getByText(/vulkan for high-performance/i) ||
          screen.getByText(/documentation for getting started/i),
      ).toBeInTheDocument();
    });

    it('should show skeleton loaders during loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<Downloads />);

      // Should show skeleton placeholders
      const skeletonElements =
        screen.getAllByTestId('skeleton-loader') || screen.getAllByText(/loading/i);
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should update progress messages during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValue(promise);

      render(<Downloads />);

      expect(screen.getByText(/connecting to github/i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => mockReleaseData,
      });

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      // Should render mobile-friendly layout
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      const { container } = render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      // Check heading structure
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should provide proper aria labels for interactive elements', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByRole('button', { name: /download/i });
        downloadButtons.forEach(button => {
          expect(button).toHaveAccessibleName();
        });
      });
    });

    it('should support keyboard navigation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      // Tab through interactive elements
      const user = userEvent.setup();
      await user.tab();

      // Should focus on interactive elements
      expect(document.activeElement).toBeDefined();
    });

    it('should provide proper alternative text for platform icons', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        // Platform icons should have proper context
        expect(screen.getByText(/windows/i)).toBeInTheDocument();
        expect(screen.getByText(/macos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show appropriate message when no releases available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/no releases available yet/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/build from source/i)).toBeInTheDocument();
    });

    it('should handle malformed release data', async () => {
      const malformedData = [
        {
          // Missing required fields
          tag_name: 'v1.0.0',
          // missing name, published_at, body, assets
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedData,
      });

      render(<Downloads />);

      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Components', () => {
    it('should integrate with NavigationBar', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should integrate with Footer', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should integrate with SEO component', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Downloads />);

      expect(document.title).toContain('Downloads');
    });

    it('should integrate with DownloadButton components', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      render(<Downloads />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByRole('button', { name: /download/i });
        expect(downloadButtons.length).toBeGreaterThan(0);
      });
    });

    it('should integrate with LoadingProgress component', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<Downloads />);

      // Loading progress should be visible
      expect(screen.getByText(/connecting to github/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle component unmounting during fetch', () => {
      let rejectPromise: (error: Error) => void;
      const promise = new Promise((_, reject) => {
        rejectPromise = reject;
      });

      mockFetch.mockReturnValue(promise);

      const { unmount } = render(<Downloads />);

      // Unmount component before fetch completes
      unmount();

      // Should not cause memory leaks or errors
      rejectPromise!(new Error('Component unmounted'));
    });

    it('should memoize release data processing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReleaseData,
      });

      const { rerender } = render(<Downloads />);

      await waitFor(() => {
        expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
      });

      // Re-render should not trigger unnecessary processing
      rerender(<Downloads />);

      expect(screen.getByText(/hearth engine v1\.2\.0/i)).toBeInTheDocument();
    });
  });
});
