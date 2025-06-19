import { useState, useEffect, useRef, useCallback } from 'react';

interface UseProgressSimulationOptions {
  duration?: number; // Total duration in ms
  steps?: number[]; // Progress steps to hit (e.g., [20, 50, 80, 100])
  onComplete?: () => void;
  startAutomatically?: boolean;
  realistic?: boolean; // Add random variations for realism
}

export const useProgressSimulation = ({
  duration = 2000,
  steps = [20, 50, 80, 100],
  onComplete,
  startAutomatically = true,
  realistic = true,
}: UseProgressSimulationOptions = {}) => {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | undefined>(undefined);
  const completedRef = useRef(false);

  const easeOutCubic = (t: number): number => {
    return 1 - (1 - t) ** 3;
  };

  const addRealisticVariation = (value: number): number => {
    if (!realistic) return value;
    // Add small random variations for realism
    const variation = (Math.random() - 0.5) * 5;
    return Math.max(0, Math.min(100, value + variation));
  };

  const updateProgress = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const stepDuration = duration / steps.length;
    const currentStep = Math.floor(elapsed / stepDuration);

    if (currentStep >= steps.length) {
      setProgress(100);
      setIsRunning(false);
      if (!completedRef.current && onComplete) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }

    const stepProgress = (elapsed % stepDuration) / stepDuration;
    const easedProgress = easeOutCubic(stepProgress);

    const fromValue = currentStep === 0 ? 0 : steps[currentStep - 1] ?? 0;
    const toValue = steps[currentStep] ?? 100;
    const interpolatedValue = fromValue + (toValue - fromValue) * easedProgress;

    setProgress(addRealisticVariation(interpolatedValue));
    setCurrentStepIndex(currentStep);

    rafRef.current = requestAnimationFrame(updateProgress);
  }, [duration, steps, onComplete, realistic]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setCurrentStepIndex(0);
    completedRef.current = false;
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [isRunning, updateProgress]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setProgress(0);
    setCurrentStepIndex(0);
    completedRef.current = false;
  }, [stop]);

  const complete = useCallback(() => {
    stop();
    setProgress(100);
    if (!completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  }, [stop, onComplete]);

  useEffect(() => {
    if (startAutomatically) {
      start();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [startAutomatically]); // eslint-disable-line

  return {
    progress: Math.round(progress),
    isRunning,
    currentStepIndex,
    start,
    stop,
    reset,
    complete,
  };
};
