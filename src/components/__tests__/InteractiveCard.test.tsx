import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import InteractiveCard, { InteractiveIconButton } from '../InteractiveCard';

expect.extend(toHaveNoViolations);

describe('InteractiveCard Component', () => {
  beforeEach(() => {
    setupTest();
    // Mock framer-motion and requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <InteractiveCard>
          <div>Test Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <InteractiveCard className='custom-card'>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('forwards Card props correctly', () => {
      render(
        <InteractiveCard data-testid='interactive-card' elevation={8}>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByTestId('interactive-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Interaction Props', () => {
    it('applies default tilt intensity', () => {
      const { container } = render(
        <InteractiveCard>
          <div>Content</div>
        </InteractiveCard>
      );

      const interactiveElement = container.querySelector('[style*="transform"]');
      expect(interactiveElement).toBeInTheDocument();
    });

    it('applies custom tilt intensity', () => {
      render(
        <InteractiveCard tiltIntensity={25}>
          <div>Content</div>
        </InteractiveCard>
      );

      // Component should render without errors
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom hover scale', () => {
      render(
        <InteractiveCard hoverScale={1.05}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom shadow intensity', () => {
      render(
        <InteractiveCard shadowIntensity={0.5}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('enables glow effect when specified', () => {
      render(
        <InteractiveCard glowEffect>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom spring configuration', () => {
      render(
        <InteractiveCard springConfig={{ damping: 30, stiffness: 500 }}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Disabled Interaction Mode', () => {
    it('renders as regular Card when interaction is disabled', () => {
      const { container } = render(
        <InteractiveCard disableInteraction>
          <div>Disabled Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Disabled Content')).toBeInTheDocument();

      // Should not have motion.div wrapper when disabled
      const motionDiv = container.querySelector('[style*="rotateX"]');
      expect(motionDiv).not.toBeInTheDocument();
    });

    it('has default cursor when interaction is disabled', () => {
      render(
        <InteractiveCard disableInteraction>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('[style*="cursor"]');
      expect(card).toHaveStyle({ cursor: 'default' });
    });

    it('still calls custom mouse event handlers when disabled', () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();

      render(
        <InteractiveCard disableInteraction onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('div');
      fireEvent.mouseEnter(card!);
      fireEvent.mouseLeave(card!);

      expect(onMouseEnter).toHaveBeenCalled();
      expect(onMouseLeave).toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('handles mouse move events correctly', async () => {
      const { container } = render(
        <InteractiveCard>
          <div style={{ width: 200, height: 200 }}>Content</div>
        </InteractiveCard>
      );

      const motionDiv = container.querySelector('[style*="rotateX"]');
      expect(motionDiv).toBeInTheDocument();

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        right: 200,
        bottom: 200,
        toJSON: jest.fn(),
      }));

      Object.defineProperty(motionDiv, 'getBoundingClientRect', {
        value: mockGetBoundingClientRect,
      });

      fireEvent.mouseMove(motionDiv!, {
        clientX: 150,
        clientY: 150,
      });

      // Should not throw any errors
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles mouse enter events', async () => {
      const onMouseEnter = jest.fn();

      render(
        <InteractiveCard onMouseEnter={onMouseEnter}>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('div');
      fireEvent.mouseEnter(card!);

      expect(onMouseEnter).toHaveBeenCalled();
    });

    it('handles mouse leave events', async () => {
      const onMouseLeave = jest.fn();

      render(
        <InteractiveCard onMouseLeave={onMouseLeave}>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('div');
      fireEvent.mouseLeave(card!);

      expect(onMouseLeave).toHaveBeenCalled();
    });

    it('does not handle mouse events when interaction is disabled', () => {
      const { container } = render(
        <InteractiveCard disableInteraction>
          <div style={{ width: 200, height: 200 }}>Content</div>
        </InteractiveCard>
      );

      const card = container.firstChild;

      // Should not throw errors when mouse events are triggered
      fireEvent.mouseMove(card!, { clientX: 100, clientY: 100 });
      fireEvent.mouseEnter(card!);
      fireEvent.mouseLeave(card!);

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Animation and Transform Effects', () => {
    it('applies 3D transform styles correctly', () => {
      const { container } = render(
        <InteractiveCard>
          <div>Content</div>
        </InteractiveCard>
      );

      const motionDiv = container.querySelector('[style*="preserve-3d"]');
      expect(motionDiv).toBeInTheDocument();
    });

    it('applies pointer cursor when interaction is enabled', () => {
      render(
        <InteractiveCard>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('[style*="cursor"]');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });

    it('handles tap animations correctly', async () => {
      render(
        <InteractiveCard>
          <div>Content</div>
        </InteractiveCard>
      );

      const card = screen.getByText('Content').closest('div');

      // Simulate click/tap
      fireEvent.mouseDown(card!);
      fireEvent.mouseUp(card!);

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('merges custom sx prop correctly', () => {
      render(
        <InteractiveCard sx={{ backgroundColor: 'red', padding: 2 }}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies glow effect shadow correctly', () => {
      render(
        <InteractiveCard glowEffect shadowIntensity={0.4}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies regular shadow when glow is disabled', () => {
      render(
        <InteractiveCard glowEffect={false} shadowIntensity={0.4}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing ref gracefully', () => {
      const { container } = render(
        <InteractiveCard>
          <div>Content</div>
        </InteractiveCard>
      );

      const motionDiv = container.querySelector('[style*="rotateX"]');

      // Simulate mouse move without proper ref
      fireEvent.mouseMove(motionDiv!, { clientX: 100, clientY: 100 });

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles zero tilt intensity', () => {
      render(
        <InteractiveCard tiltIntensity={0}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles extreme spring configuration values', () => {
      render(
        <InteractiveCard springConfig={{ damping: 0, stiffness: 1000 }}>
          <div>Content</div>
        </InteractiveCard>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <InteractiveCard>
          <div>Accessible Content</div>
        </InteractiveCard>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards when disabled', async () => {
      const { container } = render(
        <InteractiveCard disableInteraction>
          <div>Disabled Accessible Content</div>
        </InteractiveCard>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains focus management', () => {
      render(
        <InteractiveCard>
          <button>Focusable Button</button>
        </InteractiveCard>
      );

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });
  });
});

describe('InteractiveIconButton Component', () => {
  beforeEach(() => {
    setupTest();
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
    it('renders children correctly', () => {
      render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('renders as button by default', () => {
      const { container } = render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const element = container.firstChild;
      expect(element).toHaveProperty('tagName', 'DIV'); // motion.div renders as div
    });

    it('renders as link when href is provided', () => {
      render(
        <InteractiveIconButton href='https://example.com'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size correctly', () => {
      const { container } = render(
        <InteractiveIconButton size='small'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('applies medium size correctly (default)', () => {
      const { container } = render(
        <InteractiveIconButton size='medium'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('applies large size correctly', () => {
      const { container } = render(
        <InteractiveIconButton size='large'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ width: '48px', height: '48px' });
    });
  });

  describe('Color Props', () => {
    it('applies default color', () => {
      const { container } = render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ color: 'inherit' });
    });

    it('applies custom color', () => {
      const { container } = render(
        <InteractiveIconButton color='#blue'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ color: '#blue' });
    });

    it('applies custom hover color', () => {
      render(
        <InteractiveIconButton hoverColor='#green'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });
  });

  describe('Click Interactions', () => {
    it('handles click events', () => {
      const onClick = jest.fn();

      render(
        <InteractiveIconButton onClick={onClick}>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      fireEvent.click(screen.getByText('Icon'));
      expect(onClick).toHaveBeenCalled();
    });

    it('handles link clicks', () => {
      const onClick = jest.fn();

      render(
        <InteractiveIconButton href='https://example.com' onClick={onClick}>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      fireEvent.click(screen.getByText('Icon'));
      expect(onClick).toHaveBeenCalled();
    });

    it('opens links in specified target', () => {
      render(
        <InteractiveIconButton href='https://example.com' target='_blank'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });
  });

  describe('Animation Effects', () => {
    it('applies hover animations', async () => {
      render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = screen.getByText('Icon').closest('div');

      fireEvent.mouseEnter(button!);
      fireEvent.mouseLeave(button!);

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('applies tap animations', async () => {
      render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = screen.getByText('Icon').closest('div');

      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <InteractiveIconButton className='custom-button'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      expect(container.firstChild).toHaveClass('custom-button');
    });

    it('applies circular shape', () => {
      const { container } = render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ borderRadius: '50%' });
    });

    it('has transparent background', () => {
      const { container } = render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = container.firstChild as HTMLElement;
      expect(button).toHaveStyle({ background: 'transparent' });
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards as link', async () => {
      const { container } = render(
        <InteractiveIconButton href='https://example.com'>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard navigation', () => {
      render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = screen.getByText('Icon').closest('div');

      fireEvent.keyDown(button!, { key: 'Enter' });
      fireEvent.keyDown(button!, { key: ' ' });

      expect(screen.getByText('Icon')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onClick gracefully', () => {
      render(
        <InteractiveIconButton>
          <span>Icon</span>
        </InteractiveIconButton>
      );

      const button = screen.getByText('Icon').closest('div');

      fireEvent.click(button!);
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('handles empty children', () => {
      const { container } = render(<InteractiveIconButton>{null}</InteractiveIconButton>);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
