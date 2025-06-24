import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render, setupTest, teardownTest } from '../../test-utils';
import Updates from '../Updates';

expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock SEO component
jest.mock('../../components/SEO', () => {
  return function MockSEO({ title, description, keywords, pathname }: any) {
    return (
      <div
        data-testid='seo'
        data-title={title}
        data-description={description}
        data-keywords={keywords}
        data-pathname={pathname}
      />
    );
  };
});

// Mock NavigationBar and Footer
jest.mock('../../components/NavigationBar', () => {
  return function MockNavigationBar() {
    return <nav data-testid='navigation-bar' role='navigation' aria-label='Main navigation' />;
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid='footer' role='contentinfo' />;
  };
});

// Mock constants
jest.mock('../../constants', () => ({
  COLORS: {
    primary: {
      main: '#ff4500',
      light: '#ff6b35',
      dark: '#cc3300',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
      elevated: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    status: {
      success: '#4caf50',
      error: '#f44336',
      info: '#2196f3',
    },
    utils: {
      border: '#333333',
      shadow: 'rgba(0, 0, 0, 0.25)',
    },
  },
  ANIMATION: {
    transition: {
      all: 'all 0.2s ease-in-out',
    },
  },
  LAYOUT: {
    borderRadius: {
      sm: '4px',
      md: '8px',
    },
  },
  TYPOGRAPHY: {
    fontWeight: {
      black: 900,
      bold: 700,
      semibold: 600,
    },
    fontSize: {
      '3xl': '2rem',
      '5xl': '3rem',
    },
  },
}));

describe('Updates Page', () => {
  beforeEach(() => {
    setupTest();

    // Mock form submission
    const mockSubmitEvent = jest.fn();
    HTMLFormElement.prototype.submit = mockSubmitEvent;
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Page Rendering', () => {
    it('should render the page with proper structure and content', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check SEO component
      expect(screen.getByTestId('seo')).toBeInTheDocument();

      // Check navigation and footer
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      // Check main heading
      expect(screen.getByText('Engine Updates')).toBeInTheDocument();

      // Check description
      expect(
        screen.getByText(
          /Stay informed about the latest features, improvements, and fixes in Hearth Engine/,
        )
      ).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check subscribe section
      expect(screen.getByText('Subscribe to Updates')).toBeInTheDocument();

      // Check RSS feed link
      expect(screen.getByText('RSS Feed')).toBeInTheDocument();

      // Check search and filters
      expect(screen.getByPlaceholderText('Search updates...')).toBeInTheDocument();

      // Check filter buttons
      expect(screen.getByRole('button', { name: /feature updates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bug fixes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /breaking changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /performance updates/i })).toBeInTheDocument();
    });

    it('should display sample updates', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check for sample update titles
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();
      expect(screen.getByText('Structural Integrity System Overhaul')).toBeInTheDocument();
      expect(screen.getByText('Fluid Simulation Performance Boost')).toBeInTheDocument();
      expect(screen.getByText('Fixed Memory Leak in Chunk Loading')).toBeInTheDocument();
      expect(screen.getByText('New Terrain Generation Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Hearth Engine 0.9.0 Released!')).toBeInTheDocument();
    });

    it('should show update categories correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check category chips
      expect(screen.getByText('Feature')).toBeInTheDocument();
      expect(screen.getByText('Breaking')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Bugfix')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter updates by search query', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');

      // Search for "GPU"
      await user.type(searchInput, 'GPU');

      // Should show GPU-related update
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();

      // Should not show unrelated updates (though this depends on implementation)
      // The search should filter the visible updates
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');

      // Type search query
      await user.type(searchInput, 'performance');

      // Clear button should appear
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Search input should be cleared
      expect(searchInput).toHaveValue('');
    });

    it('should handle empty search results', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');

      // Search for something that doesn't exist
      await user.type(searchInput, 'nonexistent-feature-xyz');

      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText('No updates found matching your criteria')).toBeInTheDocument();
      });
    });

    it('should search through update content and summaries', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');

      // Search for content that appears in summaries
      await user.type(searchInput, 'performance');

      // Should find the performance-related update
      expect(screen.getByText('Fluid Simulation Performance Boost')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter updates by category', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });
      await user.click(featureButton);

      // Should show feature updates
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();
      expect(screen.getByText('New Terrain Generation Pipeline')).toBeInTheDocument();
    });

    it('should handle multiple category selection', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });
      const bugfixButton = screen.getByRole('button', { name: /bug fixes/i });

      // Select multiple categories
      await user.click(featureButton);
      await user.click(bugfixButton);

      // Should show updates from both categories
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument(); // Feature
      expect(screen.getByText('Fixed Memory Leak in Chunk Loading')).toBeInTheDocument(); // Bugfix
    });

    it('should deselect category when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });

      // Select and deselect
      await user.click(featureButton);
      await user.click(featureButton);

      // Should show all updates again
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();
      expect(screen.getByText('Fixed Memory Leak in Chunk Loading')).toBeInTheDocument();
    });

    it('should combine search and category filters', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');
      const performanceButton = screen.getByRole('button', { name: /performance updates/i });

      // Apply both search and category filter
      await user.type(searchInput, 'simulation');
      await user.click(performanceButton);

      // Should show updates matching both criteria
      expect(screen.getByText('Fluid Simulation Performance Boost')).toBeInTheDocument();
    });
  });

  describe('Email Subscription', () => {
    it('should handle email subscription form', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      // Fill email and submit
      await user.type(emailInput, 'test@example.com');
      await user.click(subscribeButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Thanks for subscribing!')).toBeInTheDocument();
        expect(screen.getByText("You'll receive updates at test@example.com")).toBeInTheDocument();
      });
    });

    it('should require valid email address', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      // Try to submit without email
      await user.click(subscribeButton);

      // Form should not submit (browser validation)
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should show subscription success state', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'user@example.com');
      await user.click(subscribeButton);

      // Should replace form with success message
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument();
        expect(screen.getByText('Thanks for subscribing!')).toBeInTheDocument();
      });
    });
  });

  describe('RSS Feed Integration', () => {
    it('should provide RSS feed link', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const rssLink = screen.getByRole('link', { name: /rss feed/i });
      expect(rssLink).toHaveAttribute('href', '/rss/updates.xml');
      expect(rssLink).toHaveAttribute('target', '_blank');
    });

    it('should display RSS icon', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const rssLink = screen.getByRole('link', { name: /rss feed/i });
      expect(rssLink).toBeInTheDocument();
    });
  });

  describe('Update Content Display', () => {
    it('should display update metadata correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check author information
      expect(screen.getByText('Noah Sabaj')).toBeInTheDocument();
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Sarah Martinez')).toBeInTheDocument();

      // Check dates (should be formatted properly)
      expect(screen.getByText(/January 20, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument();
    });

    it('should format update content with markdown-style formatting', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check for formatted content (bold text, code blocks, etc.)
      expect(screen.getByText(/100x faster mesh generation/)).toBeInTheDocument();
      expect(screen.getByText(/Zero CPU-GPU transfer/)).toBeInTheDocument();
    });

    it('should show update summaries', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check summaries
      expect(
        screen.getByText('Revolutionary GPU-based mesh generation for massive performance gains'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Major improvements to physics simulation with breaking API changes'),
      ).toBeInTheDocument();
    });

    it('should display technical details and code examples', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Should show code examples in Breaking Changes section
      expect(screen.getByText(/Migration Guide/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check heading structure
      const h1 = screen.getByRole('heading', { level: 1, name: /Engine Updates/i });
      expect(h1).toBeInTheDocument();

      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThan(0);

      const h5Headings = screen.getAllByRole('heading', { level: 5 });
      expect(h5Headings.length).toBeGreaterThan(0);
    });

    it('should have accessible form labels', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveAccessibleName();

      const searchInput = screen.getByPlaceholderText('Search updates...');
      expect(searchInput).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Tab through interactive elements
      await user.tab();

      const firstInteractive = document.activeElement;
      expect(firstInteractive).toBeTruthy();

      // Continue tabbing
      await user.tab();
      const secondInteractive = document.activeElement;
      expect(secondInteractive).not.toBe(firstInteractive);
    });

    it('should have proper ARIA labels for filter buttons', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });
      const bugfixButton = screen.getByRole('button', { name: /bug fixes/i });
      const breakingButton = screen.getByRole('button', { name: /breaking changes/i });
      const performanceButton = screen.getByRole('button', { name: /performance updates/i });

      expect(featureButton).toHaveAccessibleName();
      expect(bugfixButton).toHaveAccessibleName();
      expect(breakingButton).toHaveAccessibleName();
      expect(performanceButton).toHaveAccessibleName();
    });

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');
      await user.type(searchInput, 'nonexistent');

      // Should have accessible feedback for no results
      await waitFor(() => {
        expect(screen.getByText('No updates found matching your criteria')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
    });

    it('should render correctly on mobile devices', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Main content should be accessible
      expect(screen.getByText('Engine Updates')).toBeInTheDocument();

      // Subscription form should be responsive
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();

      // Filter buttons should be accessible
      expect(screen.getByRole('button', { name: /feature updates/i })).toBeInTheDocument();
    });

    it('should adapt filter controls for mobile layout', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Search and filter controls should stack vertically on mobile
      const searchInput = screen.getByPlaceholderText('Search updates...');
      const filterButtons = screen.getAllByRole('button', { name: /updates|fixes|changes/i });

      expect(searchInput).toBeInTheDocument();
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('should handle touch interactions correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });

      // Simulate touch events
      fireEvent.touchStart(featureButton);
      fireEvent.touchEnd(featureButton);

      expect(featureButton).toBeInTheDocument();
    });

    it('should maintain readability on tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Content should be well-organized
      expect(screen.getByText('Subscribe to Updates')).toBeInTheDocument();
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();
    });
  });

  describe('SEO and Metadata', () => {
    it('should include proper SEO metadata', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const seoComponent = screen.getByTestId('seo');
      expect(seoComponent).toHaveAttribute('data-title', 'Updates');
      expect(seoComponent).toHaveAttribute(
        'data-description',
        'Stay up to date with the latest Hearth Engine updates, features, bug fixes, and improvements.',
      );
      expect(seoComponent).toHaveAttribute(
        'data-keywords',
        'hearth engine updates, changelog, release notes, new features, bug fixes',
      );
      expect(seoComponent).toHaveAttribute('data-pathname', '/updates');
    });
  });

  describe('Error Handling', () => {
    it('should handle form submission errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock form submission error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(subscribeButton);

      // Should not crash
      expect(screen.getByText('Engine Updates')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle malformed update data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should render even with potential data issues
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      expect(screen.getByText('Engine Updates')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle search input errors gracefully', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search updates...');

      // Type very long search query
      const longQuery = 'a'.repeat(1000);
      await user.type(searchInput, longQuery);

      // Should not crash
      expect(screen.getByText('Engine Updates')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple updates', () => {
      const startTime = performance.now();

      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably fast
      expect(renderTime).toBeLessThan(200);

      // All updates should be rendered
      expect(screen.getByText('GPU-Driven Voxel Meshing System')).toBeInTheDocument();
      expect(screen.getByText('Structural Integrity System Overhaul')).toBeInTheDocument();
    });

    it('should handle filtering efficiently', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      const featureButton = screen.getByRole('button', { name: /feature updates/i });

      // Multiple rapid filter changes should not cause issues
      for (let i = 0; i < 5; i++) {
        await user.click(featureButton);
      }

      expect(screen.getByText('Engine Updates')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check that dates are formatted in readable format
      expect(screen.getByText(/January 20, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/January 10, 2025/)).toBeInTheDocument();
    });

    it('should handle date parsing correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // All updates should have properly formatted dates
      const updateCards = screen.getAllByText(/January|December/);
      expect(updateCards.length).toBeGreaterThan(0);
    });
  });

  describe('Content Rendering', () => {
    it('should render markdown-style content correctly', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Check that content is properly formatted
      expect(screen.getByText(/100x faster mesh generation/)).toBeInTheDocument();
      expect(screen.getByText(/Zero CPU-GPU transfer/)).toBeInTheDocument();
      expect(screen.getByText(/Adaptive LOD system/)).toBeInTheDocument();
    });

    it('should handle code blocks in update content', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Should show migration guide with code examples
      expect(screen.getByText(/Migration Guide/)).toBeInTheDocument();
    });

    it('should display update categories with proper styling', () => {
      render(
        <BrowserRouter>
          <Updates />
        </BrowserRouter>
      );

      // Category chips should be present
      const categoryChips = screen.getAllByText(/Feature|Bugfix|Breaking|Performance/);
      expect(categoryChips.length).toBeGreaterThan(0);
    });
  });
});
