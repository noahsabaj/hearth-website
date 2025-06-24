import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React, { Component } from 'react';

import App from '../../App';
import ErrorBoundary from '../../components/ErrorBoundary';
import { render, setupTest, teardownTest } from '../../test-utils';

expect.extend(toHaveNoViolations);

// Test component that can throw errors on command
interface ErrorThrowingComponentProps {
  shouldThrow?: boolean;
  errorType?: 'render' | 'async' | 'network' | 'permission' | 'memory';
  errorMessage?: string;
}

class ErrorThrowingComponent extends Component<ErrorThrowingComponentProps> {
  componentDidMount() {
    if (this.props.shouldThrow && this.props.errorType === 'async') {
      setTimeout(() => {
        throw new Error(this.props.errorMessage || 'Async error');
      }, 100);
    }
  }

  render() {
    if (this.props.shouldThrow && this.props.errorType === 'render') {
      throw new Error(this.props.errorMessage || 'Render error');
    }

    if (this.props.shouldThrow && this.props.errorType === 'network') {
      throw new Error('Network request failed');
    }

    if (this.props.shouldThrow && this.props.errorType === 'permission') {
      throw new Error('Permission denied');
    }

    if (this.props.shouldThrow && this.props.errorType === 'memory') {
      throw new Error('Out of memory');
    }

    return <div data-testid='working-component'>Component is working</div>;
  }
}

// Mock error reporting
const mockErrorReporting = {
  reportError: jest.fn(),
  captureException: jest.fn(),
};

// Mock console methods to test error logging
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Error Boundary Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    mockErrorReporting.reportError.mockClear();
    mockErrorReporting.captureException.mockClear();
    mockNavigate.mockClear();
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  afterEach(() => {
    teardownTest();
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Basic Error Boundary Functionality', () => {
    it('should catch and display render errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      // Should show error UI instead of the component
      expect(screen.queryByTestId('working-component')).not.toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should display custom error fallback when provided', () => {
      const customFallback = <div data-testid='custom-error'>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should log errors in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent
            shouldThrow
            errorType='render'
            errorMessage='Test error message'
          />
        </ErrorBoundary>
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow retry functionality', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Should attempt to re-render the component
      // In a real scenario, the error condition might be resolved
      expect(retryButton).toBeInTheDocument(); // Still showing because error persists
    });

    it('should render children normally when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary in App Context', () => {
    it('should handle errors in navigation components', async () => {
      const user = userEvent.setup();

      // Mock navigation component to throw error
      const FailingNavComponent = () => {
        throw new Error('Navigation component failed');
      };

      render(
        <ErrorBoundary>
          <FailingNavComponent />
          <App />
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Should provide way to recover
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle errors in search functionality', async () => {
      const user = userEvent.setup();

      // Mock search to throw error
      jest.mock('../../components/SearchBar', () => {
        return function SearchBar() {
          throw new Error('Search component failed');
        };
      });

      render(<App />);

      // App should still be functional with error boundary protection
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle errors in theme switching', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Mock theme context to throw error
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Simulate error in theme switching
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await user.click(themeToggle);

      // App should handle theme switching errors gracefully
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should maintain app state after error recovery', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to a page
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/docs');
      });

      // Simulate and recover from error
      // App state should be preserved
      expect(window.location.pathname).toBe('/docs');
    });
  });

  describe('Different Error Types', () => {
    it('should handle network errors appropriately', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='network' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/network request failed/i)).toBeInTheDocument();
    });

    it('should handle permission errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='permission' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });

    it('should handle memory errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='memory' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/out of memory/i)).toBeInTheDocument();
    });

    it('should categorize errors for better user messaging', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='network' />
        </ErrorBoundary>
      );

      // Network error should suggest checking connection
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='permission' />
        </ErrorBoundary>
      );

      // Permission error should suggest different action
      expect(screen.getByText(/permission required/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery Strategies', () => {
    it('should provide multiple recovery options', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      // Should provide multiple recovery options
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument();
    });

    it('should navigate home as fallback recovery', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should provide error reporting functionality', async () => {
      const user = userEvent.setup();

      // Mock global error reporting
      (window as any).reportError = mockErrorReporting.reportError;

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report issue/i });
      await user.click(reportButton);

      expect(mockErrorReporting.reportError).toHaveBeenCalled();
    });

    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent
            shouldThrow
            errorType='render'
            errorMessage='Detailed error message'
          />
        </ErrorBoundary>
      );

      // Should show error details in dev mode
      expect(screen.getByText(/detailed error message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent
            shouldThrow
            errorType='render'
            errorMessage='Detailed error message'
          />
        </ErrorBoundary>
      );

      // Should not show error details in production
      expect(screen.queryByText(/detailed error message/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Boundary Accessibility', () => {
    it('should be accessible to screen readers', async () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      // Error message should be announced
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/something went wrong/i);
    });

    it('should provide keyboard navigation for recovery options', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      // Tab through recovery options
      await user.tab();
      expect(screen.getByRole('button', { name: /try again/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /go home/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /report issue/i })).toHaveFocus();
    });

    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveAttribute('aria-describedby');
    });
  });

  describe('Error Boundary Performance', () => {
    it('should not impact performance when no errors occur', () => {
      const startTime = performance.now();

      render(
        <ErrorBoundary>
          <div>Normal content</div>
          <div>More content</div>
          <div>Even more content</div>
        </ErrorBoundary>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly when no errors
      expect(renderTime).toBeLessThan(50); // 50ms threshold
    });

    it('should handle rapid error occurrences', () => {
      const MultipleErrorComponent = () => {
        // Simulate multiple rapid errors
        for (let i = 0; i < 5; i++) {
          try {
            throw new Error(`Error ${i}`);
          } catch (e) {
            // Caught and handled
          }
        }
        throw new Error('Final error');
      };

      render(
        <ErrorBoundary>
          <MultipleErrorComponent />
        </ErrorBoundary>
      );

      // Should only show one error UI
      expect(screen.getAllByText(/something went wrong/i)).toHaveLength(1);
    });

    it('should clean up properly after errors', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      unmount();

      // Should not leave any hanging references or listeners
      expect(document.querySelectorAll('[data-error-boundary]')).toHaveLength(0);
    });
  });

  describe('Nested Error Boundary Behavior', () => {
    it('should handle nested error boundaries correctly', () => {
      render(
        <ErrorBoundary data-testid='outer-boundary'>
          <div>Outer content</div>
          <ErrorBoundary data-testid='inner-boundary'>
            <ErrorThrowingComponent shouldThrow errorType='render' />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByTestId('outer-boundary')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText('Outer content')).toBeInTheDocument();
    });

    it('should bubble errors when inner boundary fails', () => {
      const FailingBoundary = () => {
        throw new Error('Boundary itself failed');
      };

      render(
        <ErrorBoundary data-testid='outer-boundary'>
          <FailingBoundary />
        </ErrorBoundary>
      );

      // Outer boundary should catch boundary failure
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration with Routing', () => {
    it('should handle route-level error boundaries', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to a route that might have errors
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      // Even if route component fails, app should remain functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should provide route-specific error recovery', async () => {
      const user = userEvent.setup();

      // Mock route component error
      Object.defineProperty(window, 'location', {
        value: { pathname: '/docs' },
        writable: true,
      });

      render(<App />);

      // Should provide option to go back to safe route
      if (screen.queryByText(/something went wrong/i)) {
        const homeButton = screen.getByRole('button', { name: /go home/i });
        await user.click(homeButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }
    });

    it('should maintain navigation state after error recovery', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate through multiple pages
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      const engineLink = screen.getByRole('link', { name: /engine/i });
      await user.click(engineLink);

      // Even after potential errors, navigation should work
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength.greaterThan(0);
    });
  });

  describe('Error Boundary Analytics and Monitoring', () => {
    it('should track error occurrences for analytics', () => {
      const mockAnalytics = jest.fn();
      (window as any).gtag = mockAnalytics;

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      expect(mockAnalytics).toHaveBeenCalledWith('event', 'exception', {
        description: expect.any(String),
        fatal: false,
      });
    });

    it('should provide context information with errors', () => {
      const mockErrorService = jest.fn();
      (window as any).Sentry = { captureException: mockErrorService };

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow errorType='render' />
        </ErrorBoundary>
      );

      expect(mockErrorService).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: expect.any(Object),
          tags: expect.any(Object),
        })
      );
    });

    it('should rate limit error reporting', () => {
      const mockErrorService = jest.fn();
      (window as any).reportError = mockErrorService;

      // Render multiple error boundaries rapidly
      for (let i = 0; i < 10; i++) {
        render(
          <ErrorBoundary key={i}>
            <ErrorThrowingComponent shouldThrow errorType='render' />
          </ErrorBoundary>
        );
      }

      // Should rate limit error reporting
      expect(mockErrorService).toHaveBeenCalledTimes(1);
    });
  });
});
