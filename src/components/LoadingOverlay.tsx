import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import LoadingProgress from './LoadingProgress';
import VoxelLoader from './VoxelLoader';
import { loadingConfig } from '../config/loadingConfig';
import { COLORS, Z_INDEX } from '../constants';

interface LoadingOverlayProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  variant?: 'full' | 'inline' | 'minimal';
  tips?: string[];
  showProgress?: boolean;
  blur?: boolean;
  useVoxelLoader?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  progress = 0,
  message = 'Loading...',
  variant = 'full',
  tips = loadingConfig.tips.voxel,
  showProgress = true,
  blur = true,
  useVoxelLoader = true,
}) => {
  const overlayStyles = {
    full: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: Z_INDEX.loadingOverlay,
      backgroundColor: COLORS.background.overlay,
      backdropFilter: blur ? 'blur(10px)' : 'none',
    },
    inline: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: COLORS.background.overlayLight,
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

              {/* Progress */}
              {showProgress && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    width: '100%',
                    maxWidth: variant === 'minimal' ? 200 : 600,
                  }}
                >
                  {useVoxelLoader && variant === 'full' ? (
                    <VoxelLoader
                      progress={progress}
                      indeterminate={progress === 0}
                      size='large'
                      showPercentage
                      showTips
                      tips={tips}
                      tipInterval={loadingConfig.timing.tipRotationInterval}
                      message={message}
                    />
                  ) : (
                    <>
                      {/* Message for non-voxel loader */}
                      {!useVoxelLoader && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Typography
                            variant={variant === 'minimal' ? 'body2' : 'h6'}
                            sx={{
                              mb: 3,
                              color: COLORS.text.primary,
                              textAlign: 'center',
                              fontWeight: variant === 'minimal' ? 400 : 300,
                            }}
                          >
                            {message}
                          </Typography>
                        </motion.div>
                      )}
                      <LoadingProgress
                        variant={useVoxelLoader ? 'voxel' : 'linear'}
                        progress={progress}
                        indeterminate={progress === 0}
                        showPercentage={variant !== 'minimal'}
                        showTimeRemaining={variant === 'full'}
                        tips={variant === 'full' ? tips : []}
                        tipInterval={loadingConfig.timing.tipRotationInterval}
                        size={variant === 'minimal' ? 'small' : 'medium'}
                        color='primary'
                        {...(useVoxelLoader && message ? { message } : {})}
                      />
                    </>
                  )}
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
