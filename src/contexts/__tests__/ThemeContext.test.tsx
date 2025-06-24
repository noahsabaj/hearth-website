import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { ThemeProvider, useThemeContext } from '../ThemeContext';

// Test component that uses the context
const TestComponent = () => {
  const { highContrastMode, toggleHighContrastMode } = useThemeContext();

  return (
    <div>
      <div data-testid='high-contrast-mode'>{highContrastMode.toString()}</div>
      <button onClick={toggleHighContrastMode} data-testid='toggle-button'>
        Toggle High Contrast
      </button>
    </div>
  );
};

// Helper to render with ThemeProvider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeContext', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock document.documentElement.classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Provider initialization', () => {
    it('should render children correctly', () => {
      renderWithProvider(<div data-testid='test-child'>Test Child</div>);

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should initialize with default state when no localStorage value', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });

    it('should initialize with localStorage value when available', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');
    });

    it('should handle invalid localStorage value gracefully', () => {
      mockLocalStorage.highContrastMode = 'invalid';

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const TestComponentOutsideProvider = () => {
        useThemeContext();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useThemeContext must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('High contrast mode toggle', () => {
    it('should toggle high contrast mode from false to true', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');
    });

    it('should toggle high contrast mode from true to false', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });

    it('should handle multiple toggles correctly', () => {
      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');

      // Initial state
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');

      // First toggle
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');

      // Second toggle
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');

      // Third toggle
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');
    });
  });

  describe('localStorage integration', () => {
    it('should save to localStorage when toggling on', () => {
      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('highContrastMode', 'true');
    });

    it('should save to localStorage when toggling off', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('highContrastMode', 'false');
    });

    it('should read from localStorage on initialization', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      expect(window.localStorage.getItem).toHaveBeenCalledWith('highContrastMode');
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');
    });

    it('should persist state across multiple renders', () => {
      const { rerender } = renderWithProvider(<TestComponent />);

      // Toggle to true
      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');

      // Re-render and check if state persists
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('true');
    });
  });

  describe('CSS class management', () => {
    it('should add high-contrast class when enabled', () => {
      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
    });

    it('should remove high-contrast class when disabled', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
    });

    it('should apply class on initial render when localStorage is true', () => {
      mockLocalStorage.highContrastMode = 'true';

      renderWithProvider(<TestComponent />);

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
    });

    it('should remove class on initial render when localStorage is false', () => {
      mockLocalStorage.highContrastMode = 'false';

      renderWithProvider(<TestComponent />);

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
    });

    it('should handle class management for default false state', () => {
      renderWithProvider(<TestComponent />);

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('high-contrast');
    });
  });

  describe('Effect lifecycle', () => {
    it('should run effect when highContrastMode changes', () => {
      renderWithProvider(<TestComponent />);

      // Reset mocks to count only the toggle action
      jest.clearAllMocks();

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(document.documentElement.classList.add).toHaveBeenCalledTimes(1);
    });

    it('should not cause infinite re-renders', () => {
      const setItemSpy = jest.spyOn(window.localStorage, 'setItem');

      renderWithProvider(<TestComponent />);

      // Initial render should call setItem once for initialization
      expect(setItemSpy).toHaveBeenCalledTimes(1);

      // Wait a bit to ensure no additional calls
      act(() => {
        // No additional operations
      });

      expect(setItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple consumers', () => {
    const MultipleConsumersTest = () => {
      const context1 = useThemeContext();
      const context2 = useThemeContext();

      return (
        <div>
          <div data-testid='consumer1-mode'>{context1.highContrastMode.toString()}</div>
          <div data-testid='consumer2-mode'>{context2.highContrastMode.toString()}</div>
          <button onClick={context1.toggleHighContrastMode} data-testid='toggle1'>
            Toggle 1
          </button>
          <button onClick={context2.toggleHighContrastMode} data-testid='toggle2'>
            Toggle 2
          </button>
        </div>
      );
    };

    it('should provide same context to multiple consumers', () => {
      renderWithProvider(<MultipleConsumersTest />);

      expect(screen.getByTestId('consumer1-mode')).toHaveTextContent('false');
      expect(screen.getByTestId('consumer2-mode')).toHaveTextContent('false');
    });

    it('should update all consumers when context changes', () => {
      renderWithProvider(<MultipleConsumersTest />);

      const toggle1 = screen.getByTestId('toggle1');
      fireEvent.click(toggle1);

      expect(screen.getByTestId('consumer1-mode')).toHaveTextContent('true');
      expect(screen.getByTestId('consumer2-mode')).toHaveTextContent('true');
    });

    it('should work correctly with either toggle button', () => {
      renderWithProvider(<MultipleConsumersTest />);

      const toggle2 = screen.getByTestId('toggle2');
      fireEvent.click(toggle2);

      expect(screen.getByTestId('consumer1-mode')).toHaveTextContent('true');
      expect(screen.getByTestId('consumer2-mode')).toHaveTextContent('true');
    });
  });

  describe('Edge cases', () => {
    it('should handle localStorage being unavailable', () => {
      // Mock localStorage to throw error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
          setItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
        },
        writable: true,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithProvider(<TestComponent />);
      }).not.toThrow();

      // Should default to false when localStorage fails
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');

      consoleSpy.mockRestore();
    });

    it('should handle documentElement.classList being unavailable', () => {
      // Mock classList to be undefined
      Object.defineProperty(document.documentElement, 'classList', {
        value: undefined,
        writable: true,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithProvider(<TestComponent />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle null/undefined localStorage values', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(),
        },
        writable: true,
      });

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });

    it('should handle empty string localStorage value', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => ''),
          setItem: jest.fn(),
        },
        writable: true,
      });

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });
  });

  describe('Context value structure', () => {
    const ContextStructureTest = () => {
      const context = useThemeContext();

      return (
        <div>
          <div data-testid='has-high-contrast-mode'>
            {typeof context.highContrastMode === 'boolean' ? 'boolean' : 'other'}
          </div>
          <div data-testid='has-toggle-function'>
            {typeof context.toggleHighContrastMode === 'function' ? 'function' : 'other'}
          </div>
          <div data-testid='context-keys'>{Object.keys(context).sort().join(',')}</div>
        </div>
      );
    };

    it('should provide correct context structure', () => {
      renderWithProvider(<ContextStructureTest />);

      expect(screen.getByTestId('has-high-contrast-mode')).toHaveTextContent('boolean');
      expect(screen.getByTestId('has-toggle-function')).toHaveTextContent('function');
      expect(screen.getByTestId('context-keys')).toHaveTextContent(
        'highContrastMode,toggleHighContrastMode',
      );
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const PerformanceTestComponent = () => {
        renderCount++;
        const { highContrastMode, toggleHighContrastMode } = useThemeContext();

        return (
          <div>
            <div data-testid='render-count'>{renderCount}</div>
            <div data-testid='high-contrast-mode'>{highContrastMode.toString()}</div>
            <button onClick={toggleHighContrastMode} data-testid='toggle'>
              Toggle
            </button>
          </div>
        );
      };

      renderWithProvider(<PerformanceTestComponent />);

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Toggle state
      const toggleButton = screen.getByTestId('toggle');
      fireEvent.click(toggleButton);

      const afterToggleRenderCount = parseInt(
        screen.getByTestId('render-count').textContent || '0',
      );

      // Should only re-render once for the state change
      expect(afterToggleRenderCount - initialRenderCount).toBe(1);
    });

    it('should handle rapid toggles without issues', () => {
      renderWithProvider(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');

      // Rapid toggles
      for (let i = 0; i < 10; i++) {
        fireEvent.click(toggleButton);
      }

      // Should end up in even state (false) after 10 toggles
      expect(screen.getByTestId('high-contrast-mode')).toHaveTextContent('false');
    });
  });

  describe('Memory leaks prevention', () => {
    it('should not retain references after unmount', () => {
      const { unmount } = renderWithProvider(<TestComponent />);

      // Toggle before unmount
      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
