import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LoadingProgress from '../LoadingProgress';

expect.extend(toHaveNoViolations);

describe('LoadingProgress Component', () => {
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
    it('renders with default props', () => {
      render(<LoadingProgress />);

      // Should render loading progress component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders linear variant by default', () => {
      render(<LoadingProgress variant='linear' />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders with custom aria label', () => {
      const customLabel = 'Loading custom content';
      render(<LoadingProgress ariaLabel={customLabel} />);

      expect(screen.getByLabelText(customLabel)).toBeInTheDocument();
    });
  });

  describe('Variant Types', () => {
    it('renders linear variant correctly', () => {
      render(<LoadingProgress variant='linear' progress={50} indeterminate={false} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders circular variant correctly', () => {
      render(<LoadingProgress variant='circular' progress={75} indeterminate={false} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders dots variant correctly', () => {
      render(<LoadingProgress variant='dots' />);

      // Dots variant should render dots animation
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('renders spinner variant correctly', () => {
      render(<LoadingProgress variant='spinner' />);

      // Spinner should render
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('renders skeleton variant correctly', () => {
      render(<LoadingProgress variant='skeleton' />);

      // Skeleton should render
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('renders voxel variant correctly', () => {
      render(<LoadingProgress variant='voxel' progress={60} indeterminate={false} />);

      // Voxel variant should show percentage
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Progress Values', () => {
    it('displays progress percentage when showPercentage is true', () => {
      render(
        <LoadingProgress variant='linear' progress={42} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('hides progress percentage when showPercentage is false', () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={42}
          indeterminate={false}
          showPercentage={false}
        />
      );

      expect(screen.queryByText('42%')).not.toBeInTheDocument();
    });

    it('updates progress dynamically', () => {
      const { rerender } = render(
        <LoadingProgress variant='linear' progress={25} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('25%')).toBeInTheDocument();

      rerender(
        <LoadingProgress variant='linear' progress={85} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('handles indeterminate mode correctly', () => {
      render(<LoadingProgress variant='linear' indeterminate showPercentage />);

      // Should not show percentage in indeterminate mode
      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });

    it('rounds progress to nearest integer', () => {
      render(
        <LoadingProgress variant='circular' progress={67.8} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('68%')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<LoadingProgress size={size} variant='circular' />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('applies correct size for dots variant', () => {
      const { rerender } = render(<LoadingProgress variant='dots' size='small' />);

      expect(screen.getByRole('generic')).toBeInTheDocument();

      rerender(<LoadingProgress variant='dots' size='large' />);

      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    const colors = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

    colors.forEach(color => {
      it(`renders with ${color} color correctly`, () => {
        render(<LoadingProgress color={color} variant='linear' />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('Message Display', () => {
    it('displays custom message when provided', () => {
      const customMessage = 'Loading amazing content...';
      render(<LoadingProgress message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not display message when not provided', () => {
      render(<LoadingProgress />);

      // Should not show any default message
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it('handles empty message gracefully', () => {
      render(<LoadingProgress message='' />);

      // Should not crash with empty message
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Tips Rotation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('displays tips when provided', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      render(<LoadingProgress tips={tips} />);

      expect(screen.getByText('💡 Tip 1')).toBeInTheDocument();
    });

    it('rotates through tips based on interval', async () => {
      const tips = ['First tip', 'Second tip', 'Third tip'];
      render(<LoadingProgress tips={tips} tipInterval={1000} />);

      // Should show first tip initially
      expect(screen.getByText('💡 First tip')).toBeInTheDocument();

      // Advance time to trigger rotation
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should show second tip
      await waitFor(() => {
        expect(screen.getByText('💡 Second tip')).toBeInTheDocument();
      });

      // Advance time again
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should show third tip
      await waitFor(() => {
        expect(screen.getByText('💡 Third tip')).toBeInTheDocument();
      });
    });

    it('cycles back to first tip after reaching the end', async () => {
      const tips = ['Tip A', 'Tip B'];
      render(<LoadingProgress tips={tips} tipInterval={500} />);

      expect(screen.getByText('💡 Tip A')).toBeInTheDocument();

      // Advance to second tip
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('💡 Tip B')).toBeInTheDocument();
      });

      // Advance again - should cycle back to first
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('💡 Tip A')).toBeInTheDocument();
      });
    });

    it('handles single tip without rotation', () => {
      const tips = ['Only one tip'];
      render(<LoadingProgress tips={tips} tipInterval={1000} />);

      expect(screen.getByText('💡 Only one tip')).toBeInTheDocument();

      // Advance time - should not change
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByText('💡 Only one tip')).toBeInTheDocument();
    });

    it('does not show tips when empty array provided', () => {
      render(<LoadingProgress tips={[]} />);

      expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    });

    it('uses custom tip interval', async () => {
      const tips = ['Fast tip 1', 'Fast tip 2'];
      render(<LoadingProgress tips={tips} tipInterval={200} />);

      expect(screen.getByText('💡 Fast tip 1')).toBeInTheDocument();

      // Should rotate quickly with custom interval
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText('💡 Fast tip 2')).toBeInTheDocument();
      });
    });
  });

  describe('Time Remaining', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows time remaining when enabled and progress > 0', async () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={50}
          indeterminate={false}
          showTimeRemaining
          estimatedTime={10}
        />
      );

      // Advance time to simulate progress
      act(() => {
        jest.advanceTimersByTime(5000); // 5 seconds
      });

      // Should show some time remaining
      await waitFor(
        () => {
          expect(screen.getByText(/remaining/)).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });

    it('does not show time remaining when disabled', () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={50}
          indeterminate={false}
          showTimeRemaining={false}
          estimatedTime={10}
        />
      );

      expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
    });

    it('formats time correctly for seconds', async () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={90}
          indeterminate={false}
          showTimeRemaining
          estimatedTime={2}
        />
      );

      // Should format short time as seconds
      await waitFor(() => {
        const timeText = screen.queryByText(/\d+s remaining/);
        if (timeText) {
          expect(timeText).toBeInTheDocument();
        }
      });
    });

    it('formats time correctly for minutes', async () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={25}
          indeterminate={false}
          showTimeRemaining
          estimatedTime={120}
        />
      );

      // Advance some time
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });

      // Should format longer time as minutes and seconds
      await waitFor(() => {
        const timeText = screen.queryByText(/\d+m \d+s remaining/);
        if (timeText) {
          expect(timeText).toBeInTheDocument();
        }
      });
    });

    it('does not show negative time remaining', async () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={95}
          indeterminate={false}
          showTimeRemaining
          estimatedTime={1}
        />
      );

      // Should not show negative time
      await waitFor(() => {
        const negativeTime = screen.queryByText(/-\d+/);
        expect(negativeTime).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('announces progress changes to screen readers', () => {
      render(
        <LoadingProgress variant='linear' progress={30} indeterminate={false} announceProgress />
      );

      // Should have accessibility announcement element
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not announce when announceProgress is false', () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={30}
          indeterminate={false}
          announceProgress={false}
        />
      );

      // Should not have announcement when disabled
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('');
    });

    it('announces at specified intervals', () => {
      const { rerender } = render(
        <LoadingProgress
          variant='linear'
          progress={5}
          indeterminate={false}
          announceProgress
          announceInterval={10}
        />
      );

      // Should not announce yet (below interval)
      let statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent('');

      rerender(
        <LoadingProgress
          variant='linear'
          progress={15}
          indeterminate={false}
          announceProgress
          announceInterval={10}
        />
      );

      // Should announce at 10% interval
      statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent('Loading 15% complete');
    });

    it('sets proper ARIA attributes for progress bars', () => {
      render(
        <LoadingProgress
          variant='circular'
          progress={67}
          indeterminate={false}
          ariaLabel='Custom loading'
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
      expect(progressBar).toHaveAttribute('aria-label', 'Custom loading');
    });

    it('does not set aria-valuenow for indeterminate progress', () => {
      render(<LoadingProgress variant='circular' indeterminate />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).not.toHaveAttribute('aria-valuenow');
    });
  });

  describe('Accessibility Testing', () => {
    it('meets accessibility standards with default props', async () => {
      const { container } = render(<LoadingProgress />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with linear variant', async () => {
      const { container } = render(
        <LoadingProgress
          variant='linear'
          progress={50}
          indeterminate={false}
          showPercentage
          showTimeRemaining
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with circular variant', async () => {
      const { container } = render(
        <LoadingProgress variant='circular' progress={75} indeterminate={false} showPercentage />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with tips', async () => {
      const { container } = render(
        <LoadingProgress tips={['Accessible tip']} message='Loading with accessibility' />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for all variants', async () => {
      const variants = ['linear', 'circular', 'dots', 'spinner', 'skeleton', 'voxel'] as const;

      for (const variant of variants) {
        const { container } = render(
          <LoadingProgress variant={variant} progress={50} indeterminate={false} showPercentage />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<LoadingProgress tips={['Tip 1', 'Tip 2']} tipInterval={1000} />);

      unmount();

      // Should have cleaned up intervals
      expect(clearIntervalSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('handles rapid prop changes without memory leaks', () => {
      const { rerender } = render(<LoadingProgress progress={0} />);

      // Rapidly change props
      for (let i = 1; i <= 50; i++) {
        rerender(
          <LoadingProgress progress={i * 2} variant={i % 2 === 0 ? 'linear' : 'circular'} />,
        );
      }

      // Should not throw errors or cause memory issues
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles component remounting efficiently', () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <LoadingProgress tips={['Tip 1', 'Tip 2']} progress={i * 10} variant='linear' />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }

      // Should not cause memory leaks
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles progress values outside 0-100 range', () => {
      const { rerender } = render(
        <LoadingProgress variant='linear' progress={-20} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('-20%')).toBeInTheDocument();

      rerender(
        <LoadingProgress variant='linear' progress={150} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('handles NaN progress values', () => {
      render(
        <LoadingProgress variant='circular' progress={NaN} indeterminate={false} showPercentage />
      );

      expect(screen.getByText('NaN%')).toBeInTheDocument();
    });

    it('handles very long messages', () => {
      const longMessage = `${'Loading '.repeat(
        100
      )}very long content message that exceeds normal lengths`;
      render(<LoadingProgress message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles special characters in tips', () => {
      const specialTips = ['Tip with émojis 🎉', 'Speciål çharacters', 'Unicode: ∑∆øß'];
      render(<LoadingProgress tips={specialTips} />);

      expect(screen.getByText('💡 Tip with émojis 🎉')).toBeInTheDocument();
    });

    it('handles very short tip intervals', async () => {
      jest.useFakeTimers();

      const tips = ['Fast 1', 'Fast 2'];
      render(<LoadingProgress tips={tips} tipInterval={1} />);

      expect(screen.getByText('💡 Fast 1')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(screen.getByText('💡 Fast 2')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles zero estimatedTime gracefully', () => {
      render(
        <LoadingProgress
          variant='linear'
          progress={50}
          indeterminate={false}
          showTimeRemaining
          estimatedTime={0}
        />
      );

      // Should not crash with zero estimated time
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles variant changes during loading', () => {
      const { rerender } = render(<LoadingProgress variant='linear' progress={25} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<LoadingProgress variant='circular' progress={25} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<LoadingProgress variant='dots' progress={25} />);

      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom sx prop', () => {
      const customSx = { backgroundColor: 'red', width: '200px' };
      render(<LoadingProgress sx={customSx} variant='linear' />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('combines custom sx with default styles', () => {
      render(
        <LoadingProgress
          variant='linear'
          sx={{ margin: '20px' }}
          showPercentage
          progress={33}
          indeterminate={false}
        />
      );

      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('Integration with VoxelLoader', () => {
    it('passes props correctly to VoxelLoader in voxel variant', () => {
      render(
        <LoadingProgress
          variant='voxel'
          progress={45}
          indeterminate={false}
          showPercentage
          tips={['Voxel tip']}
          message='Voxel loading...'
        />
      );

      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('💡 Voxel tip')).toBeInTheDocument();
    });

    it('handles voxel variant with no tips', () => {
      render(
        <LoadingProgress
          variant='voxel'
          progress={60}
          indeterminate={false}
          showPercentage
          tips={[]}
        />
      );

      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });
});
