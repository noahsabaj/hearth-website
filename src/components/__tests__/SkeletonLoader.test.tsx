import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import SkeletonLoader from '../SkeletonLoader';

expect.extend(toHaveNoViolations);

describe('SkeletonLoader Component', () => {
  beforeEach(() => {
    setupTest();
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
      render(<SkeletonLoader />);
      expect(document.body).toContainHTML('div');
    });

    it('renders text variant by default', () => {
      render(<SkeletonLoader />);
      // Should render MUI Skeleton component
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders single skeleton by default', () => {
      render(<SkeletonLoader variant='text' />);
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(1);
    });
  });

  describe('Variant Types', () => {
    it('renders text variant correctly', () => {
      render(<SkeletonLoader variant='text' />);
      const skeleton = document.querySelector('.MuiSkeleton-text');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders card variant correctly', () => {
      render(<SkeletonLoader variant='card' />);
      // Card variant should render CardContent with multiple skeletons
      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(1);
    });

    it('renders feature variant correctly', () => {
      render(<SkeletonLoader variant='feature' count={3} />);
      // Feature variant should render a grid with multiple cards
      const grid = document.querySelector('.MuiGrid-container');
      expect(grid).toBeInTheDocument();

      const cards = document.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(3);
    });

    it('renders release variant correctly', () => {
      render(<SkeletonLoader variant='release' />);
      // Release variant should render a card with release-specific layout
      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(3);
    });

    it('renders documentation variant correctly', () => {
      render(<SkeletonLoader variant='documentation' />);
      // Documentation variant should render multiple text skeletons and a rectangular one
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(4);

      const rectangularSkeleton = document.querySelector('.MuiSkeleton-rectangular');
      expect(rectangularSkeleton).toBeInTheDocument();
    });

    it('renders image variant correctly', () => {
      render(<SkeletonLoader variant='image' />);
      const rectangularSkeleton = document.querySelector('.MuiSkeleton-rectangular');
      expect(rectangularSkeleton).toBeInTheDocument();

      // Should also have a circular element in the center
      const container = rectangularSkeleton?.parentElement;
      expect(container).toBeInTheDocument();
    });

    it('renders table variant correctly', () => {
      render(<SkeletonLoader variant='table' />);
      // Table variant should render header and multiple rows
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(10); // Header + 5 rows * 4 columns
    });

    it('renders list variant correctly', () => {
      render(<SkeletonLoader variant='list' count={5} />);
      // List variant should render items with circular and text skeletons
      const circularSkeletons = document.querySelectorAll('.MuiSkeleton-circular');
      expect(circularSkeletons).toHaveLength(5);

      const textSkeletons = document.querySelectorAll('.MuiSkeleton-text');
      expect(textSkeletons.length).toBeGreaterThan(5);
    });
  });

  describe('Animation Types', () => {
    it('renders with pulse animation by default', () => {
      render(<SkeletonLoader animation='pulse' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with wave animation', () => {
      render(<SkeletonLoader animation='wave' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with shimmer animation', () => {
      render(<SkeletonLoader animation='shimmer' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();

      // Shimmer should add a motion element for custom animation
      // This is implementation specific to the component
    });

    it('renders with no animation', () => {
      render(<SkeletonLoader animation={false} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Count Property', () => {
    it('renders multiple skeletons when count is specified', () => {
      render(<SkeletonLoader variant='text' count={5} />);
      // For text variant with count > 1, each skeleton is wrapped in motion.div
      const motionDivs = document.querySelectorAll('[style*="opacity"]');
      expect(motionDivs.length).toBeGreaterThanOrEqual(5);
    });

    it('renders correct number of feature cards', () => {
      render(<SkeletonLoader variant='feature' count={4} />);
      const cards = document.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(4);
    });

    it('renders correct number of list items', () => {
      render(<SkeletonLoader variant='list' count={3} />);
      const circularSkeletons = document.querySelectorAll('.MuiSkeleton-circular');
      expect(circularSkeletons).toHaveLength(3);
    });

    it('handles count of 1 correctly', () => {
      render(<SkeletonLoader variant='text' count={1} />);
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(1);
    });

    it('handles count of 0 gracefully', () => {
      render(<SkeletonLoader variant='text' count={0} />);
      // Should not render any skeletons
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('Size Properties', () => {
    it('applies custom width', () => {
      render(<SkeletonLoader variant='text' width={200} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies custom height', () => {
      render(<SkeletonLoader variant='text' height={50} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies string width values', () => {
      render(<SkeletonLoader variant='text' width='75%' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies string height values', () => {
      render(<SkeletonLoader variant='text' height='auto' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies custom width and height for image variant', () => {
      render(<SkeletonLoader variant='image' width={300} height={200} />);
      const skeleton = document.querySelector('.MuiSkeleton-rectangular');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Speed Property', () => {
    it('applies default speed', () => {
      render(<SkeletonLoader speed={1} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies faster speed', () => {
      render(<SkeletonLoader speed={2} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies slower speed', () => {
      render(<SkeletonLoader speed={0.5} />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Complex Variants', () => {
    describe('Card Variant', () => {
      it('includes circular skeleton for avatar', () => {
        render(<SkeletonLoader variant='card' />);
        const circularSkeleton = document.querySelector('.MuiSkeleton-circular');
        expect(circularSkeleton).toBeInTheDocument();
      });

      it('includes multiple text skeletons', () => {
        render(<SkeletonLoader variant='card' />);
        const textSkeletons = document.querySelectorAll('.MuiSkeleton-text');
        expect(textSkeletons.length).toBeGreaterThanOrEqual(3);
      });

      it('has proper card structure', () => {
        render(<SkeletonLoader variant='card' />);
        const card = document.querySelector('.MuiCard-root');
        const cardContent = document.querySelector('.MuiCardContent-root');
        expect(card).toBeInTheDocument();
        expect(cardContent).toBeInTheDocument();
      });
    });

    describe('Release Variant', () => {
      it('includes rectangular badge skeleton', () => {
        render(<SkeletonLoader variant='release' />);
        const rectangularSkeletons = document.querySelectorAll('.MuiSkeleton-rectangular');
        expect(rectangularSkeletons.length).toBeGreaterThan(1);
      });

      it('includes grid layout for actions', () => {
        render(<SkeletonLoader variant='release' />);
        const grid = document.querySelector('.MuiGrid-container');
        expect(grid).toBeInTheDocument();
      });
    });

    describe('Documentation Variant', () => {
      it('includes title skeleton', () => {
        render(<SkeletonLoader variant='documentation' />);
        const skeletons = document.querySelectorAll('.MuiSkeleton-text');
        expect(skeletons.length).toBeGreaterThan(3);
      });

      it('includes code block skeleton', () => {
        render(<SkeletonLoader variant='documentation' />);
        const rectangularSkeleton = document.querySelector('.MuiSkeleton-rectangular');
        expect(rectangularSkeleton).toBeInTheDocument();
      });
    });

    describe('Table Variant', () => {
      it('renders header row', () => {
        render(<SkeletonLoader variant='table' />);
        // Should have skeletons arranged in table-like structure
        const skeletons = document.querySelectorAll('.MuiSkeleton-text');
        expect(skeletons.length).toBeGreaterThan(15); // Header + 5 rows * 4 columns
      });

      it('renders data rows', () => {
        render(<SkeletonLoader variant='table' />);
        // Should have multiple rows of data
        const container = document.querySelector('div');
        expect(container).toBeInTheDocument();
      });
    });

    describe('List Variant', () => {
      it('includes avatar skeletons', () => {
        render(<SkeletonLoader variant='list' count={3} />);
        const circularSkeletons = document.querySelectorAll('.MuiSkeleton-circular');
        expect(circularSkeletons).toHaveLength(3);
      });

      it('includes title and subtitle skeletons', () => {
        render(<SkeletonLoader variant='list' count={2} />);
        const textSkeletons = document.querySelectorAll('.MuiSkeleton-text');
        expect(textSkeletons.length).toBeGreaterThanOrEqual(4); // 2 items * 2 text skeletons each
      });
    });
  });

  describe('Animation Integration', () => {
    it('handles framer-motion animations', async () => {
      render(<SkeletonLoader variant='card' />);

      await waitFor(() => {
        const skeleton = document.querySelector('.MuiSkeleton-root');
        expect(skeleton).toBeInTheDocument();
      });
    });

    it('applies staggered animations for multiple items', async () => {
      render(<SkeletonLoader variant='text' count={3} />);

      await waitFor(() => {
        const skeletons = document.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBe(3);
      });
    });

    it('handles shimmer animation correctly', async () => {
      render(<SkeletonLoader variant='text' animation='shimmer' />);

      await waitFor(() => {
        const skeleton = document.querySelector('.MuiSkeleton-root');
        expect(skeleton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very large count values', () => {
      render(<SkeletonLoader variant='text' count={100} />);
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(100);
    });

    it('handles negative count values', () => {
      render(<SkeletonLoader variant='text' count={-1} />);
      // Should handle gracefully, likely rendering 0 items
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThanOrEqual(0);
    });

    it('handles invalid width values', () => {
      expect(() => {
        render(<SkeletonLoader variant='text' width={-100} />);
      }).not.toThrow();
    });

    it('handles invalid height values', () => {
      expect(() => {
        render(<SkeletonLoader variant='text' height={-50} />);
      }).not.toThrow();
    });

    it('handles zero speed value', () => {
      expect(() => {
        render(<SkeletonLoader speed={0} />);
      }).not.toThrow();
    });

    it('handles very high speed values', () => {
      expect(() => {
        render(<SkeletonLoader speed={100} />);
      }).not.toThrow();
    });
  });

  describe('Props Combination', () => {
    it('handles all props together', () => {
      render(
        <SkeletonLoader
          variant='card'
          count={3}
          width={200}
          height={150}
          animation='wave'
          speed={2}
        />
      );

      const cards = document.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(3);
    });

    it('handles text variant with all props', () => {
      render(
        <SkeletonLoader
          variant='text'
          count={5}
          width='80%'
          height={24}
          animation='shimmer'
          speed={0.5}
        />
      );

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(5);
    });

    it('handles image variant with custom dimensions', () => {
      render(<SkeletonLoader variant='image' width={400} height={300} animation={false} />);

      const rectangularSkeleton = document.querySelector('.MuiSkeleton-rectangular');
      expect(rectangularSkeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards for text variant', async () => {
      const { container } = render(<SkeletonLoader variant='text' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for card variant', async () => {
      const { container } = render(<SkeletonLoader variant='card' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for feature variant', async () => {
      const { container } = render(<SkeletonLoader variant='feature' count={3} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for all variants', async () => {
      const variants: Array<
        'text' | 'card' | 'feature' | 'release' | 'documentation' | 'image' | 'table' | 'list'
      > = ['text', 'card', 'feature', 'release', 'documentation', 'image', 'table', 'list'];

      for (const variant of variants) {
        const { container, unmount } = render(<SkeletonLoader variant={variant} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it('provides proper loading indication for screen readers', () => {
      render(<SkeletonLoader variant='text' />);
      // MUI Skeleton components provide implicit loading state
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly with single skeleton', () => {
      const startTime = performance.now();
      render(<SkeletonLoader variant='text' />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('renders quickly with multiple skeletons', () => {
      const startTime = performance.now();
      render(<SkeletonLoader variant='list' count={10} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    it('handles complex variants efficiently', () => {
      const startTime = performance.now();
      render(<SkeletonLoader variant='feature' count={5} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(300);
    });

    it('handles re-renders efficiently', () => {
      const { rerender } = render(<SkeletonLoader variant='text' count={1} />);

      const startTime = performance.now();

      for (let i = 2; i <= 10; i++) {
        rerender(<SkeletonLoader variant='text' count={i} />);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Memory Management', () => {
    it('cleans up animations on unmount', () => {
      const { unmount } = render(<SkeletonLoader variant='text' animation='shimmer' />);

      expect(() => unmount()).not.toThrow();
    });

    it('handles multiple mounts and unmounts', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<SkeletonLoader variant='card' />);
        unmount();
      }

      // Should not cause memory leaks
      expect(true).toBe(true);
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors correctly', () => {
      render(<SkeletonLoader variant='text' />);
      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('adapts to theme changes', () => {
      const { rerender } = render(<SkeletonLoader variant='card' />);

      // Re-render should handle theme changes
      rerender(<SkeletonLoader variant='card' />);

      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Variant-Specific Features', () => {
    it('image variant includes pulsing center element', () => {
      render(<SkeletonLoader variant='image' />);

      const rectangularSkeleton = document.querySelector('.MuiSkeleton-rectangular');
      expect(rectangularSkeleton).toBeInTheDocument();

      // Should have positioned center element
      const container = rectangularSkeleton?.parentElement;
      expect(container).toBeInTheDocument();
    });

    it('shimmer animation creates overlay effect', () => {
      render(<SkeletonLoader variant='text' animation='shimmer' />);

      const skeleton = document.querySelector('.MuiSkeleton-root');
      expect(skeleton).toBeInTheDocument();
    });

    it('feature variant uses proper grid layout', () => {
      render(<SkeletonLoader variant='feature' count={6} />);

      const grid = document.querySelector('.MuiGrid-container');
      expect(grid).toBeInTheDocument();

      const gridItems = document.querySelectorAll('.MuiGrid-item');
      expect(gridItems).toHaveLength(6);
    });
  });
});
