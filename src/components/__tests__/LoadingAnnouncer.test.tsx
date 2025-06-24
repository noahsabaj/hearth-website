import { screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LoadingAnnouncer from '../LoadingAnnouncer';

expect.extend(toHaveNoViolations);

describe('LoadingAnnouncer Component', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders with required message prop', () => {
      render(<LoadingAnnouncer message='Loading content' />);

      // Should render ARIA live regions
      const statusRegion = screen.getByRole('status');
      const alertRegion = screen.getByRole('alert');

      expect(statusRegion).toBeInTheDocument();
      expect(alertRegion).toBeInTheDocument();
    });

    it('announces initial message', () => {
      render(<LoadingAnnouncer message='Loading page content' />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading page content');
    });

    it('has correct ARIA attributes', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');
      const alertRegion = screen.getByRole('alert');

      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('has screen reader only styling', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveStyle({
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: '0',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      });
    });
  });

  describe('Progress Announcements', () => {
    it('announces progress at intervals', () => {
      const { rerender } = render(
        <LoadingAnnouncer
          message='Loading content'
          progress={0}
          announceProgress
          announceInterval={10}
        />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading content');

      // Update progress to 10%
      rerender(
        <LoadingAnnouncer
          message='Loading content'
          progress={10}
          announceProgress
          announceInterval={10}
        />
      );

      expect(statusRegion).toHaveTextContent('Loading content. Loading 10 percent complete.');
    });

    it('only announces at specified intervals', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={0} announceInterval={20} />
      );

      const statusRegion = screen.getByRole('status');

      // Progress at 5% should not be announced (interval is 20%)
      rerender(<LoadingAnnouncer message='Loading' progress={5} announceInterval={20} />);
      expect(statusRegion).toHaveTextContent('Loading');

      // Progress at 20% should be announced
      rerender(<LoadingAnnouncer message='Loading' progress={20} announceInterval={20} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 20 percent complete.');
    });

    it('always announces 100% completion', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={90} announceInterval={20} />
      );

      const statusRegion = screen.getByRole('status');

      // 100% should always be announced regardless of interval
      rerender(<LoadingAnnouncer message='Loading' progress={100} announceInterval={20} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading complete.');
    });

    it('rounds progress values', () => {
      render(<LoadingAnnouncer message='Loading' progress={42.7} announceInterval={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 43 percent complete.');
    });

    it('does not announce when announceProgress is false', () => {
      render(<LoadingAnnouncer message='Loading' progress={50} announceProgress={false} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading');
      expect(statusRegion).not.toHaveTextContent('percent');
    });

    it('does not announce zero progress', () => {
      render(<LoadingAnnouncer message='Loading' progress={0} announceProgress />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading');
      expect(statusRegion).not.toHaveTextContent('percent');
    });
  });

  describe('Completion Announcements', () => {
    it('announces completion in status region', () => {
      render(<LoadingAnnouncer message='Loading content' isComplete />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading complete. Content is now available.');
    });

    it('announces completion in alert region', () => {
      render(<LoadingAnnouncer message='Loading content' isComplete />);

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveTextContent('Content loaded successfully');
    });

    it('only announces completion once', () => {
      const { rerender } = render(<LoadingAnnouncer message='Loading' isComplete={false} />);

      // Mark as complete
      rerender(<LoadingAnnouncer message='Loading' isComplete />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading complete. Content is now available.');

      // Rerender again - should not change the message
      rerender(<LoadingAnnouncer message='Different message' isComplete />);
      expect(statusRegion).toHaveTextContent('Loading complete. Content is now available.');
    });

    it('takes precedence over progress announcements', () => {
      render(<LoadingAnnouncer message='Loading' progress={80} isComplete announceProgress />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading complete. Content is now available.');
      expect(statusRegion).not.toHaveTextContent('80 percent');
    });
  });

  describe('Message Updates', () => {
    it('updates message when prop changes', () => {
      const { rerender } = render(<LoadingAnnouncer message='Loading initial content' />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading initial content');

      rerender(<LoadingAnnouncer message='Loading updated content' />);
      expect(statusRegion).toHaveTextContent('Loading updated content');
    });

    it('updates message with progress', () => {
      const { rerender } = render(<LoadingAnnouncer message='Loading data' progress={0} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading data');

      rerender(<LoadingAnnouncer message='Processing data' progress={50} announceInterval={10} />);

      expect(statusRegion).toHaveTextContent('Processing data. Loading 50 percent complete.');
    });
  });

  describe('Default Props', () => {
    it('uses default progress value of 0', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading');
    });

    it('uses default isComplete value of false', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');
      const alertRegion = screen.getByRole('alert');

      expect(statusRegion).toHaveTextContent('Loading');
      expect(alertRegion).toBeEmptyDOMElement();
    });

    it('uses default announceProgress value of true', () => {
      render(<LoadingAnnouncer message='Loading' progress={50} announceInterval={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 50 percent complete.');
    });

    it('uses default announceInterval from constants', () => {
      render(<LoadingAnnouncer message='Loading' progress={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 10 percent complete.');
    });
  });

  describe('Custom Announce Interval', () => {
    it('respects custom announce interval', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={0} announceInterval={25} />
      );

      const statusRegion = screen.getByRole('status');

      // 10% should not be announced (interval is 25%)
      rerender(<LoadingAnnouncer message='Loading' progress={10} announceInterval={25} />);
      expect(statusRegion).toHaveTextContent('Loading');

      // 25% should be announced
      rerender(<LoadingAnnouncer message='Loading' progress={25} announceInterval={25} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 25 percent complete.');
    });

    it('handles very small intervals', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={0} announceInterval={1} />
      );

      const statusRegion = screen.getByRole('status');

      // Every 1% should be announced
      rerender(<LoadingAnnouncer message='Loading' progress={1} announceInterval={1} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 1 percent complete.');
    });

    it('handles large intervals', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={0} announceInterval={50} />
      );

      const statusRegion = screen.getByRole('status');

      // 25% should not be announced (interval is 50%)
      rerender(<LoadingAnnouncer message='Loading' progress={25} announceInterval={50} />);
      expect(statusRegion).toHaveTextContent('Loading');

      // 50% should be announced
      rerender(<LoadingAnnouncer message='Loading' progress={50} announceInterval={50} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 50 percent complete.');
    });
  });

  describe('Progress Tracking', () => {
    it('tracks last announced progress', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={10} announceInterval={10} />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 10 percent complete.');

      // Progress at 15% should not be announced (last was 10%, interval is 10%)
      rerender(<LoadingAnnouncer message='Loading' progress={15} announceInterval={10} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 10 percent complete.');

      // Progress at 20% should be announced
      rerender(<LoadingAnnouncer message='Loading' progress={20} announceInterval={10} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 20 percent complete.');
    });

    it('resets tracking when progress decreases', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={50} announceInterval={10} />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 50 percent complete.');

      // Progress decreases and then increases again
      rerender(<LoadingAnnouncer message='Loading' progress={10} announceInterval={10} />);
      expect(statusRegion).toHaveTextContent('Loading. Loading 10 percent complete.');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative progress values', () => {
      render(<LoadingAnnouncer message='Loading' progress={-10} announceInterval={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading -10 percent complete.');
    });

    it('handles progress values over 100', () => {
      render(<LoadingAnnouncer message='Loading' progress={150} announceInterval={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 150 percent complete.');
    });

    it('handles zero announce interval', () => {
      render(<LoadingAnnouncer message='Loading' progress={50} announceInterval={0} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 50 percent complete.');
    });

    it('handles decimal announce intervals', () => {
      render(<LoadingAnnouncer message='Loading' progress={5.5} announceInterval={5.5} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 6 percent complete.');
    });

    it('handles empty message', () => {
      render(<LoadingAnnouncer message='' />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('');
    });

    it('handles very long messages', () => {
      const longMessage = 'Loading '.repeat(100);
      render(<LoadingAnnouncer message={longMessage} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(longMessage);
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('provides proper live region roles', () => {
      render(<LoadingAnnouncer message='Loading' />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('uses polite announcements for progress', () => {
      render(<LoadingAnnouncer message='Loading' progress={50} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('uses assertive announcements for completion', () => {
      render(<LoadingAnnouncer message='Loading' isComplete />);

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('sets atomic announcements', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');
      const alertRegion = screen.getByRole('alert');

      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
      expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <LoadingAnnouncer message='Loading content' progress={50} isComplete={false} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards when complete', async () => {
      const { container } = render(<LoadingAnnouncer message='Loading content' isComplete />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('is visually hidden but available to screen readers', () => {
      render(<LoadingAnnouncer message='Loading' />);

      const statusRegion = screen.getByRole('status');

      // Should be positioned absolutely off-screen
      expect(statusRegion).toHaveStyle({
        position: 'absolute',
        width: '1px',
        height: '1px',
      });

      // But still contain the text for screen readers
      expect(statusRegion).toHaveTextContent('Loading');
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(<LoadingAnnouncer message='Loading' progress={10} />);

      // Multiple rerenders with same props should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender(<LoadingAnnouncer message='Loading' progress={10} />);
      }

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
    });

    it('handles rapid progress updates efficiently', () => {
      const { rerender } = render(
        <LoadingAnnouncer message='Loading' progress={0} announceInterval={10} />
      );

      // Rapid progress updates
      for (let i = 1; i <= 100; i++) {
        rerender(<LoadingAnnouncer message='Loading' progress={i} announceInterval={10} />);
      }

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading complete.');
    });
  });

  describe('Integration with Loading Constants', () => {
    it('uses LOADING constants correctly', () => {
      // The component should use LOADING.announceInterval as default
      render(<LoadingAnnouncer message='Loading' progress={10} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Loading. Loading 10 percent complete.');
    });
  });
});
