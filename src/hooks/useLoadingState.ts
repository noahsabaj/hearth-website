import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: Error | null;
  startTime: number | null;
  endTime: number | null;
  duration: number | null;
}

interface UseLoadingStateOptions {
  initialMessage?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  minimumDuration?: number;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    initialMessage = 'Loading...',
    onStart,
    onComplete,
    onError,
    minimumDuration = 0,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: initialMessage,
    error: null,
    startTime: null,
    endTime: null,
    duration: null,
  });

  const minimumDurationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const start = useCallback(
    (message?: string) => {
      setState({
        isLoading: true,
        progress: 0,
        message: message || initialMessage,
        error: null,
        startTime: Date.now(),
        endTime: null,
        duration: null,
      });

      if (onStart) {
        onStart();
      }
    },
    [initialMessage, onStart]
  );

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      ...(message && { message }),
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message,
    }));
  }, []);

  const complete = useCallback(
    (message?: string) => {
      const endTime = Date.now();

      setState(prev => {
        const duration = prev.startTime ? endTime - prev.startTime : null;

        // Handle minimum duration
        if (minimumDuration > 0 && duration && duration < minimumDuration) {
          const remainingTime = minimumDuration - duration;

          minimumDurationTimeoutRef.current = setTimeout(() => {
            setState(current => ({
              ...current,
              isLoading: false,
              progress: 100,
              message: message || 'Complete',
              endTime,
              duration: minimumDuration,
            }));

            if (onComplete) {
              onComplete();
            }
          }, remainingTime);

          return {
            ...prev,
            progress: 100,
            message: message || 'Completing...',
          };
        }

        // Complete immediately
        if (onComplete) {
          onComplete();
        }

        return {
          ...prev,
          isLoading: false,
          progress: 100,
          message: message || 'Complete',
          endTime,
          duration,
        };
      });
    },
    [minimumDuration, onComplete]
  );

  const error = useCallback(
    (error: Error, message?: string) => {
      const endTime = Date.now();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
        message: message || error.message || 'An error occurred',
        endTime,
        duration: prev.startTime ? endTime - prev.startTime : null,
      }));

      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  const reset = useCallback(() => {
    if (minimumDurationTimeoutRef.current) {
      clearTimeout(minimumDurationTimeoutRef.current);
    }

    setState({
      isLoading: false,
      progress: 0,
      message: initialMessage,
      error: null,
      startTime: null,
      endTime: null,
      duration: null,
    });
  }, [initialMessage]);

  return {
    ...state,
    start,
    updateProgress,
    updateMessage,
    complete,
    error,
    reset,
    isComplete: !state.isLoading && state.progress === 100,
    hasError: !!state.error,
  };
};
