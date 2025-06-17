import { GitHub, Edit } from '@mui/icons-material';
import { IconButton, Tooltip, Box, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

interface EditOnGitHubProps {
  filePath: string;
  variant?: 'edit' | 'improve';
  size?: 'small' | 'medium';
  sx?: object;
}

const EditOnGitHub: React.FC<EditOnGitHubProps> = ({ 
  filePath, 
  variant = 'edit',
  size = 'medium',
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const baseUrl = 'https://github.com/noahsabaj/hearth-website';
  const editUrl = `${baseUrl}/edit/main/${filePath}`;
  
  const tooltipText = variant === 'edit' 
    ? 'Edit this page on GitHub' 
    : 'Improve this section on GitHub';
  
  const ariaLabel = variant === 'edit'
    ? 'Edit this page on GitHub (opens in new tab)'
    : 'Improve this section on GitHub (opens in new tab)';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        // Hide on very small screens if in a crowded area
        ...(size === 'small' && isMobile ? { display: { xs: 'none', sm: 'inline-flex' } } : {}),
        ...sx
      }}
    >
      <Tooltip title={tooltipText} placement={isMobile ? "bottom" : "left"}>
        <IconButton
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          size={size}
          sx={{
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#ff4500',
              backgroundColor: 'rgba(255, 69, 0, 0.08)',
              transform: 'translateY(-2px)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: {
                xs: size === 'small' ? '1rem' : '1.2rem',
                sm: size === 'small' ? '1.2rem' : '1.5rem',
              },
            },
            // Smaller padding on mobile
            padding: {
              xs: size === 'small' ? 0.5 : 1,
              sm: size === 'small' ? 1 : 1.5,
            },
          }}
        >
          {isMobile && variant === 'edit' ? <Edit /> : <GitHub />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EditOnGitHub;