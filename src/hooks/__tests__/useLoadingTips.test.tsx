import { renderHook, act } from '@testing-library/react';

import { useLoadingTips, loadingTips } from '../useLoadingTips';

describe('useLoadingTips', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with first tip', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Tip 1');
      expect(result.current.currentTipIndex).toBe(0);
      expect(result.current.totalTips).toBe(3);
    });

    it('should handle empty tips array', () => {
      const { result } = renderHook(() => useLoadingTips({ tips: [] }));

      expect(result.current.currentTip).toBe('');
      expect(result.current.currentTipIndex).toBe(0);
      expect(result.current.totalTips).toBe(0);
    });

    it('should handle single tip', () => {
      const tips = ['Only tip'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Only tip');
      expect(result.current.totalTips).toBe(1);
    });
  });

  describe('Automatic rotation', () => {
    it('should rotate tips automatically with default interval', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentTip).toBe('Tip 2');
      expect(result.current.currentTipIndex).toBe(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentTip).toBe('Tip 3');
      expect(result.current.currentTipIndex).toBe(2);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should wrap around to first tip
      expect(result.current.currentTip).toBe('Tip 1');
      expect(result.current.currentTipIndex).toBe(0);
    });

    it('should rotate tips with custom interval', () => {
      const tips = ['Tip 1', 'Tip 2'];
      const { result } = renderHook(() => useLoadingTips({ tips, interval: 1000 }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.currentTip).toBe('Tip 2');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.currentTip).toBe('Tip 1');
    });

    it('should not rotate with empty tips array', () => {
      const { result } = renderHook(() => useLoadingTips({ tips: [] }));

      expect(result.current.currentTip).toBe('');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentTip).toBe('');
      expect(result.current.currentTipIndex).toBe(0);
    });
  });

  describe('Shuffle functionality', () => {
    it('should shuffle tips when shuffle is enabled', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3', 'Tip 4', 'Tip 5'];

      // Mock Math.random to ensure deterministic shuffling
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5);

      const { result } = renderHook(() => useLoadingTips({ tips, shuffle: true }));

      // The order should be different from original due to shuffling
      expect(result.current.totalTips).toBe(5);
      expect(result.current.currentTipIndex).toBe(0);

      mockRandom.mockRestore();
    });

    it('should not shuffle tips when shuffle is disabled', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips, shuffle: false }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentTip).toBe('Tip 2');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentTip).toBe('Tip 3');
    });

    it('should shuffle on every hook initialization', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];

      // First render
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useLoadingTips({ tips, shuffle: true })
      );
      const firstTip = result1.current.currentTip;
      unmount1();

      // Second render should potentially have different order
      const { result: result2 } = renderHook(() => useLoadingTips({ tips, shuffle: true }));

      // While we can't guarantee a different order due to randomness,
      // we can at least verify the hook works with shuffle enabled
      expect(result2.current.totalTips).toBe(3);
      expect(tips).toContain(result2.current.currentTip);
    });
  });

  describe('Manual navigation', () => {
    it('should navigate to next tip manually', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('Tip 2');
      expect(result.current.currentTipIndex).toBe(1);
    });

    it('should navigate to previous tip manually', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        result.current.previousTip();
      });

      // Should wrap to last tip
      expect(result.current.currentTip).toBe('Tip 3');
      expect(result.current.currentTipIndex).toBe(2);
    });

    it('should wrap around when navigating past last tip', () => {
      const tips = ['Tip 1', 'Tip 2'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      // Go to last tip
      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('Tip 2');

      // Go past last tip
      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('Tip 1');
      expect(result.current.currentTipIndex).toBe(0);
    });

    it('should handle manual navigation with single tip', () => {
      const tips = ['Only tip'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Only tip');

      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('Only tip');
      expect(result.current.currentTipIndex).toBe(0);

      act(() => {
        result.current.previousTip();
      });

      expect(result.current.currentTip).toBe('Only tip');
      expect(result.current.currentTipIndex).toBe(0);
    });

    it('should handle manual navigation with empty tips', () => {
      const { result } = renderHook(() => useLoadingTips({ tips: [] }));

      expect(result.current.currentTip).toBe('');

      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('');

      act(() => {
        result.current.previousTip();
      });

      expect(result.current.currentTip).toBe('');
    });
  });

  describe('Tips changes', () => {
    it('should update when tips array changes', () => {
      const initialTips = ['Tip 1', 'Tip 2'];
      const { result, rerender } = renderHook(({ tips }) => useLoadingTips({ tips }), {
        initialProps: { tips: initialTips },
      });

      expect(result.current.currentTip).toBe('Tip 1');
      expect(result.current.totalTips).toBe(2);

      const newTips = ['New Tip 1', 'New Tip 2', 'New Tip 3'];
      rerender({ tips: newTips });

      expect(result.current.currentTip).toBe('New Tip 1');
      expect(result.current.totalTips).toBe(3);
      expect(result.current.currentTipIndex).toBe(0);
    });

    it('should handle tips changing to empty array', () => {
      const initialTips = ['Tip 1', 'Tip 2'];
      const { result, rerender } = renderHook(({ tips }) => useLoadingTips({ tips }), {
        initialProps: { tips: initialTips },
      });

      expect(result.current.currentTip).toBe('Tip 1');

      rerender({ tips: [] });

      expect(result.current.currentTip).toBe('');
      expect(result.current.totalTips).toBe(0);
    });
  });

  describe('Interval changes', () => {
    it('should update interval when prop changes', () => {
      const tips = ['Tip 1', 'Tip 2'];
      const { result, rerender } = renderHook(
        ({ interval }) => useLoadingTips({ tips, interval }),
        { initialProps: { interval: 1000 } }
      );

      expect(result.current.currentTip).toBe('Tip 1');

      // Change interval
      rerender({ interval: 500 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.currentTip).toBe('Tip 2');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const tips = ['Tip 1', 'Tip 2'];
      const { unmount } = renderHook(() => useLoadingTips({ tips }));

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should cleanup previous interval when tips change', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const initialTips = ['Tip 1', 'Tip 2'];
      const { rerender } = renderHook(({ tips }) => useLoadingTips({ tips }), {
        initialProps: { tips: initialTips },
      });

      const newTips = ['New Tip 1', 'New Tip 2'];
      rerender({ tips: newTips });

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Pre-defined tip collections', () => {
    it('should export general tips', () => {
      expect(loadingTips.general).toBeDefined();
      expect(Array.isArray(loadingTips.general)).toBe(true);
      expect(loadingTips.general.length).toBeGreaterThan(0);
    });

    it('should export documentation tips', () => {
      expect(loadingTips.documentation).toBeDefined();
      expect(Array.isArray(loadingTips.documentation)).toBe(true);
      expect(loadingTips.documentation).toContain(
        'Pro tip: Use Ctrl+K to quickly search the documentation',
      );
    });

    it('should export downloads tips', () => {
      expect(loadingTips.downloads).toBeDefined();
      expect(Array.isArray(loadingTips.downloads)).toBe(true);
      expect(loadingTips.downloads).toContain(
        'Hearth Engine uses Vulkan for high-performance graphics',
      );
    });

    it('should export building tips', () => {
      expect(loadingTips.building).toBeDefined();
      expect(Array.isArray(loadingTips.building)).toBe(true);
      expect(loadingTips.building).toContain('Compiling shaders for optimal performance...');
    });

    it('should export voxel tips', () => {
      expect(loadingTips.voxel).toBeDefined();
      expect(Array.isArray(loadingTips.voxel)).toBe(true);
    });

    it('should export technical tips', () => {
      expect(loadingTips.technical).toBeDefined();
      expect(Array.isArray(loadingTips.technical)).toBe(true);
    });

    it('should export performance tips', () => {
      expect(loadingTips.performance).toBeDefined();
      expect(Array.isArray(loadingTips.performance)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle very short intervals', () => {
      const tips = ['Tip 1', 'Tip 2'];
      const { result } = renderHook(() => useLoadingTips({ tips, interval: 1 }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.currentTip).toBe('Tip 2');
    });

    it('should handle very long intervals', () => {
      const tips = ['Tip 1', 'Tip 2'];
      const { result } = renderHook(() => useLoadingTips({ tips, interval: 60000 }));

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(59999);
      });

      expect(result.current.currentTip).toBe('Tip 1');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.currentTip).toBe('Tip 2');
    });

    it('should handle tips with special characters', () => {
      const tips = [
        'Tip with "quotes"',
        'Tip with <HTML>',
        'Tip with \n newlines',
        'Tip with émojis 🚀',
      ];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe('Tip with "quotes"');

      act(() => {
        result.current.nextTip();
      });

      expect(result.current.currentTip).toBe('Tip with <HTML>');
    });

    it('should handle tips with very long content', () => {
      const longTip = 'A'.repeat(1000);
      const tips = [longTip, 'Short tip'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      expect(result.current.currentTip).toBe(longTip);
      expect(result.current.currentTip.length).toBe(1000);
    });
  });

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      let renderCount = 0;
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];

      const { rerender } = renderHook(() => {
        renderCount++;
        return useLoadingTips({ tips });
      });

      const initialRenderCount = renderCount;

      // Advance time to trigger tip rotation
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should not cause excessive renders
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    it('should handle rapid manual navigation', () => {
      const tips = ['Tip 1', 'Tip 2', 'Tip 3'];
      const { result } = renderHook(() => useLoadingTips({ tips }));

      // Rapid navigation should not cause errors
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.nextTip();
        });
      }

      expect(result.current.currentTipIndex).toBe(1); // 100 % 3 = 1
      expect(result.current.currentTip).toBe('Tip 2');
    });
  });
});
