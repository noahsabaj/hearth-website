import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  speed?: number;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'medium',
  color = '#ff4500',
  speed = 1,
}) => {
  const sizeMap = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const dotSize = sizeMap[size];
  const gap = dotSize * 0.8;

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
            backgroundColor: color,
            borderRadius: '50%',
          }}
          animate={{
            y: [0, -dotSize, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4 / speed,
            repeat: Infinity,
            delay: (index * 0.2) / speed,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </Box>
  );
};

export default LoadingDots;
