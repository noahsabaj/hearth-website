import { UpdateOutlined, HistoryOutlined } from '@mui/icons-material';
import { Box, Chip, Tooltip, IconButton } from '@mui/material';
import React, { memo, useMemo } from 'react';

interface LastUpdatedProps {
  date: Date | string;
  githubEditUrl?: string;
  className?: string;
}

// Format relative time like "2 days ago", "3 hours ago", etc.
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Format absolute date like "January 15, 2025 at 2:30 PM"
const formatAbsoluteDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return date.toLocaleDateString('en-US', options).replace(',', ' at');
};

const LastUpdated: React.FC<LastUpdatedProps> = memo(({ date, githubEditUrl, className }) => {
  const dateObj = useMemo(() => (typeof date === 'string' ? new Date(date) : date), [date]);
  const relativeTime = useMemo(() => formatRelativeTime(dateObj), [dateObj]);
  const absoluteDate = useMemo(() => formatAbsoluteDate(dateObj), [dateObj]);
  
  const ariaLabel = `Last updated ${relativeTime}, on ${absoluteDate}`;

  return (
    <Box 
      sx={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 0.5,
        ...(className && { className })
      }}
    >
      <Tooltip title={absoluteDate} arrow placement="top">
        <Chip
          icon={<UpdateOutlined aria-hidden='true' />}
          label={`Updated ${relativeTime}`}
          size='small'
          aria-label={ariaLabel}
          sx={{
            backgroundColor: 'rgba(100, 100, 100, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.7rem',
            height: 22,
            transition: 'all 0.2s ease',
            cursor: 'help',
            '& .MuiChip-icon': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
            },
            '&:hover': {
              backgroundColor: 'rgba(100, 100, 100, 0.15)',
              color: 'rgba(255, 255, 255, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiChip-icon': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            },
            '&:focus': {
              outline: '2px solid rgba(255, 255, 255, 0.5)',
              outlineOffset: '2px',
            },
            // Mobile-friendly styles
            '@media (max-width: 600px)': {
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-icon': {
                fontSize: '0.75rem',
              },
            },
          }}
        />
      </Tooltip>
      
      {githubEditUrl && (
        <Tooltip title="View edit history on GitHub" arrow placement="top">
          <IconButton
            href={githubEditUrl}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View edit history on GitHub (opens in new tab)'
            size='small'
            sx={{
              padding: 0.5,
              color: 'rgba(255, 255, 255, 0.6)',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#ff4500',
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
                transform: 'scale(1.1)',
              },
              '&:focus': {
                outline: '2px solid rgba(255, 255, 255, 0.5)',
                outlineOffset: '2px',
              },
              // Mobile-friendly styles
              '@media (max-width: 600px)': {
                padding: 0.25,
                '& .MuiSvgIcon-root': {
                  fontSize: '1rem',
                },
              },
            }}
          >
            <HistoryOutlined fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

LastUpdated.displayName = 'LastUpdated';

export default LastUpdated;