import { AccessTime } from '@mui/icons-material';
import { Chip } from '@mui/material';
import React, { memo, useMemo } from 'react';

interface ReadingTimeProps {
  text: string;
  className?: string;
}

// Calculate reading time based on average reading speed
// Technical documentation with code is read slower than regular text
const calculateReadingTime = (text: string): number => {
  // Use 150 WPM for technical content (slower than regular 200-250 WPM)
  const wordsPerMinute = 150;
  const words = text.trim().split(/\s+/).length;

  // For very short content (less than 75 words), return 0 to show "< 1 min"
  // This is about 30 seconds of reading time
  if (words < 75) {
    return 0;
  }

  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime;
};

const ReadingTime: React.FC<ReadingTimeProps> = memo(({ text, className }) => {
  const readingTime = useMemo(() => calculateReadingTime(text), [text]);

  const label = readingTime === 0 ? '< 1 min read' : `${readingTime} min read`;
  const ariaLabel =
    readingTime === 0
      ? 'Estimated reading time: less than 1 minute'
      : `Estimated reading time: ${readingTime} minute${readingTime > 1 ? 's' : ''}`;

  return (
    <Chip
      icon={<AccessTime aria-hidden='true' />}
      label={label}
      size='small'
      {...(className && { className })}
      aria-label={ariaLabel}
      role='img'
      sx={{
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        color: '#ff4500',
        border: '1px solid rgba(255, 69, 0, 0.2)',
        fontSize: '0.75rem',
        height: 24,
        transition: 'all 0.2s ease',
        '& .MuiChip-icon': {
          color: '#ff4500',
          fontSize: '0.875rem',
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 69, 0, 0.15)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(255, 69, 0, 0.2)',
        },
        '&:focus': {
          outline: '2px solid #ff4500',
          outlineOffset: '2px',
        },
      }}
    />
  );
});

ReadingTime.displayName = 'ReadingTime';

export default ReadingTime;
