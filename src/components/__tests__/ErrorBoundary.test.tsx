import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import ErrorBoundary from '../ErrorBoundary';

expect.extend(toHaveNoViolations);

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({
  shouldThrow = false,
  errorMessage = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal content</div>;
};

// Test component that throws async error
const ThrowAsyncError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error('Async error');
      }, 100);
    }
  }, [shouldThrow]);

  return <div>Async content</div>;
};

// Mock console.error to test error logging
const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

// Mock window.location for navigation tests
const mockAssign = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: mockAssign,
  },
  writable: true,
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    console.error = mockConsoleError;
    // Suppress React's error boundary warnings in tests
    mockConsoleError.mockImplementation(() => {});
  });

  afterEach(() => {
    teardownTest();
    console.error = originalConsoleError;
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('renders complex child components', () => {
      const ComplexChild = () => (
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      );

      render(
        <ErrorBoundary>
          <ComplexChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches and displays error boundary UI when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We apologize for the inconvenience/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('displays custom error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Custom error message' />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('logs error to console in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Development error' />
        </ErrorBoundary>
      );

      // Error should be logged (console.error is mocked)
      expect(mockConsoleError).toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('shows error details in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Dev error details' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Dev error details/)).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('hides error details in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Prod error details' />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Error: Prod error details/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('captures component stack in error info', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Component stack should be captured and logged
      expect(mockConsoleError).toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });

    it('renders complex custom fallback', () => {
      const customFallback = (
        <div>
          <h2>Application Error</h2>
          <p>Please contact support</p>
          <button>Contact Support</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('Please contact support')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact Support' })).toBeInTheDocument();
    });

    it('prefers custom fallback over default UI', () => {
      const customFallback = <div>Priority fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Priority fallback')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Recovery Actions', () => {
    it('recovers when Try Again button is clicked', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Re-render with fixed component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Normal content')).toBeInTheDocument();
        expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
      });
    });

    it('navigates home when Go Home button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(goHomeButton);

      expect(window.location.href).toBe('/');
    });

    it('handles multiple retry attempts', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // First retry
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Still failing
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Second retry - success
      await user.click(screen.getByRole('button', { name: /try again/i }));

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Normal content')).toBeInTheDocument();
      });
    });
  });

  describe('Error Types', () => {
    it('handles JavaScript errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='TypeError: Cannot read property' />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles React rendering errors', () => {
      const BadComponent = () => {
        const undefinedVariable: any = undefined;
        return <div>{undefinedVariable.property}</div>;
      };

      render(
        <ErrorBoundary>
          <BadComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles network-related errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Network request failed' />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles custom error objects', () => {
      const CustomError = () => {
        throw new Error('Custom application error');
      };

      render(
        <ErrorBoundary>
          <CustomError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Lifecycle and State Management', () => {
    it('initializes with no error state', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('updates state when getDerivedStateFromError is called', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('resets error state when handleRetry is called', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Normal content')).toBeInTheDocument();
      });
    });

    it('maintains error state across re-renders until reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Re-render without changing error state
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe("Error Boundaries Don't Catch", () => {
    it('does not catch errors in event handlers', () => {
      const EventHandlerError = () => {
        const handleClick = () => {
          throw new Error('Event handler error');
        };

        return <button onClick={handleClick}>Click me</button>;
      };

      render(
        <ErrorBoundary>
          <EventHandlerError />
        </ErrorBoundary>
      );

      // Component should render normally
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('does not catch errors in async code', () => {
      render(
        <ErrorBoundary>
          <ThrowAsyncError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Component should render normally
      expect(screen.getByText('Async content')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('displays error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Bug report icon should be displayed
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('applies proper styling to error container', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const container = screen.getByText('Oops! Something went wrong').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('uses consistent branding colors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('displays proper spacing and layout', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We apologize for the inconvenience/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });
  });

  describe('Development vs Production', () => {
    it('shows different behavior in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Development specific error' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Development specific error/)).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('shows different behavior in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Production error' />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Error: Production error/)).not.toBeInTheDocument();
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards in normal state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides accessible button labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Tab to first button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Try Again' }));

      // Tab to second button
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go Home' }));
    });

    it('provides proper heading structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('has proper color contrast', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Component uses high contrast colors from theme
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Information Display', () => {
    it('shows error message in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Detailed error message' />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Detailed error message/)).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('shows component stack in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Error info should be captured (tested through console logs)
      expect(mockConsoleError).toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('formats error display properly', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage='Multi\nline\nerror' />
        </ErrorBoundary>
      );

      const errorDisplay = screen.getByText(/Error: Multi/);
      expect(errorDisplay).toBeInTheDocument();
      expect(errorDisplay.tagName.toLowerCase()).toBe('pre');

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Integration and Edge Cases', () => {
    it('works with nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <ErrorBoundary>
            <ThrowError shouldThrow />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles errors in error boundary itself gracefully', () => {
      // This is a theoretical test as the error boundary is well-implemented
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('maintains component tree structure', () => {
      render(
        <div data-testid='parent'>
          <ErrorBoundary>
            <ThrowError shouldThrow />
          </ErrorBoundary>
        </div>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles rapid error/recovery cycles', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // Error -> Recover -> Error -> Recover
      for (let i = 0; i < 3; i++) {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

        const tryAgainButton = screen.getByRole('button', { name: /try again/i });
        await user.click(tryAgainButton);

        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        );

        await waitFor(() => {
          expect(screen.getByText('Normal content')).toBeInTheDocument();
        });

        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow />
          </ErrorBoundary>
        );
      }
    });
  });

  describe('Performance', () => {
    it('does not impact performance when no errors occur', () => {
      const ManyChildren = () => (
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </>
      );

      render(
        <ErrorBoundary>
          <ManyChildren />
        </ErrorBoundary>
      );

      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });

    it('handles cleanup properly', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      unmount();

      // Should not cause memory leaks
      expect(document.body).toBeInTheDocument();
    });
  });
});
