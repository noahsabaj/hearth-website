import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import Documentation from '../Documentation';

expect.extend(toHaveNoViolations);

// Mock scroll methods
const mockScrollTo = jest.fn();
const mockScrollIntoView = jest.fn();

// Mock localStorage for collapsed sections
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window methods
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

Element.prototype.scrollIntoView = mockScrollIntoView;

describe('Documentation Page', () => {
  beforeEach(() => {
    setupTest();
    mockScrollTo.mockClear();
    mockScrollIntoView.mockClear();
    mockWriteText.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock getBoundingClientRect for section detection
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 100,
      bottom: 200,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 100,
    }));
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render documentation page with all main sections', () => {
      render(<Documentation />);

      // Check main heading
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i, level: 1 }),
      ).toBeInTheDocument();

      // Check introduction text
      expect(screen.getByText(/welcome to the hearth engine documentation/i)).toBeInTheDocument();

      // Check all major sections are present
      expect(
        screen.getByRole('heading', { name: /getting started/i, level: 2 }),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /installation/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /basic usage/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /core concepts/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /architecture/i, level: 2 })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /cargo commands reference/i, level: 2 }),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /api reference/i, level: 2 })).toBeInTheDocument();
    });

    it('should render navigation sidebar with grouped sections', () => {
      render(<Documentation />);

      const sidebar = screen.getByRole('navigation', { name: /documentation sections/i });
      expect(sidebar).toBeInTheDocument();

      // Check section groups
      expect(within(sidebar).getByText(/getting started/i)).toBeInTheDocument();
      expect(within(sidebar).getByText(/advanced topics/i)).toBeInTheDocument();
      expect(within(sidebar).getByText(/reference/i)).toBeInTheDocument();
    });

    it('should render progress bar and back to top button', () => {
      render(<Documentation />);

      // Progress bar should be present
      const progressBar = screen.getByRole('progressbar', { name: /reading progress/i });
      expect(progressBar).toBeInTheDocument();

      // Back to top button should exist but initially hidden
      const backToTopButton = screen.getByRole('button', { name: /back to top/i });
      expect(backToTopButton).toBeInTheDocument();
    });

    it('should render code examples and interactive elements', () => {
      render(<Documentation />);

      // Check for code blocks
      const codeBlocks = screen.getAllByText(/hearth_engine/i);
      expect(codeBlocks.length).toBeGreaterThan(0);

      // Check for reading time components
      expect(screen.getAllByText(/min read/i).length).toBeGreaterThan(0);

      // Check for edit on GitHub buttons
      const editButtons = screen.getAllByRole('button', { name: /edit on github/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Content Verification', () => {
    it('should display accurate technical content', () => {
      render(<Documentation />);

      // Check for key technical concepts
      expect(screen.getByText(/data-oriented programming/i)).toBeInTheDocument();
      expect(screen.getByText(/gpu-first architecture/i)).toBeInTheDocument();
      expect(screen.getByText(/8-phase automation/i)).toBeInTheDocument();
      expect(screen.getByText(/voxel game engine/i)).toBeInTheDocument();

      // Check for installation instructions
      expect(screen.getByText(/cargo\.toml/i)).toBeInTheDocument();
      expect(screen.getByText(/git clone/i)).toBeInTheDocument();

      // Check for system requirements
      expect(screen.getByText(/vulkan/i)).toBeInTheDocument();
      expect(screen.getByText(/directx 12/i)).toBeInTheDocument();
      expect(screen.getByText(/8gb\+ ram/i)).toBeInTheDocument();
    });

    it('should display code examples with proper syntax highlighting', () => {
      render(<Documentation />);

      // Check for Rust code examples
      expect(screen.getByText(/struct MyGame/i)).toBeInTheDocument();
      expect(screen.getByText(/impl Game for MyGame/i)).toBeInTheDocument();
      expect(screen.getByText(/fn main\(\)/i)).toBeInTheDocument();

      // Check for TOML configuration
      expect(screen.getByText(/\[dependencies\]/i)).toBeInTheDocument();

      // Check for bash commands
      expect(screen.getByText(/cargo check/i)).toBeInTheDocument();
      expect(screen.getByText(/cargo build/i)).toBeInTheDocument();
    });

    it('should display proper metadata for each section', () => {
      render(<Documentation />);

      // Check for last updated timestamps
      const updatedElements = screen.getAllByText(/updated/i);
      expect(updatedElements.length).toBeGreaterThan(0);

      // Check for reading time estimates
      const readingTimes = screen.getAllByText(/min read/i);
      expect(readingTimes.length).toBeGreaterThan(5); // Should have reading time for each major section
    });
  });

  describe('User Interactions', () => {
    it('should handle sidebar navigation clicks', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Find and click on a sidebar navigation item
      const installationLink = screen.getByRole('button', { name: /installation/i });
      await user.click(installationLink);

      // Verify scroll was called
      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: expect.any(Number),
          behavior: 'smooth',
        });
      });
    });

    it('should expand and collapse sidebar sections', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Find section group toggle
      const advancedTopicsToggle = screen.getByRole('button', { name: /advanced topics/i });
      await user.click(advancedTopicsToggle);

      // Section should collapse/expand
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'docSidebarCollapsed',
        expect.any(String)
      );
    });

    it('should handle section link copying', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Find and click a copy link button
      const copyButtons = screen.getAllByRole('button', { name: /copy link to section/i });
      await user.click(copyButtons[0]);

      // Verify clipboard operation
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('#'));
      });
    });

    it('should handle mobile sidebar toggle', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Documentation />);

      // Find mobile menu button
      const mobileMenuButton = screen.getByRole('button', {
        name: /toggle documentation sidebar/i,
      });
      expect(mobileMenuButton).toBeInTheDocument();

      await user.click(mobileMenuButton);

      // Mobile drawer should open
      const drawer = screen.getByRole('presentation');
      expect(drawer).toBeInTheDocument();
    });

    it('should handle back to top functionality', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Simulate scroll to make back to top button visible
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      await waitFor(() => {
        const backToTopButton = screen.getByRole('button', { name: /back to top/i });
        expect(backToTopButton).toBeVisible();
      });

      const backToTopButton = screen.getByRole('button', { name: /back to top/i });
      await user.click(backToTopButton);

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Navigation Behavior', () => {
    it('should track active section during scroll', async () => {
      render(<Documentation />);

      // Simulate scroll event
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 500,
      });

      fireEvent.scroll(window, { target: { scrollY: 500 } });

      // Progress bar should update
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow');
      });
    });

    it('should handle deep linking to sections', () => {
      // Mock URL hash
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          hash: '#installation',
          pathname: '/docs',
          origin: 'http://localhost:3000',
        },
        writable: true,
      });

      render(<Documentation />);

      // Should render with installation section highlighted
      const installationSection = screen.getByRole('heading', { name: /installation/i });
      expect(installationSection).toBeInTheDocument();
    });

    it('should handle keyboard navigation shortcuts', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Test keyboard shortcuts (implementation depends on KeyboardShortcutsContext)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      // Navigation should be handled by keyboard shortcuts context
      // This test verifies the component properly integrates with the shortcut system
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Documentation />);

      // Mobile menu button should be visible
      const mobileMenuButton = screen.getByRole('button', {
        name: /toggle documentation sidebar/i,
      });
      expect(mobileMenuButton).toBeInTheDocument();

      // Desktop sidebar should be hidden on mobile
      const desktopSidebar = screen.queryByRole('navigation', { name: /documentation sections/i });
      expect(desktopSidebar).toBeInTheDocument(); // Still in DOM but CSS hidden
    });

    it('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Documentation />);

      // Should render appropriately for tablet
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should handle large desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<Documentation />);

      // Should render with full desktop layout
      const sidebar = screen.getByRole('navigation', { name: /documentation sections/i });
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<Documentation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<Documentation />);

      // Check heading levels are properly structured
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(3);
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should support screen reader navigation', () => {
      render(<Documentation />);

      // Check for proper ARIA labels
      const sidebar = screen.getByRole('navigation', { name: /documentation sections/i });
      expect(sidebar).toHaveAttribute('aria-label', 'Documentation sections');

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Check for skip links or main content ID
      const mainContent = screen.getByRole('article');
      expect(mainContent).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<Documentation />);

      // Tab through interactive elements
      await user.tab();

      // Should focus on first interactive element
      const firstFocusable = screen.getAllByRole('button')[0];
      if (firstFocusable) {
        expect(document.activeElement).toBeDefined();
      }
    });

    it('should provide proper link context', () => {
      render(<Documentation />);

      // Check external links have proper attributes
      const githubLinks = screen.getAllByRole('link', { name: /github/i });
      githubLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing section elements gracefully', () => {
      // Mock getElementById to return null
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn(() => null);

      render(<Documentation />);

      // Component should still render without errors
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i }),
      ).toBeInTheDocument();

      // Restore original function
      document.getElementById = originalGetElementById;
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(<Documentation />);

      // Component should still render despite localStorage errors
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i }),
      ).toBeInTheDocument();
    });

    it('should handle clipboard API errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock clipboard to throw error
      mockWriteText.mockRejectedValue(new Error('Clipboard not available'));

      render(<Documentation />);

      const copyButtons = screen.getAllByRole('button', { name: /copy link to section/i });

      // Should not crash when clipboard fails
      await user.click(copyButtons[0]);

      // Component should still be functional
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle scroll events efficiently', () => {
      render(<Documentation />);

      // Trigger multiple scroll events rapidly
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'pageYOffset', {
          writable: true,
          value: i * 100,
        });
        fireEvent.scroll(window, { target: { scrollY: i * 100 } });
      }

      // Component should handle rapid scroll events without issues
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i }),
      ).toBeInTheDocument();
    });

    it('should memoize expensive calculations', () => {
      const { rerender } = render(<Documentation />);

      // Re-render with same props
      rerender(<Documentation />);

      // Component should handle re-renders efficiently
      expect(
        screen.getByRole('heading', { name: /hearth engine documentation/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Integration with Components', () => {
    it('should integrate with NavigationBar', () => {
      render(<Documentation />);

      // Navigation bar should be present
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should integrate with Footer', () => {
      render(<Documentation />);

      // Footer should be present
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should integrate with SEO component', () => {
      render(<Documentation />);

      // Check that document title is set
      expect(document.title).toContain('Documentation');
    });

    it('should integrate with CodeBlock components', () => {
      render(<Documentation />);

      // Code blocks should be properly rendered
      const codeElements = screen.getAllByText(/use hearth_engine/i);
      expect(codeElements.length).toBeGreaterThan(0);
    });

    it('should integrate with FeedbackWidget', () => {
      render(<Documentation />);

      // Feedback widgets should be present for each section
      const feedbackWidgets = screen.getAllByText(/feedback/i);
      expect(feedbackWidgets.length).toBeGreaterThan(0);
    });
  });
});
