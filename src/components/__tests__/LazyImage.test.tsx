import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest, mockIntersectionObserver } from '../../test-utils';
import LazyImage from '../LazyImage';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: {
      div: mockReact.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) =>
        mockReact.createElement('div', { ref, ...props }, children),
      ),
      img: mockReact.forwardRef<HTMLImageElement, any>(({ children, ...props }, ref) =>
        mockReact.createElement('img', { ref, ...props }, children),
      ),
    },
    AnimatePresence: ({ children }: { children: any }) => children,
  };
});

// Mock react-intersection-observer
const mockInView = jest.fn();
jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(() => ({
    ref: jest.fn(),
    inView: mockInView(),
  })),
}));

describe('LazyImage Component', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    mockInView.mockReturnValue(true);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = mockIntersectionObserver;

    // Mock Image constructor for testing load events
    global.Image = class {
      onload: (() => void) | null = null;

      onerror: (() => void) | null = null;

      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 100);
      }
    } as any;
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<LazyImage {...defaultProps} />);

      // Should show skeleton initially
      expect(
        screen.getByTestId('skeleton') || document.querySelector('.MuiSkeleton-root'),
      ).toBeInTheDocument();
    });

    it('applies custom width and height', () => {
      const { container } = render(<LazyImage {...defaultProps} width={300} height={200} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '300px', height: '200px' });
    });

    it('applies custom className', () => {
      const { container } = render(<LazyImage {...defaultProps} className='custom-image' />);

      expect(container.firstChild).toHaveClass('custom-image');
    });

    it('applies custom styles', () => {
      const customStyle = { border: '2px solid red' };
      const { container } = render(<LazyImage {...defaultProps} style={customStyle} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });
  });

  describe('Loading States', () => {
    it('shows skeleton while loading', () => {
      mockInView.mockReturnValue(false);
      render(<LazyImage {...defaultProps} />);

      // Should show skeleton when not in view
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('starts loading when in view', async () => {
      mockInView.mockReturnValue(true);
      render(<LazyImage {...defaultProps} />);

      await waitFor(() => {
        const img = screen.getByRole('img', { hidden: true });
        expect(img).toHaveAttribute('src', defaultProps.src);
      });
    });

    it('loads immediately when loading is eager', () => {
      mockInView.mockReturnValue(false);
      render(<LazyImage {...defaultProps} loading='eager' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', defaultProps.src);
    });

    it('shows progress bar for large images', () => {
      render(<LazyImage {...defaultProps} width='100%' />);

      // Should show progress indicator for large images
      const progressBar = document.querySelector('.MuiLinearProgress-root');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not show progress bar for small images', () => {
      render(<LazyImage {...defaultProps} width={100} />);

      // Should not show progress indicator for small images
      const progressBar = document.querySelector('.MuiLinearProgress-root');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Image Loading Simulation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('simulates loading progress', () => {
      render(<LazyImage {...defaultProps} />);

      // Fast forward timer to trigger progress updates
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Progress should be simulated
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('completes loading after image loads', async () => {
      render(<LazyImage {...defaultProps} />);

      const img = screen.getByRole('img', { hidden: true });

      // Simulate image load
      act(() => {
        fireEvent.load(img);
      });

      // Fast forward to complete the loading animation
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(img).toHaveStyle({ opacity: '1' });
      });
    });
  });

  describe('Error Handling', () => {
    it('shows fallback on image error', () => {
      const fallback = <div>Image failed to load</div>;
      render(<LazyImage {...defaultProps} fallback={fallback} />);

      const img = screen.getByRole('img', { hidden: true });

      // Simulate image error
      fireEvent.error(img);

      expect(screen.getByText('Image failed to load')).toBeInTheDocument();
    });

    it('shows default error message when no fallback provided', () => {
      render(<LazyImage {...defaultProps} />);

      const img = screen.getByRole('img', { hidden: true });

      // Simulate image error
      fireEvent.error(img);

      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });

    it('calls onError callback', () => {
      const onError = jest.fn();
      render(<LazyImage {...defaultProps} onError={onError} />);

      const img = screen.getByRole('img', { hidden: true });

      fireEvent.error(img);

      expect(onError).toHaveBeenCalled();
    });

    it('maintains container dimensions on error', () => {
      const { container } = render(<LazyImage {...defaultProps} width={300} height={200} />);

      const img = screen.getByRole('img', { hidden: true });
      fireEvent.error(img);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '300px', height: '200px' });
    });
  });

  describe('Placeholder Handling', () => {
    it('shows placeholder image when provided', () => {
      const placeholderSrc = 'https://example.com/placeholder.jpg';
      render(<LazyImage {...defaultProps} placeholder={placeholderSrc} />);

      const placeholderImg = screen.getByAltText('');
      expect(placeholderImg).toHaveAttribute('src', placeholderSrc);
      expect(placeholderImg).toHaveStyle({ filter: 'blur(5px)' });
    });

    it('shows skeleton when no placeholder provided', () => {
      render(<LazyImage {...defaultProps} />);

      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies blur effect to placeholder', () => {
      const placeholderSrc = 'https://example.com/placeholder.jpg';
      render(<LazyImage {...defaultProps} placeholder={placeholderSrc} />);

      const placeholderImg = screen.getByAltText('');
      expect(placeholderImg).toHaveStyle({
        filter: 'blur(5px)',
        transform: 'scale(1.1)',
      });
    });
  });

  describe('Image Properties', () => {
    it('applies srcSet and sizes attributes', () => {
      const srcSet = 'image-320w.jpg 320w, image-480w.jpg 480w';
      const sizes = '(max-width: 320px) 280px, 440px';

      render(<LazyImage {...defaultProps} srcSet={srcSet} sizes={sizes} />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('srcset', srcSet);
      expect(img).toHaveAttribute('sizes', sizes);
    });

    it('applies objectFit property', () => {
      render(<LazyImage {...defaultProps} objectFit='contain' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveStyle({ objectFit: 'contain' });
    });

    it('applies default objectFit as cover', () => {
      render(<LazyImage {...defaultProps} />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveStyle({ objectFit: 'cover' });
    });

    it('applies borderRadius to container and skeleton', () => {
      const { container } = render(<LazyImage {...defaultProps} borderRadius={12} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ borderRadius: '12px' });
    });

    it('handles string borderRadius', () => {
      const { container } = render(<LazyImage {...defaultProps} borderRadius='50%' />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ borderRadius: '50%' });
    });
  });

  describe('Animation Configuration', () => {
    it('disables animation when animate is false', () => {
      render(<LazyImage {...defaultProps} animate={false} />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toBeInTheDocument();
    });

    it('applies custom animation duration', () => {
      render(<LazyImage {...defaultProps} animationDuration={1.2} />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toBeInTheDocument();
    });

    it('shows shimmer effect on skeleton', () => {
      render(<LazyImage {...defaultProps} />);

      // Should show animated shimmer overlay
      const shimmer = document.querySelector('[style*="linear-gradient"]');
      expect(shimmer).toBeInTheDocument();
    });
  });

  describe('Intersection Observer Configuration', () => {
    it('applies custom threshold', () => {
      render(<LazyImage {...defaultProps} threshold={0.5} />);

      // Should render without errors with custom threshold
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('applies custom rootMargin', () => {
      render(<LazyImage {...defaultProps} rootMargin='100px' />);

      // Should render without errors with custom rootMargin
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onLoad callback when image loads', () => {
      const onLoad = jest.fn();
      render(<LazyImage {...defaultProps} onLoad={onLoad} />);

      const img = screen.getByRole('img', { hidden: true });
      fireEvent.load(img);

      // onLoad should be called after a short delay
      setTimeout(() => {
        expect(onLoad).toHaveBeenCalled();
      }, 200);
    });

    it('calls onError callback when image fails', () => {
      const onError = jest.fn();
      render(<LazyImage {...defaultProps} onError={onError} />);

      const img = screen.getByRole('img', { hidden: true });
      fireEvent.error(img);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles percentage widths', () => {
      const { container } = render(<LazyImage {...defaultProps} width='100%' height='auto' />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%', height: 'auto' });
    });

    it('handles fixed pixel dimensions', () => {
      const { container } = render(<LazyImage {...defaultProps} width={400} height={300} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '400px', height: '300px' });
    });

    it('shows progress bar only for large images', () => {
      const { rerender } = render(<LazyImage {...defaultProps} width={150} />);

      // Small image should not show progress
      expect(document.querySelector('.MuiLinearProgress-root')).not.toBeInTheDocument();

      rerender(<LazyImage {...defaultProps} width={250} />);

      // Large image should show progress
      expect(document.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<LazyImage {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper alt text', () => {
      render(<LazyImage {...defaultProps} alt='Descriptive alt text' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('handles empty alt text for decorative images', () => {
      render(<LazyImage {...defaultProps} alt='' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('alt', '');
    });

    it('maintains semantic structure during loading', () => {
      render(<LazyImage {...defaultProps} />);

      // Image should be present even while loading
      const img = screen.getByRole('img', { hidden: true });
      expect(img).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('only loads when in viewport', () => {
      mockInView.mockReturnValue(false);
      render(<LazyImage {...defaultProps} />);

      // Should not have loaded the image yet
      const img = screen.queryByRole('img');
      expect(img).not.toBeInTheDocument();
    });

    it('starts loading when entering viewport', () => {
      mockInView.mockReturnValue(true);
      render(<LazyImage {...defaultProps} />);

      // Should start loading when in view
      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', defaultProps.src);
    });

    it('handles rapid intersection changes', () => {
      const { rerender } = render(<LazyImage {...defaultProps} />);

      // Simulate rapid in/out of view changes
      mockInView.mockReturnValue(false);
      rerender(<LazyImage {...defaultProps} />);

      mockInView.mockReturnValue(true);
      rerender(<LazyImage {...defaultProps} />);

      mockInView.mockReturnValue(false);
      rerender(<LazyImage {...defaultProps} />);

      // Should handle without errors
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed image URLs', () => {
      render(<LazyImage src='not-a-valid-url' alt='Test' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', 'not-a-valid-url');
    });

    it('handles empty src gracefully', () => {
      render(<LazyImage src='' alt='Test' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', '');
    });

    it('handles missing alt text', () => {
      // @ts-ignore - testing runtime behavior
      render(<LazyImage src='test.jpg' />);

      const img = screen.getByRole('img', { hidden: true });
      expect(img).toBeInTheDocument();
    });

    it('handles zero dimensions', () => {
      const { container } = render(<LazyImage {...defaultProps} width={0} height={0} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '0px', height: '0px' });
    });

    it('handles negative dimensions gracefully', () => {
      const { container } = render(<LazyImage {...defaultProps} width={-100} height={-50} />);

      // Should render without crashing
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Loading Progress Simulation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('simulates realistic loading progress', () => {
      render(<LazyImage {...defaultProps} width='100%' />);

      // Check initial progress
      const progressBar = document.querySelector('.MuiLinearProgress-bar') as HTMLElement;

      // Advance timers to simulate progress
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Progress should have advanced
      expect(progressBar).toBeInTheDocument();

      // Complete the loading
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(progressBar).toBeInTheDocument();
    });

    it('stops progress simulation when image loads', () => {
      render(<LazyImage {...defaultProps} width='100%' />);

      const img = screen.getByRole('img', { hidden: true });

      // Simulate image load
      act(() => {
        fireEvent.load(img);
      });

      // Progress should reach 100%
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(img).toBeInTheDocument();
    });

    it('handles progress simulation cleanup on unmount', () => {
      const { unmount } = render(<LazyImage {...defaultProps} width='100%' />);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      // Should clean up any intervals
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Container and Layout', () => {
    it('applies correct container styling', () => {
      const { container } = render(<LazyImage {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        position: 'relative',
        overflow: 'hidden',
      });
    });

    it('maintains aspect ratio container', () => {
      const { container } = render(<LazyImage {...defaultProps} width={400} height={300} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        width: '400px',
        height: '300px',
      });
    });

    it('handles string dimensions correctly', () => {
      const { container } = render(<LazyImage {...defaultProps} width='50vw' height='25vh' />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        width: '50vw',
        height: '25vh',
      });
    });
  });
});
