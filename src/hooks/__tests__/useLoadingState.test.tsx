import { renderHook, act } from '@testing-library/react';

import { useLoadingState, LoadingState, UseLoadingStateOptions } from '../useLoadingState';

describe('useLoadingState', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.message).toBe('Loading...');
      expect(result.current.error).toBeNull();
      expect(result.current.startTime).toBeNull();
      expect(result.current.endTime).toBeNull();
      expect(result.current.duration).toBeNull();
      expect(result.current.isComplete).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('should initialize with custom initial message', () => {
      const options: UseLoadingStateOptions = {
        initialMessage: 'Custom loading message',
      };

      const { result } = renderHook(() => useLoadingState(options));

      expect(result.current.message).toBe('Custom loading message');
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => useLoadingState({}));

      expect(result.current.message).toBe('Loading...');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Start functionality', () => {
    it('should start loading with default message', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.progress).toBe(0);
      expect(result.current.message).toBe('Loading...');
      expect(result.current.error).toBeNull();
      expect(result.current.startTime).toBeGreaterThan(0);
      expect(result.current.endTime).toBeNull();
      expect(result.current.duration).toBeNull();
    });

    it('should start loading with custom message', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start('Custom loading message');
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.message).toBe('Custom loading message');
    });

    it('should call onStart callback when provided', () => {
      const onStart = jest.fn();
      const options: UseLoadingStateOptions = { onStart };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('should reset previous state when starting', () => {
      const { result } = renderHook(() => useLoadingState());

      // First, complete a loading cycle
      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toBe(100);

      // Start again
      act(() => {
        result.current.start();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.endTime).toBeNull();
      expect(result.current.duration).toBeNull();
    });
  });

  describe('Progress updates', () => {
    it('should update progress correctly', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.updateProgress(50);
      });

      expect(result.current.progress).toBe(50);
    });

    it('should update progress with message', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.updateProgress(75, 'Almost there...');
      });

      expect(result.current.progress).toBe(75);
      expect(result.current.message).toBe('Almost there...');
    });

    it('should clamp progress to 0-100 range', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      // Test values below 0
      act(() => {
        result.current.updateProgress(-10);
      });

      expect(result.current.progress).toBe(0);

      // Test values above 100
      act(() => {
        result.current.updateProgress(150);
      });

      expect(result.current.progress).toBe(100);
    });

    it('should handle fractional progress values', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.updateProgress(33.33);
      });

      expect(result.current.progress).toBe(33.33);
    });
  });

  describe('Message updates', () => {
    it('should update message without affecting progress', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.updateProgress(50);
      });

      act(() => {
        result.current.updateMessage('Processing data...');
      });

      expect(result.current.message).toBe('Processing data...');
      expect(result.current.progress).toBe(50);
    });

    it('should handle empty message', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.updateMessage('');
      });

      expect(result.current.message).toBe('');
    });
  });

  describe('Complete functionality', () => {
    it('should complete loading immediately without minimum duration', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(result.current.message).toBe('Complete');
      expect(result.current.endTime).toBeGreaterThan(0);
      expect(result.current.duration).toBeGreaterThan(0);
      expect(result.current.isComplete).toBe(true);
    });

    it('should complete with custom message', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete('Done!');
      });

      expect(result.current.message).toBe('Done!');
    });

    it('should call onComplete callback when provided', () => {
      const onComplete = jest.fn();
      const options: UseLoadingStateOptions = { onComplete };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should respect minimum duration', () => {
      const onComplete = jest.fn();
      const options: UseLoadingStateOptions = {
        onComplete,
        minimumDuration: 1000,
      };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      // Complete immediately (should be delayed)
      act(() => {
        result.current.complete();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.message).toBe('Completing...');
      expect(onComplete).not.toHaveBeenCalled();

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.message).toBe('Complete');
      expect(result.current.duration).toBe(1000);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should complete immediately if minimum duration already passed', () => {
      const onComplete = jest.fn();
      const options: UseLoadingStateOptions = {
        onComplete,
        minimumDuration: 100,
      };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      // Wait longer than minimum duration
      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current.complete();
      });

      expect(result.current.isLoading).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should handle errors correctly', () => {
      const { result } = renderHook(() => useLoadingState());
      const testError = new Error('Test error');

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.error(testError);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(testError);
      expect(result.current.message).toBe('Test error');
      expect(result.current.endTime).toBeGreaterThan(0);
      expect(result.current.duration).toBeGreaterThan(0);
      expect(result.current.hasError).toBe(true);
    });

    it('should handle errors with custom message', () => {
      const { result } = renderHook(() => useLoadingState());
      const testError = new Error('Test error');

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.error(testError, 'Custom error message');
      });

      expect(result.current.message).toBe('Custom error message');
      expect(result.current.error).toBe(testError);
    });

    it('should call onError callback when provided', () => {
      const onError = jest.fn();
      const options: UseLoadingStateOptions = { onError };
      const testError = new Error('Test error');

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.error(testError);
      });

      expect(onError).toHaveBeenCalledWith(testError);
    });

    it('should handle errors without message', () => {
      const { result } = renderHook(() => useLoadingState());
      const testError = new Error('');

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.error(testError);
      });

      expect(result.current.message).toBe('An error occurred');
    });

    it('should handle errors with null message', () => {
      const { result } = renderHook(() => useLoadingState());
      const testError = new Error();
      testError.message = null as any;

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.error(testError);
      });

      expect(result.current.message).toBe('An error occurred');
    });
  });

  describe('Reset functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useLoadingState());

      // Start and update loading state
      act(() => {
        result.current.start('Custom message');
      });

      act(() => {
        result.current.updateProgress(75);
      });

      act(() => {
        result.current.complete();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.message).toBe('Loading...');
      expect(result.current.error).toBeNull();
      expect(result.current.startTime).toBeNull();
      expect(result.current.endTime).toBeNull();
      expect(result.current.duration).toBeNull();
      expect(result.current.isComplete).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('should reset with custom initial message', () => {
      const options: UseLoadingStateOptions = {
        initialMessage: 'Custom initial message',
      };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start('Different message');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.message).toBe('Custom initial message');
    });

    it('should clear pending minimum duration timeout', () => {
      const options: UseLoadingStateOptions = {
        minimumDuration: 1000,
      };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete();
      });

      // Should be in "completing" state due to minimum duration
      expect(result.current.isLoading).toBe(true);

      // Reset should clear the timeout
      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);

      // Advance time to ensure timeout was cleared
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('should compute isComplete correctly', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.start();
      });

      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.updateProgress(100);
      });

      // Should still be false because isLoading is true
      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.complete();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should compute hasError correctly', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.hasError).toBe(false);

      act(() => {
        result.current.start();
      });

      expect(result.current.hasError).toBe(false);

      act(() => {
        result.current.error(new Error('Test error'));
      });

      expect(result.current.hasError).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.hasError).toBe(false);
    });
  });

  describe('Duration calculation', () => {
    it('should calculate duration correctly on complete', () => {
      const { result } = renderHook(() => useLoadingState());

      const startTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      act(() => {
        result.current.start();
      });

      const endTime = startTime + 500;
      jest.spyOn(Date, 'now').mockReturnValue(endTime);

      act(() => {
        result.current.complete();
      });

      expect(result.current.duration).toBe(500);
      expect(result.current.startTime).toBe(startTime);
      expect(result.current.endTime).toBe(endTime);

      jest.restoreAllMocks();
    });

    it('should calculate duration correctly on error', () => {
      const { result } = renderHook(() => useLoadingState());

      const startTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      act(() => {
        result.current.start();
      });

      const endTime = startTime + 300;
      jest.spyOn(Date, 'now').mockReturnValue(endTime);

      act(() => {
        result.current.error(new Error('Test error'));
      });

      expect(result.current.duration).toBe(300);
      expect(result.current.startTime).toBe(startTime);
      expect(result.current.endTime).toBe(endTime);

      jest.restoreAllMocks();
    });

    it('should handle missing startTime gracefully', () => {
      const { result } = renderHook(() => useLoadingState());

      // Manually trigger complete without starting
      act(() => {
        result.current.complete();
      });

      expect(result.current.duration).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple start calls', () => {
      const onStart = jest.fn();
      const options: UseLoadingStateOptions = { onStart };

      const { result } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start('First start');
      });

      const firstStartTime = result.current.startTime;

      act(() => {
        result.current.start('Second start');
      });

      const secondStartTime = result.current.startTime;

      expect(result.current.message).toBe('Second start');
      expect(secondStartTime).toBeGreaterThan(firstStartTime!);
      expect(onStart).toHaveBeenCalledTimes(2);
    });

    it('should handle complete without start', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.complete();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(result.current.duration).toBeNull();
    });

    it('should handle error without start', () => {
      const { result } = renderHook(() => useLoadingState());
      const testError = new Error('Test error');

      act(() => {
        result.current.error(testError);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(testError);
      expect(result.current.duration).toBeNull();
    });

    it('should handle updateProgress without start', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.updateProgress(50);
      });

      expect(result.current.progress).toBe(50);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Memory leaks prevention', () => {
    it('should cleanup timeout on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const options: UseLoadingStateOptions = {
        minimumDuration: 1000,
      };

      const { result, unmount } = renderHook(() => useLoadingState(options));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.complete();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});
