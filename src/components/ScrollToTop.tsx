import { KeyboardArrowUp } from '@mui/icons-material';
import { Fab, Zoom } from '@mui/material';
import React, { useState, useEffect, memo, useCallback } from 'react';

/**
 * ScrollToTop component - A floating action button that appears when scrolling down
 * and allows users to quickly return to the top of the page
 *
 * Features:
 * - Auto-shows/hides based on scroll position (300px threshold)
 * - Smooth scroll animation to top
 * - Keyboard accessibility (Enter/Space key support)
 * - Zoom in/out animation for appearance
 * - Focus management and ARIA labels
 * - Responsive hover and focus states
 *
 * @returns A floating scroll-to-top button component
 */
const ScrollToTop: React.FC = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    /**
     * Toggles button visibility based on scroll position
     * Shows button when user scrolls down more than 300px
     */
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  /**
   * Smoothly scrolls the page back to the top
   */
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
          }
        }}
        size='small'
        aria-label='Scroll back to top of page'
        title='Scroll to top'
        tabIndex={0}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#ff4500',
          color: 'white',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#ff6b35',
            transform: 'scale(1.1)',
            boxShadow: '0 8px 20px rgba(255, 69, 0, 0.4)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:focus': {
            outline: '3px solid #ffffff',
            outlineOffset: '2px',
            backgroundColor: '#ff6b35',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        }}
      >
        <KeyboardArrowUp aria-hidden='true' />
      </Fab>
    </Zoom>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop;
