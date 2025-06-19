import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import LoadingProgress from './LoadingProgress';
import { loadingConfig } from '../config/loadingConfig';

interface LoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  variant?: 'full' | 'inline' | 'minimal';
  tips?: string[];
  showProgress?: boolean;
  blur?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  progress = 0,
  message = 'Loading...',
  variant = 'full',
  tips = loadingConfig.tips.general,
  showProgress = true,
  blur = true,
}) => {
  const overlayStyles = {
    full: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: blur ? 'blur(10px)' : 'none',
    },
    inline: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      backdropFilter: blur ? 'blur(5px)' : 'none',
    },
    minimal: {
      position: 'relative' as const,
      padding: 4,
      backgroundColor: 'transparent',
    },
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={overlayStyles[variant]}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: 4,
              }}
            >
              {/* Animated background effect */}
              {variant === 'full' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    opacity: 0.05,
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: '200%',
                      height: '200%',
                      background: `radial-gradient(circle at center, ${loadingConfig.visuals.colors.primary} 0%, transparent 70%)`,
                      top: '-50%',
                      left: '-50%',
                    }}
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  />
                </Box>
              )}

              {/* Logo or icon */}
              {variant === 'full' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Box
                    component='img'
                    src='/hearth-website/logo.png'
                    alt='Loading'
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 3,
                      filter: 'drop-shadow(0 0 20px rgba(255, 69, 0, 0.5))',
                    }}
                  />
                </motion.div>
              )}

              {/* Message */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography
                  variant={variant === 'minimal' ? 'body2' : 'h6'}
                  sx={{
                    mb: 3,
                    color: 'text.primary',
                    textAlign: 'center',
                    fontWeight: variant === 'minimal' ? 400 : 300,
                  }}
                >
                  {message}
                </Typography>
              </motion.div>

              {/* Progress */}
              {showProgress && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    width: '100%',
                    maxWidth: variant === 'minimal' ? 200 : 400,
                  }}
                >
                  <LoadingProgress
                    variant='linear'
                    progress={progress}
                    indeterminate={progress === 0}
                    showPercentage={variant !== 'minimal'}
                    showTimeRemaining={variant === 'full'}
                    tips={variant === 'full' ? tips : []}
                    tipInterval={loadingConfig.timing.tipRotationInterval}
                    size={variant === 'minimal' ? 'small' : 'medium'}
                    color='primary'
                  />
                </motion.div>
              )}
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
