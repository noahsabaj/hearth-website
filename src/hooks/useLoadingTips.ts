import { useState, useEffect, useRef } from 'react';

import { loadingConfig } from '../config/loadingConfig';

interface UseLoadingTipsOptions {
  tips: string[];
  interval?: number;
  shuffle?: boolean;
}

export const useLoadingTips = ({
  tips,
  interval = 3000,
  shuffle = false,
}: UseLoadingTipsOptions) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedTips, setDisplayedTips] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (tips.length === 0) return;

    // Shuffle tips if requested
    const tipsList = shuffle ? [...tips].sort(() => Math.random() - 0.5) : tips;

    setDisplayedTips(tipsList);
    setCurrentTipIndex(0);

    // Set up rotation interval
    intervalRef.current = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tipsList.length);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tips, interval, shuffle]);

  const currentTip = displayedTips[currentTipIndex] || '';
  const nextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % displayedTips.length);
  };
  const previousTip = () => {
    setCurrentTipIndex(prev => (prev === 0 ? displayedTips.length - 1 : prev - 1));
  };

  return {
    currentTip,
    currentTipIndex,
    totalTips: displayedTips.length,
    nextTip,
    previousTip,
  };
};

// Pre-defined tip collections
export const loadingTips = {
  general: loadingConfig.tips.general,
  documentation: [
    'Pro tip: Use Ctrl+K to quickly search the documentation',
    'Did you know? Our docs include interactive code examples',
    'Tip: Bookmark frequently used sections for quick access',
    'Fun fact: The documentation is available offline too',
    'Quick tip: Use the sidebar navigation for easy browsing',
  ],
  downloads: [
    'Hearth Engine uses Vulkan for high-performance graphics',
    'Check out our documentation for getting started guides',
    'Join our community Discord for support and updates',
    'All releases include example projects to help you begin',
    'Our engine supports both 2D and 3D voxel games',
  ],
  building: [
    'Compiling shaders for optimal performance...',
    'Optimizing asset pipeline...',
    'Building documentation indices...',
    'Preparing development environment...',
    'Setting up project templates...',
  ],
  voxel: loadingConfig.tips.voxel,
  technical: loadingConfig.tips.technical,
  performance: loadingConfig.tips.performance,
};
