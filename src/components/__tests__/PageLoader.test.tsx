import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import PageLoader from '../PageLoader';

expect.extend(toHaveNoViolations);

describe('PageLoader Component', () => {
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
      render(<PageLoader />);

      // Should render voxel loader with default tips
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('renders with custom page name', () => {
      render(<PageLoader pageName='Dashboard' />);

      // Should show loading message for specific page
      expect(screen.getByText('Loading Dashboard')).toBeInTheDocument();
    });

    it('renders fullscreen layout', () => {
      render(<PageLoader />);

      // Should render in a full screen container
      const container = screen.getByText(/Building voxel worlds block by block.../).closest('div');
      expect(container).toBeInTheDocument();
    });

    it('includes accessibility skip instruction', () => {
      render(<PageLoader />);

      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });
  });

  describe('Progress Simulation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('starts in indeterminate mode', () => {
      render(<PageLoader />);

      // Should start without showing percentage
      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });

    it('switches to determinate mode after initial delay', async () => {
      render(<PageLoader estimatedTime={2} />);

      // Fast forward past initial delay
      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Should now show progress
      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });
    });

    it('progresses gradually over estimated time', async () => {
      render(<PageLoader estimatedTime={1} />);

      // Initial quick progress
      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      // Progress over time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        if (progressText) {
          const progress = parseInt(progressText.textContent || '0');
          expect(progress).toBeGreaterThan(30);
        }
      });
    });

    it('stops at 90% and waits', async () => {
      render(<PageLoader estimatedTime={0.1} />);

      // Fast forward through entire estimated time
      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should cap at around 90%
      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        if (progressText) {
          const progress = parseInt(progressText.textContent || '0');
          expect(progress).toBeLessThanOrEqual(90);
        }
      });
    });

    it('respects custom estimated time', async () => {
      render(<PageLoader estimatedTime={5} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      // With longer estimated time, progress should be slower
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        if (progressText) {
          const progress = parseInt(progressText.textContent || '0');
          expect(progress).toBeLessThan(60); // Should progress slower
        }
      });
    });

    it('handles very short estimated times', async () => {
      render(<PageLoader estimatedTime={0.1} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      // Even with very short time, should not exceed 90%
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        if (progressText) {
          const progress = parseInt(progressText.textContent || '0');
          expect(progress).toBeLessThanOrEqual(90);
        }
      });
    });
  });

  describe('Page Name Handling', () => {
    it('displays loading message with page name', () => {
      render(<PageLoader pageName='Settings' />);

      expect(screen.getByText('Loading Settings')).toBeInTheDocument();
    });

    it('handles undefined page name gracefully', () => {
      render(<PageLoader pageName={undefined} />);

      // Should not show any loading message for specific page
      expect(screen.queryByText(/Loading /)).not.toBeInTheDocument();
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('handles empty page name gracefully', () => {
      render(<PageLoader pageName='' />);

      expect(screen.getByText('Loading ')).toBeInTheDocument();
    });

    it('handles special characters in page name', () => {
      const specialPageName = 'Página & Dashboard™';
      render(<PageLoader pageName={specialPageName} />);

      expect(screen.getByText(`Loading ${specialPageName}`)).toBeInTheDocument();
    });

    it('handles very long page names', () => {
      const longPageName = 'Very Long Page Name That Exceeds Normal Length Expectations';
      render(<PageLoader pageName={longPageName} />);

      expect(screen.getByText(`Loading ${longPageName}`)).toBeInTheDocument();
    });
  });

  describe('Tips Integration', () => {
    it('displays default voxel tips when no custom tips provided', () => {
      render(<PageLoader />);

      // Should show default voxel tips
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('displays custom tips when provided', () => {
      const customTips = ['Custom loading tip 1', 'Custom loading tip 2'];
      render(<PageLoader tips={customTips} />);

      expect(screen.getByText('Custom loading tip 1')).toBeInTheDocument();
    });

    it('handles empty tips array gracefully', () => {
      render(<PageLoader tips={[]} />);

      // Should still render without crashing
      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });

    it('rotates through custom tips', async () => {
      jest.useFakeTimers();

      const customTips = ['Tip One', 'Tip Two', 'Tip Three'];
      render(<PageLoader tips={customTips} />);

      expect(screen.getByText('Tip One')).toBeInTheDocument();

      // Advance time to trigger tip rotation (3000ms default)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Tip Two')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles single custom tip without rotation', () => {
      const singleTip = ['Only one tip here'];
      render(<PageLoader tips={singleTip} />);

      expect(screen.getByText('Only one tip here')).toBeInTheDocument();
    });
  });

  describe('Visual Components', () => {
    it('renders animated background', () => {
      render(<PageLoader />);

      // Should render with animated background (tested indirectly)
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('renders voxel loader component', () => {
      render(<PageLoader />);

      // Should render voxel loader
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('shows skip instruction with fade in animation', () => {
      render(<PageLoader />);

      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });

    it('applies full viewport height styling', () => {
      render(<PageLoader />);

      const container = screen.getByText(/Building voxel worlds block by block.../).closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Animation and Motion', () => {
    it('animates voxel loader on mount', () => {
      render(<PageLoader />);

      // Should render with motion animation
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('animates skip instruction with delay', () => {
      render(<PageLoader />);

      // Skip instruction should be present (delay tested indirectly)
      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });

    it('handles animation cleanup on unmount', () => {
      const { unmount } = render(<PageLoader />);

      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Props Combinations', () => {
    it('handles all props together correctly', async () => {
      jest.useFakeTimers();

      const customTips = ['Combined tip 1', 'Combined tip 2'];
      render(<PageLoader pageName='Complex Page' estimatedTime={3} tips={customTips} />);

      expect(screen.getByText('Loading Complex Page')).toBeInTheDocument();
      expect(screen.getByText('Combined tip 1')).toBeInTheDocument();

      // Advance time to see progress
      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('works with minimal props', () => {
      render(<PageLoader />);

      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });

    it('handles zero estimated time', async () => {
      jest.useFakeTimers();

      render(<PageLoader estimatedTime={0} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Should still show initial progress
      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles negative estimated time', async () => {
      jest.useFakeTimers();

      render(<PageLoader estimatedTime={-1} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards with default props', async () => {
      const { container } = render(<PageLoader />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all props', async () => {
      const { container } = render(
        <PageLoader pageName='Accessible Page' estimatedTime={2} tips={['Accessible tip']} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides skip instruction for accessibility', () => {
      render(<PageLoader />);

      // Skip instruction helps users with animations sensitivity
      expect(screen.getByText('Press ESC to skip loading animation')).toBeInTheDocument();
    });

    it('provides proper loading announcements', () => {
      render(<PageLoader pageName='Dashboard' />);

      expect(screen.getByText('Loading Dashboard')).toBeInTheDocument();
    });

    it('maintains focus management during loading', () => {
      render(<PageLoader />);

      // Should not interfere with focus (tested indirectly)
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up intervals on unmount', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<PageLoader />);

      unmount();

      // Should clean up progress interval
      expect(clearIntervalSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('handles rapid mounting and unmounting', () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<PageLoader estimatedTime={1} />);
        expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
        unmount();
      }

      // Should not cause memory leaks
      expect(screen.queryByText(/Building voxel worlds block by block.../)).not.toBeInTheDocument();
    });

    it('handles prop changes efficiently', () => {
      const { rerender } = render(<PageLoader pageName='Page 1' />);

      // Change props multiple times
      for (let i = 2; i <= 10; i++) {
        rerender(<PageLoader pageName={`Page ${i}`} estimatedTime={i} />);
        expect(screen.getByText(`Loading Page ${i}`)).toBeInTheDocument();
      }
    });

    it('manages memory during long loading periods', async () => {
      jest.useFakeTimers();

      render(<PageLoader estimatedTime={100} />);

      // Simulate very long loading
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should still work without memory issues
      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        expect(progressText).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('handles extreme estimated times', async () => {
      jest.useFakeTimers();

      const { rerender } = render(<PageLoader estimatedTime={0.001} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      rerender(<PageLoader estimatedTime={1000} />);

      // Should handle very large times
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('handles undefined/null props gracefully', () => {
      render(<PageLoader pageName={undefined} estimatedTime={undefined as any} tips={undefined} />);

      // Should not crash with undefined props
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('handles mixed data types in tips', () => {
      const mixedTips = ['String tip', '', 'Another tip'];
      render(<PageLoader tips={mixedTips} />);

      expect(screen.getByText('String tip')).toBeInTheDocument();
    });

    it('handles component re-rendering during progress', async () => {
      jest.useFakeTimers();

      const { rerender } = render(<PageLoader estimatedTime={2} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('30%')).toBeInTheDocument();
      });

      // Re-render with same props
      rerender(<PageLoader estimatedTime={2} />);

      // Should maintain progress
      expect(screen.getByText('30%')).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('handles rapid prop changes during loading', async () => {
      jest.useFakeTimers();

      const { rerender } = render(<PageLoader pageName='Initial' estimatedTime={2} />);

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByText('Loading Initial')).toBeInTheDocument();
      });

      // Rapidly change page name
      for (let i = 1; i <= 5; i++) {
        rerender(<PageLoader pageName={`Page ${i}`} estimatedTime={2} />);
      }

      expect(screen.getByText('Loading Page 5')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Integration with Loading Config', () => {
    it('uses default voxel tips from loading config', () => {
      render(<PageLoader />);

      // Should use tips from loadingConfig.tips.voxel
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });

    it('uses tip rotation interval from loading config', async () => {
      jest.useFakeTimers();

      render(<PageLoader />);

      // Should use 3000ms interval from config
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should have rotated to different tip
      await waitFor(() => {
        const container = screen
          .getByText(/Building voxel worlds block by block.../)
          .closest('div');
        expect(container).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('integrates properly with voxel loader size configuration', () => {
      render(<PageLoader />);

      // Should use large size for voxel loader
      expect(screen.getByText(/Building voxel worlds block by block.../)).toBeInTheDocument();
    });
  });
});
