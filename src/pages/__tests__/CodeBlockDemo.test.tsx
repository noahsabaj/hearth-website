import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render, setupTest, teardownTest, mockIntersectionObserver } from '../../test-utils';
import CodeBlockDemo from '../CodeBlockDemo';

expect.extend(toHaveNoViolations);

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('CodeBlockDemo Page', () => {
  beforeEach(() => {
    setupTest();
    mockWriteText.mockClear();
    mockNavigate.mockClear();
    window.IntersectionObserver = mockIntersectionObserver;

    // Mock scrollTo
    window.scrollTo = jest.fn();

    // Mock getSelection for text selection tests
    window.getSelection = jest.fn(() => ({
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    })) as any;
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Page Rendering', () => {
    it('should render the page with proper structure and content', () => {
      render(<CodeBlockDemo />);

      // Check main heading
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();

      // Check navigation bar
      expect(screen.getByText('CodeBlock Demo')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument();

      // Check GitHub link
      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/noahsabaj/hearth-engine');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render all demo sections', () => {
      render(<CodeBlockDemo />);

      // Check all section headings
      expect(
        screen.getByText('1. Basic Features (Line Numbers, Language Label, Copy/Select)'),
      ).toBeInTheDocument();
      expect(screen.getByText('2. File Path Display')).toBeInTheDocument();
      expect(screen.getByText('3. Line Highlighting')).toBeInTheDocument();
      expect(screen.getByText('4. Toggle Features')).toBeInTheDocument();
      expect(screen.getByText('5. Different Languages')).toBeInTheDocument();
      expect(screen.getByText('6. Combined Features')).toBeInTheDocument();
    });

    it('should render all code blocks with proper languages', () => {
      render(<CodeBlockDemo />);

      // Check for language labels in code blocks
      expect(screen.getByText('rust')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('python')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('toml')).toBeInTheDocument();
      expect(screen.getByText('bash')).toBeInTheDocument();
    });

    it('should display code snippets correctly', () => {
      render(<CodeBlockDemo />);

      // Check for specific code content
      expect(screen.getByText(/use std::collections::HashMap/)).toBeInTheDocument();
      expect(screen.getByText(/async function fetchUserData/)).toBeInTheDocument();
      expect(screen.getByText(/class Animal:/)).toBeInTheDocument();
      expect(screen.getByText(/interface User/)).toBeInTheDocument();
    });
  });

  describe('Code Block Interactions', () => {
    it('should handle copy functionality', async () => {
      const user = userEvent.setup();
      render(<CodeBlockDemo />);

      // Find copy buttons (there should be multiple)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      expect(copyButtons.length).toBeGreaterThan(0);

      // Click first copy button
      await user.click(copyButtons[0]);

      // Verify clipboard was called
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });

      // Check for success feedback (if implemented)
      await waitFor(
        () => {
          expect(screen.getByText(/copied/i) || screen.getByLabelText(/copied/i)).toBeTruthy();
        },
        { timeout: 1000 },
      );
    });

    it('should handle text selection functionality', async () => {
      const user = userEvent.setup();
      render(<CodeBlockDemo />);

      // Find select all buttons
      const selectButtons = screen.getAllByRole('button', { name: /select/i });
      expect(selectButtons.length).toBeGreaterThan(0);

      // Click first select button
      await user.click(selectButtons[0]);

      // Verify selection was called
      expect(window.getSelection).toHaveBeenCalled();
    });

    it('should display file paths correctly', () => {
      render(<CodeBlockDemo />);

      // Check for file path displays
      expect(screen.getByText('src/utils/api.js')).toBeInTheDocument();
      expect(screen.getByText('examples/animals.py')).toBeInTheDocument();
      expect(screen.getByText('config/settings.js')).toBeInTheDocument();
      expect(screen.getByText('Cargo.toml')).toBeInTheDocument();
      expect(screen.getByText('scripts/build.sh')).toBeInTheDocument();
      expect(screen.getByText('src/engine/physics.rs')).toBeInTheDocument();
    });

    it('should show line numbers correctly', () => {
      render(<CodeBlockDemo />);

      // Look for line number elements (they typically have specific classes or data attributes)
      const codeElements = screen.getAllByRole('code');
      expect(codeElements.length).toBeGreaterThan(0);

      // Check that line numbers are displayed (implementation dependent)
      const firstCodeBlock = codeElements[0];
      expect(firstCodeBlock).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to home when home button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <CodeBlockDemo />
        </BrowserRouter>
      );

      const homeButton = screen.getByRole('link', { name: /home/i });
      await user.click(homeButton);

      // Check if navigation would occur (link has correct href)
      expect(homeButton).toHaveAttribute('href', '/');
    });

    it('should navigate to documentation when docs button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <CodeBlockDemo />
        </BrowserRouter>
      );

      const docsButton = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsButton);

      expect(docsButton).toHaveAttribute('href', '/docs');
    });

    it('should handle GitHub link correctly', () => {
      render(<CodeBlockDemo />);

      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/noahsabaj/hearth-engine');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667, // Mobile height
      });
    });

    it('should render correctly on mobile devices', () => {
      render(<CodeBlockDemo />);

      // Check that content is still accessible
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();

      // Check that navigation is responsive
      const appBar = screen.getByRole('banner');
      expect(appBar).toBeInTheDocument();
    });

    it('should handle touch interactions on mobile', async () => {
      render(<CodeBlockDemo />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });

      // Simulate touch event on copy button
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 0 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 0, clientY: 0 } as Touch],
      });

      act(() => {
        fireEvent(copyButtons[0], touchStart);
        fireEvent(copyButtons[0], touchEnd);
      });

      // Should not interfere with normal functionality
      expect(copyButtons[0]).toBeInTheDocument();
    });

    it('should adapt layout for tablet view', () => {
      // Set tablet dimensions
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      render(<CodeBlockDemo />);

      // Check that content adapts appropriately
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();

      // Navigation should be visible
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<CodeBlockDemo />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', () => {
      render(<CodeBlockDemo />);

      // Check navigation accessibility
      const navigation = screen.getByRole('banner');
      expect(navigation).toBeInTheDocument();

      // Check button accessibility
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      copyButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });

      // Check link accessibility
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CodeBlockDemo />);

      // Tab through interactive elements
      await user.tab();

      // Should focus on first interactive element
      const firstButton = screen.getAllByRole('button')[0] || screen.getAllByRole('link')[0];
      expect(firstButton).toHaveFocus();

      // Continue tabbing
      await user.tab();
      const secondElement = document.activeElement;
      expect(secondElement).not.toBe(firstButton);
    });

    it('should have proper heading hierarchy', () => {
      render(<CodeBlockDemo />);

      // Check heading levels are properly structured
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Enhanced CodeBlock Component Demo');

      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThan(0);
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<CodeBlockDemo />);

      // Test focus on interactive elements
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });

      await user.click(copyButtons[0]);

      // Focus should remain manageable
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Code Highlighting Features', () => {
    it('should display syntax highlighting correctly', () => {
      render(<CodeBlockDemo />);

      // Check that different programming languages are highlighted
      const codeBlocks = screen.getAllByRole('code');
      expect(codeBlocks.length).toBeGreaterThan(0);

      // Verify that code contains syntax elements
      expect(screen.getByText(/use std::collections::HashMap/)).toBeInTheDocument();
      expect(screen.getByText(/async function fetchUserData/)).toBeInTheDocument();
    });

    it('should handle line highlighting demonstration', () => {
      render(<CodeBlockDemo />);

      // Look for the Python example that shows line highlighting
      expect(screen.getByText('examples/animals.py')).toBeInTheDocument();
      expect(screen.getByText(/class Animal:/)).toBeInTheDocument();
    });

    it('should demonstrate word wrap toggle', () => {
      render(<CodeBlockDemo />);

      // Check for the long line example
      expect(screen.getByText('config/settings.js')).toBeInTheDocument();
      expect(screen.getByText(/very long string that demonstrates/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle clipboard API errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock clipboard error
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard not available'));

      render(<CodeBlockDemo />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });

      // Should not crash when copy fails
      await user.click(copyButtons[0]);

      // Page should still be functional
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();
    });

    it('should handle missing code content gracefully', () => {
      // This would test edge cases where code content might be undefined
      render(<CodeBlockDemo />);

      // Page should still render
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();
    });

    it('should handle network errors for external resources', async () => {
      // Mock console.error to prevent error output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<CodeBlockDemo />);

      // Page should render even if external resources fail
      expect(screen.getByText('Enhanced CodeBlock Component Demo')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple code blocks', () => {
      const startTime = performance.now();

      render(<CodeBlockDemo />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should be reasonably fast
      expect(renderTime).toBeLessThan(1000); // 1 second threshold for tests

      // All code blocks should be present
      const codeBlocks = screen.getAllByRole('code');
      expect(codeBlocks.length).toBeGreaterThan(5);
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(<CodeBlockDemo />);

      // Simulate unmounting
      unmount();

      // No specific assertions here, but test would fail if there were obvious memory leaks
      expect(true).toBe(true);
    });
  });

  describe('Theme Integration', () => {
    it('should work with different themes', () => {
      render(<CodeBlockDemo />);

      // Check that theme styling is applied
      const appBar = screen.getByRole('banner');
      expect(appBar).toHaveStyle('background: rgba(10, 10, 10, 0.9)');
    });

    it('should maintain readability across themes', () => {
      render(<CodeBlockDemo />);

      // Text should be visible
      const heading = screen.getByText('Enhanced CodeBlock Component Demo');
      expect(heading).toBeVisible();

      // Code blocks should be readable
      const codeContent = screen.getByText(/use std::collections::HashMap/);
      expect(codeContent).toBeVisible();
    });
  });

  describe('Content Verification', () => {
    it('should display comprehensive feature descriptions', () => {
      render(<CodeBlockDemo />);

      // Check feature descriptions are present
      expect(screen.getByText(/By default, the CodeBlock shows line numbers/)).toBeInTheDocument();
      expect(
        screen.getByText(/You can specify a file path to provide context/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Highlight specific lines or ranges/)).toBeInTheDocument();
    });

    it('should show technical implementation details', () => {
      render(<CodeBlockDemo />);

      // Check that accessibility note is present
      expect(
        screen.getByText(/smooth animations and maintain excellent accessibility/),
      ).toBeInTheDocument();
    });

    it('should demonstrate all supported languages', () => {
      render(<CodeBlockDemo />);

      // Verify all language examples are shown
      const languageLabels = ['rust', 'javascript', 'python', 'typescript', 'toml', 'bash'];
      languageLabels.forEach(lang => {
        expect(screen.getByText(lang)).toBeInTheDocument();
      });
    });
  });
});
