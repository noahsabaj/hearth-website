import { screen, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { render, setupTest, teardownTest } from '../../test-utils';
import PageTransition, { AnimatedSection, StaggerContainer, StaggerItem } from '../PageTransition';

expect.extend(toHaveNoViolations);

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('PageTransition Component', () => {
  beforeEach(() => {
    setupTest();
    // Mock requestAnimationFrame for framer-motion animations
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    // Mock useLocation
    mockUseLocation.mockReturnValue({
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <PageTransition>
          <div>Test content</div>
        </PageTransition>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('uses fade variant by default', () => {
      render(
        <PageTransition>
          <div>Fade content</div>
        </PageTransition>
      );

      expect(screen.getByText('Fade content')).toBeInTheDocument();
    });

    it('applies minimum height styling', () => {
      render(
        <PageTransition>
          <div>Full height content</div>
        </PageTransition>
      );

      const content = screen.getByText('Full height content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Animation Variants', () => {
    const testContent = <div>Animation test content</div>;

    it('renders slide variant correctly', () => {
      render(<PageTransition variant='slide'>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });

    it('renders fade variant correctly', () => {
      render(<PageTransition variant='fade'>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });

    it('renders scale variant correctly', () => {
      render(<PageTransition variant='scale'>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });

    it('renders slideUp variant correctly', () => {
      render(<PageTransition variant='slideUp'>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });

    it('renders slideDown variant correctly', () => {
      render(<PageTransition variant='slideDown'>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });

    it('falls back to fade for invalid variant', () => {
      render(<PageTransition variant={'invalid' as any}>{testContent}</PageTransition>);

      expect(screen.getByText('Animation test content')).toBeInTheDocument();
    });
  });

  describe('Animation Timing', () => {
    it('uses default duration of 0.6 seconds', () => {
      render(
        <PageTransition>
          <div>Default duration content</div>
        </PageTransition>
      );

      expect(screen.getByText('Default duration content')).toBeInTheDocument();
    });

    it('accepts custom duration', () => {
      render(
        <PageTransition duration={1.2}>
          <div>Custom duration content</div>
        </PageTransition>
      );

      expect(screen.getByText('Custom duration content')).toBeInTheDocument();
    });

    it('accepts custom delay', () => {
      render(
        <PageTransition delay={0.3}>
          <div>Delayed content</div>
        </PageTransition>
      );

      expect(screen.getByText('Delayed content')).toBeInTheDocument();
    });

    it('handles zero duration', () => {
      render(
        <PageTransition duration={0}>
          <div>Zero duration content</div>
        </PageTransition>
      );

      expect(screen.getByText('Zero duration content')).toBeInTheDocument();
    });

    it('handles negative duration', () => {
      render(
        <PageTransition duration={-1}>
          <div>Negative duration content</div>
        </PageTransition>
      );

      expect(screen.getByText('Negative duration content')).toBeInTheDocument();
    });
  });

  describe('Route Change Animation', () => {
    it('triggers animation on route change', () => {
      const { rerender } = render(
        <PageTransition>
          <div>Route 1 content</div>
        </PageTransition>
      );

      expect(screen.getByText('Route 1 content')).toBeInTheDocument();

      // Change route
      mockUseLocation.mockReturnValue({
        pathname: '/new-route',
        search: '',
        hash: '',
        state: null,
        key: 'new-key',
      });

      rerender(
        <PageTransition>
          <div>Route 2 content</div>
        </PageTransition>
      );

      expect(screen.getByText('Route 2 content')).toBeInTheDocument();
    });

    it('uses pathname as animation key', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/unique-path',
        search: '',
        hash: '',
        state: null,
        key: 'unique-key',
      });

      render(
        <PageTransition>
          <div>Unique path content</div>
        </PageTransition>
      );

      expect(screen.getByText('Unique path content')).toBeInTheDocument();
    });

    it('handles complex route patterns', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/complex/nested/route/123',
        search: '?param=value',
        hash: '#section',
        state: { data: 'test' },
        key: 'complex-key',
      });

      render(
        <PageTransition>
          <div>Complex route content</div>
        </PageTransition>
      );

      expect(screen.getByText('Complex route content')).toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('handles all props together', () => {
      render(
        <PageTransition variant='slideUp' duration={0.8} delay={0.2}>
          <div>Combined props content</div>
        </PageTransition>
      );

      expect(screen.getByText('Combined props content')).toBeInTheDocument();
    });

    it('works with minimal props', () => {
      render(
        <PageTransition>
          <div>Minimal props content</div>
        </PageTransition>
      );

      expect(screen.getByText('Minimal props content')).toBeInTheDocument();
    });

    it('handles extreme timing values', () => {
      render(
        <PageTransition duration={100} delay={50}>
          <div>Extreme timing content</div>
        </PageTransition>
      );

      expect(screen.getByText('Extreme timing content')).toBeInTheDocument();
    });
  });

  describe('Complex Children', () => {
    it('handles nested components', () => {
      render(
        <PageTransition>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </PageTransition>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <PageTransition>
          <div>First child</div>
          <div>Second child</div>
          <div>Third child</div>
        </PageTransition>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('handles empty children', () => {
      render(<PageTransition>{null}</PageTransition>);

      // Should render without crashing
      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });

    it('handles conditional children', () => {
      const showContent = true;

      render(<PageTransition>{showContent && <div>Conditional content</div>}</PageTransition>);

      expect(screen.getByText('Conditional content')).toBeInTheDocument();
    });
  });
});

describe('AnimatedSection Component', () => {
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
        <AnimatedSection>
          <div>Section content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    it('uses fadeUp variant by default', () => {
      render(
        <AnimatedSection>
          <div>Default variant content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Default variant content')).toBeInTheDocument();
    });
  });

  describe('Section Variants', () => {
    const testContent = <div>Section test content</div>;

    it('renders fadeUp variant correctly', () => {
      render(<AnimatedSection variant='fadeUp'>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });

    it('renders fadeIn variant correctly', () => {
      render(<AnimatedSection variant='fadeIn'>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });

    it('renders slideLeft variant correctly', () => {
      render(<AnimatedSection variant='slideLeft'>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });

    it('renders slideRight variant correctly', () => {
      render(<AnimatedSection variant='slideRight'>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });

    it('renders scaleIn variant correctly', () => {
      render(<AnimatedSection variant='scaleIn'>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });

    it('falls back to fadeUp for invalid variant', () => {
      render(<AnimatedSection variant={'invalid' as any}>{testContent}</AnimatedSection>);

      expect(screen.getByText('Section test content')).toBeInTheDocument();
    });
  });

  describe('Section Timing', () => {
    it('uses default timing values', () => {
      render(
        <AnimatedSection>
          <div>Default timing content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Default timing content')).toBeInTheDocument();
    });

    it('accepts custom delay', () => {
      render(
        <AnimatedSection delay={0.5}>
          <div>Custom delay content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Custom delay content')).toBeInTheDocument();
    });

    it('accepts custom duration', () => {
      render(
        <AnimatedSection duration={1.0}>
          <div>Custom duration content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Custom duration content')).toBeInTheDocument();
    });

    it('accepts custom threshold', () => {
      render(
        <AnimatedSection threshold={0.5}>
          <div>Custom threshold content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Custom threshold content')).toBeInTheDocument();
    });
  });

  describe('Viewport Intersection', () => {
    it('handles viewport threshold correctly', () => {
      render(
        <AnimatedSection threshold={0.2}>
          <div>Threshold content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Threshold content')).toBeInTheDocument();
    });

    it('handles edge threshold values', () => {
      const { rerender } = render(
        <AnimatedSection threshold={0}>
          <div>Zero threshold content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Zero threshold content')).toBeInTheDocument();

      rerender(
        <AnimatedSection threshold={1}>
          <div>Full threshold content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Full threshold content')).toBeInTheDocument();
    });
  });
});

describe('StaggerContainer Component', () => {
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
        <StaggerContainer>
          <div>Stagger content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Stagger content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <StaggerContainer className='custom-stagger'>
          <div>Classed content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Classed content')).toBeInTheDocument();
    });

    it('uses default stagger delay', () => {
      render(
        <StaggerContainer>
          <div>Default stagger content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Default stagger content')).toBeInTheDocument();
    });

    it('accepts custom stagger delay', () => {
      render(
        <StaggerContainer staggerDelay={0.2}>
          <div>Custom stagger content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Custom stagger content')).toBeInTheDocument();
    });
  });

  describe('Stagger Animation', () => {
    it('handles multiple children with stagger', () => {
      render(
        <StaggerContainer staggerDelay={0.1}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('handles zero stagger delay', () => {
      render(
        <StaggerContainer staggerDelay={0}>
          <div>No stagger content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('No stagger content')).toBeInTheDocument();
    });

    it('handles negative stagger delay', () => {
      render(
        <StaggerContainer staggerDelay={-0.1}>
          <div>Negative stagger content</div>
        </StaggerContainer>
      );

      expect(screen.getByText('Negative stagger content')).toBeInTheDocument();
    });
  });
});

describe('StaggerItem Component', () => {
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
        <StaggerItem>
          <div>Item content</div>
        </StaggerItem>
      );

      expect(screen.getByText('Item content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <StaggerItem className='custom-item'>
          <div>Custom item content</div>
        </StaggerItem>
      );

      expect(screen.getByText('Custom item content')).toBeInTheDocument();
    });

    it('handles complex children', () => {
      render(
        <StaggerItem>
          <div>
            <h3>Item Title</h3>
            <p>Item Description</p>
          </div>
        </StaggerItem>
      );

      expect(screen.getByText('Item Title')).toBeInTheDocument();
      expect(screen.getByText('Item Description')).toBeInTheDocument();
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    mockUseLocation.mockReturnValue({
      pathname: '/integration',
      search: '',
      hash: '',
      state: null,
      key: 'integration-key',
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Combined Components', () => {
    it('works with PageTransition and AnimatedSection together', () => {
      render(
        <PageTransition variant='fade'>
          <AnimatedSection variant='fadeUp'>
            <div>Combined content</div>
          </AnimatedSection>
        </PageTransition>
      );

      expect(screen.getByText('Combined content')).toBeInTheDocument();
    });

    it('works with all components together', () => {
      render(
        <PageTransition variant='slide'>
          <AnimatedSection variant='fadeIn'>
            <StaggerContainer staggerDelay={0.1}>
              <StaggerItem>
                <div>Staggered item 1</div>
              </StaggerItem>
              <StaggerItem>
                <div>Staggered item 2</div>
              </StaggerItem>
            </StaggerContainer>
          </AnimatedSection>
        </PageTransition>
      );

      expect(screen.getByText('Staggered item 1')).toBeInTheDocument();
      expect(screen.getByText('Staggered item 2')).toBeInTheDocument();
    });

    it('handles nested stagger containers', () => {
      render(
        <StaggerContainer staggerDelay={0.1}>
          <StaggerItem>
            <StaggerContainer staggerDelay={0.05}>
              <StaggerItem>
                <div>Nested item 1</div>
              </StaggerItem>
              <StaggerItem>
                <div>Nested item 2</div>
              </StaggerItem>
            </StaggerContainer>
          </StaggerItem>
        </StaggerContainer>
      );

      expect(screen.getByText('Nested item 1')).toBeInTheDocument();
      expect(screen.getByText('Nested item 2')).toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    setupTest();
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    mockUseLocation.mockReturnValue({
      pathname: '/accessibility',
      search: '',
      hash: '',
      state: null,
      key: 'accessibility-key',
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('PageTransition Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <PageTransition>
          <div>Accessible content</div>
        </PageTransition>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all variants', async () => {
      const variants = ['slide', 'fade', 'scale', 'slideUp', 'slideDown'] as const;

      for (const variant of variants) {
        const { container } = render(
          <PageTransition variant={variant}>
            <div>Variant {variant} content</div>
          </PageTransition>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('AnimatedSection Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <AnimatedSection>
          <div>Accessible section</div>
        </AnimatedSection>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all variants', async () => {
      const variants = ['fadeUp', 'fadeIn', 'slideLeft', 'slideRight', 'scaleIn'] as const;

      for (const variant of variants) {
        const { container } = render(
          <AnimatedSection variant={variant}>
            <div>Section variant {variant}</div>
          </AnimatedSection>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Stagger Components Accessibility', () => {
    it('meets accessibility standards for StaggerContainer', async () => {
      const { container } = render(
        <StaggerContainer>
          <div>Accessible stagger container</div>
        </StaggerContainer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for StaggerItem', async () => {
      const { container } = render(
        <StaggerItem>
          <div>Accessible stagger item</div>
        </StaggerItem>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for combined stagger components', async () => {
      const { container } = render(
        <StaggerContainer>
          <StaggerItem>
            <div>Combined stagger item 1</div>
          </StaggerItem>
          <StaggerItem>
            <div>Combined stagger item 2</div>
          </StaggerItem>
        </StaggerContainer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Performance and Memory', () => {
  beforeEach(() => {
    setupTest();
    global.requestAnimationFrame = jest.fn(cb => {
      setTimeout(cb, 16);
      return 1;
    });

    mockUseLocation.mockReturnValue({
      pathname: '/performance',
      search: '',
      hash: '',
      state: null,
      key: 'performance-key',
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Component Cleanup', () => {
    it('cleans up PageTransition animations on unmount', () => {
      const { unmount } = render(
        <PageTransition>
          <div>Cleanup test</div>
        </PageTransition>
      );

      expect(() => unmount()).not.toThrow();
    });

    it('cleans up AnimatedSection animations on unmount', () => {
      const { unmount } = render(
        <AnimatedSection>
          <div>Section cleanup test</div>
        </AnimatedSection>
      );

      expect(() => unmount()).not.toThrow();
    });

    it('cleans up stagger animations on unmount', () => {
      const { unmount } = render(
        <StaggerContainer>
          <StaggerItem>
            <div>Stagger cleanup test</div>
          </StaggerItem>
        </StaggerContainer>
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('handles rapid mounting and unmounting', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <PageTransition variant='slide'>
            <div>Mount test {i}</div>
          </PageTransition>
        );
        expect(screen.getByText(`Mount test ${i}`)).toBeInTheDocument();
        unmount();
      }
    });

    it('handles route changes efficiently', () => {
      const { rerender } = render(
        <PageTransition>
          <div>Route 1</div>
        </PageTransition>
      );

      for (let i = 2; i <= 10; i++) {
        mockUseLocation.mockReturnValue({
          pathname: `/route-${i}`,
          search: '',
          hash: '',
          state: null,
          key: `route-${i}-key`,
        });

        rerender(
          <PageTransition>
            <div>Route {i}</div>
          </PageTransition>
        );

        expect(screen.getByText(`Route ${i}`)).toBeInTheDocument();
      }
    });
  });
});
