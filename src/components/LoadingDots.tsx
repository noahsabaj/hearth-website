import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

import { LOADING, COLORS } from '../constants';

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  speed?: number;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'medium',
  color = COLORS.primary.main,
  speed = 1,
}) => {
  const dotSize = LOADING.sizes.voxel[size];
  const gap = LOADING.voxel.voxelGap;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        gap: `${gap}px`,
        alignItems: 'center',
      }}
      role='status'
      aria-label='Loading'
    >
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          style={{
            width: dotSize,
            height: dotSize,
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            y: [0, -dotSize, 0],
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 1.4 / speed,
            repeat: Infinity,
            delay: (index * 0.2) / speed,
            ease: 'easeInOut',
          }}
        >
          {/* Voxel cube */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `translateZ(${dotSize / 2}px)`,
                opacity: 0.9,
              }}
            />
            {/* Back face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `rotateY(180deg) translateZ(${dotSize / 2}px)`,
                opacity: 0.7,
              }}
            />
            {/* Top face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `rotateX(90deg) translateZ(${dotSize / 2}px)`,
                opacity: 0.8,
              }}
            />
            {/* Bottom face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `rotateX(-90deg) translateZ(${dotSize / 2}px)`,
                opacity: 0.6,
              }}
            />
            {/* Right face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `rotateY(90deg) translateZ(${dotSize / 2}px)`,
                opacity: 0.75,
              }}
            />
            {/* Left face */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: color,
                transform: `rotateY(-90deg) translateZ(${dotSize / 2}px)`,
                opacity: 0.75,
              }}
            />
          </Box>
        </motion.div>
      ))}
      <span className='sr-only'>Loading...</span>
    </Box>
  );
};

export default LoadingDots;
