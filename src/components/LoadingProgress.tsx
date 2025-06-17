import { Box, LinearProgress, CircularProgress, Typography, Fade, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';

interface LoadingProgressProps {
  /** Loading variant type */
  variant?: 'linear' | 'circular' | 'skeleton' | 'dots' | 'spinner';
  /** Current progress percentage (0-100) */
  progress?: number;
  /** Whether loading is indeterminate */
  indeterminate?: boolean;
  /** Size of the loader */
  size?: 'small' | 'medium' | 'large';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show estimated time remaining */
  showTimeRemaining?: boolean;
  /** Estimated total time in seconds */
  estimatedTime?: number;
  /** Loading message */
  message?: string;
  /** Array of rotating tips */
  tips?: string[];
  /** Tip rotation interval in ms */
  tipInterval?: number;
  /** Color of the loader */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Custom styles */
  sx?: any;
  /** Accessibility label */
  ariaLabel?: string;
  /** Announce progress changes to screen readers */
  announceProgress?: boolean;
  /** Progress announcement interval */
  announceInterval?: number;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  variant = 'linear',
  progress = 0,
  indeterminate = true,
  size = 'medium',
  showPercentage = false,
  showTimeRemaining = false,
  estimatedTime,
  message,
  tips = [],
  tipInterval = 3000,
  color = 'primary',
  sx,
  ariaLabel = 'Loading progress',
  announceProgress = true,
  announceInterval = 10,
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime || 0);
  const lastAnnouncedProgress = useRef(0);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Rotate tips
  useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
      }, tipInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [tips, tipInterval]);

  // Calculate time remaining
  useEffect(() => {
    if (showTimeRemaining && estimatedTime && progress > 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = progress / elapsed;
      const remaining = (100 - progress) / rate;
      setTimeRemaining(Math.max(0, Math.round(remaining)));
    }
  }, [progress, showTimeRemaining, estimatedTime, startTime]);

  // Announce progress to screen readers
  useEffect(() => {
    if (announceProgress && !indeterminate && announcementRef.current) {
      const roundedProgress = Math.round(progress);
      if (roundedProgress - lastAnnouncedProgress.current >= announceInterval) {
        lastAnnouncedProgress.current = roundedProgress;
        announcementRef.current.textContent = `Loading ${roundedProgress}% complete`;
      }
    }
  }, [progress, announceProgress, indeterminate, announceInterval]);

  const sizeMap = {
    small: { circular: 24, linear: 4, dots: 8 },
    medium: { circular: 40, linear: 6, dots: 12 },
    large: { circular: 60, linear: 8, dots: 16 },
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderDots = () => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ...sx }}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          <Box
            sx={{
              width: sizeMap[size].dots,
              height: sizeMap[size].dots,
              borderRadius: '50%',
              backgroundColor: theme => theme.palette[color].main,
            }}
          />
        </motion.div>
      ))}
    </Box>
  );

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Box
        sx={{
          width: sizeMap[size].circular,
          height: sizeMap[size].circular,
          border: '3px solid',
          borderColor: theme => `${theme.palette[color].main}20`,
          borderTopColor: theme => theme.palette[color].main,
          borderRadius: '50%',
          ...sx,
        }}
      />
    </motion.div>
  );

  const renderProgress = () => {
    switch (variant) {
      case 'circular':
        return (
          <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
            <CircularProgress
              variant={indeterminate ? 'indeterminate' : 'determinate'}
              value={progress}
              size={sizeMap[size].circular}
              color={color}
              aria-label={ariaLabel}
              aria-valuenow={indeterminate ? undefined : progress}
            />
            {showPercentage && !indeterminate && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'dots':
        return renderDots();

      case 'spinner':
        return renderSpinner();

      case 'skeleton':
        return (
          <Box sx={{ width: '100%', ...sx }}>
            <Box
              sx={{
                height: sizeMap[size].linear,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                }}
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </Box>
          </Box>
        );

      default: // linear
        return (
          <Box sx={{ width: '100%', ...sx }}>
            <LinearProgress
              variant={indeterminate ? 'indeterminate' : 'determinate'}
              value={progress}
              color={color}
              sx={{
                height: sizeMap[size].linear,
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  transition: 'transform 0.4s ease',
                },
              }}
              aria-label={ariaLabel}
              aria-valuenow={indeterminate ? undefined : progress}
            />
            {(showPercentage || showTimeRemaining) && !indeterminate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {showPercentage && (
                  <Typography variant="caption" color="text.secondary">
                    {`${Math.round(progress)}%`}
                  </Typography>
                )}
                {showTimeRemaining && timeRemaining > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(timeRemaining)} remaining
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Accessibility announcement */}
      <Box
        ref={announcementRef}
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Progress indicator */}
      {renderProgress()}

      {/* Message */}
      {message && (
        <Fade in>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            {message}
          </Typography>
        </Fade>
      )}

      {/* Tips rotation */}
      {tips.length > 0 && (
        <Box sx={{ mt: 2, height: 40, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', width: '100%' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center' }}
                >
                  💡 {tips[currentTip]}
                </Typography>
              </Paper>
            </motion.div>
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default LoadingProgress;