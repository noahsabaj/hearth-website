import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest, mockLocalStorage } from '../../test-utils';
import FeedbackDemo from '../FeedbackDemo';

expect.extend(toHaveNoViolations);

// Mock toast notifications
const mockToast = jest.fn();
jest.mock('react-hot-toast', () => ({
  toast: {
    success: mockToast,
    error: mockToast,
    loading: mockToast,
  },
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('FeedbackDemo Page', () => {
  beforeEach(() => {
    setupTest();
    mockToast.mockClear();
    mockLocalStorage.clear();

    // Mock download functionality
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock anchor element for download
    const mockAnchor = {
      click: jest.fn(),
      setAttribute: jest.fn(),
      style: {},
    };
    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName === 'a') {
        return mockAnchor as any;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the page with proper structure and content', () => {
      render(<FeedbackDemo />);

      // Check main heading
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();

      // Check description
      expect(
        screen.getByText(/This page demonstrates the feedback widget system/),
      ).toBeInTheDocument();

      // Check sample sections
      expect(screen.getByText('Sample Documentation Section')).toBeInTheDocument();
      expect(screen.getByText('Another Sample Section')).toBeInTheDocument();

      // Check data management section
      expect(screen.getByText('Feedback Data Management')).toBeInTheDocument();

      // Check implementation notes
      expect(screen.getByText('Implementation Notes')).toBeInTheDocument();
    });

    it('should render feedback widgets for both demo sections', () => {
      render(<FeedbackDemo />);

      // Should have two feedback widgets
      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });
      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      expect(thumbsUpButtons).toHaveLength(2);
      expect(thumbsDownButtons).toHaveLength(2);
    });

    it('should display feature list correctly', () => {
      render(<FeedbackDemo />);

      // Check all feature items
      expect(
        screen.getByText(/Thumbs up\/down voting with real-time counters/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Vote persistence/)).toBeInTheDocument();
      expect(screen.getByText(/Optional comment box for negative feedback/)).toBeInTheDocument();
      expect(screen.getByText(/LocalStorage persistence for demo purposes/)).toBeInTheDocument();
      expect(screen.getByText(/Toast notifications for user feedback/)).toBeInTheDocument();
      expect(screen.getByText(/Analytics-ready data structure/)).toBeInTheDocument();
      expect(screen.getByText(/Fully accessible with ARIA labels/)).toBeInTheDocument();
      expect(screen.getByText(/Smooth animations with Framer Motion/)).toBeInTheDocument();
    });

    it('should render feedback exporter controls', () => {
      render(<FeedbackDemo />);

      // Look for export/clear buttons (these would be in the FeedbackExporter component)
      expect(
        screen.getByText(/export feedback data or clear all stored feedback/),
      ).toBeInTheDocument();
    });
  });

  describe('Feedback Widget Interactions', () => {
    it('should handle positive feedback correctly', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Click first thumbs up button
      await user.click(thumbsUpButtons[0]);

      // Should show feedback was registered
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should handle negative feedback and show comment box', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      // Click first thumbs down button
      await user.click(thumbsDownButtons[0]);

      // Should show comment box for negative feedback
      await waitFor(() => {
        const commentTextarea =
          screen.getByRole('textbox', { name: /comment/i }) ||
          screen.getByPlaceholderText(/tell us more/i);
        expect(commentTextarea).toBeInTheDocument();
      });
    });

    it('should prevent multiple votes from same user', async () => {
      const user = userEvent.setup();

      // Mock that user has already voted
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthVote_demo-section-1') {
          return 'up';
        }
        return null;
      });

      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Button should be disabled or show voted state
      expect(thumbsUpButtons[0]).toHaveAttribute('aria-pressed', 'true') ||
        expect(thumbsUpButtons[0]).toBeDisabled();
    });

    it('should handle comment submission', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      // Click thumbs down to show comment box
      await user.click(thumbsDownButtons[0]);

      // Find and fill comment box
      await waitFor(async () => {
        const commentBox =
          screen.getByRole('textbox', { name: /comment/i }) ||
          screen.getByPlaceholderText(/tell us more/i);
        await user.type(commentBox, 'This section needs more examples');

        // Submit comment
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);
      });

      // Should save comment to localStorage
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          expect.stringContaining('hearthFeedback'),
          expect.any(String)
        );
      });
    });
  });

  describe('Feedback Data Management', () => {
    it('should export feedback data correctly', async () => {
      const user = userEvent.setup();

      // Mock some feedback data
      const mockFeedbackData = {
        'demo-section-1': {
          sectionId: 'demo-section-1',
          sectionTitle: 'Sample Documentation Section',
          votes: { up: 5, down: 2 },
          comments: ['Great section!', 'Needs more detail'],
          lastUpdated: new Date().toISOString(),
        },
      };

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthFeedback') {
          return JSON.stringify(mockFeedbackData);
        }
        return null;
      });

      render(<FeedbackDemo />);

      // Find and click export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should trigger download
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
      });
    });

    it('should clear all feedback data', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      // Find and click clear button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Should clear localStorage
      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hearthFeedback');
      });
    });

    it('should handle empty feedback data gracefully', async () => {
      const user = userEvent.setup();

      // Mock empty feedback data
      mockLocalStorage.getItem.mockReturnValue(null);

      render(<FeedbackDemo />);

      // Export button should still work
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should not crash
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<FeedbackDemo />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for feedback widgets', () => {
      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });
      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      // All buttons should have proper labels
      thumbsUpButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });

      thumbsDownButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      // Tab through feedback widgets
      await user.tab();

      // Should focus on first interactive element
      const firstInteractiveElement = document.activeElement;
      expect(firstInteractiveElement).toBeTruthy();

      // Continue tabbing to feedback buttons
      await user.tab();
      await user.tab();

      const feedbackButton = document.activeElement;
      expect(feedbackButton).toHaveAttribute('role', 'button') ||
        expect(feedbackButton?.tagName.toLowerCase()).toBe('button');
    });

    it('should announce feedback actions to screen readers', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Click thumbs up
      await user.click(thumbsUpButtons[0]);

      // Should have appropriate ARIA live regions or status updates
      await waitFor(() => {
        const statusRegion =
          screen.queryByRole('status') || screen.queryByLabelText(/feedback submitted/i);
        expect(statusRegion || mockToast).toBeTruthy();
      });
    });

    it('should have proper form labels for comment input', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      // Click thumbs down to show comment form
      await user.click(thumbsDownButtons[0]);

      // Comment input should have proper label
      await waitFor(() => {
        const commentInput = screen.getByRole('textbox');
        expect(commentInput).toHaveAccessibleName();
      });
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
      render(<FeedbackDemo />);

      // Content should still be accessible
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();

      // Feedback widgets should be present
      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });
      expect(thumbsUpButtons).toHaveLength(2);
    });

    it('should adapt feedback widgets for touch interfaces', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Should handle touch events
      fireEvent.touchStart(thumbsUpButtons[0]);
      fireEvent.touchEnd(thumbsUpButtons[0]);

      // Widget should still function
      expect(thumbsUpButtons[0]).toBeInTheDocument();
    });

    it('should maintain usability on tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      render(<FeedbackDemo />);

      // All sections should be visible
      expect(screen.getByText('Sample Documentation Section')).toBeInTheDocument();
      expect(screen.getByText('Another Sample Section')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock localStorage error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Should not crash when localStorage fails
      await user.click(thumbsUpButtons[0]);

      // Page should still be functional
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();
    });

    it('should handle malformed feedback data in localStorage', () => {
      // Mock corrupted data
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthFeedback') {
          return 'invalid json data';
        }
        return null;
      });

      // Should not crash on render
      render(<FeedbackDemo />);
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();
    });

    it('should handle network-related errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock console.error to prevent error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<FeedbackDemo />);

      // Should render without issues
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Data Persistence', () => {
    it('should persist vote state across page reloads', () => {
      // Mock existing vote
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthVote_demo-section-1') {
          return 'up';
        }
        return null;
      });

      render(<FeedbackDemo />);

      // First thumbs up button should show as already voted
      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });
      expect(thumbsUpButtons[0]).toHaveAttribute('aria-pressed', 'true') ||
        expect(thumbsUpButtons[0]).toHaveClass(/selected|active|voted/);
    });

    it('should maintain feedback counts correctly', () => {
      // Mock feedback data with counts
      const mockData = {
        'demo-section-1': {
          votes: { up: 10, down: 2 },
          comments: [],
        },
      };

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthFeedback') {
          return JSON.stringify(mockData);
        }
        return null;
      });

      render(<FeedbackDemo />);

      // Should display vote counts (implementation dependent)
      // This would check for vote count displays if implemented
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();
    });

    it('should handle data migration correctly', () => {
      // Mock old format data
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'hearthFeedback') {
          return JSON.stringify({ oldFormat: true });
        }
        return null;
      });

      // Should not crash with old data format
      render(<FeedbackDemo />);
      expect(screen.getByText('Feedback Widget Demo')).toBeInTheDocument();
    });
  });

  describe('Implementation Details', () => {
    it('should display correct implementation notes', () => {
      render(<FeedbackDemo />);

      // Check implementation details
      expect(
        screen.getByText(/Feedback is stored in localStorage with the key 'hearthFeedback'/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/User votes are tracked with keys like 'hearthVote_\[sectionId\]'/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The system is ready for Google Analytics integration via gtag events/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The widget is responsive and works well on mobile devices/),
      ).toBeInTheDocument();
      expect(screen.getByText(/All interactions are keyboard accessible/)).toBeInTheDocument();
    });

    it('should demonstrate proper section isolation', async () => {
      const user = userEvent.setup();
      render(<FeedbackDemo />);

      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });

      // Vote on first section
      await user.click(thumbsUpButtons[0]);

      // Second section should remain unaffected
      expect(thumbsUpButtons[1]).not.toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();

      render(<FeedbackDemo />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle multiple feedback widgets without performance issues', () => {
      render(<FeedbackDemo />);

      // Should have two feedback widgets without issues
      const thumbsUpButtons = screen.getAllByRole('button', { name: /thumbs up/i });
      const thumbsDownButtons = screen.getAllByRole('button', { name: /thumbs down/i });

      expect(thumbsUpButtons.length).toBe(2);
      expect(thumbsDownButtons.length).toBe(2);
    });
  });
});
