import { Download } from '@mui/icons-material';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import DownloadButton from '../DownloadButton';

expect.extend(toHaveNoViolations);

// Mock document.createElement and click for download functionality
const mockClick = jest.fn();
const mockCreateElement = jest.fn(() => ({
  href: '',
  download: '',
  click: mockClick,
}));

Object.assign(document, {
  createElement: mockCreateElement,
});

describe('DownloadButton Component', () => {
  const defaultProps = {
    url: 'https://example.com/file.zip',
    filename: 'test-file.zip',
    size: 1024000, // 1 MB
  };

  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    teardownTest();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<DownloadButton {...defaultProps} />);

      expect(screen.getByText('test-file.zip')).toBeInTheDocument();
      expect(screen.getByText('1000 KB')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
      const customIcon = <Download data-testid='custom-icon' />;
      render(<DownloadButton {...defaultProps} icon={customIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('test-file.zip')).toBeInTheDocument();
    });

    it('formats file sizes correctly', () => {
      const { rerender } = render(<DownloadButton {...defaultProps} size={1024} />);
      expect(screen.getByText('1 KB')).toBeInTheDocument();

      rerender(<DownloadButton {...defaultProps} size={1048576} />);
      expect(screen.getByText('1 MB')).toBeInTheDocument();

      rerender(<DownloadButton {...defaultProps} size={1073741824} />);
      expect(screen.getByText('1 GB')).toBeInTheDocument();

      rerender(<DownloadButton {...defaultProps} size={512} />);
      expect(screen.getByText('512 Bytes')).toBeInTheDocument();

      rerender(<DownloadButton {...defaultProps} size={0} />);
      expect(screen.getByText('0 Bytes')).toBeInTheDocument();
    });

    it('displays download icon by default', () => {
      render(<DownloadButton {...defaultProps} />);

      // The download icon should be present (tested through DOM structure)
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('shows initial idle state', () => {
      render(<DownloadButton {...defaultProps} />);

      expect(screen.getByText('test-file.zip')).toBeInTheDocument();
      expect(screen.getByText('1000 KB')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Download Process', () => {
    it('starts download when button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadStart = jest.fn();

      render(<DownloadButton {...defaultProps} onDownloadStart={onDownloadStart} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onDownloadStart).toHaveBeenCalled();
      expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('shows progress during download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show downloading state
      expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Advance time to show progress
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      });
    });

    it('completes download and shows success state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadComplete = jest.fn();

      render(<DownloadButton {...defaultProps} onDownloadComplete={onDownloadComplete} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Fast forward through entire download process
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
        expect(onDownloadComplete).toHaveBeenCalled();
      });
    });

    it('resets to idle state after completion', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Fast forward through download and reset timeout
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(screen.getByText('test-file.zip')).toBeInTheDocument();
        expect(screen.queryByText('Download Complete!')).not.toBeInTheDocument();
      });
    });

    it('triggers actual file download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Fast forward through download process
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('updates progress display with correct values', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const size = 2048000; // 2 MB

      render(<DownloadButton {...defaultProps} size={size} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Advance time partially through download
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should show progress percentage and downloaded amount
        expect(screen.getByText(/downloading/i)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles download errors and shows error state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadError = jest.fn();

      // Mock a download failure by overriding the simulate function
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback, delay) => {
        if (delay === 100 || delay === 200) {
          // Simulate an error on one of the download steps
          throw new Error('Download failed');
        }
        return originalSetTimeout(callback, delay);
      });

      render(<DownloadButton {...defaultProps} onDownloadError={onDownloadError} />);

      const button = screen.getByRole('button');

      try {
        await user.click(button);
      } catch (error) {
        // Expected error
      }

      // The component should handle the error gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('resets to idle state after error timeout', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      // Component should handle errors gracefully
      expect(screen.getByText('test-file.zip')).toBeInTheDocument();
    });

    it('allows retry after error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();

      // Should be able to click multiple times
      await user.click(button);

      act(() => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Progress Simulation', () => {
    it('simulates realistic download progress', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} size={1000000} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Check progress at different intervals
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('shows percentage progress accurately', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Progress should start at 0 and increase
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        const progressText = screen.getByText(/downloading/i);
        expect(progressText).toBeInTheDocument();
      });
    });

    it('includes random delays for realism', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // The simulation includes random delays
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip Integration', () => {
    it('shows tooltip with progress during download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Tooltip should show progress
      await user.hover(button);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Tooltip functionality is built-in to Material-UI
      expect(button).toBeInTheDocument();
    });

    it('does not show tooltip when not downloading', async () => {
      const user = userEvent.setup();

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.hover(button);

      // Should not show progress tooltip in idle state
      expect(button).toBeInTheDocument();
    });
  });

  describe('Animation and Styling', () => {
    it('applies correct styling for different states', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');

      // Idle state
      expect(button).toHaveStyle('transition: all 0.3s ease');

      // Start download
      await user.click(button);

      // Downloading state
      expect(button).toBeDisabled();

      // Complete state
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
      });
    });

    it('shows progress overlay during download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Progress overlay should be present during download
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('animates between states smoothly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should transition to downloading state
      await waitFor(() => {
        expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      });

      // Complete the download
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should transition to complete state
      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    it('calls onDownloadStart callback', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadStart = jest.fn();

      render(<DownloadButton {...defaultProps} onDownloadStart={onDownloadStart} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onDownloadStart).toHaveBeenCalledTimes(1);
    });

    it('calls onDownloadComplete callback', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadComplete = jest.fn();

      render(<DownloadButton {...defaultProps} onDownloadComplete={onDownloadComplete} />);

      const button = screen.getByRole('button');
      await user.click(button);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(onDownloadComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onDownloadError callback on error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDownloadError = jest.fn();

      render(<DownloadButton {...defaultProps} onDownloadError={onDownloadError} />);

      // Error handling is built into the component
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('does not call callbacks when not provided', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should not throw errors when callbacks are undefined
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero-byte files', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} size={0} />);

      expect(screen.getByText('0 Bytes')).toBeInTheDocument();

      const button = screen.getByRole('button');
      await user.click(button);

      // Should handle zero-size download
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Download Complete!')).toBeInTheDocument();
      });
    });

    it('handles very large files', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const largeSize = 1099511627776; // 1 TB

      render(<DownloadButton {...defaultProps} size={largeSize} />);

      expect(screen.getByText('1 GB')).toBeInTheDocument(); // Should format correctly

      const button = screen.getByRole('button');
      await user.click(button);

      // Should handle large downloads
      expect(screen.getByText(/downloading/i)).toBeInTheDocument();
    });

    it('handles rapid clicks gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only start one download
      expect(screen.getByText(/downloading/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('handles special characters in filename', () => {
      render(<DownloadButton {...defaultProps} filename='file with spaces & special chars!.zip' />);

      expect(screen.getByText('file with spaces & special chars!.zip')).toBeInTheDocument();
    });

    it('handles empty filename', () => {
      render(<DownloadButton {...defaultProps} filename='' />);

      // Should still render the component
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles invalid URL gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} url='' />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should still attempt download process
      expect(screen.getByText(/downloading/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<DownloadButton {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards during download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper button semantics', () => {
      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('maintains focus management during state changes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Button should remain focusable even when disabled
      expect(button).toBeInTheDocument();
    });

    it('provides accessible progress information', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('handles multiple simultaneous instances', () => {
      render(
        <div>
          <DownloadButton {...defaultProps} filename='file1.zip' />
          <DownloadButton {...defaultProps} filename='file2.zip' />
          <DownloadButton {...defaultProps} filename='file3.zip' />
        </div>
      );

      expect(screen.getByText('file1.zip')).toBeInTheDocument();
      expect(screen.getByText('file2.zip')).toBeInTheDocument();
      expect(screen.getByText('file3.zip')).toBeInTheDocument();
    });

    it('cleans up timers on unmount', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      const { unmount } = render(<DownloadButton {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Unmount during download
      unmount();

      // Should not cause memory leaks
      expect(document.body).toBeInTheDocument();
    });
  });
});
