import React from 'react';
import { Chip } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

interface ReadingTimeProps {
  text: string;
  className?: string;
}

// Calculate reading time based on average reading speed of 200 words per minute
const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
};

const ReadingTime: React.FC<ReadingTimeProps> = ({ text, className }) => {
  const readingTime = calculateReadingTime(text);

  return (
    <Chip
      icon={<AccessTime />}
      label={`${readingTime} min read`}
      size="small"
      className={className}
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
      }}
    />
  );
};

export default ReadingTime;