import { Download, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { Button, Box, Typography, LinearProgress, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';

import { COLORS } from '../constants';

interface DownloadButtonProps {
  url: string;
  filename: string;
  size: number;
  icon?: React.ReactNode;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  url,
  filename,
  size,
  icon,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'complete' | 'error'>(
    'idle'
  );
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const simulateDownload = useCallback(async () => {
    setDownloadState('downloading');
    setProgress(0);
    setDownloaded(0);

    if (onDownloadStart) {
      onDownloadStart();
    }

    try {
      // Simulate download progress
      const totalSteps = 20;
      const stepSize = size / totalSteps;

      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
        const currentProgress = (i / totalSteps) * 100;
        const currentDownloaded = i * stepSize;

        setProgress(currentProgress);
        setDownloaded(currentDownloaded);

        // Add some realistic variation
        if (i < totalSteps && Math.random() > 0.8) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setDownloadState('complete');
      if (onDownloadComplete) {
        onDownloadComplete();
      }

      // Reset after showing complete state
      setTimeout(() => {
        setDownloadState('idle');
        setProgress(0);
        setDownloaded(0);
      }, 3000);

      // Actually trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } catch (error) {
      setDownloadState('error');
      if (onDownloadError) {
        onDownloadError(error as Error);
      }

      setTimeout(() => {
        setDownloadState('idle');
        setProgress(0);
        setDownloaded(0);
      }, 3000);
    }
  }, [url, filename, size, onDownloadStart, onDownloadComplete, onDownloadError]);

  const getButtonContent = () => {
    switch (downloadState) {
      case 'downloading':
        return (
          <>
            {icon}
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
                Downloading... {Math.round(progress)}%
              </Typography>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  height: 3,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff4500',
                  },
                }}
              />
              <Typography variant='caption' sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                {formatBytes(downloaded)} / {formatBytes(size)}
              </Typography>
            </Box>
          </>
        );
      case 'complete':
        return (
          <>
            <CheckCircle sx={{ color: COLORS.status.success }} />
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <Typography variant='body2'>Download Complete!</Typography>
              <Typography variant='caption' color='text.secondary'>
                {formatBytes(size)}
              </Typography>
            </Box>
          </>
        );
      case 'error':
        return (
          <>
            <ErrorIcon sx={{ color: '#f44336' }} />
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <Typography variant='body2'>Download Failed</Typography>
              <Typography variant='caption' color='text.secondary'>
                Click to retry
              </Typography>
            </Box>
          </>
        );
      default:
        return (
          <>
            {icon}
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <Typography variant='body2'>{filename}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {formatBytes(size)}
              </Typography>
            </Box>
            <Download />
          </>
        );
    }
  };

  return (
    <Tooltip
      title={downloadState === 'downloading' ? `Downloading ${Math.round(progress)}%` : ''}
      placement='top'
    >
      <Button
        fullWidth
        variant='outlined'
        onClick={simulateDownload}
        disabled={downloadState === 'downloading'}
        sx={{
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          ...(downloadState === 'complete' && {
            borderColor: COLORS.status.success,
            '&:hover': {
              borderColor: COLORS.status.success,
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
            },
          }),
          ...(downloadState === 'error' && {
            borderColor: '#f44336',
            '&:hover': {
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
            },
          }),
        }}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={downloadState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {getButtonContent()}
          </motion.div>
        </AnimatePresence>

        {/* Progress overlay */}
        {downloadState === 'downloading' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progress}%`,
              backgroundColor: 'rgba(255, 69, 0, 0.1)',
              transition: 'width 0.3s ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </Button>
    </Tooltip>
  );
};

export default DownloadButton;
