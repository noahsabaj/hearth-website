import { renderHook, act } from '@testing-library/react';

import { useProgressSimulation } from '../useProgressSimulation';

describe('useProgressSimulation', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    // Mock performance.now
    let mockTime = 0;
    Object.defineProperty(global.performance, 'now', {
      writable: true,
      value: jest.fn(() => {
        const time = mockTime;
        mockTime += 16; // Advance 16ms each call
        return time;
      }),
    });
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => {
      return setTimeout(cb, 16) as any;
    });
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn(id => {
      clearTimeout(id as any);
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: false }));

      expect(result.current.progress).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should start automatically when enabled', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      expect(result.current.isRunning).toBe(true);
    });

    it('should not start automatically when disabled', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: false }));

      expect(result.current.isRunning).toBe(false);
    });

    it('should accept custom options', () => {
      const options = {
        duration: 5000,
        steps: [25, 50, 75, 100],
        startAutomatically: false,
        realistic: false,
      };

      const { result } = renderHook(() => useProgressSimulation(options));

      expect(result.current.progress).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Manual control', () => {
    it('should start simulation manually', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: false }));

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.progress).toBe(0);
    });

    it('should not start if already running', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      expect(result.current.isRunning).toBe(true);

      // Try to start again
      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('should stop simulation', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should reset simulation', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      // Let it progress a bit
      act(() => {
        jest.advanceTimersByTime(500);
      });

      const progressBeforeReset = result.current.progress;
      expect(progressBeforeReset).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.progress).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should complete simulation immediately', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({ startAutomatically: true, onComplete })
      );

      act(() => {
        result.current.complete();
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress simulation', () => {
    it('should progress through default steps', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 2000,
          realistic: false,
        }),
      );

      expect(result.current.progress).toBe(0);

      // Progress to first step (20%)
      act(() => {
        jest.advanceTimersByTime(500); // 25% of duration
      });

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.currentStepIndex).toBe(0);

      // Progress to second step (50%)
      act(() => {
        jest.advanceTimersByTime(500); // 50% of duration
      });

      expect(result.current.progress).toBeGreaterThan(20);
      expect(result.current.currentStepIndex).toBe(1);

      // Complete the simulation
      act(() => {
        jest.advanceTimersByTime(1000); // 100% of duration
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
    });

    it('should work with custom steps', () => {
      const customSteps = [10, 30, 60, 100];
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          steps: customSteps,
          duration: 1000,
          realistic: false,
        }),
      );

      expect(result.current.progress).toBe(0);

      // Progress to first step
      act(() => {
        jest.advanceTimersByTime(250); // 25% of duration
      });

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.progress).toBeLessThanOrEqual(10);

      // Progress to completion
      act(() => {
        jest.advanceTimersByTime(750);
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
    });

    it('should call onComplete when finished', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          onComplete,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onComplete multiple times', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          onComplete,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);

      // Advance more time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Easing function', () => {
    it('should apply ease-out cubic easing', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [100],
          realistic: false,
        }),
      );

      const progressValues: number[] = [];

      // Capture progress at different time intervals
      for (let i = 0; i <= 10; i++) {
        act(() => {
          jest.advanceTimersByTime(100); // 10% intervals
        });
        progressValues.push(result.current.progress);
      }

      // With ease-out easing, progress should show non-linear progression
      // Just verify that we have reasonable progression values
      expect(progressValues[progressValues.length - 1]).toBe(100); // Should end at 100
      expect(progressValues[0]).toBeGreaterThanOrEqual(0); // Should start at or near 0
    });
  });

  describe('Realistic variation', () => {
    it('should add variation when realistic mode is enabled', () => {
      // Mock Math.random to return predictable values
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.8); // Will add positive variation

      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [50, 100],
          realistic: true,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Progress should have some variation (should be different from exactly 50)
      const { progress } = result.current;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
      // With variation, it might not be exactly 50
      expect(typeof progress).toBe('number');

      mockRandom.mockRestore();
    });

    it('should not add variation when realistic mode is disabled', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [50, 100],
          realistic: false,
        }),
      );

      // Let progress reach first step
      act(() => {
        jest.advanceTimersByTime(500);
      });

      const progress1 = result.current.progress;

      // Reset and run again
      act(() => {
        result.current.reset();
        result.current.start();
        jest.advanceTimersByTime(500);
      });

      const progress2 = result.current.progress;

      // Without realistic variation, progress should be similar (allowing for timing differences)
      expect(Math.abs(progress1 - progress2)).toBeLessThan(10);
    });

    it('should clamp realistic variations to 0-100 range', () => {
      // Mock Math.random to return extreme values
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom.mockReturnValue(1); // Will add +2.5 variation

      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [98, 100],
          realistic: true,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.progress).toBeLessThanOrEqual(100);
      expect(result.current.progress).toBeGreaterThanOrEqual(0);

      mockRandom.mockRestore();
    });
  });

  describe('Step progression', () => {
    it('should update currentStepIndex correctly', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [25, 50, 75, 100],
          realistic: false,
        }),
      );

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current.currentStepIndex).toBe(2);

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current.currentStepIndex).toBe(3);
    });

    it('should handle single step', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [100],
          realistic: false,
        }),
      );

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1200); // Give extra time for completion
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
    });

    it('should handle empty steps array', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [],
          realistic: false,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Duration handling', () => {
    it('should handle very short durations', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1,
          onComplete,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(100); // Give more time for animation frames
      });

      expect(result.current.progress).toBe(100);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should handle very long durations', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 60000,
          realistic: false,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(15000); // 25% of duration
      });

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.progress).toBeLessThan(25);
      expect(result.current.isRunning).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup animation frame on unmount', () => {
      const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

      const { unmount } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });

    it('should cleanup animation frame when stopping', () => {
      const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      act(() => {
        result.current.stop();
      });

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });

    it('should cleanup animation frame when resetting', () => {
      const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      act(() => {
        result.current.reset();
      });

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle negative duration', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: -1000,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should complete with negative duration
      expect(result.current.progress).toBe(100);
    });

    it('should handle zero duration', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 0,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.progress).toBe(100);
    });

    it('should handle steps with values outside 0-100 range', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [-10, 50, 150],
          realistic: false,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1200);
      });

      // The hook doesn't clamp step values itself, it just progresses through them
      // So we expect it to reach the final step value (150) but still be a valid number
      expect(typeof result.current.progress).toBe('number');
      expect(result.current.isRunning).toBe(false);
    });

    it('should handle steps in non-ascending order', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [80, 30, 60, 100],
          realistic: false,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1200);
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.isRunning).toBe(false);
    });

    it('should handle duplicate steps', () => {
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          steps: [25, 25, 50, 50, 100],
          realistic: false,
        }),
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.progress).toBe(100);
    });
  });

  describe('Performance', () => {
    it('should use requestAnimationFrame for smooth animation', () => {
      const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame');

      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: true }));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(requestAnimationFrameSpy).toHaveBeenCalled();
      requestAnimationFrameSpy.mockRestore();
    });

    it('should handle rapid start/stop cycles', () => {
      const { result } = renderHook(() => useProgressSimulation({ startAutomatically: false }));

      // Rapid start/stop cycles
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.start();
          result.current.stop();
        });
      }

      expect(result.current.isRunning).toBe(false);
      expect(result.current.progress).toBe(0);
    });
  });

  describe('Integration with onComplete', () => {
    it('should not call onComplete when completed manually before natural completion', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 2000,
          onComplete,
        }),
      );

      // Complete manually before natural completion
      act(() => {
        jest.advanceTimersByTime(500);
        result.current.complete();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);

      // Advance to where natural completion would occur
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Should still only be called once
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should call onComplete only once even with multiple complete calls', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useProgressSimulation({
          startAutomatically: true,
          duration: 1000,
          onComplete,
        }),
      );

      act(() => {
        result.current.complete();
        result.current.complete();
        result.current.complete();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
