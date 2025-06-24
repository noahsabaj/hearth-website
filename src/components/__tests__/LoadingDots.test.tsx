import { screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LoadingDots from '../LoadingDots';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: {
      div: mockReact.forwardRef<HTMLDivElement, any>(
        ({ children, animate, transition, style, ...props }, ref) =>
          mockReact.createElement(
            'div',
            {
              ref,
              ...props,
              'data-testid': 'motion-div',
              'data-animate': JSON.stringify(animate),
              'data-transition': JSON.stringify(transition),
              style,
            },
            children,
          )
      ),
    },
  };
});

describe('LoadingDots Component', () => {
  beforeEach(() => {
    setupTest();
    // Mock requestAnimationFrame for animations
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
    it('renders three dots by default', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs).toHaveLength(3);
    });

    it('has correct status role and aria-label', () => {
      render(<LoadingDots />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading');
    });

    it('includes screen reader text', () => {
      render(<LoadingDots />);

      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('renders with proper container structure', () => {
      const { container } = render(<LoadingDots />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        display: 'inline-flex',
        alignItems: 'center',
      });
    });
  });

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(<LoadingDots size='small' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '12px',
          height: '12px',
        });
      });
    });

    it('renders with medium size (default)', () => {
      render(<LoadingDots size='medium' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '20px',
          height: '20px',
        });
      });
    });

    it('renders with large size', () => {
      render(<LoadingDots size='large' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '28px',
          height: '28px',
        });
      });
    });

    it('uses medium size when no size prop provided', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '20px',
          height: '20px',
        });
      });
    });
  });

  describe('Color Customization', () => {
    it('uses default primary color', () => {
      render(<LoadingDots />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(el => el.style.backgroundColor === '#ff4500');
      expect(voxelFaces.length).toBeGreaterThan(0);
    });

    it('applies custom color to all voxel faces', () => {
      const customColor = '#00ff00';
      render(<LoadingDots color={customColor} />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(el => el.style.backgroundColor === customColor);
      expect(voxelFaces.length).toBeGreaterThan(0);
    });

    it('maintains color consistency across all faces', () => {
      const customColor = '#blue';
      render(<LoadingDots color={customColor} />);

      // Each voxel should have 6 faces with the same color
      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(el => el.style.backgroundColor === customColor);
      expect(voxelFaces).toHaveLength(18); // 3 voxels × 6 faces each
    });
  });

  describe('Animation Configuration', () => {
    it('applies default animation speed', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach((div, index) => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(1.4); // 1.4 / speed (1)
        expect(transitionData.delay).toBe(index * 0.2); // index * 0.2 / speed (1)
      });
    });

    it('applies custom animation speed', () => {
      const customSpeed = 2;
      render(<LoadingDots speed={customSpeed} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach((div, index) => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(1.4 / customSpeed);
        expect(transitionData.delay).toBe((index * 0.2) / customSpeed);
      });
    });

    it('handles slow animation speed', () => {
      const slowSpeed = 0.5;
      render(<LoadingDots speed={slowSpeed} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach((div, index) => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(1.4 / slowSpeed); // 2.8 seconds
        expect(transitionData.delay).toBe((index * 0.2) / slowSpeed);
      });
    });

    it('handles fast animation speed', () => {
      const fastSpeed = 3;
      render(<LoadingDots speed={fastSpeed} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach((div, index) => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(1.4 / fastSpeed);
        expect(transitionData.delay).toBe((index * 0.2) / fastSpeed);
      });
    });
  });

  describe('Animation Properties', () => {
    it('sets up correct bounce animation', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        const animateData = JSON.parse(div.getAttribute('data-animate') || '{}');
        expect(animateData.y).toEqual([0, -20, 0]); // Bouncing animation
        expect(animateData.rotateX).toEqual([0, 360]);
        expect(animateData.rotateY).toEqual([0, 360]);
      });
    });

    it('configures infinite repeat animation', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.repeat).toBe(Infinity);
        expect(transitionData.ease).toBe('easeInOut');
      });
    });

    it('applies staggered delay between dots', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach((div, index) => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.delay).toBe(index * 0.2);
      });
    });
  });

  describe('Voxel 3D Structure', () => {
    it('renders all six faces for each voxel', () => {
      render(<LoadingDots />);

      // Each voxel should have 6 faces (front, back, top, bottom, left, right)
      // 3 voxels × 6 faces = 18 faces total
      const allBoxes = screen.getAllByRole('generic');
      const voxelFaces = allBoxes.filter(
        box => box.style.backgroundColor && box.style.position === 'absolute' && box.style.transform
      );

      expect(voxelFaces).toHaveLength(18);
    });

    it('applies correct 3D transforms to voxel faces', () => {
      render(<LoadingDots />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(box => box.style.transform && box.style.position === 'absolute');

      // Check for different transform values
      const transforms = voxelFaces.map(face => face.style.transform);
      const uniqueTransforms = new Set(transforms);

      // Should have 6 unique transforms (one for each face direction)
      expect(uniqueTransforms.size).toBe(6);
    });

    it('applies different opacity to each face', () => {
      render(<LoadingDots />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(box => box.style.opacity && box.style.position === 'absolute');

      const opacities = voxelFaces.map(face => parseFloat(face.style.opacity));
      const uniqueOpacities = new Set(opacities);

      // Should have multiple opacity values for depth effect
      expect(uniqueOpacities.size).toBeGreaterThan(1);
    });

    it('maintains proper voxel dimensions', () => {
      render(<LoadingDots size='medium' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '20px',
          height: '20px',
          transformStyle: 'preserve-3d',
        });
      });
    });
  });

  describe('Container Styling', () => {
    it('applies correct gap between voxels', () => {
      const { container } = render(<LoadingDots />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        gap: '4px', // LOADING.voxel.voxelGap
      });
    });

    it('maintains inline-flex display', () => {
      const { container } = render(<LoadingDots />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({
        display: 'inline-flex',
        alignItems: 'center',
      });
    });

    it('preserves 3D transform style on voxel containers', () => {
      render(<LoadingDots />);

      const voxelContainers = screen
        .getAllByRole('generic')
        .filter(
          el =>
            el.style.transformStyle === 'preserve-3d' &&
            el.getAttribute('data-testid') !== 'motion-div'
        );

      expect(voxelContainers).toHaveLength(3); // One per voxel
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<LoadingDots />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA labels', () => {
      render(<LoadingDots />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-label', 'Loading');
    });

    it('includes accessible text for screen readers', () => {
      render(<LoadingDots />);

      const screenReaderText = screen.getByText('Loading...');
      expect(screenReaderText).toHaveClass('sr-only');
    });

    it('maintains semantic structure', () => {
      render(<LoadingDots />);

      // Should have proper roles and structure
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple size changes', () => {
      const { rerender } = render(<LoadingDots size='small' />);

      // Multiple rerenders with different sizes
      rerender(<LoadingDots size='medium' />);
      rerender(<LoadingDots size='large' />);
      rerender(<LoadingDots size='small' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs).toHaveLength(3);
    });

    it('handles rapid color changes', () => {
      const { rerender } = render(<LoadingDots color='#red' />);

      const colors = ['#blue', '#green', '#yellow', '#purple', '#orange'];
      colors.forEach(color => {
        rerender(<LoadingDots color={color} />);
      });

      expect(screen.getAllByTestId('motion-div')).toHaveLength(3);
    });

    it('handles rapid speed changes', () => {
      const { rerender } = render(<LoadingDots speed={1} />);

      const speeds = [0.5, 2, 3, 0.1, 5];
      speeds.forEach(speed => {
        rerender(<LoadingDots speed={speed} />);
      });

      expect(screen.getAllByTestId('motion-div')).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero speed gracefully', () => {
      render(<LoadingDots speed={0} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(Infinity); // 1.4 / 0
      });
    });

    it('handles negative speed values', () => {
      render(<LoadingDots speed={-1} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(-1.4); // 1.4 / -1
      });
    });

    it('handles very large speed values', () => {
      render(<LoadingDots speed={1000} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      motionDivs.forEach(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        expect(transitionData.duration).toBe(0.0014); // 1.4 / 1000
      });
    });

    it('handles undefined color prop', () => {
      // @ts-ignore - testing runtime behavior
      render(<LoadingDots color={undefined} />);

      // Should still render without errors
      expect(screen.getAllByTestId('motion-div')).toHaveLength(3);
    });

    it('handles invalid size prop', () => {
      // @ts-ignore - testing runtime behavior
      render(<LoadingDots size='invalid' />);

      // Should still render (likely with default size)
      expect(screen.getAllByTestId('motion-div')).toHaveLength(3);
    });
  });

  describe('Constants Integration', () => {
    it('uses LOADING constants for sizing', () => {
      render(<LoadingDots size='medium' />);

      const motionDivs = screen.getAllByTestId('motion-div');
      // Should use LOADING.sizes.voxel.medium (20px)
      motionDivs.forEach(div => {
        expect(div).toHaveStyle({
          width: '20px',
          height: '20px',
        });
      });
    });

    it('uses COLORS constants for default color', () => {
      render(<LoadingDots />);

      // Should use COLORS.primary.main (#ff4500)
      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(el => el.style.backgroundColor === '#ff4500');
      expect(voxelFaces.length).toBeGreaterThan(0);
    });

    it('uses LOADING constants for gap spacing', () => {
      const { container } = render(<LoadingDots />);

      const wrapper = container.firstChild as HTMLElement;
      // Should use LOADING.voxel.voxelGap (4px)
      expect(wrapper).toHaveStyle({
        gap: '4px',
      });
    });
  });

  describe('Animation Timing', () => {
    it('creates proper staggered effect', () => {
      render(<LoadingDots />);

      const motionDivs = screen.getAllByTestId('motion-div');
      const delays = motionDivs.map(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        return transitionData.delay;
      });

      expect(delays).toEqual([0, 0.2, 0.4]); // Staggered by 0.2s
    });

    it('adjusts stagger timing with speed', () => {
      render(<LoadingDots speed={2} />);

      const motionDivs = screen.getAllByTestId('motion-div');
      const delays = motionDivs.map(div => {
        const transitionData = JSON.parse(div.getAttribute('data-transition') || '{}');
        return transitionData.delay;
      });

      expect(delays).toEqual([0, 0.1, 0.2]); // Staggered by 0.1s (0.2/2)
    });
  });

  describe('Voxel Face Transforms', () => {
    it('applies correct transforms for cube faces', () => {
      render(<LoadingDots size='medium' />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(box => box.style.transform && box.style.position === 'absolute');

      const transforms = voxelFaces.map(face => face.style.transform);

      // Should include transforms for all 6 faces
      const expectedTransforms = [
        'translateZ(10px)', // front
        'rotateY(180deg) translateZ(10px)', // back
        'rotateX(90deg) translateZ(10px)', // top
        'rotateX(-90deg) translateZ(10px)', // bottom
        'rotateY(90deg) translateZ(10px)', // right
        'rotateY(-90deg) translateZ(10px)', // left
      ];

      expectedTransforms.forEach(expectedTransform => {
        expect(transforms).toContain(expectedTransform);
      });
    });

    it('scales transforms with voxel size', () => {
      render(<LoadingDots size='large' />);

      const voxelFaces = screen
        .getAllByRole('generic')
        .filter(box => box.style.transform && box.style.position === 'absolute');

      const transforms = voxelFaces.map(face => face.style.transform);

      // For large size (28px), translateZ should be half the size (14px)
      const frontFaceTransform = transforms.find(t => t.includes('translateZ(14px)'));
      expect(frontFaceTransform).toBeTruthy();
    });
  });
});
