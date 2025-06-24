import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import VoxelLoader from './VoxelLoader';
import { loadingConfig } from '../config/loadingConfig';
import { COLORS } from '../constants';

interface PageLoaderProps {
  /** Page name being loaded */
  pageName?: string;
  /** Estimated loading time in seconds */
  estimatedTime?: number;
  /** Custom loading tips */
  tips?: string[];
}

const PageLoader: React.FC<PageLoaderProps> = ({ pageName, estimatedTime = 2, tips }) => {
  const [progress, setProgress] = useState(0);
  const [isIndeterminate, setIsIndeterminate] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const startTime = Date.now();
    const duration = estimatedTime * 1000;

    // Initial quick progress
    setTimeout(() => {
      setIsIndeterminate(false);
      setProgress(30);
    }, 100);

    // Gradual progress
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(90, (elapsed / duration) * 100);
      setProgress(progressValue);

      if (progressValue >= 90) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [estimatedTime]);

  const defaultTips = tips || loadingConfig.tips.voxel;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: COLORS.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          style={{
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle at center, ${COLORS.primary.main} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </Box>

      {/* Voxel Loader */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VoxelLoader
          progress={progress}
          indeterminate={isIndeterminate}
          size='large'
          showPercentage={!isIndeterminate}
          showTips
          tips={defaultTips}
          tipInterval={loadingConfig.timing.tipRotationInterval}
          {...(pageName ? { message: `Loading ${pageName}` } : {})}
        />
      </motion.div>

      {/* Skip loading (for accessibility) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <Typography
          variant='caption'
          sx={{
            mt: 4,
            color: COLORS.text.secondary,
            opacity: 0.5,
          }}
        >
          Press ESC to skip loading animation
        </Typography>
      </motion.div>
    </Box>
  );
};

export default PageLoader;
