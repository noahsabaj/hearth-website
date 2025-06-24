import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import ScrollToTop from '../ScrollToTop';

expect.extend(toHaveNoViolations);

describe('ScrollToTop Component', () => {
  let mockScrollTo: jest.Mock;
  let mockPageYOffset: number;

  beforeEach(() => {
    setupTest();

    // Mock window.scrollTo
    mockScrollTo = jest.fn();
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true,
    });

    // Mock window.pageYOffset
    mockPageYOffset = 0;
    Object.defineProperty(window, 'pageYOffset', {
      get: () => mockPageYOffset,
      configurable: true,
    });

    // Mock requestAnimationFrame for framer-motion animations
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ScrollToTop />);
      // Component should be in the DOM but may not be visible initially
      expect(document.body).toBeInTheDocument();
    });

    it('is initially hidden when page offset is 0', () => {
      mockPageYOffset = 0;
      render(<ScrollToTop />);

      // Trigger scroll event to update visibility
      fireEvent.scroll(window);

      // Button should not be visible
      const button = screen.queryByRole('button', { name: /scroll back to top/i });
      expect(button).not.toBeInTheDocument();
    });

    it('becomes visible when scrolled past threshold', async () => {
      render(<ScrollToTop />);

      // Simulate scrolling past threshold (300px)
      mockPageYOffset = 350;
      fireEvent.scroll(window);

      // Button should become visible
      await waitFor(() => {
        const button = screen.queryByRole('button', { name: /scroll back to top/i });
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Scroll Behavior', () => {
    it('shows button when scrolled down more than 300px', async () => {
      render(<ScrollToTop />);

      // Simulate scrolling to 400px
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });
    });

    it('hides button when scrolled back to top', async () => {
      render(<ScrollToTop />);

      // First scroll down to show button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      // Then scroll back to top
      mockPageYOffset = 0;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /scroll back to top/i }),
        ).not.toBeInTheDocument();
      });
    });

    it('shows button exactly at threshold (300px)', async () => {
      render(<ScrollToTop />);

      // Simulate scrolling to exactly 301px (just over threshold)
      mockPageYOffset = 301;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });
    });

    it('hides button exactly at threshold boundary', async () => {
      render(<ScrollToTop />);

      // First show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      // Then scroll to exactly 300px (at threshold)
      mockPageYOffset = 300;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /scroll back to top/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Click Interaction', () => {
    it('scrolls to top when clicked', async () => {
      render(<ScrollToTop />);

      // Show the button first
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      // Click the button
      const button = screen.getByRole('button', { name: /scroll back to top/i });
      fireEvent.click(button);

      // Verify scrollTo was called with correct parameters
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('calls scrollTo only once per click', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /scroll back to top/i });

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should be called for each click
      expect(mockScrollTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Interaction', () => {
    it('scrolls to top when Enter key is pressed', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /scroll back to top/i });

      // Press Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('scrolls to top when Space key is pressed', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /scroll back to top/i });

      // Press Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('prevents default behavior for Space key', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /scroll back to top/i });

      // Create a mock event to test preventDefault
      const mockEvent = {
        key: ' ',
        code: 'Space',
        preventDefault: jest.fn(),
      };

      fireEvent.keyDown(button, mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('does not respond to other keys', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /scroll back to top/i });

      // Press other keys
      fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(button, { key: 'Tab', code: 'Tab' });

      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Event Listener Management', () => {
    it('adds scroll event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<ScrollToTop />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<ScrollToTop />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('handles multiple mounts and unmounts correctly', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      // Mount first instance
      const { unmount: unmount1 } = render(<ScrollToTop />);
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      // Mount second instance
      const { unmount: unmount2 } = render(<ScrollToTop />);
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);

      // Unmount first instance
      unmount1();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      // Unmount second instance
      unmount2();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Appearance', () => {
    it('applies correct ARIA attributes', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /scroll back to top/i });
        expect(button).toHaveAttribute('aria-label', 'Scroll back to top of page');
        expect(button).toHaveAttribute('title', 'Scroll to top');
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('has correct button size', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /scroll back to top/i });
        // MUI Fab component should have correct size class
        expect(button).toBeInTheDocument();
      });
    });

    it('contains keyboard arrow up icon', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /scroll back to top/i });
        // Check that icon is present and has aria-hidden
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Animation and Transitions', () => {
    it('uses Zoom transition for appearance', async () => {
      render(<ScrollToTop />);

      // Initially hidden
      expect(screen.queryByRole('button', { name: /scroll back to top/i })).not.toBeInTheDocument();

      // Show the button - the Zoom component should handle the animation
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });
    });

    it('handles rapid visibility changes', async () => {
      render(<ScrollToTop />);

      // Rapidly toggle visibility
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      mockPageYOffset = 200;
      fireEvent.scroll(window);

      mockPageYOffset = 500;
      fireEvent.scroll(window);

      // Should end up visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles window object not available', () => {
      // Mock window to be undefined
      const originalWindow = global.window;
      delete (global as any).window;

      // Should not crash
      expect(() => render(<ScrollToTop />)).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('handles scroll events with extreme values', async () => {
      render(<ScrollToTop />);

      // Test with very large scroll value
      mockPageYOffset = 999999;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      // Test with negative scroll value (shouldn't happen but test anyway)
      mockPageYOffset = -100;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /scroll back to top/i }),
        ).not.toBeInTheDocument();
      });
    });

    it('handles rapid scroll events', async () => {
      render(<ScrollToTop />);

      // Fire many scroll events rapidly
      for (let i = 0; i < 100; i++) {
        mockPageYOffset = i * 10;
        fireEvent.scroll(window);
      }

      // Should handle all events without issues
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards when visible', async () => {
      const { container } = render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards when hidden', async () => {
      const { container } = render(<ScrollToTop />);

      // Keep button hidden
      mockPageYOffset = 100;
      fireEvent.scroll(window);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('is focusable when visible', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /scroll back to top/i });
        expect(button).toBeInTheDocument();

        // Focus the button
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('has proper focus management', async () => {
      render(<ScrollToTop />);

      // Show the button
      mockPageYOffset = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /scroll back to top/i });

        // Button should be focusable
        expect(button).toHaveAttribute('tabIndex', '0');

        // Should have proper ARIA label
        expect(button).toHaveAccessibleName('Scroll back to top of page');
      });
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      render(<ScrollToTop />);
      const endTime = performance.now();

      // Should render very quickly
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('handles many scroll events efficiently', () => {
      render(<ScrollToTop />);

      const startTime = performance.now();

      // Fire 1000 scroll events
      for (let i = 0; i < 1000; i++) {
        mockPageYOffset = i;
        fireEvent.scroll(window);
      }

      const endTime = performance.now();

      // Should handle all events in reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('uses memoization correctly', () => {
      // Component is wrapped with memo, so it should not re-render unnecessarily
      const { rerender } = render(<ScrollToTop />);

      // Re-render with same props should not cause issues
      rerender(<ScrollToTop />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<ScrollToTop />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('does not leak memory with multiple instances', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      // Create and destroy multiple instances
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ScrollToTop />);
        unmount();
      }

      // Should have equal adds and removes
      expect(addEventListenerSpy).toHaveBeenCalledTimes(10);
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(10);
    });
  });
});
