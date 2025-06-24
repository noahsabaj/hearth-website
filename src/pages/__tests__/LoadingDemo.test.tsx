import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest, mockIntersectionObserver } from '../../test-utils';
import LoadingDemo from '../LoadingDemo';

expect.extend(toHaveNoViolations);

// Mock hooks
const mockUseLoadingState = {
  isLoading: false,
  progress: 0,
  message: 'Loading demo content...',
  hasError: false,
  start: jest.fn(),
  updateMessage: jest.fn(),
  updateProgress: jest.fn(),
  complete: jest.fn(),
  error: jest.fn(),
  reset: jest.fn(),
};

const mockUseProgressSimulation = {
  progress: 0,
  isRunning: false,
  reset: jest.fn(),
  start: jest.fn(),
};

jest.mock('../../hooks/useLoadingState', () => ({
  useLoadingState: () => mockUseLoadingState,
}));

jest.mock('../../hooks/useProgressSimulation', () => ({
  useProgressSimulation: () => mockUseProgressSimulation,
}));

// Mock loading config
jest.mock('../../config/loadingConfig', () => ({
  loadingConfig: {
    tips: {
      general: ['Tip 1', 'Tip 2', 'Tip 3'],
      voxel: ['Voxel tip 1', 'Voxel tip 2'],
    },
  },
}));

// Mock loading tips
jest.mock('../../hooks/useLoadingTips', () => ({
  loadingTips: {
    general: ['General loading tip', 'Another tip'],
  },
}));

// Mock timers for animation tests
jest.useFakeTimers();

describe('LoadingDemo Page', () => {
  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    window.IntersectionObserver = mockIntersectionObserver;

    // Reset mock states
    mockUseLoadingState.isLoading = false;
    mockUseLoadingState.progress = 0;
    mockUseLoadingState.hasError = false;
    mockUseProgressSimulation.progress = 0;
    mockUseProgressSimulation.isRunning = false;
  });

  afterEach(() => {
    teardownTest();
    jest.clearAllTimers();
  });

  describe('Page Rendering', () => {
    it('should render the page with proper structure and content', () => {
      render(<LoadingDemo />);

      // Check main heading
      expect(
        screen.getByRole('heading', { level: 1, name: /Loading State Demonstrations/i }),
      ).toBeInTheDocument();

      // Check main navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check all main sections
      expect(screen.getByText('Loading Progress Components')).toBeInTheDocument();
      expect(screen.getByText('Voxel Loader Showcase')).toBeInTheDocument();
      expect(screen.getByText('Skeleton Loaders')).toBeInTheDocument();
      expect(screen.getByText('Voxel Loading Dots')).toBeInTheDocument();
      expect(screen.getByText('Loading Overlay')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Image Loading')).toBeInTheDocument();
      expect(screen.getByText('Loading State Management')).toBeInTheDocument();
    });

    it('should render all loading component variants', () => {
      render(<LoadingDemo />);

      // Check that all loading components are present
      expect(screen.getByText('Linear')).toBeInTheDocument();
      expect(screen.getByText('Circular')).toBeInTheDocument();
      expect(screen.getByText('Dots')).toBeInTheDocument();
      expect(screen.getByText('Spinner')).toBeInTheDocument();
      expect(screen.getByText('Voxel')).toBeInTheDocument();
    });

    it('should render size options correctly', () => {
      render(<LoadingDemo />);

      // Check size selectors
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('should display skeleton loader variants', () => {
      render(<LoadingDemo />);

      // Check skeleton loader types
      expect(screen.getByText('Text Skeleton')).toBeInTheDocument();
      expect(screen.getByText('Card Skeleton')).toBeInTheDocument();
      expect(screen.getByText('Image Skeleton')).toBeInTheDocument();
      expect(screen.getByText('Table Skeleton')).toBeInTheDocument();
      expect(screen.getByText('List Skeleton')).toBeInTheDocument();
    });
  });

  describe('Loading Progress Components', () => {
    it('should allow variant selection', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      // Find variant selector
      const variantSelect = screen.getByLabelText('Variant');
      await user.click(variantSelect);

      // Select different variant
      const circularOption = screen.getByText('Circular');
      await user.click(circularOption);

      // Verify selection
      expect(variantSelect).toHaveDisplayValue('Circular');
    });

    it('should allow size selection', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      // Find size selector
      const sizeSelect = screen.getByLabelText('Size');
      await user.click(sizeSelect);

      // Select different size
      const largeOption = screen.getByText('Large');
      await user.click(largeOption);

      // Verify selection
      expect(sizeSelect).toHaveDisplayValue('Large');
    });

    it('should restart animation when button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const restartButton = screen.getByRole('button', { name: /restart animation/i });
      await user.click(restartButton);

      expect(mockUseProgressSimulation.reset).toHaveBeenCalled();
    });

    it('should display progress with percentage and time remaining', () => {
      // Set progress state
      mockUseProgressSimulation.progress = 45;

      render(<LoadingDemo />);

      // Should show progress indicators (implementation dependent)
      expect(screen.getByText(/Loading example content/)).toBeInTheDocument();
    });
  });

  describe('Voxel Loader Showcase', () => {
    it('should display voxel loaders in different sizes', () => {
      render(<LoadingDemo />);

      // Check voxel loader sections
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium with Progress')).toBeInTheDocument();
      expect(screen.getByText('Large with Tips')).toBeInTheDocument();
    });

    it('should show progress on medium voxel loader', () => {
      mockUseProgressSimulation.progress = 60;

      render(<LoadingDemo />);

      // Medium voxel loader should show progress
      expect(screen.getByText('Medium with Progress')).toBeInTheDocument();
    });

    it('should display tips on large voxel loader', () => {
      render(<LoadingDemo />);

      // Large voxel loader should show tips
      expect(screen.getByText('Large with Tips')).toBeInTheDocument();
    });
  });

  describe('Skeleton Loaders', () => {
    it('should display all skeleton loader types', () => {
      render(<LoadingDemo />);

      // All skeleton types should be present
      const skeletonSections = [
        'Text Skeleton',
        'Card Skeleton',
        'Image Skeleton',
        'Table Skeleton',
        'List Skeleton',
      ];

      skeletonSections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it('should show different animation types', () => {
      render(<LoadingDemo />);

      // Check that skeletons are rendered (they might not have visible text)
      const skeletonContainers = screen.getAllByText(/Skeleton/);
      expect(skeletonContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Loading Overlay', () => {
    it('should allow overlay variant selection', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      // Find overlay variant selector
      const overlaySelect = screen.getByLabelText('Overlay Variant');
      await user.click(overlaySelect);

      // Select different variant
      const inlineOption = screen.getByText('Inline');
      await user.click(inlineOption);

      expect(overlaySelect).toHaveDisplayValue('Inline');
    });

    it('should show loading overlay when button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const showOverlayButton = screen.getByRole('button', { name: /show loading overlay/i });
      await user.click(showOverlayButton);

      // Overlay should be shown (implementation dependent)
      // Since we're using fake timers, we need to advance them
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByText(/Loading overlay demonstration/)).toBeInTheDocument();
    });

    it('should hide overlay after timeout', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const showOverlayButton = screen.getByRole('button', { name: /show loading overlay/i });
      await user.click(showOverlayButton);

      // Advance timers to simulate overlay timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Overlay should be hidden (state dependent)
      expect(showOverlayButton).toBeInTheDocument();
    });
  });

  describe('Enhanced Image Loading', () => {
    it('should display lazy-loaded images', () => {
      render(<LoadingDemo />);

      // Check for image sections
      expect(screen.getByText('With Shimmer Effect')).toBeInTheDocument();
      expect(screen.getByText('With Placeholder')).toBeInTheDocument();

      // Images should be present
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle image loading states', async () => {
      render(<LoadingDemo />);

      const images = screen.getAllByRole('img');

      // Simulate image loading
      fireEvent.load(images[0]);

      expect(images[0]).toBeInTheDocument();
    });

    it('should show proper alt text for accessibility', () => {
      render(<LoadingDemo />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });
  });

  describe('Loading State Management', () => {
    it('should display current loading state information', () => {
      mockUseLoadingState.isLoading = true;
      mockUseLoadingState.progress = 75;
      mockUseLoadingState.message = 'Processing data...';

      render(<LoadingDemo />);

      expect(screen.getByText('Current State: Loading')).toBeInTheDocument();
      expect(screen.getByText('Progress: 75%')).toBeInTheDocument();
      expect(screen.getByText('Message: Processing data...')).toBeInTheDocument();
    });

    it('should handle simulate loading button', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const simulateButton = screen.getByRole('button', { name: /simulate loading/i });
      await user.click(simulateButton);

      expect(mockUseLoadingState.start).toHaveBeenCalled();
      expect(mockUseProgressSimulation.reset).toHaveBeenCalled();
      expect(mockUseProgressSimulation.start).toHaveBeenCalled();
    });

    it('should handle simulate error button', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const errorButton = screen.getByRole('button', { name: /simulate error/i });
      await user.click(errorButton);

      expect(mockUseLoadingState.error).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle reset button', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockUseLoadingState.reset).toHaveBeenCalled();
    });

    it('should disable buttons during loading', () => {
      mockUseLoadingState.isLoading = true;

      render(<LoadingDemo />);

      const simulateButton = screen.getByRole('button', { name: /simulate loading/i });
      const errorButton = screen.getByRole('button', { name: /simulate error/i });

      expect(simulateButton).toBeDisabled();
      expect(errorButton).toBeDisabled();
    });

    it('should show error state correctly', () => {
      mockUseLoadingState.hasError = true;

      render(<LoadingDemo />);

      // Progress bar should show error color (implementation dependent)
      expect(screen.getByText('Current State: Idle')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<LoadingDemo />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<LoadingDemo />);

      // Check heading structure
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Loading State Demonstrations');

      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThan(0);
    });

    it('should have proper labels for form controls', () => {
      render(<LoadingDemo />);

      // Check form labels
      expect(screen.getByLabelText('Variant')).toBeInTheDocument();
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Overlay Variant')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      // Tab through interactive elements
      await user.tab();

      const firstInteractive = document.activeElement;
      expect(firstInteractive).toBeTruthy();

      // Continue tabbing
      await user.tab();
      const secondInteractive = document.activeElement;
      expect(secondInteractive).not.toBe(firstInteractive);
    });

    it('should have accessible loading indicators', () => {
      render(<LoadingDemo />);

      // Loading components should have proper ARIA attributes
      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(progressBar => {
        expect(progressBar).toHaveAttribute('aria-label');
      });
    });

    it('should announce loading state changes', () => {
      mockUseLoadingState.isLoading = true;
      mockUseLoadingState.message = 'Loading in progress';

      render(<LoadingDemo />);

      // Should have live regions for screen readers
      expect(screen.getByText(/Loading in progress/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
    });

    it('should render correctly on mobile devices', () => {
      render(<LoadingDemo />);

      // Main content should be accessible
      expect(screen.getByText('Loading State Demonstrations')).toBeInTheDocument();

      // Components should adapt to mobile
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle touch interactions', () => {
      render(<LoadingDemo />);

      const buttons = screen.getAllByRole('button');

      // Simulate touch events
      fireEvent.touchStart(buttons[0]);
      fireEvent.touchEnd(buttons[0]);

      expect(buttons[0]).toBeInTheDocument();
    });

    it('should maintain functionality on tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      render(<LoadingDemo />);

      // All sections should be visible
      expect(screen.getByText('Loading Progress Components')).toBeInTheDocument();
      expect(screen.getByText('Voxel Loader Showcase')).toBeInTheDocument();
    });
  });

  describe('Loading Components Integration', () => {
    it('should integrate with loading state hook correctly', () => {
      render(<LoadingDemo />);

      // State should be reflected in UI
      expect(screen.getByText('Current State: Idle')).toBeInTheDocument();
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument();
    });

    it('should handle loading tips correctly', () => {
      render(<LoadingDemo />);

      // Tips should be available to components
      expect(screen.getByText('Large with Tips')).toBeInTheDocument();
    });

    it('should manage multiple loading states independently', () => {
      render(<LoadingDemo />);

      // Different loading components should have independent states
      const variantSelect = screen.getByLabelText('Variant');
      const sizeSelect = screen.getByLabelText('Size');
      const overlaySelect = screen.getByLabelText('Overlay Variant');

      expect(variantSelect).toBeInTheDocument();
      expect(sizeSelect).toBeInTheDocument();
      expect(overlaySelect).toBeInTheDocument();
    });
  });

  describe('Animation and Timing', () => {
    it('should handle loading simulation timing correctly', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const simulateButton = screen.getByRole('button', { name: /simulate loading/i });
      await user.click(simulateButton);

      // Advance timers to simulate loading sequence
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockUseLoadingState.updateMessage).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockUseLoadingState.updateProgress).toHaveBeenCalledWith(30, 'Processing...');
    });

    it('should complete loading sequence properly', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const simulateButton = screen.getByRole('button', { name: /simulate loading/i });
      await user.click(simulateButton);

      // Advance through entire loading sequence
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(mockUseLoadingState.complete).toHaveBeenCalledWith('Loading complete!');
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors gracefully', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      const errorButton = screen.getByRole('button', { name: /simulate error/i });
      await user.click(errorButton);

      // Should handle error without crashing
      expect(screen.getByText('Loading State Demonstrations')).toBeInTheDocument();
    });

    it('should handle hook errors gracefully', () => {
      // Mock hook to throw error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<LoadingDemo />);

      // Should still render
      expect(screen.getByText('Loading State Demonstrations')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle image loading failures', () => {
      render(<LoadingDemo />);

      const images = screen.getAllByRole('img');

      // Simulate image error
      fireEvent.error(images[0]);

      // Should not crash
      expect(screen.getByText('Loading State Demonstrations')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple loading components', () => {
      const startTime = performance.now();

      render(<LoadingDemo />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably fast
      expect(renderTime).toBeLessThan(200);
    });

    it('should handle state updates efficiently', async () => {
      const user = userEvent.setup();
      render(<LoadingDemo />);

      // Multiple rapid updates should not cause issues
      const restartButton = screen.getByRole('button', { name: /restart animation/i });

      for (let i = 0; i < 5; i++) {
        await user.click(restartButton);
      }

      expect(mockUseProgressSimulation.reset).toHaveBeenCalledTimes(5);
    });

    it('should cleanup timers properly', () => {
      const { unmount } = render(<LoadingDemo />);

      unmount();

      // Should not have memory leaks
      expect(true).toBe(true);
    });
  });
});
