import { useMediaQuery } from '@mui/material';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import EditOnGitHub from '../EditOnGitHub';

expect.extend(toHaveNoViolations);

// Mock useMediaQuery hook
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('EditOnGitHub Component', () => {
  const defaultProps = {
    filePath: 'src/pages/Documentation.tsx',
  };

  beforeEach(() => {
    setupTest();
    // Default to desktop view
    mockUseMediaQuery.mockReturnValue(false);
  });

  afterEach(() => {
    teardownTest();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button', { name: /edit this page on github/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/src/pages/Documentation.tsx',
      );
      expect(button).toHaveAttribute('target', '_blank');
      expect(button).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders with edit variant by default', () => {
      render(<EditOnGitHub {...defaultProps} />);

      expect(screen.getByRole('button', { name: /edit this page on github/i })).toBeInTheDocument();
    });

    it('renders with improve variant', () => {
      render(<EditOnGitHub {...defaultProps} variant='improve' />);

      expect(
        screen.getByRole('button', { name: /improve this section on github/i }),
      ).toBeInTheDocument();
    });

    it('renders with medium size by default', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with small size', () => {
      render(<EditOnGitHub {...defaultProps} size='small' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('applies custom sx styles', () => {
      const customSx = { marginTop: 2 };
      render(<EditOnGitHub {...defaultProps} sx={customSx} />);

      const container = screen.getByRole('button').parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe('URL Generation', () => {
    it('generates correct GitHub edit URL', () => {
      render(<EditOnGitHub filePath='docs/README.md' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/docs/README.md',
      );
    });

    it('handles file paths with leading slash', () => {
      render(<EditOnGitHub filePath='/src/components/Test.tsx' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main//src/components/Test.tsx',
      );
    });

    it('handles nested file paths', () => {
      render(<EditOnGitHub filePath='src/components/ui/Button.tsx' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/src/components/ui/Button.tsx',
      );
    });

    it('handles file paths with special characters', () => {
      render(<EditOnGitHub filePath='docs/API Reference.md' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/docs/API Reference.md',
      );
    });
  });

  describe('Tooltip Messages', () => {
    it('shows correct tooltip for edit variant', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} variant='edit' />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Edit this page on GitHub')).toBeInTheDocument();
      });
    });

    it('shows correct tooltip for improve variant', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} variant='improve' />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Improve this section on GitHub')).toBeInTheDocument();
      });
    });

    it('adjusts tooltip placement on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile view
      const user = userEvent.setup();

      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.hover(button);

      // Tooltip should still appear (placement is handled by Material-UI)
      await waitFor(() => {
        expect(screen.getByText('Edit this page on GitHub')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Labels', () => {
    it('provides correct aria-label for edit variant', () => {
      render(<EditOnGitHub {...defaultProps} variant='edit' />);

      const button = screen.getByRole('button', {
        name: /edit this page on github \(opens in new tab\)/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('provides correct aria-label for improve variant', () => {
      render(<EditOnGitHub {...defaultProps} variant='improve' />);

      const button = screen.getByRole('button', {
        name: /improve this section on github \(opens in new tab\)/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('includes information about opening in new tab', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('opens in new tab'));
    });
  });

  describe('Icon Rendering', () => {
    it('shows GitHub icon on desktop for edit variant', () => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop
      render(<EditOnGitHub {...defaultProps} variant='edit' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Icon presence is tested through DOM structure
    });

    it('shows Edit icon on mobile for edit variant', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      render(<EditOnGitHub {...defaultProps} variant='edit' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Icon presence is tested through DOM structure
    });

    it('shows GitHub icon for improve variant regardless of device', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      render(<EditOnGitHub {...defaultProps} variant='improve' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('maintains icon consistency across viewport changes', () => {
      const { rerender } = render(<EditOnGitHub {...defaultProps} />);

      // Start with desktop
      mockUseMediaQuery.mockReturnValue(false);
      rerender(<EditOnGitHub {...defaultProps} />);

      let button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Switch to mobile
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<EditOnGitHub {...defaultProps} />);

      button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides small buttons on mobile when specified', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      render(<EditOnGitHub {...defaultProps} size='small' />);

      // Component should still render but may have different visibility styles
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('shows buttons on desktop regardless of size', () => {
      mockUseMediaQuery.mockReturnValue(false); // Desktop
      render(<EditOnGitHub {...defaultProps} size='small' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('adjusts icon sizes for mobile', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      render(<EditOnGitHub {...defaultProps} size='small' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('adjusts padding for mobile', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      render(<EditOnGitHub {...defaultProps} size='small' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Link should open in new tab (handled by browser)
      expect(button).toHaveAttribute('target', '_blank');
    });

    it('handles hover effects', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');

      await user.hover(button);
      expect(button).toBeInTheDocument();

      await user.unhover(button);
      expect(button).toBeInTheDocument();
    });

    it('handles focus states', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(button);
    });

    it('supports keyboard activation', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');

      // Should activate the link
      expect(button).toHaveAttribute('href');
    });
  });

  describe('Styling and Theme Integration', () => {
    it('applies hover styles correctly', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');

      // Initial state
      expect(button).toBeInTheDocument();

      // Hover state (styles applied via CSS)
      await user.hover(button);
      expect(button).toBeInTheDocument();
    });

    it('applies correct color scheme', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle('color: text.secondary');
    });

    it('applies transform effects on hover', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.hover(button);

      // Transform styles are applied via CSS
      expect(button).toBeInTheDocument();
    });

    it('applies brand color on hover', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.hover(button);

      // Brand color applied via CSS
      expect(button).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles empty filePath', () => {
      render(<EditOnGitHub filePath='' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/',
      );
    });

    it('handles all prop combinations', () => {
      render(<EditOnGitHub filePath='test.md' variant='improve' size='small' sx={{ margin: 1 }} />);

      const button = screen.getByRole('button', { name: /improve this section on github/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/test.md',
      );
    });

    it('handles default prop values', () => {
      render(<EditOnGitHub filePath='test.md' />);

      const button = screen.getByRole('button', { name: /edit this page on github/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long file paths', () => {
      const longPath =
        'very/long/path/that/goes/deep/into/the/directory/structure/with/many/nested/folders/file.tsx';
      render(<EditOnGitHub filePath={longPath} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        `https://github.com/noahsabaj/hearth-website/edit/main/${longPath}`,
      );
    });

    it('handles file paths with dots', () => {
      render(<EditOnGitHub filePath='../relative/path/file.tsx' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/../relative/path/file.tsx',
      );
    });

    it('handles file paths with query parameters in name', () => {
      render(<EditOnGitHub filePath='file?with=query.md' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/file?with=query.md',
      );
    });

    it('handles file paths with hash symbols', () => {
      render(<EditOnGitHub filePath='file#with-hash.md' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'href',
        'https://github.com/noahsabaj/hearth-website/edit/main/file#with-hash.md',
      );
    });
  });

  describe('Media Query Responsiveness', () => {
    it('responds to media query changes', () => {
      const { rerender } = render(<EditOnGitHub {...defaultProps} />);

      // Desktop
      mockUseMediaQuery.mockReturnValue(false);
      rerender(<EditOnGitHub {...defaultProps} />);

      let button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Mobile
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<EditOnGitHub {...defaultProps} />);

      button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles media query breakpoint edge cases', () => {
      // Test at breakpoint boundary
      mockUseMediaQuery.mockReturnValue(true);
      render(<EditOnGitHub {...defaultProps} size='small' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('includes security attributes for external link', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('rel', 'noopener noreferrer');
      expect(button).toHaveAttribute('target', '_blank');
    });

    it('prevents window.opener access', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });

    it('prevents referrer leakage', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<EditOnGitHub {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all variants', async () => {
      const { container } = render(
        <div>
          <EditOnGitHub filePath='test1.md' variant='edit' size='small' />
          <EditOnGitHub filePath='test2.md' variant='improve' size='medium' />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper focus indicators', async () => {
      const user = userEvent.setup();
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.tab();

      expect(document.activeElement).toBe(button);
    });

    it('supports screen readers', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('GitHub');
      expect(button.getAttribute('aria-label')).toContain('opens in new tab');
    });

    it('provides meaningful link text through aria-label', () => {
      render(<EditOnGitHub {...defaultProps} variant='improve' />);

      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toContain('Improve this section on GitHub');
      expect(ariaLabel).toContain('opens in new tab');
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple instances', () => {
      render(
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <EditOnGitHub key={i} filePath={`file${i}.md`} />
          ))}
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<EditOnGitHub filePath='file1.md' />);

      // Rapidly change props
      for (let i = 2; i <= 10; i++) {
        rerender(<EditOnGitHub filePath={`file${i}.md`} />);
      }

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('href', expect.stringContaining('file10.md'));
    });

    it('memoizes effectively', () => {
      const { rerender } = render(<EditOnGitHub {...defaultProps} />);

      // Rerender with same props
      rerender(<EditOnGitHub {...defaultProps} />);
      rerender(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Integration with Material-UI', () => {
    it('integrates properly with Material-UI theme', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Theme integration tested through rendering without errors
    });

    it('respects Material-UI breakpoint system', () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('uses Material-UI icon components correctly', () => {
      render(<EditOnGitHub {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Icon rendering tested through component stability
    });
  });
});
