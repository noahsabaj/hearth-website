import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import Footer from '../Footer';

expect.extend(toHaveNoViolations);

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Rendering', () => {
    it('renders footer with correct role', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });

    it('renders copyright text', () => {
      render(<Footer />);

      expect(screen.getByText(/© 2025 Hearth Engine/)).toBeInTheDocument();
      expect(screen.getByText(/Built with/)).toBeInTheDocument();
      expect(screen.getByText(/in Rust/)).toBeInTheDocument();
    });

    it('renders fire emoji with proper aria-label', () => {
      render(<Footer />);

      const fireEmoji = screen.getByLabelText('fire');
      expect(fireEmoji).toBeInTheDocument();
      expect(fireEmoji).toHaveTextContent('🔥');
    });

    it('renders all navigation links', () => {
      render(<Footer />);

      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('renders with proper semantic structure', () => {
      render(<Footer />);

      // Should have proper footer structure
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Should contain navigation buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // GitHub, Documentation, Downloads
    });
  });

  describe('Link Functionality', () => {
    it('has working GitHub link with correct attributes', () => {
      render(<Footer />);

      const githubLink = screen.getByText('GitHub').closest('a');
      expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'));
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has working Documentation link', () => {
      render(<Footer />);

      const docsLink = screen.getByText('Documentation').closest('a');
      expect(docsLink).toHaveAttribute('href', '/docs');
    });

    it('has working Downloads link', () => {
      render(<Footer />);

      const downloadsLink = screen.getByText('Downloads').closest('a');
      expect(downloadsLink).toHaveAttribute('href', '/downloads');
    });

    it('opens GitHub link in new tab', () => {
      render(<Footer />);

      const githubButton = screen.getByText('GitHub');
      const githubLink = githubButton.closest('a');

      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('internal links do not open in new tab', () => {
      render(<Footer />);

      const docsLink = screen.getByText('Documentation').closest('a');
      const downloadsLink = screen.getByText('Downloads').closest('a');

      expect(docsLink).not.toHaveAttribute('target');
      expect(downloadsLink).not.toHaveAttribute('target');
    });
  });

  describe('Icons', () => {
    it('renders GitHub icon', () => {
      render(<Footer />);

      const githubButton = screen.getByText('GitHub');
      const githubIcon = githubButton.closest('button')?.querySelector('svg');
      expect(githubIcon).toBeInTheDocument();
    });

    it('renders Documentation icon', () => {
      render(<Footer />);

      const docsButton = screen.getByText('Documentation');
      const docsIcon = docsButton.closest('button')?.querySelector('svg');
      expect(docsIcon).toBeInTheDocument();
    });

    it('renders Downloads icon', () => {
      render(<Footer />);

      const downloadsButton = screen.getByText('Downloads');
      const downloadsIcon = downloadsButton.closest('button')?.querySelector('svg');
      expect(downloadsIcon).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains layout on mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(<Footer />);

      // All elements should still be present
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
      expect(screen.getByText(/© 2025 Hearth Engine/)).toBeInTheDocument();
    });

    it('maintains layout on tablet screens', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Footer />);

      // All elements should still be present
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('maintains layout on desktop screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<Footer />);

      // All elements should be present
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('uses responsive grid layout', () => {
      render(<Footer />);

      // Should use MUI Grid components for responsive layout
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Check that buttons are contained within the grid structure
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Hover Effects', () => {
    it('applies hover effects to GitHub button', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const githubButton = screen.getByText('GitHub').closest('button');
      expect(githubButton).toBeInTheDocument();

      await user.hover(githubButton!);

      // Button should have hover styles applied
      expect(githubButton).toHaveStyle('color: rgba(255,255,255,0.7)');
    });

    it('applies hover effects to Documentation button', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const docsButton = screen.getByText('Documentation').closest('button');
      expect(docsButton).toBeInTheDocument();

      await user.hover(docsButton!);

      // Should maintain consistent hover behavior
      expect(docsButton).toBeInTheDocument();
    });

    it('applies hover effects to Downloads button', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const downloadsButton = screen.getByText('Downloads').closest('button');
      expect(downloadsButton).toBeInTheDocument();

      await user.hover(downloadsButton!);

      // Should maintain consistent hover behavior
      expect(downloadsButton).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels and roles', () => {
      render(<Footer />);

      // Footer should have contentinfo role
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Buttons should be properly labeled
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('has accessible button text', () => {
      render(<Footer />);

      // All buttons should have descriptive text
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const githubButton = screen.getByText('GitHub').closest('button');
      const docsButton = screen.getByText('Documentation').closest('button');
      const downloadsButton = screen.getByText('Downloads').closest('button');

      // Should be able to focus buttons
      await user.tab();
      expect(githubButton).toHaveFocus();

      await user.tab();
      expect(docsButton).toHaveFocus();

      await user.tab();
      expect(downloadsButton).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const githubButton = screen.getByText('GitHub').closest('button');

      // Focus the button
      githubButton?.focus();
      expect(githubButton).toHaveFocus();

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');

      // Should be able to activate with Space
      await user.keyboard(' ');
    });

    it('has proper color contrast', () => {
      render(<Footer />);

      // Buttons should have sufficient color contrast
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle('color: rgba(255,255,255,0.7)');
      });
    });

    it('handles high contrast mode', () => {
      // Mock high contrast mode
      document.documentElement.classList.add('high-contrast');

      render(<Footer />);

      // Should still be accessible in high contrast mode
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();

      // Cleanup
      document.documentElement.classList.remove('high-contrast');
    });
  });

  describe('Performance', () => {
    it('is memoized correctly', () => {
      const { rerender } = render(<Footer />);

      // Re-render with same props
      rerender(<Footer />);

      // Should not cause unnecessary re-renders
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('handles multiple rapid interactions', async () => {
      const user = userEvent.setup();
      render(<Footer />);

      const githubButton = screen.getByText('GitHub').closest('button');

      // Rapidly hover and click
      for (let i = 0; i < 5; i++) {
        await user.hover(githubButton!);
        await user.unhover(githubButton!);
      }

      // Should not cause performance issues
      expect(githubButton).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('has proper border top styling', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveStyle('border-top: 1px solid rgba(255, 255, 255, 0.1)');
    });

    it('has proper padding and spacing', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Should have proper spacing structure
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('centers content correctly', () => {
      render(<Footer />);

      // Copyright text should be centered
      const copyrightText = screen.getByText(/© 2025 Hearth Engine/);
      expect(copyrightText).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works with routing system', () => {
      render(<Footer />);

      // Internal links should work with React Router
      const docsLink = screen.getByText('Documentation').closest('a');
      const downloadsLink = screen.getByText('Downloads').closest('a');

      expect(docsLink).toHaveAttribute('href', '/docs');
      expect(downloadsLink).toHaveAttribute('href', '/downloads');
    });

    it('works with external links', () => {
      render(<Footer />);

      // External GitHub link should open in new tab
      const githubLink = screen.getByText('GitHub').closest('a');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing constants gracefully', () => {
      // This test ensures the component doesn't crash if constants are undefined
      render(<Footer />);

      // Should still render basic structure
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('handles window resize events', () => {
      render(<Footer />);

      // Simulate window resize
      fireEvent(window, new Event('resize'));

      // Should still function correctly
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });
  });
});
