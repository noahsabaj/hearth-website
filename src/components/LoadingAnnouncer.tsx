import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface LoadingAnnouncerProps {
  message: string;
  progress?: number;
  isComplete?: boolean;
  announceProgress?: boolean;
  announceInterval?: number;
}

const LoadingAnnouncer: React.FC<LoadingAnnouncerProps> = ({
  message,
  progress = 0,
  isComplete = false,
  announceProgress = true,
  announceInterval = 10,
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);
  const lastAnnouncedProgress = useRef(0);
  const hasAnnouncedComplete = useRef(false);

  useEffect(() => {
    if (!announcerRef.current) return;

    // Announce completion
    if (isComplete && !hasAnnouncedComplete.current) {
      announcerRef.current.textContent = 'Loading complete. Content is now available.';
      hasAnnouncedComplete.current = true;
      return;
    }

    // Announce progress at intervals
    if (announceProgress && progress > 0) {
      const roundedProgress = Math.round(progress);
      const shouldAnnounce = 
        roundedProgress - lastAnnouncedProgress.current >= announceInterval ||
        roundedProgress === 100;

      if (shouldAnnounce) {
        lastAnnouncedProgress.current = roundedProgress;
        const progressMessage = roundedProgress === 100 
          ? 'Loading complete'
          : `Loading ${roundedProgress} percent complete`;
        
        announcerRef.current.textContent = `${message}. ${progressMessage}.`;
      }
    } else {
      // Initial message
      announcerRef.current.textContent = message;
    }
  }, [message, progress, isComplete, announceProgress, announceInterval]);

  return (
    <>
      {/* Live region for screen readers */}
      <Box
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      
      {/* Additional assertive announcer for important updates */}
      <Box
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {isComplete && 'Content loaded successfully'}
      </Box>
    </>
  );
};

export default LoadingAnnouncer;