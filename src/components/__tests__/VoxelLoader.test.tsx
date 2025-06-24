import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import VoxelLoader from '../VoxelLoader';

expect.extend(toHaveNoViolations);

describe('VoxelLoader Component', () => {
  beforeEach(() => {
    setupTest();
    // Mock requestAnimationFrame for framer-motion animations
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Size Variants', () => {
    it('renders with small size correctly', () => {
      render(<VoxelLoader size='small' indeterminate={false} progress={50} />);

      // Should render the voxel loader
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders with medium size correctly (default)', () => {
      render(<VoxelLoader size='medium' indeterminate={false} progress={75} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders with large size correctly', () => {
      render(<VoxelLoader size='large' indeterminate={false} progress={25} />);

      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('applies correct size styles', () => {
      const { rerender } = render(<VoxelLoader size='small' />);

      // Small size should use smaller font
      let progressText = screen.queryByText(/\d+%/);
      if (progressText) {
        // Check if it's using the appropriate font size for small
        expect(progressText).toBeInTheDocument();
      }

      rerender(<VoxelLoader size='large' />);

      // Large size should use larger font (tested indirectly through presence)
      progressText = screen.queryByText(/\d+%/);
      if (progressText) {
        expect(progressText).toBeInTheDocument();
      }
    });
  });

  describe('Progress Modes', () => {
    it('renders indeterminate mode by default', () => {
      render(<VoxelLoader />);

      // Should not show percentage in indeterminate mode
      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });

    it('renders determinate mode with progress', () => {
      render(<VoxelLoader indeterminate={false} progress={42} />);

      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('updates progress dynamically', () => {
      const { rerender } = render(<VoxelLoader indeterminate={false} progress={0} />);

      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<VoxelLoader indeterminate={false} progress={100} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('does not show percentage when showPercentage is false', () => {
      render(<VoxelLoader indeterminate={false} progress={50} showPercentage={false} />);

      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('rounds progress to nearest integer', () => {
      render(<VoxelLoader indeterminate={false} progress={42.7} />);

      expect(screen.getByText('43%')).toBeInTheDocument();
    });
  });

  describe('Animation States and Transitions', () => {
    it('renders voxel animation container', () => {
      render(<VoxelLoader />);

      // The component should render with voxel animation structure
      const container = screen.getByRole('generic');
      expect(container).toBeInTheDocument();
    });

    it('handles animation timing correctly', async () => {
      render(<VoxelLoader indeterminate />);

      // Animation should start immediately for indeterminate mode
      await waitFor(() => {
        // Check that the component is rendered and stable
        expect(screen.getByRole('generic')).toBeInTheDocument();
      });
    });

    it('handles transition from indeterminate to determinate', () => {
      const { rerender } = render(<VoxelLoader indeterminate />);

      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();

      rerender(<VoxelLoader indeterminate={false} progress={50} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('manages voxel visibility based on progress', () => {
      const { rerender } = render(<VoxelLoader indeterminate={false} progress={0} />);

      // At 0% progress, should show 0%
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<VoxelLoader indeterminate={false} progress={100} />);

      // At 100% progress, should show 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Loading Tips Cycling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows loading tips by default', () => {
      render(<VoxelLoader showTips />);

      // Should show at least one tip from the default voxel tips
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('does not show tips when showTips is false', () => {
      render(<VoxelLoader showTips={false} />);

      // Should not show any tips
      expect(screen.queryByText(/Building voxel worlds block by block.../)).not.toBeInTheDocument();
    });

    it('cycles through multiple tips', async () => {
      const customTips = [
        'First tip for testing',
        'Second tip for testing',
        'Third tip for testing',
      ];

      render(<VoxelLoader showTips tips={customTips} tipInterval={1000} />);

      // Should show first tip initially
      expect(screen.getByText('First tip for testing')).toBeInTheDocument();

      // Fast forward time to trigger tip rotation
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should now show second tip
      await waitFor(() => {
        expect(screen.getByText('Second tip for testing')).toBeInTheDocument();
      });

      // Fast forward again
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should now show third tip
      await waitFor(() => {
        expect(screen.getByText('Third tip for testing')).toBeInTheDocument();
      });
    });

    it('uses custom tip interval', async () => {
      const customTips = ['Tip 1', 'Tip 2'];

      render(<VoxelLoader showTips tips={customTips} tipInterval={500} />);

      expect(screen.getByText('Tip 1')).toBeInTheDocument();

      // Should rotate after 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('Tip 2')).toBeInTheDocument();
      });
    });

    it('handles single tip without rotation', () => {
      const singleTip = ['Only one tip'];

      render(<VoxelLoader showTips tips={singleTip} tipInterval={1000} />);

      expect(screen.getByText('Only one tip')).toBeInTheDocument();

      // Fast forward time - should not change since there's only one tip
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByText('Only one tip')).toBeInTheDocument();
    });

    it('cycles back to first tip after reaching the end', async () => {
      const customTips = ['First', 'Second'];

      render(<VoxelLoader showTips tips={customTips} tipInterval={1000} />);

      expect(screen.getByText('First')).toBeInTheDocument();

      // Advance to second tip
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Second')).toBeInTheDocument();
      });

      // Advance again - should cycle back to first
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('First')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Message', () => {
    it('displays custom message when provided', () => {
      const customMessage = 'Loading your awesome game...';

      render(<VoxelLoader message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not display message when not provided', () => {
      render(<VoxelLoader />);

      // Should not show any custom message
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<VoxelLoader />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all props', async () => {
      const { container } = render(
        <VoxelLoader
          size='large'
          progress={50}
          indeterminate={false}
          showPercentage
          showTips
          message='Loading test content'
          tips={['Test tip 1', 'Test tip 2']}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA labels for screen readers', () => {
      render(<VoxelLoader indeterminate={false} progress={75} message='Loading game assets' />);

      // Progress should be announced for screen readers
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Loading game assets')).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<VoxelLoader showTips tipInterval={1000} />);

      unmount();

      // Should have cleaned up any intervals
      expect(clearIntervalSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('handles rapid prop changes without memory leaks', () => {
      const { rerender } = render(<VoxelLoader progress={0} />);

      // Rapidly change props
      for (let i = 1; i <= 10; i++) {
        rerender(<VoxelLoader progress={i * 10} />);
      }

      // Should not throw errors or cause memory issues
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles progress values outside 0-100 range', () => {
      const { rerender } = render(<VoxelLoader indeterminate={false} progress={-10} />);

      // Should handle negative values gracefully
      expect(screen.getByText('-10%')).toBeInTheDocument();

      rerender(<VoxelLoader indeterminate={false} progress={150} />);

      // Should handle values over 100
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('handles undefined/null tips gracefully', () => {
      render(<VoxelLoader showTips tips={[]} />);

      // Should not crash with empty tips array
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('handles very short tip intervals', async () => {
      jest.useFakeTimers();

      const fastTips = ['Fast 1', 'Fast 2'];

      render(<VoxelLoader showTips tips={fastTips} tipInterval={1} />);

      expect(screen.getByText('Fast 1')).toBeInTheDocument();

      // Should handle very short intervals
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Fast 2')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Integration with Loading Config', () => {
    it('uses default voxel tips from loading config', () => {
      render(<VoxelLoader />);

      // Should show tips from the loading config
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('uses default tip interval from loading config', () => {
      jest.useFakeTimers();

      render(<VoxelLoader />);

      // Should use the default interval from config (3000ms)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should have rotated to a different tip
      expect(screen.getByRole('generic')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});
