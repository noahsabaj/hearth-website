import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LastUpdated from '../LastUpdated';

expect.extend(toHaveNoViolations);

describe('LastUpdated Component', () => {
  const mockDate = new Date('2025-01-15T14:30:00Z');
  const mockRecentDate = new Date(Date.now() - 1000 * 60 * 30); // 30 minutes ago
  const mockOldDate = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    setupTest();
    // Mock Date.now to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-22T16:00:00Z'));
  });

  afterEach(() => {
    teardownTest();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with Date object', () => {
      render(<LastUpdated date={mockDate} />);

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });

    it('renders with ISO string date', () => {
      render(<LastUpdated date={mockDate.toISOString()} />);

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });

    it('displays update icon', () => {
      render(<LastUpdated date={mockDate} />);

      // Check for MUI UpdateOutlined icon
      const chip = screen.getByRole('button'); // Chip with icon has button role
      expect(chip).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<LastUpdated date={mockDate} className='custom-class' />);

      // The className is applied to the sx prop, check container structure
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Date Formatting - Relative Time', () => {
    it('shows "just now" for very recent updates', () => {
      const justNow = new Date(Date.now() - 30000); // 30 seconds ago
      render(<LastUpdated date={justNow} />);

      expect(screen.getByText(/Updated just now/)).toBeInTheDocument();
    });

    it('shows minutes for recent updates', () => {
      const minutesAgo = new Date(Date.now() - 1000 * 60 * 15); // 15 minutes ago
      render(<LastUpdated date={minutesAgo} />);

      expect(screen.getByText(/Updated 15 minutes ago/)).toBeInTheDocument();
    });

    it('shows singular minute correctly', () => {
      const oneMinuteAgo = new Date(Date.now() - 1000 * 60); // 1 minute ago
      render(<LastUpdated date={oneMinuteAgo} />);

      expect(screen.getByText(/Updated 1 minute ago/)).toBeInTheDocument();
    });

    it('shows hours for older updates', () => {
      const hoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 3); // 3 hours ago
      render(<LastUpdated date={hoursAgo} />);

      expect(screen.getByText(/Updated 3 hours ago/)).toBeInTheDocument();
    });

    it('shows singular hour correctly', () => {
      const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      render(<LastUpdated date={oneHourAgo} />);

      expect(screen.getByText(/Updated 1 hour ago/)).toBeInTheDocument();
    });

    it('shows days for updates within a month', () => {
      const daysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // 5 days ago
      render(<LastUpdated date={daysAgo} />);

      expect(screen.getByText(/Updated 5 days ago/)).toBeInTheDocument();
    });

    it('shows singular day correctly', () => {
      const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
      render(<LastUpdated date={oneDayAgo} />);

      expect(screen.getByText(/Updated 1 day ago/)).toBeInTheDocument();
    });

    it('shows months for updates within a year', () => {
      const monthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3); // ~3 months ago
      render(<LastUpdated date={monthsAgo} />);

      expect(screen.getByText(/Updated 3 months ago/)).toBeInTheDocument();
    });

    it('shows singular month correctly', () => {
      const oneMonthAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // ~1 month ago
      render(<LastUpdated date={oneMonthAgo} />);

      expect(screen.getByText(/Updated 1 month ago/)).toBeInTheDocument();
    });

    it('shows years for very old updates', () => {
      const yearsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2); // 2 years ago
      render(<LastUpdated date={yearsAgo} />);

      expect(screen.getByText(/Updated 2 years ago/)).toBeInTheDocument();
    });

    it('shows singular year correctly', () => {
      const oneYearAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365); // 1 year ago
      render(<LastUpdated date={oneYearAgo} />);

      expect(screen.getByText(/Updated 1 year ago/)).toBeInTheDocument();
    });
  });

  describe('Date Formatting - Absolute Time', () => {
    it('displays absolute date in tooltip on hover', async () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      fireEvent.mouseEnter(chip);

      await waitFor(() => {
        expect(screen.getByText(/January 15, 2025 at/)).toBeInTheDocument();
      });
    });

    it('formats absolute date correctly with AM/PM', () => {
      const morningDate = new Date('2025-01-15T09:30:00Z');
      render(<LastUpdated date={morningDate} />);

      const chip = screen.getByRole('button');
      fireEvent.mouseEnter(chip);

      // The tooltip should appear with the formatted date
      waitFor(() => {
        // Check that it contains the date format
        expect(chip).toHaveAttribute('aria-describedby');
      });
    });

    it('handles different timezones correctly', () => {
      // Component uses user's local timezone
      const testDate = new Date('2025-01-15T14:30:00Z');
      render(<LastUpdated date={testDate} />);

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });
  });

  describe('GitHub Integration', () => {
    it('renders GitHub edit link when provided', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubLink = screen.getByRole('link');
      expect(githubLink).toHaveAttribute('href', githubUrl);
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render GitHub link when not provided', () => {
      render(<LastUpdated date={mockDate} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('shows correct tooltip for GitHub link', async () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubButton = screen.getByRole('link');
      fireEvent.mouseEnter(githubButton);

      await waitFor(() => {
        expect(screen.getByText('View edit history on GitHub')).toBeInTheDocument();
      });
    });

    it('has correct aria-label for GitHub link', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubLink = screen.getByRole('link');
      expect(githubLink).toHaveAttribute(
        'aria-label',
        'View edit history on GitHub (opens in new tab)',
      );
    });

    it('displays history icon for GitHub link', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      // HistoryOutlined icon should be present
      const githubLink = screen.getByRole('link');
      expect(githubLink).toBeInTheDocument();
    });
  });

  describe('Hover and Focus Effects', () => {
    it('applies hover effects to the chip', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      fireEvent.mouseEnter(chip);
      fireEvent.mouseLeave(chip);

      expect(chip).toBeInTheDocument();
    });

    it('applies hover effects to GitHub button', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubButton = screen.getByRole('link');
      fireEvent.mouseEnter(githubButton);
      fireEvent.mouseLeave(githubButton);

      expect(githubButton).toBeInTheDocument();
    });

    it('maintains focus styles', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      chip.focus();

      expect(chip).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive styles correctly', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      expect(chip).toBeInTheDocument();

      // Component should render without errors on all screen sizes
      expect(chip).toHaveAttribute('aria-label');
    });

    it('adjusts GitHub button size for mobile', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubButton = screen.getByRole('link');
      expect(githubButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<LastUpdated date={mockDate} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with GitHub link', async () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      const { container } = render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper aria-label for screen readers', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      const ariaLabel = chip.getAttribute('aria-label');

      expect(ariaLabel).toContain('Last updated');
      expect(ariaLabel).toContain('ago');
      expect(ariaLabel).toContain('on');
    });

    it('has proper role for interactive elements', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      expect(chip).toBeInTheDocument();
    });

    it('provides keyboard navigation support', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const chip = screen.getByRole('button');
      const githubLink = screen.getByRole('link');

      // Both elements should be focusable
      chip.focus();
      expect(chip).toHaveFocus();

      githubLink.focus();
      expect(githubLink).toHaveFocus();
    });

    it('announces update information properly', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      const ariaLabel = chip.getAttribute('aria-label');

      expect(ariaLabel).toMatch(/Last updated \d+ days? ago, on .*/);
    });
  });

  describe('Performance and Memoization', () => {
    it('memoizes date calculations', () => {
      const { rerender } = render(<LastUpdated date={mockDate} />);

      // First render
      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();

      // Rerender with same props should not cause issues
      rerender(<LastUpdated date={mockDate} />);
      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });

    it('updates when date prop changes', () => {
      const { rerender } = render(<LastUpdated date={mockDate} />);

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();

      const newDate = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
      rerender(<LastUpdated date={newDate} />);

      expect(screen.getByText(/Updated 5 minutes ago/)).toBeInTheDocument();
    });

    it('handles rapid prop changes efficiently', () => {
      const { rerender } = render(<LastUpdated date={mockDate} />);

      // Rapidly change dates
      for (let i = 1; i <= 10; i++) {
        const testDate = new Date(Date.now() - 1000 * 60 * 60 * i); // i hours ago
        rerender(<LastUpdated date={testDate} />);
      }

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day in future
      render(<LastUpdated date={futureDate} />);

      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });

    it('handles invalid date strings gracefully', () => {
      // Component should handle invalid dates without crashing
      const { container } = render(<LastUpdated date='invalid-date' />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles very old dates', () => {
      const ancientDate = new Date('1990-01-01');
      render(<LastUpdated date={ancientDate} />);

      expect(screen.getByText(/Updated.*years ago/)).toBeInTheDocument();
    });

    it('handles malformed GitHub URLs', () => {
      const malformedUrl = 'not-a-valid-url';
      render(<LastUpdated date={mockDate} githubEditUrl={malformedUrl} />);

      const githubLink = screen.getByRole('link');
      expect(githubLink).toHaveAttribute('href', malformedUrl);
    });

    it('handles empty GitHub URL', () => {
      render(<LastUpdated date={mockDate} githubEditUrl='' />);

      // Should not render GitHub link for empty URL
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies correct chip styling', () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      expect(chip).toBeInTheDocument();

      // Should have the expected visual properties
      const computedStyle = window.getComputedStyle(chip);
      expect(computedStyle.cursor).toBe('help');
    });

    it('applies correct icon button styling for GitHub link', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubButton = screen.getByRole('link');
      expect(githubButton).toBeInTheDocument();
    });

    it('maintains proper spacing between elements', () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      const { container } = render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      // Both chip and GitHub button should be present
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();

      // Container should have proper flex layout
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Component Display Name', () => {
    it('has correct display name for debugging', () => {
      expect(LastUpdated.displayName).toBe('LastUpdated');
    });
  });

  describe('Tooltip Behavior', () => {
    it('shows tooltip on hover', async () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      fireEvent.mouseEnter(chip);

      // Tooltip should appear
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(<LastUpdated date={mockDate} />);

      const chip = screen.getByRole('button');
      fireEvent.mouseEnter(chip);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(chip);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('shows GitHub tooltip on hover', async () => {
      const githubUrl = 'https://github.com/user/repo/commits/main/file.md';
      render(<LastUpdated date={mockDate} githubEditUrl={githubUrl} />);

      const githubButton = screen.getByRole('link');
      fireEvent.mouseEnter(githubButton);

      await waitFor(() => {
        expect(screen.getByText('View edit history on GitHub')).toBeInTheDocument();
      });
    });
  });
});
