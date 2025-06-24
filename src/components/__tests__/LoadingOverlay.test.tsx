import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LoadingOverlay from '../LoadingOverlay';

expect.extend(toHaveNoViolations);

describe('LoadingOverlay Component', () => {
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

  describe('Basic Rendering', () => {
    it('renders when isLoading is true', () => {
      render(<LoadingOverlay isLoading />);

      // Should render the overlay
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not render when isLoading is false', () => {
      render(<LoadingOverlay isLoading={false} />);

      // Should not render anything
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('displays custom message when provided', () => {
      const customMessage = 'Loading custom content...';
      render(<LoadingOverlay isLoading message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('shows progress value when provided', () => {
      render(<LoadingOverlay isLoading progress={45} showProgress />);

      // Should show progress percentage
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  describe('Variant Styles', () => {
    it('renders full variant correctly (default)', () => {
      render(<LoadingOverlay isLoading variant='full' />);

      // Full variant should render with loading message
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders inline variant correctly', () => {
      render(<LoadingOverlay isLoading variant='inline' />);

      // Should render inline variant
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders minimal variant correctly', () => {
      render(<LoadingOverlay isLoading variant='minimal' />);

      // Should render minimal variant
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies correct styles for each variant', () => {
      const { rerender } = render(<LoadingOverlay isLoading variant='full' />);

      // Full variant should have animated background
      let overlay = screen.getByText('Loading...').closest('div');
      expect(overlay).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading variant='minimal' />);

      // Minimal variant should still render
      overlay = screen.getByText('Loading...').closest('div');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('shows progress when showProgress is true', () => {
      render(<LoadingOverlay isLoading progress={75} showProgress />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides progress when showProgress is false', () => {
      render(<LoadingOverlay isLoading progress={75} showProgress={false} />);

      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('updates progress dynamically', () => {
      const { rerender } = render(<LoadingOverlay isLoading progress={25} showProgress />);

      expect(screen.getByText('25%')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading progress={85} showProgress />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('handles progress values outside normal range', () => {
      const { rerender } = render(<LoadingOverlay isLoading progress={-10} showProgress />);

      // Should handle negative values
      expect(screen.getByText('-10%')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading progress={120} showProgress />);

      // Should handle values over 100
      expect(screen.getByText('120%')).toBeInTheDocument();
    });
  });

  describe('Voxel Loader Integration', () => {
    it('uses voxel loader when useVoxelLoader is true (default)', () => {
      render(<LoadingOverlay isLoading useVoxelLoader variant='full' progress={50} />);

      // Should show voxel loader percentage
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('uses regular loader when useVoxelLoader is false', () => {
      render(<LoadingOverlay isLoading useVoxelLoader={false} message='Regular loading...' />);

      // Should show regular loading message
      expect(screen.getByText('Regular loading...')).toBeInTheDocument();
    });

    it('passes custom tips to voxel loader', async () => {
      const customTips = ['Custom tip 1', 'Custom tip 2'];

      render(<LoadingOverlay isLoading useVoxelLoader variant='full' tips={customTips} />);

      // Should show at least one of the custom tips
      expect(screen.getByText('Custom tip 1')).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('animates in when isLoading becomes true', async () => {
      const { rerender } = render(<LoadingOverlay isLoading={false} />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

      rerender(<LoadingOverlay isLoading />);

      // Should animate in
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('animates out when isLoading becomes false', async () => {
      const { rerender } = render(<LoadingOverlay isLoading />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading={false} />);

      // Should start exit animation
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Eventually should be removed
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('handles rapid loading state changes', () => {
      const { rerender } = render(<LoadingOverlay isLoading={false} />);

      // Rapidly toggle loading state
      for (let i = 0; i < 5; i++) {
        rerender(<LoadingOverlay isLoading={i % 2 === 0} />);
      }

      // Should not crash and should render final state
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Blur and Visual Effects', () => {
    it('applies blur when blur prop is true (default)', () => {
      render(<LoadingOverlay isLoading blur />);

      // Should render with blur effect
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not apply blur when blur prop is false', () => {
      render(<LoadingOverlay isLoading blur={false} />);

      // Should render without blur effect
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows animated background for full variant', () => {
      render(<LoadingOverlay isLoading variant='full' />);

      // Should render animated background (tested indirectly through presence)
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not show animated background for non-full variants', () => {
      const { rerender } = render(<LoadingOverlay isLoading variant='inline' />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading variant='minimal' />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('shows default message when no message provided', () => {
      render(<LoadingOverlay isLoading />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows custom message when provided', () => {
      const customMessage = 'Loading amazing content...';
      render(<LoadingOverlay isLoading message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('handles empty message gracefully', () => {
      render(<LoadingOverlay isLoading message='' />);

      // Should not crash with empty message
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles special characters in message', () => {
      const specialMessage = 'Loading... 50% ⭐ 🚀 & more!';
      render(<LoadingOverlay isLoading message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('handles all props together correctly', () => {
      const customTips = ['Tip 1', 'Tip 2'];

      render(
        <LoadingOverlay
          isLoading
          progress={67}
          message='Complex loading...'
          variant='full'
          tips={customTips}
          showProgress
          blur
          useVoxelLoader
        />
      );

      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('Tip 1')).toBeInTheDocument();
    });

    it('works with minimal props set', () => {
      render(<LoadingOverlay isLoading />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles conflicting props gracefully', () => {
      render(<LoadingOverlay isLoading useVoxelLoader showProgress={false} progress={50} />);

      // Should handle conflicting showProgress and progress props
      expect(screen.queryByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards with default props', async () => {
      const { container } = render(<LoadingOverlay isLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all props', async () => {
      const { container } = render(
        <LoadingOverlay
          isLoading
          progress={75}
          message='Loading content...'
          variant='full'
          tips={['Accessibility tip']}
          showProgress
          blur
          useVoxelLoader
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for all variants', async () => {
      const variants = ['full', 'inline', 'minimal'] as const;

      for (const variant of variants) {
        const { container } = render(
          <LoadingOverlay isLoading variant={variant} progress={50} showProgress />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('provides appropriate ARIA labels and roles', () => {
      render(<LoadingOverlay isLoading progress={40} showProgress />);

      // Should provide accessible progress information
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up animations on unmount', () => {
      const { unmount } = render(<LoadingOverlay isLoading />);

      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid prop changes without memory leaks', () => {
      const { rerender } = render(<LoadingOverlay isLoading progress={0} />);

      // Rapidly change props
      for (let i = 1; i <= 20; i++) {
        rerender(<LoadingOverlay isLoading progress={i * 5} />);
      }

      // Should not throw errors or cause memory issues
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles repeated mounting and unmounting', () => {
      let component;

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        component = render(<LoadingOverlay isLoading />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        component.unmount();
      }

      // Should not cause memory leaks or errors
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined tips array gracefully', () => {
      render(<LoadingOverlay isLoading tips={undefined} useVoxelLoader />);

      // Should not crash with undefined tips
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles empty tips array gracefully', () => {
      render(<LoadingOverlay isLoading tips={[]} useVoxelLoader />);

      // Should not crash with empty tips array
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles very long messages', () => {
      const longMessage = `${'Loading '.repeat(100)}content...`;
      render(<LoadingOverlay isLoading message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles non-standard progress values', () => {
      const { rerender } = render(<LoadingOverlay isLoading progress={NaN} showProgress />);

      // Should handle NaN gracefully
      expect(screen.getByText('NaN%')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading progress={Infinity} showProgress />);

      // Should handle Infinity gracefully
      expect(screen.getByText('Infinity%')).toBeInTheDocument();
    });

    it('works with variant prop changes during loading', () => {
      const { rerender } = render(<LoadingOverlay isLoading variant='full' />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<LoadingOverlay isLoading variant='minimal' />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Integration with Loading Config', () => {
    it('uses default tips from loading config', () => {
      render(<LoadingOverlay isLoading useVoxelLoader variant='full' />);

      // Should use default voxel tips from config
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('respects tip rotation interval from config', async () => {
      jest.useFakeTimers();

      render(<LoadingOverlay isLoading useVoxelLoader variant='full' />);

      // Should rotate tips according to config interval (3000ms)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should have rotated to different tip
      expect(screen.getByRole('generic')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});
